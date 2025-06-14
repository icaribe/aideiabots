
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Phone, MessageCircle, Settings } from "lucide-react";
import { WhatsAppConfig } from "./WhatsAppConfig";
import { supabase } from "@/integrations/supabase/client";

type IntegrationsManagerProps = {
  botId: string;
};

type Integration = {
  id: string;
  type: string;
  config: any;
  active: boolean;
  webhook_url?: string;
};

export const IntegrationsManager = ({ botId }: IntegrationsManagerProps) => {
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [activeTab, setActiveTab] = useState("whatsapp");

  useEffect(() => {
    fetchIntegrations();
  }, [botId]);

  const fetchIntegrations = async () => {
    try {
      const { data, error } = await supabase
        .from('integrations')
        .select('*')
        .eq('bot_id', botId);

      if (error) {
        console.error('Error fetching integrations:', error);
        return;
      }

      setIntegrations(data || []);
    } catch (error) {
      console.error('Error fetching integrations:', error);
    }
  };

  const getIntegrationStatus = (type: string) => {
    const integration = integrations.find(i => i.type === type);
    return integration?.active ? 'connected' : 'disconnected';
  };

  const getIntegrationCount = () => {
    return integrations.filter(i => i.active).length;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Integrações
          </CardTitle>
          <CardDescription>
            Configure integrações com diferentes plataformas de mensagens
          </CardDescription>
          <div className="flex items-center gap-2 mt-2">
            <Badge variant="secondary">
              {getIntegrationCount()} ativa{getIntegrationCount() !== 1 ? 's' : ''}
            </Badge>
          </div>
        </CardHeader>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-1">
          <TabsTrigger value="whatsapp" className="flex items-center gap-2">
            <Phone className="w-4 h-4" />
            WhatsApp
            <Badge 
              variant={getIntegrationStatus('whatsapp') === 'connected' ? 'default' : 'secondary'}
              className="ml-auto"
            >
              {getIntegrationStatus('whatsapp') === 'connected' ? 'Conectado' : 'Desconectado'}
            </Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="whatsapp" className="space-y-4">
          <WhatsAppConfig botId={botId} onConfigChange={fetchIntegrations} />
        </TabsContent>
      </Tabs>
    </div>
  );
};
