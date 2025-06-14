
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Phone, Settings } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type WhatsAppConfig = {
  access_token?: string;
  phone_number_id?: string;
  verify_token?: string;
};

type Integration = {
  id: string;
  type: string;
  config: WhatsAppConfig;
  active: boolean;
  webhook_url?: string;
};

type WhatsAppCredentialsProps = {
  integration: Integration | null;
  onConfigSaved: (integration: Integration) => void;
  botId: string;
};

export const WhatsAppCredentials = ({ integration, onConfigSaved, botId }: WhatsAppCredentialsProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [accessToken, setAccessToken] = useState(integration?.config?.access_token || "");
  const [phoneNumberId, setPhoneNumberId] = useState(integration?.config?.phone_number_id || "");
  const [verifyToken, setVerifyToken] = useState(integration?.config?.verify_token || "whatsapp_webhook_token");

  const webhookUrl = `https://hmmbolvudsckgzjzzwnr.functions.supabase.co/whatsapp-webhook`;

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

      const updatedIntegration = {
        ...data,
        config
      };
      
      onConfigSaved(updatedIntegration);
      toast.success("Configuração WhatsApp salva com sucesso!");
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

      const updatedIntegration = { ...integration, active: false };
      onConfigSaved(updatedIntegration);
      toast.success("WhatsApp desconectado com sucesso!");
    } catch (error) {
      console.error('Error disconnecting WhatsApp:', error);
      toast.error("Erro ao desconectar WhatsApp");
    } finally {
      setIsLoading(false);
    }
  };

  return (
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
  );
};
