
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { AppSidebar } from "@/components/dashboard/AppSidebar";
import { AgentsList } from "@/components/dashboard/AgentsList";

type Bot = {
  id: string;
  name: string;
  description: string;
  type: string;
  whatsappNumber: string;
  created_at: string;
  api_key: string;
  llm_provider: string;
  model: string;
  updated_at: string;
  user_id: string;
  webhook_url: string;
};

const Agents = () => {
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

  useEffect(() => {
    const fetchAgents = async () => {
      try {
        const { data, error } = await supabase
          .from('bots')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Erro ao buscar agentes:', error);
          toast.error("Erro ao carregar agentes. Verifique se você está conectado ao Supabase.");
          return;
        }

        const formattedBots: Bot[] = (data || []).map(bot => ({
          ...bot,
          type: 'Custom',
          whatsappNumber: '',
        })) as Bot[];

        setAgents(formattedBots);
      } catch (error) {
        console.error('Erro ao buscar agentes:', error);
        toast.error("Erro ao carregar agentes. Por favor, tente novamente.");
      }
    };

    fetchAgents();
  }, []);

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gray-50">
        <AppSidebar workspace={workspace} />
        <main className="flex-1 p-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-2xl font-bold">Agentes</h1>
            <Button onClick={() => navigate("/create-agent")} className="gap-2">
              <Plus className="h-4 w-4" />
              Criar Agente
            </Button>
          </div>
          <AgentsList agents={agents} />
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Agents;
