import "https://deno.land/x/xhr@0.1.0/mod.ts";
// import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
// import { OAuth2Client } from "https://deno.land/x/oauth2_client/mod.ts";
// import { SignJWT, importPKCS8 } from "https://deno.land/x/jose@v4.15.2/index.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { encode } from "https://deno.land/std@0.168.0/encoding/base64.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Function to generate a JWT for Google authentication
async function generateGoogleAuthToken(client_email: string, token_uri: string, google_key: string): Promise<string> {
  const header = {
      alg: "RS256",
      typ: "JWT",
  };

  const now = Math.floor(Date.now() / 1000);
  const payload = {
      iss: client_email,
      scope: "https://www.googleapis.com/auth/cloud-platform",
      aud: token_uri,
      exp: now + 3600, // Token valid for 1 hour
      iat: now,
  };

  const encoder = new TextEncoder();
  const encodedHeader = encode(JSON.stringify(header));
  const encodedPayload = encode(JSON.stringify(payload));

  const message = `${encodedHeader}.${encodedPayload}`;
  const key = await crypto.subtle.importKey(
      "pkcs8",
      Uint8Array.from(atob(google_key.split("-----")[2]), c => c.charCodeAt(0)),
      { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
      false,
      ["sign"]
  );

  const signature = await crypto.subtle.sign("RSASSA-PKCS1-v1_5", key, encoder.encode(message));
  const encodedSignature = encode(String.fromCharCode(...new Uint8Array(signature)));

  return `${message}.${encodedSignature}`;
}

// Function to retrieve an OAuth token from Google
async function getIdentityToken(serviceAccountJson: string): Promise<string> {
  const google_credentials = JSON.parse(serviceAccountJson);
  const google_client_email = google_credentials.client_email;
  const google_private_key = google_credentials.private_key.replace(/\\n/g, "\n");
  const google_token_uri = google_credentials.token_uri;

  const jwt = await generateGoogleAuthToken(google_client_email, google_token_uri, google_private_key);
  console.log("THE JWT THING: ", jwt);
  
  const response = await fetch(google_token_uri, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
          grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
          assertion: jwt,
      }),
  });

  const data = await response.json();
  console.log("THE DATA: ", data);
  return data.access_token;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const serviceAccountJson = Deno.env.get('GCLOUD_SERVICE_ACCOUNT');
    if (!serviceAccountJson) {
      throw new Error('Google Cloud service account credentials not configured');
    }

    // Parse the request body
    const { query } = await req.json();
    console.log("Checking logs are updated.....");
    console.log('Received query:', query);

    if (!query) {
      throw new Error('Query is required');
    }

    // Get Google Cloud access token
    console.log('Getting Google Cloud access token...');
    console.log('The service account: ', serviceAccountJson);
    const accessToken = await getIdentityToken(serviceAccountJson);
    console.log("THE TOKEN WE GOT IS:", accessToken);

    // Call Google Cloud Function
    console.log('Calling Google Cloud Function...');
    //const cloudFunctionUrl = 'https://hypertype.cloudfunctions.net/lovable_hypersight_chat_greenely';
    const cloudFunctionUrl = 'https://us-central1-hypertype.cloudfunctions.net/lovable_hypersight_chat_greenely/ask_llm';
    
    const response = await fetch(cloudFunctionUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Google Cloud Function error:', errorText);
      throw new Error(`Google Cloud Function error: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    console.log('Successfully received response from Google Cloud Function');

    return new Response(
      JSON.stringify({ answer: result.response }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        },
        status: 200
      },
    );
  } catch (error) {
    console.error('Error in analyze-tickets function:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to analyze tickets. Please try again.',
        details: error.message 
      }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        },
      },
    );
  }
});