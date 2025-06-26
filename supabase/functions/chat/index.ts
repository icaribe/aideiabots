
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Max-Age': '86400',
};

serve(async (req) => {
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
    console.log('Processing chat request:', { botId, conversationId, messageLength: message?.length });
    
    // Fetch bot configuration
    const { data: bot, error: botError } = await supabase
      .from('bots')
      .select('*')
      .eq('id', botId)
      .single();

    if (botError || !bot) {
      console.error('Error fetching bot:', botError);
      throw new Error('Agente não encontrado');
    }

    console.log('Bot found. Provider:', bot.llm_provider, 'Model:', bot.model);

    // Get API key from credentials or environment
    let apiKey = null;
    if (bot.llm_credential_id) {
      const { data: credential, error: credentialError } = await supabase
        .from('provider_credentials')
        .select('*')
        .eq('id', bot.llm_credential_id)
        .single();
        
      if (credentialError) {
        console.error('Error fetching credential:', credentialError);
        throw new Error('Credencial do LLM não encontrada');
      }
      
      apiKey = credential.api_key;
      console.log('Using credential API key for provider:', bot.llm_provider);
    } else {
      // Fallback to environment variables
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
        default:
          console.error('Unsupported LLM provider:', bot.llm_provider);
          throw new Error(`Provedor LLM não suportado: ${bot.llm_provider}`);
      }
    }
    
    if (!apiKey) {
      throw new Error(`Chave API para ${bot.llm_provider} não configurada`);
    }

    // Get conversation history for context
    const { data: conversationHistory, error: historyError } = await supabase
      .from('messages')
      .select('content, is_from_user, created_at')
      .eq('conversation_id', conversationId)
      .eq('error', false)
      .order('created_at', { ascending: true })
      .limit(10); // Last 10 messages for context

    if (historyError) {
      console.error('Error fetching conversation history:', historyError);
    }

    // Build messages array with context
    const messages = [];
    
    // Add system prompt
    const systemPrompt = bot.description || "Você é um assistente útil e amigável. Responda de forma clara e precisa.";
    messages.push({ role: 'system', content: systemPrompt });

    // Add conversation history
    if (conversationHistory && conversationHistory.length > 0) {
      conversationHistory.forEach(msg => {
        messages.push({
          role: msg.is_from_user ? 'user' : 'assistant',
          content: msg.content
        });
      });
    }

    // Add current message
    messages.push({ role: 'user', content: message });

    console.log('Sending request to LLM with', messages.length, 'messages');

    // Process with appropriate LLM provider
    let response;
    switch (bot.llm_provider.toLowerCase()) {
      case 'openai':
        response = await handleOpenAIRequest(messages, bot, apiKey);
        break;
      case 'anthropic':
        response = await handleAnthropicRequest(messages, bot, apiKey);
        break;
      case 'groq':
        response = await handleGroqRequest(messages, bot, apiKey);
        break;
      case 'gemini':
        response = await handleGeminiRequest(messages, bot, apiKey);
        break;
      default:
        throw new Error(`Provedor LLM não suportado: ${bot.llm_provider}`);
    }

    console.log('LLM response received, length:', response.length);

    // Save bot response to database
    const { error: messageError } = await supabase
      .from('messages')
      .insert({
        content: response,
        conversation_id: conversationId,
        bot_id: botId,
        is_from_user: false,
        user_id: bot.user_id,
        error: false
      });

    if (messageError) {
      console.error('Error saving bot message:', messageError);
      throw new Error('Erro ao salvar resposta do agente');
    }

    return new Response(
      JSON.stringify({ response }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in chat function:', error);
    
    return new Response(
      JSON.stringify({ error: error.message || 'Erro interno do servidor' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

async function handleOpenAIRequest(messages, bot, apiKey) {
  console.log('Making OpenAI request with model:', bot.model);
  
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: bot.model || 'gpt-4o-mini',
      messages: messages,
      temperature: 0.7,
      max_tokens: 1000,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('OpenAI API error:', error);
    throw new Error(`Erro na API da OpenAI: ${response.status}`);
  }

  const data = await response.json();
  return data.choices[0]?.message?.content || 'Desculpe, não consegui gerar uma resposta.';
}

async function handleAnthropicRequest(messages, bot, apiKey) {
  console.log('Making Anthropic request with model:', bot.model);
  
  // Extract system message
  const systemMessage = messages.find(msg => msg.role === 'system');
  const conversationMessages = messages.filter(msg => msg.role !== 'system');
  
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: bot.model || 'claude-3-sonnet-20240229',
      max_tokens: 1000,
      system: systemMessage?.content || 'Você é um assistente útil.',
      messages: conversationMessages,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('Anthropic API error:', error);
    throw new Error(`Erro na API da Anthropic: ${response.status}`);
  }

  const data = await response.json();
  return data.content[0]?.text || 'Desculpe, não consegui gerar uma resposta.';
}

async function handleGroqRequest(messages, bot, apiKey) {
  console.log('Making Groq request with model:', bot.model);
  
  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: bot.model || 'mixtral-8x7b-32768',
      messages: messages,
      temperature: 0.7,
      max_tokens: 1000,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('Groq API error:', error);
    throw new Error(`Erro na API do Groq: ${response.status}`);
  }

  const data = await response.json();
  return data.choices[0]?.message?.content || 'Desculpe, não consegui gerar uma resposta.';
}

async function handleGeminiRequest(messages, bot, apiKey) {
  console.log('Making Gemini request with model:', bot.model);
  
  // Convert messages to Gemini format
  const systemMessage = messages.find(msg => msg.role === 'system');
  const conversationMessages = messages.filter(msg => msg.role !== 'system');
  
  let prompt = '';
  if (systemMessage) {
    prompt += systemMessage.content + '\n\n';
  }
  
  conversationMessages.forEach(msg => {
    const role = msg.role === 'user' ? 'Usuário' : 'Assistente';
    prompt += `${role}: ${msg.content}\n`;
  });
  
  const modelName = bot.model || 'gemini-1.5-flash';
  
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [
        { 
          parts: [{ text: prompt }]
        }
      ],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 1000,
      }
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('Gemini API error:', error);
    throw new Error(`Erro na API do Gemini: ${response.status}`);
  }

  const data = await response.json();
  return data.candidates[0]?.content?.parts[0]?.text || 'Desculpe, não consegui gerar uma resposta.';
}
