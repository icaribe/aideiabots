
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";
import { ConversationList } from "@/components/chat/ConversationList";
import { MessageList } from "@/components/chat/MessageList";
import { MessageInput } from "@/components/chat/MessageInput";

type Message = {
  id: string;
  content: string;
  is_from_user: boolean;
  created_at: string;
  conversation_id: string;
};

type Conversation = {
  id: string;
  title: string;
  created_at: string;
};

const Chat = () => {
  const { agentId } = useParams();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversation, setCurrentConversation] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [agentName, setAgentName] = useState("");

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/");
        return;
      }
    };

    checkAuth();
  }, [navigate]);

  useEffect(() => {
    const fetchAgent = async () => {
      if (!agentId) return;
      
      const { data: agent, error } = await supabase
        .from('bots')
        .select('name')
        .eq('id', agentId)
        .single();

      if (error || !agent) {
        toast.error("Erro ao carregar o agente");
        navigate('/agents');
        return;
      }

      setAgentName(agent.name);
    };

    fetchAgent();
  }, [agentId, navigate]);

  useEffect(() => {
    const fetchConversations = async () => {
      if (!agentId) return;

      const { data, error } = await supabase
        .from('conversations')
        .select('*')
        .eq('bot_id', agentId)
        .order('created_at', { ascending: false });

      if (error) {
        toast.error("Erro ao carregar conversas");
        return;
      }

      setConversations(data || []);
      
      if (data && data.length > 0 && !currentConversation) {
        setCurrentConversation(data[0].id);
      }
    };

    fetchConversations();
  }, [agentId, currentConversation]);

  useEffect(() => {
    const fetchMessages = async () => {
      if (!currentConversation) return;

      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', currentConversation)
        .order('created_at', { ascending: true });

      if (error) {
        toast.error("Erro ao carregar mensagens");
        return;
      }

      setMessages(data || []);
    };

    fetchMessages();

    const channel = supabase
      .channel('messages_channel')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${currentConversation}`,
        },
        (payload) => {
          setMessages((current) => [...current, payload.new as Message]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentConversation]);

  const createNewConversation = async () => {
    if (!agentId) return;

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      toast.error("Você precisa estar logado para criar uma conversa");
      return;
    }

    const { data: conversation, error } = await supabase
      .from('conversations')
      .insert({
        bot_id: agentId,
        user_id: session.user.id,
        title: `Nova conversa ${format(new Date(), 'dd/MM/yyyy HH:mm')}`
      })
      .select()
      .single();

    if (error) {
      toast.error("Erro ao criar nova conversa");
      return;
    }

    setConversations(prev => [conversation, ...prev]);
    setCurrentConversation(conversation.id);
    setMessages([]);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !agentId || !currentConversation || isLoading) return;

    setIsLoading(true);
    const messageContent = newMessage; // Guardar o conteúdo antes de limpar
    setNewMessage(""); // Limpar o input imediatamente após o envio

    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      toast.error("Você precisa estar logado para enviar mensagens");
      setIsLoading(false);
      return;
    }

    try {
      const { error: userMessageError } = await supabase
        .from('messages')
        .insert({
          content: messageContent,
          bot_id: agentId,
          user_id: session.user.id,
          is_from_user: true,
          conversation_id: currentConversation
        });

      if (userMessageError) {
        throw new Error("Erro ao enviar mensagem");
      }

      const { data: response, error: functionError } = await supabase.functions
        .invoke('chat', {
          body: {
            botId: agentId,
            message: messageContent,
            conversationId: currentConversation
          }
        });

      if (functionError) {
        throw new Error("Erro ao processar mensagem");
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <ConversationList
        conversations={conversations}
        currentConversation={currentConversation}
        onConversationSelect={setCurrentConversation}
        onNewConversation={createNewConversation}
        onBack={() => navigate("/agents")}
      />

      <div className="flex-1 flex flex-col">
        <header className="px-6 py-4 border-b bg-white">
          <h1 className="text-xl font-semibold">{agentName}</h1>
        </header>

        {currentConversation ? (
          <>
            <MessageList messages={messages} />
            <MessageInput
              value={newMessage}
              onChange={setNewMessage}
              onSubmit={handleSendMessage}
              isLoading={isLoading}
            />
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <Button onClick={createNewConversation}>
              <Plus className="h-4 w-4 mr-2" />
              Iniciar Nova Conversa
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat;
