
import { Bot } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Agent = {
  id: string;
  name: string;
  description: string;
  type: string;
  whatsappNumber: string;
  created_at: string;
};

type AgentsListProps = {
  agents: Agent[];
};

export const AgentsList = ({ agents }: AgentsListProps) => {
  const navigate = useNavigate();

  return (
    <>
      <h2 className="text-xl font-bold mb-6">Seus Agentes</h2>

      {agents.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Bot className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhum agente</h3>
            <p className="text-gray-500 mb-4">Comece criando seu primeiro agente.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {agents.map((agent) => (
            <Card 
              key={agent.id} 
              className="hover:border-purple-200 transition-colors cursor-pointer"
              onClick={() => navigate(`/chat/${agent.id}`)}
            >
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
    </>
  );
};
