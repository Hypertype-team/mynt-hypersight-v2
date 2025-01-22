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
    return new Response(null, { 
      headers: corsHeaders,
      status: 200
    });
  }

  try {
    // Parse the request body
    const { query } = await req.json();

    if (!query) {
      throw new Error('Query is required');
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('Fetching ticket data for query:', query);

    // Fetch relevant data from ticket_analysis
    const { data: tickets, error } = await supabase
      .from('ticket_analysis')
      .select('summary, issue, common_issue, category, subcategory, link, responsible_department_justification');

    if (error) {
      console.error('Database query error:', error);
      throw error;
    }

    console.log('Retrieved ticket count:', tickets?.length);

    // Get all valid links from the database
    const validLinks = new Set(
      tickets
        .filter(ticket => ticket.link)
        .map(ticket => ticket.link)
    );

    // Format the context for OpenAI
    const context = tickets.map(ticket => ({
      summary: ticket.summary,
      issue: ticket.issue,
      common_issue: ticket.common_issue,
      category: ticket.category,
      subcategory: ticket.subcategory,
      link: ticket.link,
      justification: ticket.responsible_department_justification
    }));

    console.log('Calling OpenAI API');

    // Call OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: `You are a helpful assistant analyzing ticket data. Use the provided context to give insightful, well-organized answers.
            
            Guidelines for your responses:
            1. Always summarize and organize information into clear, readable points
            2. Use bullet points or numbered lists for better readability
            3. Group related information together
            4. Highlight key insights at the beginning
            5. If mentioning statistics, round numbers and present them clearly
            6. Only include links that are present in this list: ${Array.from(validLinks).join(', ')}
            7. Keep responses concise but informative
            8. Use markdown formatting for better readability
            
            When analyzing categories or issues:
            - Group similar issues together
            - Identify patterns and trends
            - Highlight the most significant findings first
            - Provide brief explanations where helpful
            
            Never dump raw data. Instead, process and present it in a way that's immediately useful to the reader.
            
            IMPORTANT: When including links in your response, ONLY use links from the validated list provided. Do not make up or suggest any links that aren't in the database.`
          },
          {
            role: 'user',
            content: `Context: ${JSON.stringify(context)}\n\nQuestion: ${query}`
          }
        ],
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      console.error('OpenAI API error:', await response.text());
      throw new Error('Failed to get response from OpenAI');
    }

    const result = await response.json();
    const answer = result.choices[0].message.content;

    console.log('Successfully generated response');

    // Post-process the answer to ensure only valid links are included
    let processedAnswer = answer;
    const markdownLinkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    processedAnswer = processedAnswer.replace(markdownLinkRegex, (match, text, url) => {
      return validLinks.has(url) ? match : text;
    });

    return new Response(
      JSON.stringify({ answer: processedAnswer }),
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
        error: error.message,
        details: error.stack 
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