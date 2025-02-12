
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createClient } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Bot, Check, Clock, MessageSquare, Plus, Settings, Users } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from "@/components/ui/sidebar";

const supabase = createClient(
  "https://hmmbolvudsckgzjzzwnr.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhtbWJvbHZ1ZHNja2d6anp6d25yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzkxMTIxMDMsImV4cCI6MjA1NDY4ODEwM30.rGUHvUPbkqNCBcF_JkaEPKPibF-QH5dNhWD2QLjDLqg"
);

const menuItems = [
  { title: "Dashboards", icon: Bot, route: "/dashboard", active: true },
  { title: "Agentes", icon: Bot, route: "/agents" },
  { title: "Chat", icon: MessageSquare, route: "/chat" },
  { title: "Equipe", icon: Users, route: "/team" },
  { title: "Configurações", icon: Settings, route: "/settings" },
];

// Dados de exemplo para o gráfico
const chartData = [
  { date: '01/03', atendimentos: 4 },
  { date: '02/03', atendimentos: 7 },
  { date: '03/03', atendimentos: 5 },
  { date: '04/03', atendimentos: 8 },
  { date: '05/03', atendimentos: 12 },
  { date: '06/03', atendimentos: 9 },
  { date: '07/03', atendimentos: 11 },
];

type Agent = {
  id: string;
  name: string;
  description: string;
  type: string;
  whatsappNumber: string;
  created_at: string;
};

const Dashboard = () => {
  const navigate = useNavigate();
  const [workspace] = useState("Meu Workspace");
  const [timeFilter, setTimeFilter] = useState("14 dias");
  const [agents, setAgents] = useState<Agent[]>([]);
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
      const { data, error } = await supabase
        .from('agents')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao buscar agentes:', error);
        return;
      }

      setAgents(data || []);
    };

    fetchAgents();
  }, []);

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gray-50">
        <Sidebar>
          <SidebarContent>
            <div className="p-4">
              <Button variant="outline" className="w-full justify-between">
                {workspace}
                <span className="text-xs">▼</span>
              </Button>
            </div>
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu>
                  {menuItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton 
                        className={item.active ? "bg-purple-50 text-purple-600" : ""}
                        onClick={() => navigate(item.route)}
                      >
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>

        <main className="flex-1 p-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <Bot className="h-6 w-6 text-purple-600" />
                Dashboards
              </h1>
              <p className="text-gray-500 mt-1">Informações em tempo real sobre sua conta e agentes</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setTimeFilter("7 dias")}>7 dias</Button>
              <Button variant="outline" className={timeFilter === "14 dias" ? "bg-teal-500 text-white" : ""} onClick={() => setTimeFilter("14 dias")}>14 dias</Button>
              <Button variant="outline" onClick={() => setTimeFilter("30 dias")}>30 dias</Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Atendimentos concluídos</CardTitle>
                <Check className="h-4 w-4 text-teal-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.completedChats}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Atendimentos em andamento</CardTitle>
                <MessageSquare className="h-4 w-4 text-purple-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.activeChats}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Tempo médio de atendimento</CardTitle>
                <Clock className="h-4 w-4 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.averageTime}</div>
              </CardContent>
            </Card>
          </div>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Histórico de Atendimentos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[200px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Area
                      type="monotone"
                      dataKey="atendimentos"
                      stroke="#8b5cf6"
                      fill="#ddd6fe"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">Seus Agentes</h2>
            <Button 
              className="bg-teal-500 hover:bg-teal-600"
              onClick={() => navigate("/create-agent")}
            >
              <Plus className="h-4 w-4 mr-2" />
              Criar agente
            </Button>
          </div>

          {agents.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Bot className="h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold mb-2">Nenhum agente</h3>
                <p className="text-gray-500 mb-4">Comece criando seu primeiro agente.</p>
                <Button 
                  className="bg-teal-500 hover:bg-teal-600"
                  onClick={() => navigate("/create-agent")}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Criar agente
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {agents.map((agent) => (
                <Card key={agent.id} className="hover:border-purple-200 transition-colors cursor-pointer">
                  <CardHeader>
                    <CardTitle className="text-lg">{agent.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-500 text-sm mb-4">{agent.description}</p>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Bot className="h-4 w-4" />
                      <span>{agent.type}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Dashboard;
