
import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Phone } from "lucide-react";

type IntegrationsTabsListProps = {
  whatsappStatus: 'connected' | 'disconnected';
};

export const IntegrationsTabsList = ({ whatsappStatus }: IntegrationsTabsListProps) => {
  return (
    <TabsList className="grid w-full grid-cols-1">
      <TabsTrigger value="whatsapp" className="flex items-center gap-2">
        <Phone className="w-4 h-4" />
        WhatsApp
        <Badge 
          variant={whatsappStatus === 'connected' ? 'default' : 'secondary'}
          className="ml-auto"
        >
          {whatsappStatus === 'connected' ? 'Conectado' : 'Desconectado'}
        </Badge>
      </TabsTrigger>
    </TabsList>
  );
};
