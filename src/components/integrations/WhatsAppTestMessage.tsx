
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { TestTube } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type WhatsAppTestMessageProps = {
  botId: string;
  isIntegrationActive: boolean;
};

export const WhatsAppTestMessage = ({ botId, isIntegrationActive }: WhatsAppTestMessageProps) => {
  const [testPhoneNumber, setTestPhoneNumber] = useState("");
  const [testMessage, setTestMessage] = useState("Olá! Este é um teste da integração WhatsApp.");
  const [isLoading, setIsLoading] = useState(false);

  const handleTestMessage = async () => {
    if (!testPhoneNumber || !testMessage || !isIntegrationActive) {
      toast.error("Preencha o número e mensagem para teste");
      return;
    }

    setIsLoading(true);
    try {
      const response = await supabase.functions.invoke('whatsapp-send', {
        body: {
          botId,
          phoneNumber: testPhoneNumber,
          message: testMessage
        }
      });

      if (response.error) throw response.error;

      toast.success("Mensagem de teste enviada com sucesso!");
    } catch (error) {
      console.error('Error sending test message:', error);
      toast.error("Erro ao enviar mensagem de teste");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TestTube className="w-5 h-5" />
          Teste de Envio
        </CardTitle>
        <CardDescription>
          Envie uma mensagem de teste para verificar se a integração está funcionando
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="testPhone">Número de Telefone (com código do país)</Label>
          <Input
            id="testPhone"
            value={testPhoneNumber}
            onChange={(e) => setTestPhoneNumber(e.target.value)}
            placeholder="5511999999999"
          />
        </div>

        <div>
          <Label htmlFor="testMessage">Mensagem de Teste</Label>
          <Textarea
            id="testMessage"
            value={testMessage}
            onChange={(e) => setTestMessage(e.target.value)}
            placeholder="Digite sua mensagem de teste..."
            rows={3}
          />
        </div>

        <Button 
          onClick={handleTestMessage} 
          disabled={isLoading || !isIntegrationActive}
          className="w-full"
        >
          <TestTube className="w-4 h-4 mr-2" />
          Enviar Teste
        </Button>

        {!isIntegrationActive && (
          <p className="text-sm text-muted-foreground text-center">
            Configure e ative a integração primeiro para enviar mensagens de teste
          </p>
        )}
      </CardContent>
    </Card>
  );
};
