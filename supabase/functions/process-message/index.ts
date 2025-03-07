
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Lidar com requisições OPTIONS para CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Obter as variáveis de ambiente
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

    // Inicializar o cliente Supabase
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Obter os dados da requisição
    const { message, conversationId, botId } = await req.json();

    if (!message || !conversationId || !botId) {
      return new Response(
        JSON.stringify({ error: 'Parâmetros inválidos' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Buscar o bot e configurações
    const { data: bot, error: botError } = await supabase
      .from('bots')
      .select('*')
      .eq('id', botId)
      .single();

    if (botError) {
      console.error('Erro ao buscar informações do bot:', botError);
      return new Response(
        JSON.stringify({ error: 'Bot não encontrado' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Aqui você integraria com o provedor LLM selecionado para o bot
    // Por enquanto, simularemos uma resposta
    const assistantResponse = `Isso é uma resposta simulada do bot ${bot.name}. Em uma integração real, isso seria processado pelo modelo ${bot.model} do provedor ${bot.llm_provider}.`;

    // Inserir a resposta do assistente no banco de dados
    const { error: responseError } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        role: 'assistant',
        content: assistantResponse
      });

    if (responseError) {
      console.error('Erro ao salvar resposta do assistente:', responseError);
      return new Response(
        JSON.stringify({ error: 'Erro ao processar mensagem' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Atualizar o título da conversa se for a primeira mensagem
    const { data: messageCount } = await supabase
      .from('messages')
      .select('id', { count: 'exact' })
      .eq('conversation_id', conversationId);

    if (messageCount && messageCount.length <= 2) {
      await supabase
        .from('conversations')
        .update({ title: message.substring(0, 50) + (message.length > 50 ? '...' : '') })
        .eq('id', conversationId);
    }

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Erro no processamento da mensagem:', error);
    return new Response(
      JSON.stringify({ error: 'Erro interno do servidor' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
