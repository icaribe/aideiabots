
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { Bot, ChevronLeft, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/dashboard/AppSidebar";
import { MessageList } from "@/components/chat/MessageList";
import { MessageInput } from "@/components/chat/MessageInput";
import { ConversationList } from "@/components/chat/ConversationList";
import { Message, Conversation } from "@/types/chat";

const ChatConversation = () => {
  const { agentId } = useParams<{ agentId: string }>();
  const navigate = useNavigate();
  const [agent, setAgent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [workspace] = useState("Meu Workspace");

  // Fetch agent details
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

  // Fetch conversations for this agent
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

      // If there are conversations, select the first one
      if (data && data.length > 0) {
        await selectConversation(data[0]);
      } else {
        // If no conversation exists, create a new one
        await createNewConversation();
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Erro ao carregar as conversas");
    }
  };

  // Select a conversation
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

      // Convert database format to UI format
      const formattedMessages: Message[] = (data || []).map(msg => ({
        id: msg.id,
        content: msg.content,
        is_from_user: msg.is_from_user || false,
        conversation_id: msg.conversation_id,
        created_at: msg.created_at,
        bot_id: msg.bot_id,
        user_id: msg.user_id,
        error: msg.error || false
      }));

      setMessages(formattedMessages);
    } catch (error) {
      console.error("Error:", error);
      toast.error("Erro ao carregar as mensagens");
    }
  };

  // Create a new conversation
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

  // Send message to agent
  const sendMessage = async (content: string) => {
    if (!content.trim() || !conversation) return;

    try {
      setSendingMessage(true);
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate('/');
        return;
      }

      // Add user message to UI
      const userMessage: Message = {
        id: crypto.randomUUID(),
        content,
        is_from_user: true,
        conversation_id: conversation.id,
        created_at: new Date().toISOString()
      };

      setMessages(prev => [...prev, userMessage]);

      // Save user message to database
      const { error: messageError } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversation.id,
          content,
          is_from_user: true,
          user_id: session.user.id,
          bot_id: agentId
        });

      if (messageError) {
        console.error("Error saving message:", messageError);
        toast.error("Erro ao enviar mensagem");
        return;
      }

      // Call Supabase Edge Function to process the message
      const response = await supabase.functions.invoke('chat', {
        body: { 
          botId: agentId,
          message: content,
          conversationId: conversation.id
        }
      });
      
      if (response.error) {
        console.error("Error processing message:", response.error);
        
        // Add error message to UI
        const errorMessage: Message = {
          id: crypto.randomUUID(),
          content: response.error.message || "Erro desconhecido ao processar mensagem",
          is_from_user: false,
          conversation_id: conversation.id,
          created_at: new Date().toISOString(),
          error: true
        };
        
        setMessages(prev => [...prev, errorMessage]);
        
        // Save error message to database
        await supabase.from('messages').insert({
          conversation_id: conversation.id,
          content: response.error.message || "Erro desconhecido ao processar mensagem",
          is_from_user: false,
          user_id: session.user.id,
          bot_id: agentId,
          error: true
        });
        
        return;
      }

      // Add bot response to UI
      if (response.data && response.data.response) {
        const botMessage: Message = {
          id: crypto.randomUUID(),
          content: response.data.response,
          is_from_user: false,
          conversation_id: conversation.id,
          created_at: new Date().toISOString()
        };

        setMessages(prev => [...prev, botMessage]);
      }

    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Erro ao enviar mensagem");
      
      // Add error message to UI if there's a critical error
      const errorMessage: Message = {
        id: crypto.randomUUID(),
        content: error instanceof Error ? error.message : "Erro desconhecido ao processar mensagem",
        is_from_user: false,
        conversation_id: conversation?.id || "",
        created_at: new Date().toISOString(),
        error: true
      };
      
      setMessages(prev => [...prev, errorMessage]);
      
    } finally {
      setSendingMessage(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gray-50">
        <AppSidebar workspace={workspace} />
        <main className="flex-1 flex flex-col md:flex-row">
          <aside className="w-full md:w-64 border-r bg-white p-4">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="mr-2"
                  onClick={() => navigate('/chat')}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <h2 className="text-lg font-semibold">Conversas</h2>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={createNewConversation}
              >
                Nova
              </Button>
            </div>
            <ConversationList
              conversations={conversations}
              activeConversationId={conversation?.id}
              onSelect={selectConversation}
            />
          </aside>

          <div className="flex-1 flex flex-col h-screen">
            <header className="p-4 border-b bg-white flex items-center">
              <Bot className="h-6 w-6 text-purple-600 mr-2" />
              <h1 className="text-xl font-bold">{agent?.name}</h1>
            </header>
            
            <div className="flex-1 overflow-auto p-4">
              <MessageList messages={messages} />
            </div>
            
            <div className="p-4 border-t bg-white">
              <MessageInput 
                onSend={sendMessage}
                disabled={sendingMessage}
              />
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default ChatConversation;
