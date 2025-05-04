
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Max-Age': '86400',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: corsHeaders
    });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { botId, message, conversationId } = await req.json();
    console.log('Received request:', { botId, message, conversationId });
    
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

    console.log('Bot configuration:', { llm_provider: bot.llm_provider, model: bot.model });

    // Buscar credencial LLM se existir
    let apiKey = null;
    if (bot.llm_credential_id) {
      const { data: credential, error: credentialError } = await supabase
        .from('provider_credentials')
        .select('*')
        .eq('id', bot.llm_credential_id)
        .single();
        
      if (credentialError) {
        console.error('Error fetching credential:', credentialError);
        throw new Error('Credencial não encontrada');
      }
      
      apiKey = credential.api_key;
    } else {
      // Fallback para variáveis de ambiente ou API key direta do bot
      switch (bot.llm_provider.toLowerCase()) {
        case 'groq':
          apiKey = Deno.env.get('GROQ_API_KEY') || bot.api_key;
          break;
        case 'openai':
          apiKey = Deno.env.get('OPENAI_API_KEY') || bot.api_key;
          break;
        case 'anthropic':
          apiKey = Deno.env.get('ANTHROPIC_API_KEY') || bot.api_key;
          break;
        case 'gemini':
          apiKey = Deno.env.get('GOOGLE_API_KEY') || bot.api_key;
          break;
      }
    }
    
    if (!apiKey) {
      throw new Error(`Chave API para ${bot.llm_provider} não configurada.`);
    }

    const systemPrompt = bot.description || "Você é um assistente útil e amigável.";
    let response;

    switch (bot.llm_provider.toLowerCase()) {
      case 'openai':
        response = await handleOpenAIRequest(message, systemPrompt, { ...bot, api_key: apiKey });
        break;
      case 'anthropic':
        response = await handleAnthropicRequest(message, systemPrompt, { ...bot, api_key: apiKey });
        break;
      case 'groq':
        response = await handleGroqRequest(message, systemPrompt, { ...bot, api_key: apiKey });
        break;
      case 'gemini':
        response = await handleGeminiRequest(message, systemPrompt, { ...bot, api_key: apiKey });
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
    
    // Resposta mais detalhada para o front-end
    return new Response(
      JSON.stringify({ error: error.message || 'Erro interno do servidor' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

async function handleOpenAIRequest(message, systemPrompt, bot) {
  console.log('Making OpenAI request with model:', bot.model);
  
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${bot.api_key}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: bot.model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: message }
      ],
      temperature: 0.7,
      max_tokens: 1000,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('OpenAI API error:', error);
    throw new Error(`Erro na API da OpenAI: ${error}`);
  }

  const data = await response.json();
  console.log('OpenAI response:', data);
  return data.choices[0]?.message?.content || 'No response generated';
}

async function handleAnthropicRequest(message, systemPrompt, bot) {
  console.log('Making Anthropic request with model:', bot.model);
  
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': bot.api_key,
      'anthropic-version': '2023-06-01',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: bot.model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: message }
      ],
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('Anthropic API error:', error);
    throw new Error(`Erro na API da Anthropic: ${error}`);
  }

  const data = await response.json();
  console.log('Anthropic response:', data);
  return data.content[0]?.text || 'No response generated';
}

async function handleGeminiRequest(message, systemPrompt, bot) {
  console.log('Making Gemini request with model:', bot.model);
  
  const response = await fetch('https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-goog-api-key': bot.api_key,
    },
    body: JSON.stringify({
      contents: [
        { parts: [{ text: systemPrompt }] },
        { parts: [{ text: message }] }
      ],
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('Gemini API error:', error);
    throw new Error(`Erro na API do Gemini: ${error}`);
  }

  const data = await response.json();
  console.log('Gemini response:', data);
  return data.candidates[0]?.content?.parts[0]?.text || 'No response generated';
}

async function handleGroqRequest(message, systemPrompt, bot) {
  console.log('Making Groq request with model:', bot.model);
  
  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${bot.api_key}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: bot.model || 'mixtral-8x7b-32768',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: message }
      ],
      temperature: 0.7,
      max_tokens: 1000,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('Groq API error:', error);
    throw new Error(`Erro na API do Groq: ${error}`);
  }

  const data = await response.json();
  console.log('Groq response:', data);
  return data.choices[0]?.message?.content || 'No response generated';
}
