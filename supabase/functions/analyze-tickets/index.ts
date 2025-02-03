import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { OAuth2Client } from "https://deno.land/x/oauth2_client/mod.ts";
import { SignJWT, importPKCS8 } from "https://deno.land/x/jose@v4.15.2/index.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};


// Function to create and sign a JWT for Google authentication
async function createServiceAccountJWT(serviceAccount: JSON): Promise<string> {
  const now = Math.floor(Date.now() / 1000);

  const payload = {
      iss: serviceAccount.client_email,  // ✅ Issuer (Service Account Email)
      sub: serviceAccount.client_email,  // ✅ Subject (Same Service Account Email)
      aud: "https://us-central1-hypertype.cloudfunctions.net/lovable_hypersight_chat_greenely", // ✅ Audience must be EXACTLY this
      iat: now,
      exp: now + 3600,  // ✅ Token expiration (1 hour)
  };

  // Import private key from the service account
  const privateKey = await importPKCS8(serviceAccount.private_key.replace(/\n/g, "").trim(), "RS256");

  // Sign the JWT
  return await new SignJWT(payload)
      .setProtectedHeader({ alg: "RS256", typ: "JWT" })
      .sign(privateKey);
}

// Function to exchange JWT for an Identity Token
async function getIdentityToken(serviceAccountJson: string): Promise<string> {
  const serviceAccount = JSON.parse(serviceAccountJson);
  const jwt = await createServiceAccountJWT(serviceAccount);

  console.log("🔑 Generated JWT:", jwt);

  // Define the OAuth2 client for Google Identity Token exchange
  const GOOGLE_OAUTH_CLIENT = new OAuth2Client({
    clientId: serviceAccount.client_id,  // ✅ Use client_id from the service account JSON
    clientSecret: "",  // Service accounts do not use client secrets
    tokenUri: "https://oauth2.googleapis.com/token", // Google token exchange endpoint
  });

  const response = await fetch(`https://iamcredentials.googleapis.com/v1/projects/-/serviceAccounts/${serviceAccount.client_email}:generateIdToken`, {
    method: "POST",
    headers: {
        Authorization: `Bearer ${jwt}`,
        "Content-Type": "application/json",
    },
    body: JSON.stringify({
        audience: "https://us-central1-hypertype.cloudfunctions.net/lovable_hypersight_chat_greenely", // ✅ Set audience to Cloud Function URL
        includeEmail: true,
    }),
});


  // const response = await fetch(GOOGLE_OAUTH_CLIENT.config.tokenUri, {
  //     method: "POST",
  //     headers: { "Content-Type": "application/x-www-form-urlencoded" },
  //     body: new URLSearchParams({
  //         grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
  //         assertion: jwt,
  //     }),
  // });

  const text = await response.text();
  console.log("🔍 Google OAuth Response:", text);

  if (!response.ok) {
      throw new Error(`Google OAuth Error: ${text}`);
  }

  const data = JSON.parse(text);
  if (!data.id_token) {
      throw new Error(`❌ Failed to get ID token: ${JSON.stringify(data)}`);
  }

  return data.id_token;
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