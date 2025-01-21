import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt } = await req.json();
    console.log('Processing query:', prompt);
    
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get all ticket data without limit
    const { data: tickets, error: ticketError } = await supabase
      .from('ticket_analysis')
      .select('category, priority, responsible_department, sentiment, company_name, created_at')
      .order('created_at', { ascending: false });

    if (ticketError) {
      console.error('Error fetching tickets:', ticketError);
      throw new Error('Failed to fetch ticket data');
    }

    if (!tickets || tickets.length === 0) {
      return new Response(
        JSON.stringify({
          analysis: "No ticket data available for analysis.",
          chartSuggestion: "none",
          chartData: [],
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Process the data to create a summary
    const summary = {
      totalTickets: tickets.length,
      categories: {},
      priorities: {},
      departments: {},
      sentiments: {},
      companies: {},
    };

    tickets.forEach(ticket => {
      if (ticket.category) summary.categories[ticket.category] = (summary.categories[ticket.category] || 0) + 1;
      if (ticket.priority) summary.priorities[ticket.priority] = (summary.priorities[ticket.priority] || 0) + 1;
      if (ticket.responsible_department) {
        summary.departments[ticket.responsible_department] = 
          (summary.departments[ticket.responsible_department] || 0) + 1;
      }
      if (ticket.sentiment) summary.sentiments[ticket.sentiment] = (summary.sentiments[ticket.sentiment] || 0) + 1;
      if (ticket.company_name) summary.companies[ticket.company_name] = (summary.companies[ticket.company_name] || 0) + 1;
    });

    console.log('Data summary prepared:', summary);

    // Call OpenAI API with the summarized data
    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: `You are a data analysis assistant. Analyze the ticket data summary and respond to user queries.
            Format your response as JSON with:
            {
              "analysis": "brief text explanation of insights",
              "chartSuggestion": "bar" or "line",
              "chartData": [{"name": "label", "value": number}]
            }
            Keep responses concise and ensure valid JSON.
            Limit chartData to 10 items for readability.
            Base your analysis on this data summary: ${JSON.stringify(summary)}`
          },
          {
            role: 'user',
            content: prompt,
          }
        ],
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    if (!openAIResponse.ok) {
      console.error('OpenAI API error:', await openAIResponse.text());
      throw new Error('OpenAI API error');
    }

    const openAIData = await openAIResponse.json();
    console.log('OpenAI response:', openAIData);

    if (!openAIData.choices?.[0]?.message?.content) {
      throw new Error('Invalid response format from OpenAI');
    }

    let parsedResponse;
    try {
      parsedResponse = JSON.parse(openAIData.choices[0].message.content);
      console.log('Parsed response:', parsedResponse);

      if (!parsedResponse.analysis || !parsedResponse.chartSuggestion || !Array.isArray(parsedResponse.chartData)) {
        throw new Error('Invalid response structure');
      }
    } catch (error) {
      console.error('Error parsing OpenAI response:', error);
      throw new Error('Failed to parse OpenAI response');
    }

    return new Response(
      JSON.stringify(parsedResponse),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in analyze-charts function:', error);
    return new Response(
      JSON.stringify({
        error: error.message,
        analysis: "Failed to analyze the data.",
        chartSuggestion: "none",
        chartData: [],
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});