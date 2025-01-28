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
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      console.error('OpenAI API key not found');
      throw new Error('OpenAI API key not configured');
    }

    // Parse the request body
    const { query } = await req.json();
    console.log('Received query:', query);

    if (!query) {
      throw new Error('Query is required');
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('Fetching ticket data...');

    // Fetch relevant data from ticket_analysis
    const { data: tickets, error: dbError } = await supabase
      .from('ticket_analysis')
      .select('*');

    if (dbError) {
      console.error('Database query error:', dbError);
      throw dbError;
    }

    console.log(`Retrieved ${tickets?.length} tickets`);

    // Format the context for OpenAI
    const context = tickets?.map(ticket => ({
      summary: ticket.summary,
      issue: ticket.issue,
      common_issue: ticket.common_issue,
      category: ticket.category,
      subcategory: ticket.subcategory,
      responsible_department: ticket.responsible_department,
      responsible_department_justification: ticket.responsible_department_justification,
      report_period: ticket.report_period
    }));

    console.log('Calling OpenAI API...');

    // Call OpenAI API with better error handling
    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are a helpful assistant analyzing ticket data. Your task is to provide insights about the tickets based on the user's query.
            
            Guidelines for your responses:
            1. Always summarize information into clear, readable points
            2. Use bullet points for better readability
            3. Group related information together
            4. Highlight key insights at the beginning
            5. When mentioning statistics, round numbers for clarity
            6. Keep responses concise but informative
            7. Use markdown formatting for better readability
            
            When analyzing categories or issues:
            - Group similar issues together
            - Identify patterns and trends
            - Highlight the most significant findings first
            - Provide brief explanations where helpful`
          },
          {
            role: 'user',
            content: `Based on this ticket data: ${JSON.stringify(context)}\n\nAnswer this question: ${query}`
          }
        ],
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    if (!openAIResponse.ok) {
      const errorText = await openAIResponse.text();
      console.error('OpenAI API error response:', errorText);
      throw new Error(`OpenAI API error: ${openAIResponse.status} - ${errorText}`);
    }

    const result = await openAIResponse.json();
    const answer = result.choices[0].message.content;

    console.log('Successfully generated response');

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