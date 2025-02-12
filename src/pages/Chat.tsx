
import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { SendHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type Message = {
  id: string;
  content: string;
  is_from_user: boolean;
  created_at: string;
};

const Chat = () => {
  const { agentId } = useParams();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
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
    const fetchMessages = async () => {
      if (!agentId) return;

      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('bot_id', agentId)
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
          filter: `bot_id=eq.${agentId}`,
        },
        (payload) => {
          setMessages((current) => [...current, payload.new as Message]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [agentId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !agentId) return;

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
        is_from_user: true
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
    <div className="flex flex-col h-screen bg-gray-50">
      <header className="px-6 py-4 border-b bg-white">
        <h1 className="text-xl font-semibold">{agentName}</h1>
      </header>

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
    </div>
  );
};

export default Chat;
