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
    
    // Create a JWT for Google authentication
    const now = Math.floor(Date.now() / 1000);
    const exp = now + 3600; // Token expires in 1 hour
    
    const jwt = {
      iss: credentials.client_email,
      scope: 'https://www.googleapis.com/auth/cloud-platform',
      aud: 'https://oauth2.googleapis.com/token',
      exp: exp,
      iat: now,
    };
    
    // Sign the JWT with the private key
    const key = credentials.private_key;
    const encoder = new TextEncoder();
    const signatureInput = encoder.encode(JSON.stringify(jwt));
    
    // Convert private key to crypto key
    const privateKey = await crypto.subtle.importKey(
      'pkcs8',
      new TextEncoder().encode(key),
      {
        name: 'RSASSA-PKCS1-v1_5',
        hash: 'SHA-256',
      },
      false,
      ['sign']
    );
    
    // Sign the JWT
    const signature = await crypto.subtle.sign(
      'RSASSA-PKCS1-v1_5',
      privateKey,
      signatureInput
    );
    
    // Encode the JWT
    const jwtString = `${btoa(JSON.stringify(jwt))}.${btoa(String.fromCharCode(...new Uint8Array(signature)))}`;
    
    // Exchange JWT for access token
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
        assertion: jwtString,
      }),
    });
    
    const tokenData = await tokenResponse.json();
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

    // Call Google Cloud Function
    console.log('Calling Google Cloud Function...');
    const response = await fetch('https://hypertype.cloudfunctions.net/ask_llm_function', {
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