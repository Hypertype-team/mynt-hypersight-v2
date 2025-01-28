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

    // Fetch only the most recent tickets (limit to 100) and select only necessary fields
    const { data: tickets, error: dbError } = await supabase
      .from('ticket_analysis')
      .select('summary, common_issue, category, subcategory, responsible_department')
      .order('created_at', { ascending: false })
      .limit(100);

    if (dbError) {
      console.error('Database query error:', dbError);
      throw dbError;
    }

    console.log(`Retrieved ${tickets?.length} tickets for analysis`);

    // Create a summarized context from the tickets
    const ticketSummaries = tickets?.map(ticket => ({
      issue: ticket.common_issue,
      category: ticket.category,
      department: ticket.responsible_department
    }));

    // Group tickets by category for a more concise context
    const categorySummary = tickets?.reduce((acc, ticket) => {
      const category = ticket.category || 'Uncategorized';
      if (!acc[category]) {
        acc[category] = {
          count: 0,
          common_issues: new Set(),
          departments: new Set()
        };
      }
      acc[category].count++;
      if (ticket.common_issue) acc[category].common_issues.add(ticket.common_issue);
      if (ticket.responsible_department) acc[category].departments.add(ticket.responsible_department);
      return acc;
    }, {});

    // Convert the summary to a string format
    const contextSummary = Object.entries(categorySummary)
      .map(([category, data]) => `
        Category: ${category}
        Count: ${data.count}
        Common Issues: ${Array.from(data.common_issues).join(', ')}
        Departments: ${Array.from(data.departments).join(', ')}
      `).join('\n');

    console.log('Calling OpenAI API with optimized context...');

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
            content: `You are a helpful assistant analyzing ticket data. Your task is to provide insights about the tickets based on the user's query.
            
            Guidelines for your responses:
            1. Keep responses concise and focused
            2. Use bullet points for better readability
            3. Highlight key insights
            4. Use markdown formatting
            5. Focus on trends and patterns`
          },
          {
            role: 'user',
            content: `Based on this ticket summary:\n${contextSummary}\n\nAnswer this question: ${query}`
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