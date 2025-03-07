
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/dashboard/AppSidebar";
import { ConversationList } from "@/components/chat/ConversationList";
import { MessageList } from "@/components/chat/MessageList";
import { MessageInput } from "@/components/chat/MessageInput";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
};

type Conversation = {
  id: string;
  title: string;
  created_at: string;
};

const ChatConversation = () => {
  const { agentId } = useParams<{ agentId: string }>();
  const navigate = useNavigate();
  const [workspace] = useState("Meu Workspace");
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversation, setCurrentConversation] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [botName, setBotName] = useState("Agente");

  // Buscar informações do bot
  useEffect(() => {
    const fetchBotInfo = async () => {
      if (!agentId) return;
      
      try {
        const { data, error } = await supabase
          .from('bots')
          .select('name')
          .eq('id', agentId)
          .single();
        
        if (error) throw error;
        if (data) setBotName(data.name);
      } catch (error) {
        console.error('Erro ao buscar informações do bot:', error);
      }
    };
    
    fetchBotInfo();
  }, [agentId]);

  // Buscar conversas
  useEffect(() => {
    const fetchConversations = async () => {
      if (!agentId) return;
      
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          navigate("/");
          return;
        }

        const { data, error } = await supabase
          .from('conversations')
          .select('*')
          .eq('bot_id', agentId)
          .eq('user_id', session.user.id)
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        const formattedConversations = data?.map(conv => ({
          id: conv.id,
          title: conv.title || `Conversa ${new Date(conv.created_at).toLocaleDateString()}`,
          created_at: conv.created_at
        })) || [];
        
        setConversations(formattedConversations);
        
        // Se houver conversas, seleciona a primeira
        if (formattedConversations.length > 0 && !currentConversation) {
          setCurrentConversation(formattedConversations[0].id);
        }
      } catch (error) {
        console.error('Erro ao buscar conversas:', error);
        toast.error("Erro ao carregar conversas");
      }
    };
    
    fetchConversations();
  }, [agentId, navigate, currentConversation]);

  // Buscar mensagens da conversa atual
  useEffect(() => {
    const fetchMessages = async () => {
      if (!currentConversation) return;
      
      try {
        const { data, error } = await supabase
          .from('messages')
          .select('*')
          .eq('conversation_id', currentConversation)
          .order('created_at', { ascending: true });
        
        if (error) throw error;
        
        setMessages(data || []);
      } catch (error) {
        console.error('Erro ao buscar mensagens:', error);
        toast.error("Erro ao carregar mensagens");
      }
    };
    
    fetchMessages();
    
    // Criar subscription para novas mensagens
    const channel = supabase
      .channel(`messages_${currentConversation}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${currentConversation}`
        },
        (payload) => {
          const newMessage = payload.new as Message;
          setMessages(prev => [...prev, newMessage]);
          
          if (isLoading && newMessage.role === 'assistant') {
            setIsLoading(false);
          }
        }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentConversation, isLoading]);

  const handleConversationSelect = (id: string) => {
    setCurrentConversation(id);
  };

  const handleNewConversation = async () => {
    if (!agentId) return;
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      
      const title = `Nova conversa ${new Date().toLocaleString()}`;
      const { data, error } = await supabase
        .from('conversations')
        .insert({
          bot_id: agentId,
          user_id: session.user.id,
          title
        })
        .select()
        .single();
      
      if (error) throw error;
      
      const newConversation = {
        id: data.id,
        title,
        created_at: data.created_at
      };
      
      setConversations(prev => [newConversation, ...prev]);
      setCurrentConversation(data.id);
      setMessages([]);
    } catch (error) {
      console.error('Erro ao criar nova conversa:', error);
      toast.error("Erro ao criar nova conversa");
    }
  };

  const handleSendMessage = async (content: string) => {
    if (!content.trim() || !currentConversation || !agentId) return;
    
    try {
      // Inserir mensagem do usuário
      const { error: userMsgError } = await supabase
        .from('messages')
        .insert({
          conversation_id: currentConversation,
          role: 'user',
          content
        });
      
      if (userMsgError) throw userMsgError;
      
      setIsLoading(true);
      
      // Chamar o processamento na edge function
      const { data, error } = await supabase.functions.invoke('process-message', {
        body: {
          message: content,
          conversationId: currentConversation,
          botId: agentId
        }
      });
      
      if (error) {
        console.error('Erro ao processar mensagem:', error);
        toast.error("Erro ao processar sua mensagem");
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      toast.error("Erro ao enviar mensagem");
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/chat');
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-white">
        <AppSidebar workspace={workspace} />
        <div className="flex-1 flex h-screen overflow-hidden">
          <ConversationList
            conversations={conversations}
            currentConversation={currentConversation}
            onConversationSelect={handleConversationSelect}
            onNewConversation={handleNewConversation}
            onBack={handleBack}
          />
          
          {currentConversation ? (
            <div className="flex-1 flex flex-col h-full">
              <div className="p-4 border-b">
                <h2 className="font-medium">{botName}</h2>
              </div>
              
              <MessageList 
                messages={messages} 
                isLoading={isLoading} 
              />
              
              <MessageInput 
                onSendMessage={handleSendMessage}
                disabled={isLoading}
              />
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <h3 className="text-lg font-medium mb-2">Nenhuma conversa selecionada</h3>
                <p className="text-gray-500 mb-4">Selecione uma conversa ou inicie uma nova para começar</p>
                <Button onClick={handleNewConversation}>Nova Conversa</Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </SidebarProvider>
  );
};

export default ChatConversation;
