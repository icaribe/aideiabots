
import { useState, useEffect } from "react";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { WhatsAppConfig } from "./WhatsAppConfig";
import { IntegrationsHeader } from "./IntegrationsHeader";
import { IntegrationsTabsList } from "./IntegrationsTabsList";
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

  const getActiveIntegrationsCount = () => {
    return integrations.filter(i => i.active).length;
  };

  return (
    <div className="space-y-6">
      <IntegrationsHeader activeIntegrationsCount={getActiveIntegrationsCount()} />

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <IntegrationsTabsList whatsappStatus={getIntegrationStatus('whatsapp')} />

        <TabsContent value="whatsapp" className="space-y-4">
          <WhatsAppConfig botId={botId} onConfigChange={fetchIntegrations} />
        </TabsContent>
      </Tabs>
    </div>
  );
};
