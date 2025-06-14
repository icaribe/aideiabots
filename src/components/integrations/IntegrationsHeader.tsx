
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Settings } from "lucide-react";

type IntegrationsHeaderProps = {
  activeIntegrationsCount: number;
};

export const IntegrationsHeader = ({ activeIntegrationsCount }: IntegrationsHeaderProps) => {
  return (
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
            {activeIntegrationsCount} ativa{activeIntegrationsCount !== 1 ? 's' : ''}
          </Badge>
        </div>
      </CardHeader>
    </Card>
  );
};
