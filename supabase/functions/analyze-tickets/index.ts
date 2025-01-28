import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const { query } = await req.json();
    console.log('Received query:', query);

    if (!query) {
      throw new Error('Query is required');
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('Fetching relevant tickets...');

    // Search for relevant tickets using textSearch
    const { data: relevantTickets, error: searchError } = await supabase
      .from('ticket_analysis')
      .select('*')
      .textSearch('summary', query, {
        type: 'plain',
        config: 'english'
      })
      .limit(10);

    if (searchError) {
      console.error('Error searching tickets:', searchError);
      throw searchError;
    }

    // Get statistics for context
    const { data: stats, error: statsError } = await supabase
      .from('ticket_analysis')
      .select('category, subcategory, common_issue, responsible_department')
      .limit(1000);

    if (statsError) {
      console.error('Error fetching statistics:', statsError);
      throw statsError;
    }

    // Process statistics
    const categoryCounts = stats.reduce((acc, ticket) => {
      const category = ticket.category || 'Uncategorized';
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {});

    // Create context from relevant tickets and statistics
    const context = `
    Based on the analysis of our ticket database:

    Relevant Tickets:
    ${relevantTickets?.map(ticket => `
    - Category: ${ticket.category}
    - Issue: ${ticket.common_issue}
    - Summary: ${ticket.summary}
    - Department: ${ticket.responsible_department}
    `).join('\n')}

    Overall Statistics:
    ${Object.entries(categoryCounts)
      .map(([category, count]) => `${category}: ${count} tickets`)
      .join('\n')}
    `;

    console.log('Calling OpenAI with context...');

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
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
            content: `You are a helpful ticket analysis assistant. Use the provided context to answer questions accurately. 
            Format your responses using markdown.
            If you're not confident about an answer, acknowledge the uncertainty.
            Focus on trends and patterns in the data.
            Keep responses concise and well-structured.`
          },
          {
            role: 'user',
            content: `Context:\n${context}\n\nQuestion: ${query}`
          }
        ],
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error response:', errorText);
      throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
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