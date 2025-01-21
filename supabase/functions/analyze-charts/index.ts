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
    
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get ticket data with specific columns and limit
    const { data: tickets, error: ticketError } = await supabase
      .from('ticket_analysis')
      .select('category, priority, sentiment, responsible_department, created_at')
      .order('created_at', { ascending: false })
      .limit(100);

    if (ticketError) {
      console.error('Error fetching tickets:', ticketError);
      throw new Error('Failed to fetch ticket data');
    }

    if (!tickets || tickets.length === 0) {
      console.error('No tickets found');
      return new Response(
        JSON.stringify({
          analysis: "No ticket data available for analysis.",
          chartSuggestion: "none",
          chartData: []
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Process the data to create a summary
    const summary = {
      totalTickets: tickets.length,
      categories: {},
      priorities: {},
      departments: {},
      timeRange: {
        start: tickets[tickets.length - 1]?.created_at,
        end: tickets[0]?.created_at
      }
    };

    tickets.forEach(ticket => {
      if (ticket.category) summary.categories[ticket.category] = (summary.categories[ticket.category] || 0) + 1;
      if (ticket.priority) summary.priorities[ticket.priority] = (summary.priorities[ticket.priority] || 0) + 1;
      if (ticket.responsible_department) {
        summary.departments[ticket.responsible_department] = 
          (summary.departments[ticket.responsible_department] || 0) + 1;
      }
    });

    console.log('Data summary prepared:', summary);

    // Call OpenAI API with the summarized data
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: `You are a data analysis assistant. Analyze ticket data summary and provide insights. 
            Format your response as JSON with the following structure:
            {
              "analysis": "text explanation of insights",
              "chartSuggestion": "bar" or "line",
              "chartData": [{"name": "label", "value": number}, ...]
            }`,
          },
          {
            role: 'user',
            content: `Analyze this ticket data summary and respond to this prompt: ${prompt}\n\nData summary: ${JSON.stringify(summary)}`,
          }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', errorText);
      throw new Error(`OpenAI API error: ${errorText}`);
    }

    const data = await response.json();
    console.log('OpenAI response:', data);
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      throw new Error('Invalid response format from OpenAI');
    }

    let aiResponse;
    try {
      aiResponse = JSON.parse(data.choices[0].message.content);
    } catch (error) {
      console.error('Error parsing OpenAI response:', error);
      throw new Error('Failed to parse OpenAI response');
    }

    return new Response(
      JSON.stringify(aiResponse),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in analyze-charts function:', error);
    return new Response(
      JSON.stringify({
        error: error.message,
        analysis: "Failed to analyze the data.",
        chartSuggestion: "none",
        chartData: []
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});