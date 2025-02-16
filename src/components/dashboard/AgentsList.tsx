
import { Bot, Edit, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

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
  onDelete?: (id: string) => void;
};

export const AgentsList = ({ agents, onDelete }: AgentsListProps) => {
  const navigate = useNavigate();

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('bots')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success("Agente excluído com sucesso!");
      if (onDelete) onDelete(id);
    } catch (error) {
      console.error('Erro ao excluir agente:', error);
      toast.error("Erro ao excluir agente. Por favor, tente novamente.");
    }
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
              className="hover:border-purple-200 transition-colors"
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
              <CardFooter className="flex justify-between">
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/edit-agent/${agent.id}`)}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Editar
                  </Button>
                  
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="sm">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Excluir
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Esta ação não pode ser desfeita. Isso excluirá permanentemente o agente
                          e todos os seus dados associados.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          onClick={() => handleDelete(agent.id)}
                        >
                          Excluir
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
                
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => navigate(`/chat/${agent.id}`)}
                >
                  Conversar
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </>
  );
};
