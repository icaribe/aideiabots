
import { Bot, Edit, MessageSquare } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type Agent = {
  id: string;
  name: string;
  description: string;
  type: string;
  created_at: string;
};

type AgentsListProps = {
  agents: Agent[];
  onAgentClick?: (id: string) => void;
};

export const AgentsList = ({ agents, onAgentClick }: AgentsListProps) => {
  const navigate = useNavigate();

  const handleEditClick = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/edit-agent/${id}`);
  };

  const handleChatClick = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/chat/${id}`);
  };

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
              onClick={() => onAgentClick && onAgentClick(agent.id)}
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
              <CardFooter className="flex justify-end gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={(e) => handleEditClick(agent.id, e)}
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Editar
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={(e) => handleChatClick(agent.id, e)}
                >
                  <MessageSquare className="h-4 w-4 mr-1" />
                  Chat
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </>
  );
};
