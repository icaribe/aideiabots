
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { IntegrationsManager } from "@/components/integrations/IntegrationsManager";

type IntegrationsStepProps = {
  botId: string;
  onBack: () => void;
};

export const IntegrationsStep = ({ botId, onBack }: IntegrationsStepProps) => {
  return (
    <div className="space-y-6">
      <Button variant="ghost" onClick={onBack}>
        Voltar
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>Configurar Integrações</CardTitle>
          <CardDescription>
            Configure integrações com plataformas de mensagens para expandir o alcance do seu agente
          </CardDescription>
        </CardHeader>
        <CardContent>
          <IntegrationsManager botId={botId} />
        </CardContent>
      </Card>
    </div>
  );
};
