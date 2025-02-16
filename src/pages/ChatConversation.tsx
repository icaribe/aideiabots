
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { MessageList } from "@/components/chat/MessageList";
import { MessageInput } from "@/components/chat/MessageInput";
import { ConversationList } from "@/components/chat/ConversationList";

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

const ChatConversation = () => {
  const navigate = useNavigate();
  const { botId } = useParams<{ botId: string }>();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversation, setCurrentConversation] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchConversations = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/");
        return;
      }

      const { data, error } = await supabase
        .from('conversations')
        .select('*')
        .eq('bot_id', botId)
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao buscar conversas:', error);
        toast.error("Erro ao carregar conversas");
        return;
      }

      setConversations(data);
      if (data.length > 0) {
        setCurrentConversation(data[0].id);
      }
    };

    fetchConversations();
  }, [botId, navigate]);

  useEffect(() => {
    const fetchMessages = async () => {
      if (!currentConversation) return;

      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', currentConversation)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Erro ao buscar mensagens:', error);
        toast.error("Erro ao carregar mensagens");
        return;
      }

      setMessages(data);
    };

    fetchMessages();
  }, [currentConversation]);

  const createNewConversation = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const { data, error } = await supabase
      .from('conversations')
      .insert({
        bot_id: botId,
        user_id: session.user.id,
        title: "Nova conversa",
      })
      .select()
      .single();

    if (error) {
      console.error('Erro ao criar conversa:', error);
      toast.error("Erro ao criar nova conversa");
      return;
    }

    setConversations([data, ...conversations]);
    setCurrentConversation(data.id);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !currentConversation) return;

    setIsLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      // Save user message
      const { data: userMessage, error: userMessageError } = await supabase
        .from('messages')
        .insert({
          content: newMessage,
          conversation_id: currentConversation,
          bot_id: botId,
          is_from_user: true,
          user_id: session.user.id
        })
        .select()
        .single();

      if (userMessageError) throw userMessageError;

      setMessages([...messages, userMessage]);
      setNewMessage("");

      // Call the chat function
      const response = await fetch(`https://hmmbolvudsckgzjzzwnr.functions.supabase.co/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: newMessage,
          botId,
          conversationId: currentConversation,
        }),
      });

      if (!response.ok) {
        throw new Error('Erro na resposta do bot');
      }

      const data = await response.json();

      // Fetch the latest messages to include the bot's response
      const { data: updatedMessages, error: messagesError } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', currentConversation)
        .order('created_at', { ascending: true });

      if (messagesError) throw messagesError;

      setMessages(updatedMessages);
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      toast.error("Erro ao enviar mensagem");
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
        onBack={() => navigate("/chat")}
      />
      <div className="flex-1 flex flex-col">
        <MessageList messages={messages} />
        <MessageInput
          value={newMessage}
          onChange={setNewMessage}
          onSubmit={handleSubmit}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
};

export default ChatConversation;
