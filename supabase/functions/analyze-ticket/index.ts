import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { ticketId, content } = await req.json();
    
    if (!content) {
      throw new Error('No content provided for analysis');
    }

    console.log('Analyzing ticket:', { ticketId, content });
    
    // Initialize OpenAI API call
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are a ticket analysis assistant. Analyze the ticket content and provide:
              - A brief summary
              - Category classification
              - Priority level (Low, Medium, High, Critical)
              - Sentiment analysis (Positive, Neutral, Negative)
              - Responsible department
              
              Respond in JSON format with these fields:
              {
                "summary": "brief summary",
                "category": "main category",
                "priority": "priority level",
                "sentiment": "sentiment analysis",
                "responsible_department": "department name",
                "responsible_department_justification": "reason for department assignment"
              }`
          },
          { role: 'user', content }
        ],
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('OpenAI API error:', error);
      throw new Error(`OpenAI API error: ${error}`);
    }

    const aiResponse = await response.json();
    console.log('OpenAI response:', aiResponse);
    
    const analysis = JSON.parse(aiResponse.choices[0].message.content);

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Update the ticket with AI analysis
    const { error: updateError } = await supabaseClient
      .from('ticket_analysis')
      .update({
        summary: analysis.summary,
        category: analysis.category,
        priority: analysis.priority,
        sentiment: analysis.sentiment,
        responsible_department: analysis.responsible_department,
        responsible_department_justification: analysis.responsible_department_justification
      })
      .eq('id', ticketId);

    if (updateError) {
      console.error('Supabase update error:', updateError);
      throw updateError;
    }

    return new Response(JSON.stringify(analysis), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in analyze-ticket function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});