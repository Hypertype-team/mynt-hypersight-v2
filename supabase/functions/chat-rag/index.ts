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
    const { prompt } = await req.json();
    
    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Fetch relevant context from the ticket_analysis table
    const { data: relevantTickets } = await supabaseClient
      .from('ticket_analysis')
      .select('*')
      .textSearch('summary', prompt.split(' ').join(' & '))
      .limit(5);

    // Prepare context from relevant tickets
    const context = relevantTickets?.map(ticket => `
      Summary: ${ticket.summary}
      Category: ${ticket.category}
      Priority: ${ticket.priority}
      Department: ${ticket.responsible_department}
      Issue: ${ticket.issue}
    `).join('\n\n');

    // Call OpenAI with context
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
            content: `You are a helpful assistant analyzing ticket data. Use the following context from similar tickets to inform your responses, but don't mention that you're using this context unless explicitly asked. Context:\n\n${context}`
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to get response from OpenAI');
    }

    const data = await response.json();
    const analysis = data.choices[0].message.content;

    // Get follow-up questions based on the context
    const followUpResponse = await fetch('https://api.openai.com/v1/chat/completions', {
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
            content: 'Based on the previous response and ticket context, generate 3 relevant follow-up questions that would help explore the data further. Make them specific and data-focused.'
          },
          { role: 'assistant', content: analysis },
          { role: 'user', content: 'Generate 3 follow-up questions.' }
        ],
        temperature: 0.7,
      }),
    });

    const followUpData = await followUpResponse.json();
    const followUpQuestions = followUpData.choices[0].message.content
      .split('\n')
      .filter(q => q.trim())
      .slice(0, 3);

    return new Response(
      JSON.stringify({
        analysis,
        followUpQuestions,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});