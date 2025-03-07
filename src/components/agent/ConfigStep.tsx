
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { X } from "lucide-react";
import { toast } from "sonner";
import { IntentConfig } from "@/types/agent";

interface ConfigStepProps {
  agentName: string;
  agentDescription: string;
  whatsappNumber: string;
  intents: IntentConfig[];
  onAgentNameChange: (name: string) => void;
  onAgentDescriptionChange: (description: string) => void;
  onWhatsappNumberChange: (number: string) => void;
  onIntentsChange: (intents: IntentConfig[]) => void;
  onBack: () => void;
  onSubmit: () => void;
}

export const ConfigStep = ({
  agentName,
  agentDescription,
  whatsappNumber,
  intents,
  onAgentNameChange,
  onAgentDescriptionChange,
  onWhatsappNumberChange,
  onIntentsChange,
  onBack,
  onSubmit
}: ConfigStepProps) => {
  const handleAddIntent = () => {
    onIntentsChange([...intents, {
      name: "",
      description: "",
      examples: [""],
      webhookUrl: ""
    }]);
  };

  const handleRemoveIntent = (index: number) => {
    if (intents.length > 1) {
      const newIntents = [...intents];
      newIntents.splice(index, 1);
      onIntentsChange(newIntents);
    }
  };

  const handleUpdateIntent = (index: number, field: keyof IntentConfig, value: any) => {
    const newIntents = [...intents];
    newIntents[index] = { ...newIntents[index], [field]: value };
    onIntentsChange(newIntents);
  };

  const handleAddExample = (intentIndex: number) => {
    const newIntents = [...intents];
    newIntents[intentIndex].examples.push("");
    onIntentsChange(newIntents);
  };

  const handleUpdateExample = (intentIndex: number, exampleIndex: number, value: string) => {
    const newIntents = [...intents];
    newIntents[intentIndex].examples[exampleIndex] = value;
    onIntentsChange(newIntents);
  };

  const handleRemoveExample = (intentIndex: number, exampleIndex: number) => {
    if (intents[intentIndex].examples.length > 1) {
      const newIntents = [...intents];
      newIntents[intentIndex].examples.splice(exampleIndex, 1);
      onIntentsChange(newIntents);
    }
  };

  const handleSubmit = () => {
    if (!agentName || intents.some(intent => !intent.name)) {
      toast.error("Por favor, preencha todos os campos obrigatórios");
      return;
    }
    onSubmit();
  };

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Configuração do Agente</h2>
        
        <div className="space-y-4">
          <div>
            <Label>Nome do Agente</Label>
            <Input 
              value={agentName}
              onChange={(e) => onAgentNameChange(e.target.value)}
              placeholder="Ex: Assistente de Vendas"
              required
            />
          </div>
          
          <div>
            <Label>Descrição</Label>
            <Textarea 
              value={agentDescription}
              onChange={(e) => onAgentDescriptionChange(e.target.value)}
              placeholder="Descreva o propósito e capacidades do seu agente"
            />
          </div>

          <div>
            <Label>Número do WhatsApp</Label>
            <Input 
              type="text"
              value={whatsappNumber}
              onChange={(e) => onWhatsappNumberChange(e.target.value)}
              placeholder="Ex: +5511999999999"
            />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Intenções</h3>
          <Button
            type="button"
            variant="outline"
            onClick={handleAddIntent}
          >
            Adicionar Intenção
          </Button>
        </div>

        {intents.map((intent, intentIndex) => (
          <Card key={intentIndex} className="p-4 space-y-4">
            <div className="flex justify-between items-start">
              <div className="flex-1 space-y-4">
                <div>
                  <Label>Nome da Intenção</Label>
                  <Input 
                    value={intent.name}
                    onChange={(e) => handleUpdateIntent(intentIndex, "name", e.target.value)}
                    placeholder="Ex: solicitar_orcamento"
                    required
                  />
                </div>
                
                <div>
                  <Label>Descrição</Label>
                  <Textarea 
                    value={intent.description}
                    onChange={(e) => handleUpdateIntent(intentIndex, "description", e.target.value)}
                    placeholder="Descreva quando esta intenção deve ser reconhecida"
                  />
                </div>

                <div>
                  <Label>Webhook URL (n8n)</Label>
                  <Input 
                    value={intent.webhookUrl}
                    onChange={(e) => handleUpdateIntent(intentIndex, "webhookUrl", e.target.value)}
                    placeholder="https://n8n.seudominio.com/webhook/..."
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label>Exemplos de Frases</Label>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleAddExample(intentIndex)}
                    >
                      Adicionar Exemplo
                    </Button>
                  </div>
                  
                  {intent.examples.map((example, exampleIndex) => (
                    <div key={exampleIndex} className="flex gap-2">
                      <Input 
                        value={example}
                        onChange={(e) => handleUpdateExample(intentIndex, exampleIndex, e.target.value)}
                        placeholder="Ex: Gostaria de saber o preço do produto X"
                      />
                      {intent.examples.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveExample(intentIndex, exampleIndex)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              
              {intents.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="ml-2"
                  onClick={() => handleRemoveIntent(intentIndex)}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </Card>
        ))}
      </div>

      <div className="flex justify-between mt-8">
        <Button
          variant="outline"
          onClick={onBack}
        >
          Voltar
        </Button>
        <Button
          className="bg-teal-500 hover:bg-teal-600"
          onClick={handleSubmit}
        >
          Atualizar Agente
        </Button>
      </div>
    </div>
  );
};
