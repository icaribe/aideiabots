
import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { SendHorizontal, ChevronLeft, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";

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
  const messagesEndRef = useRef<HTMLDivElement>(null);
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
      
      // If there are conversations but none is selected, select the most recent one
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

    // Subscribe to new messages
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

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

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
    if (!newMessage.trim() || !agentId || !currentConversation) return;

    setIsLoading(true);
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      toast.error("Você precisa estar logado para enviar mensagens");
      return;
    }

    const { error } = await supabase
      .from('messages')
      .insert({
        content: newMessage,
        bot_id: agentId,
        user_id: session.user.id,
        is_from_user: true,
        conversation_id: currentConversation
      });

    if (error) {
      toast.error("Erro ao enviar mensagem");
      setIsLoading(false);
      return;
    }

    setNewMessage("");
    setIsLoading(false);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r flex flex-col">
        <div className="p-4 border-b flex justify-between items-center">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => navigate("/agents")}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button onClick={createNewConversation}>
            <Plus className="h-4 w-4 mr-2" />
            Nova Conversa
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          {conversations.map((conv) => (
            <div
              key={conv.id}
              className={`p-3 rounded-lg mb-2 cursor-pointer hover:bg-gray-100 ${
                currentConversation === conv.id ? 'bg-gray-100' : ''
              }`}
              onClick={() => setCurrentConversation(conv.id)}
            >
              {conv.title}
            </div>
          ))}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        <header className="px-6 py-4 border-b bg-white">
          <h1 className="text-xl font-semibold">{agentName}</h1>
        </header>

        {currentConversation ? (
          <>
            <div className="flex-1 overflow-y-auto p-6">
              <div className="max-w-3xl mx-auto space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.is_from_user ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`rounded-lg px-4 py-2 max-w-[70%] ${
                        message.is_from_user
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-200 text-gray-900'
                      }`}
                    >
                      {message.content}
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </div>

            <form onSubmit={handleSendMessage} className="p-4 border-t bg-white">
              <div className="max-w-3xl mx-auto flex gap-2">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Digite sua mensagem..."
                  disabled={isLoading}
                />
                <Button type="submit" disabled={isLoading}>
                  <SendHorizontal className="h-4 w-4" />
                </Button>
              </div>
            </form>
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
