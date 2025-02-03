import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function getGoogleAccessToken(serviceAccountJson: string): Promise<string> {
  try {
    // Parse the service account JSON
    const credentials = JSON.parse(serviceAccountJson);
    console.log('Successfully parsed service account credentials');
    
    // Create a JWT for Google authentication
    const now = Math.floor(Date.now() / 1000);
    const exp = now + 3600; // Token expires in 1 hour
    
    // Create JWT header and claims
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

    // Base64url encode header and claims
    const base64Header = btoa(JSON.stringify(header))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
    
    const base64Claims = btoa(JSON.stringify(claims))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    // Create signing input
    const signInput = `${base64Header}.${base64Claims}`;

    // Clean and format private key
    const privateKey = credentials.private_key
      .replace(/\\n/g, '\n')
      .replace(/["']/g, '');

    // Import private key
    const keyData = await crypto.subtle.importKey(
      'pkcs8',
      new TextEncoder().encode(privateKey),
      {
        name: 'RSASSA-PKCS1-v1_5',
        hash: 'SHA-256',
      },
      false,
      ['sign']
    );

    // Sign the input
    const signature = await crypto.subtle.sign(
      'RSASSA-PKCS1-v1_5',
      keyData,
      new TextEncoder().encode(signInput)
    );

    // Convert signature to base64url
    const base64Signature = btoa(String.fromCharCode(...new Uint8Array(signature)))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    // Create final JWT
    const jwt = `${signInput}.${base64Signature}`;

    console.log('JWT created successfully');

    // Exchange JWT for access token
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
      console.error('Token exchange error:', errorText);
      throw new Error(`Token exchange failed: ${tokenResponse.status} - ${errorText}`);
    }

    const tokenData = await tokenResponse.json();
    console.log('Successfully obtained access token');
    return tokenData.access_token;
  } catch (error) {
    console.error('Error getting Google access token:', error);
    throw new Error('Failed to get Google access token');
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
    console.log('Received query:', query);

    if (!query) {
      throw new Error('Query is required');
    }

    // Get Google Cloud access token
    console.log('Getting Google Cloud access token...');
    const accessToken = await getGoogleAccessToken(serviceAccountJson);

    // Call Google Cloud Function with the correct URL format
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
      throw new Error(`Google Cloud Function error: ${response.status}`);
    }

    const result = await response.json();
    console.log('Successfully received response from Google Cloud Function');

    // Extract the response from the result
    const answer = result.response;

    return new Response(
      JSON.stringify({ answer }),
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