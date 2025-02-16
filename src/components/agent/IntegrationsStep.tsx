
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { QrCode } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type Integration = {
  id: string;
  type: string;
  config: any;
  active: boolean;
};

type IntegrationsStepProps = {
  botId: string;
  onBack: () => void;
};

export const IntegrationsStep = ({ botId, onBack }: IntegrationsStepProps) => {
  const [whatsappIntegration, setWhatsappIntegration] = useState<Integration | null>(null);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchIntegrations = async () => {
      const { data, error } = await supabase
        .from('integrations')
        .select('*')
        .eq('bot_id', botId)
        .eq('type', 'whatsapp')
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Erro ao buscar integrações:', error);
        toast.error("Erro ao carregar integrações");
        return;
      }

      setWhatsappIntegration(data || null);
    };

    fetchIntegrations();
  }, [botId]);

  const handleConnectWhatsapp = async () => {
    setIsLoading(true);
    try {
      // Primeiro, cria ou atualiza a integração
      const { data: integration, error: integrationError } = await supabase
        .from('integrations')
        .upsert({
          bot_id: botId,
          type: 'whatsapp',
          config: {},
          active: false
        })
        .select()
        .single();

      if (integrationError) throw integrationError;

      setWhatsappIntegration(integration);

      // Chama a edge function para gerar o QR code
      const response = await fetch('https://hmmbolvudsckgzjzzwnr.functions.supabase.co/whatsapp-qr', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          botId,
          integrationId: integration.id
        }),
      });

      if (!response.ok) {
        throw new Error('Erro ao gerar QR code');
      }

      const { qrCode: newQrCode } = await response.json();
      setQrCode(newQrCode);
    } catch (error) {
      console.error('Erro ao conectar WhatsApp:', error);
      toast.error("Erro ao iniciar conexão com WhatsApp");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisconnectWhatsapp = async () => {
    if (!whatsappIntegration) return;

    setIsLoading(true);
    try {
      // Chama a edge function para desconectar
      const response = await fetch('https://hmmbolvudsckgzjzzwnr.functions.supabase.co/whatsapp-disconnect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          botId,
          integrationId: whatsappIntegration.id
        }),
      });

      if (!response.ok) {
        throw new Error('Erro ao desconectar WhatsApp');
      }

      // Atualiza o estado da integração
      const { error } = await supabase
        .from('integrations')
        .update({ active: false })
        .eq('id', whatsappIntegration.id);

      if (error) throw error;

      setWhatsappIntegration(prev => prev ? { ...prev, active: false } : null);
      setQrCode(null);
      toast.success("WhatsApp desconectado com sucesso");
    } catch (error) {
      console.error('Erro ao desconectar WhatsApp:', error);
      toast.error("Erro ao desconectar WhatsApp");
    } finally {
      setIsLoading(false);
    }
  };

  // Atualiza o status da conexão periodicamente
  useEffect(() => {
    if (!whatsappIntegration) return;

    const checkStatus = async () => {
      const { data, error } = await supabase
        .from('integrations')
        .select('*')
        .eq('id', whatsappIntegration.id)
        .single();

      if (error) {
        console.error('Erro ao verificar status:', error);
        return;
      }

      setWhatsappIntegration(data);
      if (data.active) {
        setQrCode(null);
      }
    };

    const interval = setInterval(checkStatus, 5000);
    return () => clearInterval(interval);
  }, [whatsappIntegration]);

  return (
    <div className="space-y-6">
      <Button variant="ghost" onClick={onBack}>
        Voltar
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>WhatsApp</CardTitle>
          <CardDescription>
            Conecte seu bot ao WhatsApp para interagir com seus usuários
          </CardDescription>
        </CardHeader>
        <CardContent>
          {whatsappIntegration?.active ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-green-600">
                <div className="w-2 h-2 bg-green-600 rounded-full" />
                <span>Conectado</span>
              </div>
              <Button
                variant="destructive"
                onClick={handleDisconnectWhatsapp}
                disabled={isLoading}
              >
                Desconectar
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {qrCode ? (
                <div className="space-y-4">
                  <img
                    src={`data:image/png;base64,${qrCode}`}
                    alt="QR Code WhatsApp"
                    className="mx-auto"
                  />
                  <p className="text-sm text-center text-muted-foreground">
                    Escaneie o QR Code com seu WhatsApp para conectar
                  </p>
                </div>
              ) : (
                <Button
                  onClick={handleConnectWhatsapp}
                  disabled={isLoading}
                  className="w-full"
                >
                  <QrCode className="w-4 h-4 mr-2" />
                  Conectar WhatsApp
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
