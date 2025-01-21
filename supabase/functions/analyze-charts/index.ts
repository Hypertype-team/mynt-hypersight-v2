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
    const { prompt } = await req.json();
    console.log('Received prompt:', prompt);

    // Create Supabase client
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
      throw ticketError;
    }

    if (!tickets || tickets.length === 0) {
      return new Response(
        JSON.stringify({
          analysis: "No ticket data available to analyze.",
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
              "chartSuggestion": "line or bar",
              "chartData": [{"name": "Category 1", "value": 10}, {"name": "Category 2", "value": 20}]
            }
            Always ensure chartData is an array of objects with name and value properties.
            Based on the user's prompt, analyze the data and suggest either a line chart for time-based trends or a bar chart for comparisons.`
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

    const analysis = JSON.parse(data.choices[0].message.content);

    // Validate the analysis format
    if (!analysis.chartData || !Array.isArray(analysis.chartData)) {
      throw new Error('Invalid chart data format');
    }

    return new Response(JSON.stringify(analysis), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error:', error);
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