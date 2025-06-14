
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { AgentsList } from "@/components/dashboard/AgentsList";
import { AppSidebar } from "@/components/dashboard/AppSidebar";
import { AnalyticsCard } from "@/components/analytics/AnalyticsCard";
import { AnalyticsChart } from "@/components/analytics/AnalyticsChart";
import { ConversationsList } from "@/components/analytics/ConversationsList";
import { AnalyticsFilters } from "@/components/analytics/AnalyticsFilters";
import { useAnalytics } from "@/hooks/useAnalytics";
import { UniversalLoading } from "@/components/ui/universal-loading";
import {
  MessageSquare,
  CheckCircle,
  Clock,
  TrendingUp,
  Users,
  Star
} from "lucide-react";

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
  const [timeRange, setTimeRange] = useState(14);
  const [selectedBot, setSelectedBot] = useState<string>("all");
  const [agents, setAgents] = useState<Bot[]>([]);

  const {
    loading: analyticsLoading,
    dailyMetrics,
    conversationMetrics,
    totalStats,
    fetchAnalytics
  } = useAnalytics(timeRange);

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

  useEffect(() => {
    const botId = selectedBot === "all" ? undefined : selectedBot;
    fetchAnalytics(botId);
  }, [timeRange, selectedBot]);

  const handleAgentClick = (id: string) => {
    navigate(`/edit-agent/${id}`);
  };

  const chartData = dailyMetrics.map(metric => ({
    date: metric.date,
    conversations: metric.conversations_started,
    completed: metric.conversations_completed,
    messages: metric.total_messages,
    response_time: metric.avg_response_time,
    satisfaction: metric.avg_satisfaction
  }));

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gray-50">
        <AppSidebar workspace={workspace} />
        <main className="flex-1 p-8">
          <DashboardHeader timeFilter={`${timeRange} dias`} setTimeFilter={() => {}} />
          
          <AnalyticsFilters
            timeRange={timeRange}
            setTimeRange={setTimeRange}
            selectedBot={selectedBot}
            setSelectedBot={setSelectedBot}
            bots={agents.map(bot => ({ id: bot.id, name: bot.name }))}
          />

          <UniversalLoading
            isLoading={analyticsLoading}
            loadingMessage="Carregando analytics..."
          >
            {/* Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <AnalyticsCard
                title="Total de Conversas"
                value={totalStats.totalConversations}
                icon={<MessageSquare className="h-4 w-4" />}
                description="Conversas iniciadas no período"
              />
              <AnalyticsCard
                title="Conversas Concluídas"
                value={totalStats.completedConversations}
                icon={<CheckCircle className="h-4 w-4" />}
                description="Taxa de conclusão"
              />
              <AnalyticsCard
                title="Total de Mensagens"
                value={totalStats.totalMessages}
                icon={<Users className="h-4 w-4" />}
                description="Mensagens trocadas"
              />
              <AnalyticsCard
                title="Tempo Médio"
                value={`${totalStats.avgResponseTime.toFixed(1)}s`}
                icon={<Clock className="h-4 w-4" />}
                description="Tempo de resposta"
              />
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <AnalyticsChart
                title="Conversas por Dia"
                data={chartData}
                dataKey="conversations"
                xAxisKey="date"
                type="area"
                color="#8b5cf6"
                description="Número de conversas iniciadas diariamente"
              />
              <AnalyticsChart
                title="Mensagens por Dia"
                data={chartData}
                dataKey="messages"
                xAxisKey="date"
                type="bar"
                color="#06b6d4"
                description="Volume de mensagens por dia"
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <AnalyticsChart
                title="Tempo de Resposta"
                data={chartData.filter(d => d.response_time > 0)}
                dataKey="response_time"
                xAxisKey="date"
                type="line"
                color="#f59e0b"
                description="Tempo médio de resposta em segundos"
              />
              <ConversationsList
                conversations={conversationMetrics}
                loading={analyticsLoading}
              />
            </div>
          </UniversalLoading>

          <AgentsList agents={agents} onAgentClick={handleAgentClick} />
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Dashboard;
