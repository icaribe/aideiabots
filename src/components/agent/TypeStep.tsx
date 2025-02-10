
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { agentTypes } from "@/constants/agent";

interface TypeStepProps {
  selectedType: string | null;
  onTypeSelect: (type: string) => void;
  onNext: () => void;
}

export const TypeStep = ({ selectedType, onTypeSelect, onNext }: TypeStepProps) => {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-2">Escolha o tipo do seu agente</h2>
      <div className="space-y-4">
        {agentTypes.map((type) => (
          <Card
            key={type.id}
            className={`
              p-4 cursor-pointer transition-all hover:border-purple-200
              ${selectedType === type.id ? 'border-purple-500 bg-purple-50' : ''}
            `}
            onClick={() => onTypeSelect(type.id)}
          >
            <div className="flex items-start gap-4">
              <div className="p-2 bg-white rounded-lg">
                <type.icon className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold">{type.title}</h3>
                <p className="text-gray-500 text-sm">{type.description}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>
      <div className="mt-8 flex justify-end">
        <Button
          className="bg-teal-500 hover:bg-teal-600"
          disabled={!selectedType}
          onClick={onNext}
        >
          Continuar
        </Button>
      </div>
    </div>
  );
};
