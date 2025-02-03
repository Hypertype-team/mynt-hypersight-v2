import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { encode } from "https://deno.land/std@0.168.0/encoding/base64.ts";

//import { encode } from "https://deno.land/std@0.168.0/encoding/base64.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

/// 🔹 Read and parse the service account JSON from environment variable
const GOOGLE_CREDENTIALS_JSON = Deno.env.get("GCLOUD_SERVICE_ACCOUNT")!;
const GOOGLE_CREDENTIALS = JSON.parse(GOOGLE_CREDENTIALS_JSON);

const GOOGLE_CLIENT_EMAIL = GOOGLE_CREDENTIALS.client_email;
const GOOGLE_PRIVATE_KEY = GOOGLE_CREDENTIALS.private_key.replace(/\\n/g, "\n").trim();
const GOOGLE_TOKEN_URI = "https://oauth2.googleapis.com/token";
const CLOUD_FUNCTION_URL = "https://us-central1-hypertype.cloudfunctions.net/lovable_hypersight_chat_greenely"; // Change this!

// 🔹 Function to base64 URL encode (Deno does not support atob/btoa)
function base64UrlEncode(input: string): string {
    return btoa(input)
        .replace(/\+/g, "-") // Replace "+" with "-"
        .replace(/\//g, "_") // Replace "/" with "_"
        .replace(/=+$/, ""); // Remove trailing "="
}

// 🔹 Generate a JWT for Google Identity Token
async function generateGoogleIdToken(): Promise<string> {
    const now = Math.floor(Date.now() / 1000);
    const header = base64UrlEncode(JSON.stringify({ alg: "RS256", typ: "JWT" }));
    const payload = base64UrlEncode(JSON.stringify({
        iss: GOOGLE_CLIENT_EMAIL,
        sub: GOOGLE_CLIENT_EMAIL,
        aud: GOOGLE_TOKEN_URI, // ✅ This is important! Google expects this
        target_audience: CLOUD_FUNCTION_URL, // ✅ This makes it an ID Token for the Cloud Function
        exp: now + 3600, // Expires in 1 hour
        iat: now,
    }));

    // 🔹 Convert private key to correct format
    function parsePEM(pem: string): Uint8Array {
        const base64String = pem
            .replace(/-----BEGIN PRIVATE KEY-----/, "")
            .replace(/-----END PRIVATE KEY-----/, "")
            .replace(/\n/g, "")
            .trim();
        return new Uint8Array([...atob(base64String)].map(c => c.charCodeAt(0)));
    }

    const privateKeyData = parsePEM(GOOGLE_PRIVATE_KEY);

    // 🔹 Import key
    const key = await crypto.subtle.importKey(
        "pkcs8",
        privateKeyData,
        { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
        false,
        ["sign"]
    );

    // 🔹 Sign the JWT
    const unsignedToken = `${header}.${payload}`;
    const unsignedTokenBytes = new TextEncoder().encode(unsignedToken);
    const signatureBuffer = await crypto.subtle.sign("RSASSA-PKCS1-v1_5", key, unsignedTokenBytes);
    const encodedSignature = base64UrlEncode(
        String.fromCharCode(...new Uint8Array(signatureBuffer))
    );

    const signedJWT = `${unsignedToken}.${encodedSignature}`;
    return signedJWT;
}

// 🔹 Exchange JWT for Google Identity Token
async function getGoogleIdentityToken(): Promise<string> {
    const jwt = await generateGoogleIdToken();
    console.log("🔹 Signed JWT:", jwt); // Debugging

    const response = await fetch(GOOGLE_TOKEN_URI, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
            grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
            assertion: jwt, // Send the signed JWT
        }),
    });

    const data = await response.json();
    console.log("🔹 Identity Token Response:", data);

    if (!data.id_token) {
        throw new Error(`Failed to get identity token: ${JSON.stringify(data)}`);
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
    //const { query } = await req.json();
    const { query, conversationMemory } = await req.json(); // ✅ Extract both query & conversationMemory
    console.log("Checking logs are updated.....");
    console.log('Received query:', query);
    console.log('Received memory:', conversationMemory);

    if (!query) {
      throw new Error('Query is required');
    }

    // Get Google Cloud access token
    console.log('Getting Google Cloud access token...');
    console.log('The service account: ', serviceAccountJson);
    const accessToken = await getGoogleIdentityToken();
    console.log("THE TOKEN WE GOT IS:", accessToken);

    // Call Google Cloud Function
    console.log('Calling Google Cloud Function...');
    //const cloudFunctionUrl = 'https://hypertype.cloudfunctions.net/lovable_hypersight_chat_greenely';
    const cloudFunctionUrl = 'https://us-central1-hypertype.cloudfunctions.net/lovable_hypersight_chat_greenely';
    
    const response = await fetch(cloudFunctionUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query, conversationMemory }),
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