import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { create, getNumericDate } from "https://deno.land/x/djwt@v2.8/mod.ts";
import { importSPKI } from "https://deno.land/x/jose@v4.15.2/index.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Convert PEM private key to a CryptoKey
async function importPrivateKey(pemKey: string): Promise<CryptoKey> {
  // Remove PEM headers
  const pemContents = pemKey.replace(/-----BEGIN PRIVATE KEY-----|-----END PRIVATE KEY-----|\n/g, "");
  
  // Convert base64-encoded key to binary buffer
  const binaryDer = Uint8Array.from(atob(pemContents), (c) => c.charCodeAt(0)).buffer;

  // Import as CryptoKey
  return await crypto.subtle.importKey(
      "pkcs8",
      binaryDer,
      { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
      false,
      ["sign"]
  );
}

/**
 * Generates an OAuth 2.0 access token for Google Cloud APIs using a Service Account.
 *
 * @param serviceAccountJson - The JSON string containing service account credentials.
 * @returns {Promise<string>} - A valid Google access token.
 */
async function getGoogleAccessToken(serviceAccountJson: string): Promise<string> {
  try {
    console.log("🚀 Starting Google access token generation...");

    // ✅ Step 1: Parse the service account JSON
    const serviceAccount = JSON.parse(serviceAccountJson);
    console.log("✅ Successfully parsed service account credentials");

    // Rest of the code

    const now = getNumericDate(0);
    const jwtPayload = {
      iss: serviceAccount.client_email,
      sub: serviceAccount.client_email,
      aud: "https://oauth2.googleapis.com/token",
      iat: now,
      exp: now + 3600, // Expires in 1 hour
    };

    const privateKey = await importPrivateKey(serviceAccount.private_key);

    console.log("THE PRIVATE KEY WE GOT: ", privateKey);

    // Sign the JWT using the service account's private key
    let jwt = await create(
      { alg: "RS256", typ: "JWT" },
      jwtPayload,
      privateKey
    );
    jwt = jwt.replace(/\n/g, "");
    console.log("THE JWT WE GOT: ", jwt);

    // Exchange JWT for an access token
    const response = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
        assertion: jwt,
      }),
    });

    const response_text = await response.text();
    console.log("The reponse we got: ", response);
    console.log("The response text: ", response_text);

    const data = await response.json();
    if (!data.id_token) {
      throw new Error(`Failed to get ID token: ${JSON.stringify(data)}`);
    }

    return data.id_token;
  } catch (error) {
    console.error("❌ Error in getGoogleAccessToken:", error);
    throw new Error(`Failed to get Google access token: ${error.message}`);
  }
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
    const accessToken = await getGoogleAccessToken(serviceAccountJson);
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