
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { WhatsAppCredentials } from "./WhatsAppCredentials";
import { WhatsAppWebhookConfig } from "./WhatsAppWebhookConfig";
import { WhatsAppTestMessage } from "./WhatsAppTestMessage";
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
      }
    } catch (error) {
      console.error('Error fetching integration:', error);
    }
  };

  const handleConfigSaved = (updatedIntegration: Integration) => {
    setIntegration(updatedIntegration);
    onConfigChange?.();
  };

  const verifyToken = integration?.config?.verify_token || "whatsapp_webhook_token";

  return (
    <div className="space-y-6">
      <WhatsAppCredentials 
        integration={integration}
        onConfigSaved={handleConfigSaved}
        botId={botId}
      />

      <WhatsAppWebhookConfig verifyToken={verifyToken} />

      <WhatsAppTestMessage 
        botId={botId}
        isIntegrationActive={integration?.active || false}
      />

      {integration?.active && (
        <WhatsAppSessions botId={botId} />
      )}
    </div>
  );
};
