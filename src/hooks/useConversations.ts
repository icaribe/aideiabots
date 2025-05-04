
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Conversation, Message } from "@/types/chat";

export function useConversations(agentId: string | undefined) {
  const navigate = useNavigate();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [agent, setAgent] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAgent = async () => {
      try {
        if (!agentId) return;

        const { data, error } = await supabase
          .from('bots')
          .select('*')
          .eq('id', agentId)
          .single();

        if (error) {
          console.error("Error fetching agent:", error);
          toast.error("Erro ao carregar o agente");
          navigate("/chat");
          return;
        }

        setAgent(data);
        await fetchConversations();
      } catch (error) {
        console.error("Error:", error);
        toast.error("Erro ao carregar o agente");
      } finally {
        setLoading(false);
      }
    };

    fetchAgent();
  }, [agentId, navigate]);

  const fetchConversations = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/');
        return;
      }

      const { data, error } = await supabase
        .from('conversations')
        .select('*')
        .eq('bot_id', agentId)
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Error fetching conversations:", error);
        toast.error("Erro ao carregar as conversas");
        return;
      }

      setConversations(data || []);

      if (data && data.length > 0) {
        await selectConversation(data[0]);
      } else {
        await createNewConversation();
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Erro ao carregar as conversas");
    }
  };

  const selectConversation = async (selectedConversation: Conversation) => {
    setConversation(selectedConversation);
    
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', selectedConversation.id)
        .order('created_at', { ascending: true });

      if (error) {
        console.error("Error fetching messages:", error);
        toast.error("Erro ao carregar as mensagens");
        return;
      }

      const formattedMessages: Message[] = (data || []).map(msg => ({
        id: msg.id,
        content: msg.content,
        is_from_user: msg.is_from_user || false,
        conversation_id: msg.conversation_id,
        created_at: msg.created_at,
        bot_id: msg.bot_id || "",
        user_id: msg.user_id,
        // Explicitly check if the error property exists and provide a default value if it doesn't
        error: 'error' in msg ? msg.error : false
      }));

      setMessages(formattedMessages);
    } catch (error) {
      console.error("Error:", error);
      toast.error("Erro ao carregar as mensagens");
    }
  };

  const createNewConversation = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/');
        return;
      }

      const { data, error } = await supabase
        .from('conversations')
        .insert({
          bot_id: agentId,
          user_id: session.user.id,
          title: `Nova conversa com ${agent?.name || 'Agente'}`
        })
        .select()
        .single();

      if (error) {
        console.error("Error creating conversation:", error);
        toast.error("Erro ao criar nova conversa");
        return;
      }

      setConversation(data);
      setConversations(prev => [data, ...prev]);
      setMessages([]);
    } catch (error) {
      console.error("Error:", error);
      toast.error("Erro ao criar nova conversa");
    }
  };

  return {
    agent,
    loading,
    conversations,
    conversation,
    messages,
    setMessages,
    selectConversation,
    createNewConversation
  };
}
