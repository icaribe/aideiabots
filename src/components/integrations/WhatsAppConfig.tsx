import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Copy, ExternalLink, Phone, Settings, TestTube } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { WhatsAppSessions } from "./WhatsAppSessions";

type WhatsAppConfig = {
  access_token?: string;
  phone_number_id?: string;
  verify_token?: string;
};

type WhatsAppConfigProps = {
  botId: string;
  onConfigChange?: () => void;
};

type Integration = {
  id: string;
  type: string;
  config: WhatsAppConfig;
  active: boolean;
  webhook_url?: string;
};

export const WhatsAppConfig = ({ botId, onConfigChange }: WhatsAppConfigProps) => {
  const [integration, setIntegration] = useState<Integration | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [accessToken, setAccessToken] = useState("");
  const [phoneNumberId, setPhoneNumberId] = useState("");
  const [verifyToken, setVerifyToken] = useState("whatsapp_webhook_token");
  const [testPhoneNumber, setTestPhoneNumber] = useState("");
  const [testMessage, setTestMessage] = useState("Olá! Este é um teste da integração WhatsApp.");

  const webhookUrl = `https://hmmbolvudsckgzjzzwnr.functions.supabase.co/whatsapp-webhook`;

  useEffect(() => {
    fetchIntegration();
  }, [botId]);

  const fetchIntegration = async () => {
    try {
      const { data, error } = await supabase
        .from('integrations')
        .select('*')
        .eq('bot_id', botId)
        .eq('type', 'whatsapp')
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching WhatsApp integration:', error);
        return;
      }

      if (data) {
        const config = data.config as WhatsAppConfig;
        setIntegration({
          ...data,
          config
        });
        setAccessToken(config?.access_token || "");
        setPhoneNumberId(config?.phone_number_id || "");
        setVerifyToken(config?.verify_token || "whatsapp_webhook_token");
      }
    } catch (error) {
      console.error('Error fetching integration:', error);
    }
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const config: WhatsAppConfig = {
        access_token: accessToken,
        phone_number_id: phoneNumberId,
        verify_token: verifyToken,
      };

      const { data, error } = await supabase
        .from('integrations')
        .upsert({
          bot_id: botId,
          type: 'whatsapp',
          config,
          active: true,
          webhook_url: webhookUrl
        })
        .select()
        .single();

      if (error) throw error;

      setIntegration({
        ...data,
        config
      });
      toast.success("Configuração WhatsApp salva com sucesso!");
      onConfigChange?.();
    } catch (error) {
      console.error('Error saving WhatsApp config:', error);
      toast.error("Erro ao salvar configuração WhatsApp");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisconnect = async () => {
    if (!integration) return;

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('integrations')
        .update({ active: false })
        .eq('id', integration.id);

      if (error) throw error;

      setIntegration(prev => prev ? { ...prev, active: false } : null);
      toast.success("WhatsApp desconectado com sucesso!");
      onConfigChange?.();
    } catch (error) {
      console.error('Error disconnecting WhatsApp:', error);
      toast.error("Erro ao desconectar WhatsApp");
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestMessage = async () => {
    if (!testPhoneNumber || !testMessage || !integration?.active) {
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

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copiado para a área de transferência!");
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Phone className="w-5 h-5" />
            Configuração WhatsApp Business API
          </CardTitle>
          <CardDescription>
            Configure sua integração com WhatsApp Business API para receber e enviar mensagens
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {integration?.active && (
            <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="w-2 h-2 bg-green-500 rounded-full" />
              <span className="text-green-700 font-medium">Conectado</span>
              <Badge variant="secondary" className="ml-auto">Ativo</Badge>
            </div>
          )}

          <div className="grid gap-4">
            <div>
              <Label htmlFor="accessToken">Access Token</Label>
              <Input
                id="accessToken"
                type="password"
                value={accessToken}
                onChange={(e) => setAccessToken(e.target.value)}
                placeholder="Seu WhatsApp Business API Access Token"
              />
            </div>

            <div>
              <Label htmlFor="phoneNumberId">Phone Number ID</Label>
              <Input
                id="phoneNumberId"
                value={phoneNumberId}
                onChange={(e) => setPhoneNumberId(e.target.value)}
                placeholder="ID do número de telefone do WhatsApp Business"
              />
            </div>

            <div>
              <Label htmlFor="verifyToken">Verify Token</Label>
              <Input
                id="verifyToken"
                value={verifyToken}
                onChange={(e) => setVerifyToken(e.target.value)}
                placeholder="Token de verificação do webhook"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Button onClick={handleSave} disabled={isLoading}>
              <Settings className="w-4 h-4 mr-2" />
              Salvar Configuração
            </Button>
            {integration?.active && (
              <Button variant="destructive" onClick={handleDisconnect} disabled={isLoading}>
                Desconectar
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Configuração do Webhook</CardTitle>
          <CardDescription>
            Configure este URL como webhook no seu WhatsApp Business API
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>URL do Webhook</Label>
            <div className="flex items-center gap-2 mt-1">
              <Input value={webhookUrl} readOnly className="font-mono text-sm" />
              <Button
                size="sm"
                variant="outline"
                onClick={() => copyToClipboard(webhookUrl)}
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div>
            <Label>Verify Token</Label>
            <div className="flex items-center gap-2 mt-1">
              <Input value={verifyToken} readOnly className="font-mono text-sm" />
              <Button
                size="sm"
                variant="outline"
                onClick={() => copyToClipboard(verifyToken)}
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-700">
              <strong>Instruções:</strong> Configure este webhook URL no Meta for Developers 
              na seção WhatsApp Business API. Use o verify token acima para validação.
            </p>
          </div>
        </CardContent>
      </Card>

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
            disabled={isLoading || !integration?.active}
            className="w-full"
          >
            <TestTube className="w-4 h-4 mr-2" />
            Enviar Teste
          </Button>

          {!integration?.active && (
            <p className="text-sm text-muted-foreground text-center">
              Configure e ative a integração primeiro para enviar mensagens de teste
            </p>
          )}
        </CardContent>
      </Card>

      {integration?.active && (
        <WhatsAppSessions botId={botId} />
      )}
    </div>
  );
};
