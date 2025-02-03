import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createSign } from "https://deno.land/std@0.190.0/node/crypto.ts";
import { encode } from "https://deno.land/std@0.190.0/encoding/base64url.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function getGoogleAccessToken(serviceAccountJson: string): Promise<string> {
  try {
    console.log('Starting Google access token generation...');
    
    // Parse the service account JSON
    let credentials;
    try {
      credentials = JSON.parse(serviceAccountJson);
      console.log('Successfully parsed service account credentials');
    } catch (parseError) {
      console.error('Error parsing service account JSON:', parseError);
      throw new Error('Invalid service account credentials format');
    }

    console.log("This is the latest deploy 1350");
    
    // Create JWT claims
    const now = Math.floor(Date.now() / 1000);
    const exp = now + 3600; // Token expires in 1 hour
    
    const header = {
      alg: "RS256",
      typ: "JWT",
      kid: credentials.private_key_id
    };

    const claims = {
      iss: credentials.client_email,
      scope: 'https://www.googleapis.com/auth/cloud-platform',
      aud: 'https://oauth2.googleapis.com/token',
      exp: exp,
      iat: now,
    };

    console.log('Created JWT header and claims');

    // Encode Header & Claims
    const encodedHeader = encode(new TextEncoder().encode(JSON.stringify(header)));
    const encodedClaims = encode(new TextEncoder().encode(JSON.stringify(claims)));
    const signingInput = `${encodedHeader}.${encodedClaims}`;

    // Clean and prepare private key
    const privateKey = credentials.private_key
      .replace(/\\n/g, "\n")
      .trim();

    console.log('Prepared private key for signing');

    // Sign JWT
    const sign = createSign("RSA-SHA256");
    sign.update(signingInput);
    sign.end();
    const signature = sign.sign(privateKey, "base64url");

    const jwt = `${signingInput}.${signature}`;
    console.log('Successfully created signed JWT');

    // Exchange JWT for access token
    console.log('Attempting to exchange JWT for access token...');
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
        assertion: jwt,
      }),
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error('Token exchange error response:', errorText);
      throw new Error(`Token exchange failed: ${tokenResponse.status} - ${errorText}`);
    }

    const tokenData = await tokenResponse.json();
    console.log('Successfully obtained access token');
    return tokenData.access_token;
  } catch (error) {
    console.error('Detailed error in getGoogleAccessToken:', error);
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

    // Call Google Cloud Function
    console.log('Calling Google Cloud Function...');
    const cloudFunctionUrl = 'https://hypertype.cloudfunctions.net/ask_llm_function';
    
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