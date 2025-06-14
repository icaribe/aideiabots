
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Phone, Plus, Trash2, MessageCircle, Clock } from "lucide-react";
import { useWhatsAppSessions } from "@/hooks/useWhatsAppSessions";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

type WhatsAppSessionsProps = {
  botId: string;
};

export const WhatsAppSessions = ({ botId }: WhatsAppSessionsProps) => {
  const { sessions, loading, createSession, deleteSession } = useWhatsAppSessions(botId);
  const [newPhoneNumber, setNewPhoneNumber] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateSession = async () => {
    if (!newPhoneNumber.trim()) {
      return;
    }

    setIsCreating(true);
    try {
      await createSession(newPhoneNumber);
      setNewPhoneNumber("");
    } catch (error) {
      console.error('Error creating session:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteSession = async (sessionId: string) => {
    if (confirm("Tem certeza que deseja remover esta sessão?")) {
      await deleteSession(sessionId);
    }
  };

  const formatPhoneNumber = (phone: string) => {
    // Simple formatting for better display
    if (phone.length >= 10) {
      return `+${phone.slice(0, 2)} (${phone.slice(2, 4)}) ${phone.slice(4, 9)}-${phone.slice(9)}`;
    }
    return phone;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Phone className="w-5 h-5" />
          Sessões WhatsApp Ativas
        </CardTitle>
        <CardDescription>
          Gerencie as sessões ativas do WhatsApp para este agente
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <div className="flex-1">
            <Label htmlFor="phoneNumber">Novo Número de Telefone</Label>
            <Input
              id="phoneNumber"
              value={newPhoneNumber}
              onChange={(e) => setNewPhoneNumber(e.target.value)}
              placeholder="5511999999999"
              disabled={isCreating}
            />
          </div>
          <div className="flex items-end">
            <Button 
              onClick={handleCreateSession} 
              disabled={isCreating || !newPhoneNumber.trim()}
            >
              <Plus className="w-4 h-4 mr-2" />
              Criar Sessão
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-4">Carregando sessões...</div>
        ) : sessions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Phone className="w-12 h-12 mx-auto mb-4 opacity-20" />
            <p>Nenhuma sessão WhatsApp ativa</p>
            <p className="text-sm">Crie uma nova sessão para começar</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Número</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Última Atividade</TableHead>
                <TableHead>Conversa</TableHead>
                <TableHead className="w-[100px]">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sessions.map((session) => (
                <TableRow key={session.id}>
                  <TableCell className="font-medium">
                    {formatPhoneNumber(session.phone_number)}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      Ativo
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      {format(new Date(session.last_activity), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                    </div>
                  </TableCell>
                  <TableCell>
                    {session.conversation_id ? (
                      <Badge variant="outline" className="bg-blue-50">
                        <MessageCircle className="w-3 h-3 mr-1" />
                        Ativa
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground text-sm">Nenhuma</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteSession(session.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};
