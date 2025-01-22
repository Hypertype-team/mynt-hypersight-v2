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

    // Get all ticket data
    const { data: tickets, error: ticketError } = await supabase
      .from('ticket_analysis')
      .select('*');

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
          followUpQuestions: [],
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
      issues: {},
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
      if (ticket.issue_summary) summary.issues[ticket.issue_summary] = (summary.issues[ticket.issue_summary] || 0) + 1;
    });

    console.log('Data summary prepared:', summary);

    // Call OpenAI API
    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
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
            content: `You are a data analysis assistant specialized in analyzing ticket data. 
            You have access to ticket analysis data with the following summary: ${JSON.stringify(summary)}.
            
            When analyzing the data, consider:
            - Distribution of tickets across categories
            - Priority levels and their frequency
            - Sentiment analysis trends
            - Department workload distribution
            - Company-specific patterns
            - Common issues and their frequency
            
            Format your response as JSON with the following structure:
            {
              "analysis": "detailed text explanation of insights",
              "chartSuggestion": "bar" or "line",
              "chartData": [{"name": "label", "value": number}, ...],
              "followUpQuestions": ["question1", "question2", "question3"]
            }
            
            Keep your response concise and ensure the JSON is valid.
            Limit chartData to 10 data points maximum for readability.
            Include 3 relevant follow-up questions based on the current analysis.`
          },
          {
            role: 'user',
            content: prompt,
          }
        ],
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    if (!openAIResponse.ok) {
      console.error('OpenAI API error:', await openAIResponse.text());
      throw new Error('OpenAI API error');
    }

    const openAIData = await openAIResponse.json();
    console.log('OpenAI response:', openAIData);

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
        followUpQuestions: [],
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});