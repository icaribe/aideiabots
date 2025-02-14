
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

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
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { botId, message, conversationId } = await req.json();
    
    // Fetch bot configuration
    const { data: bot, error: botError } = await supabase
      .from('bots')
      .select('*')
      .eq('id', botId)
      .single();

    if (botError || !bot) {
      console.error('Error fetching bot:', botError);
      throw new Error('Bot não encontrado');
    }

    let response;
    switch (bot.llm_provider.toLowerCase()) {
      case 'openai':
        response = await handleOpenAIRequest(message, bot);
        break;
      case 'anthropic':
        response = await handleAnthropicRequest(message, bot);
        break;
      case 'groq':
        response = await handleGroqRequest(message, bot);
        break;
      case 'gemini':
        response = await handleGeminiRequest(message, bot);
        break;
      default:
        throw new Error('Provedor LLM não suportado');
    }

    // Save bot response to database
    const { error: messageError } = await supabase
      .from('messages')
      .insert({
        content: response,
        conversation_id: conversationId,
        bot_id: botId,
        is_from_user: false,
        user_id: bot.user_id
      });

    if (messageError) {
      console.error('Error saving message:', messageError);
      throw new Error('Erro ao salvar mensagem');
    }

    return new Response(
      JSON.stringify({ response }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in chat function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

async function handleOpenAIRequest(message: string, bot: any) {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${bot.api_key}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: bot.model,
      messages: [{ role: 'user', content: message }],
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    throw new Error('Erro na chamada à API da OpenAI');
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

async function handleAnthropicRequest(message: string, bot: any) {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': bot.api_key,
      'anthropic-version': '2023-06-01',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: bot.model,
      messages: [{ role: 'user', content: message }],
    }),
  });

  if (!response.ok) {
    throw new Error('Erro na chamada à API da Anthropic');
  }

  const data = await response.json();
  return data.content[0].text;
}

async function handleGroqRequest(message: string, bot: any) {
  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${bot.api_key}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: bot.model,
      messages: [{ role: 'user', content: message }],
    }),
  });

  if (!response.ok) {
    throw new Error('Erro na chamada à API da Groq');
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

async function handleGeminiRequest(message: string, bot: any) {
  const response = await fetch('https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-goog-api-key': bot.api_key,
    },
    body: JSON.stringify({
      contents: [{ parts: [{ text: message }] }],
    }),
  });

  if (!response.ok) {
    throw new Error('Erro na chamada à API do Gemini');
  }

  const data = await response.json();
  return data.candidates[0].content.parts[0].text;
}
