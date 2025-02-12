
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { MetricsCards } from "@/components/dashboard/MetricsCards";
import { ChartCard } from "@/components/dashboard/ChartCard";
import { AgentsList } from "@/components/dashboard/AgentsList";
import { AppSidebar } from "@/components/dashboard/AppSidebar";

const chartData = [
  { date: '01/03', atendimentos: 4 },
  { date: '02/03', atendimentos: 7 },
  { date: '03/03', atendimentos: 5 },
  { date: '04/03', atendimentos: 8 },
  { date: '05/03', atendimentos: 12 },
  { date: '06/03', atendimentos: 9 },
  { date: '07/03', atendimentos: 11 },
];

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

const Dashboard = () => {
  const navigate = useNavigate();
  const [workspace] = useState("Meu Workspace");
  const [timeFilter, setTimeFilter] = useState("14 dias");
  const [agents, setAgents] = useState<Bot[]>([]);
  const [metrics, setMetrics] = useState({
    completedChats: 0,
    activeChats: 0,
    averageTime: "--"
  });

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

        setAgents(data || []);
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
          <DashboardHeader timeFilter={timeFilter} setTimeFilter={setTimeFilter} />
          <MetricsCards {...metrics} />
          <ChartCard data={chartData} />
          <AgentsList agents={agents} />
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Dashboard;
