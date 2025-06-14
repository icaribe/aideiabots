
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Copy } from "lucide-react";
import { toast } from "sonner";

type WhatsAppWebhookConfigProps = {
  verifyToken: string;
};

export const WhatsAppWebhookConfig = ({ verifyToken }: WhatsAppWebhookConfigProps) => {
  const webhookUrl = `https://hmmbolvudsckgzjzzwnr.functions.supabase.co/whatsapp-webhook`;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copiado para a área de transferência!");
  };

  return (
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
  );
};
