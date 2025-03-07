
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { AppSidebar } from "@/components/dashboard/AppSidebar";
import { AgentsList } from "@/components/dashboard/AgentsList";

type Bot = {
  id: string;
  name: string;
  description: string;
  type: string;
  created_at: string;
};

const Chat = () => {
  const navigate = useNavigate();
  const [workspace] = useState("Meu Workspace");
  const [agents, setAgents] = useState<Bot[]>([]);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/");
      }
    };

    checkAuth();
  }, [navigate]);

  const fetchAgents = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data, error } = await supabase
        .from('bots')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao buscar agentes:', error);
        toast.error("Erro ao carregar agentes");
        return;
      }

      const formattedBots = (data || []).map(bot => ({
        ...bot,
        type: bot.provider || 'Custom'
      }));

      setAgents(formattedBots);
    } catch (error) {
      console.error('Erro ao buscar agentes:', error);
      toast.error("Erro ao carregar agentes");
    }
  };

  useEffect(() => {
    fetchAgents();
  }, []);

  const handleAgentClick = (id: string) => {
    navigate(`/chat/${id}`);
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gray-50">
        <AppSidebar workspace={workspace} />
        <main className="flex-1 p-8">
          <div className="mb-8">
            <h1 className="text-2xl font-bold">Chat com Agentes</h1>
            <p className="text-gray-500 mt-2">
              Selecione um agente para iniciar uma conversa
            </p>
          </div>
          <AgentsList 
            agents={agents} 
            onAgentClick={handleAgentClick}
          />
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Chat;
