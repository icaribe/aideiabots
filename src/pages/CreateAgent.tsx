
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { 
  Bot, 
  Calendar, 
  ChevronLeft,
  Globe,
  HeartHandshake,
  ShoppingCart,
  User,
  X 
} from "lucide-react";

type AgentType = {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType;
};

const agentTypes: AgentType[] = [
  {
    id: "personal",
    title: "Assistente Pessoal",
    description: "Um assistente virtual para tarefas gerais e produtividade",
    icon: User
  },
  {
    id: "support",
    title: "Suporte",
    description: "Atendimento ao cliente e resolução de problemas",
    icon: HeartHandshake
  },
  {
    id: "sales",
    title: "Vendas",
    description: "Qualificação de leads e suporte a vendas",
    icon: ShoppingCart
  },
  {
    id: "scheduler",
    title: "Agendador",
    description: "Gerenciamento de compromissos e calendário",
    icon: Calendar
  },
  {
    id: "custom",
    title: "Personalizado",
    description: "Crie um bot com funcionalidades específicas",
    icon: Globe
  }
];

type Step = "type" | "llm" | "config";

const CreateAgent = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<Step>("type");
  const [selectedType, setSelectedType] = useState<string | null>(null);

  const steps = [
    { id: "type", label: "Tipo" },
    { id: "llm", label: "LLM" },
    { id: "config", label: "Configuração" }
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <Button 
            variant="ghost" 
            className="gap-2"
            onClick={() => navigate(-1)}
          >
            <ChevronLeft className="h-4 w-4" />
            Voltar
          </Button>
          <Button 
            variant="ghost" 
            onClick={() => navigate("/dashboard")}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Progress Steps */}
        <div className="mb-12">
          <h1 className="text-2xl font-bold text-center mb-6">Criar Novo Agente</h1>
          <div className="flex justify-center gap-4">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`
                  flex items-center justify-center w-8 h-8 rounded-full
                  ${currentStep === step.id ? 'bg-purple-100 text-purple-600' : 'bg-gray-100 text-gray-400'}
                `}>
                  {index + 1}
                </div>
                <span className={`
                  ml-2 
                  ${currentStep === step.id ? 'text-purple-600' : 'text-gray-400'}
                `}>
                  {step.label}
                </span>
                {index < steps.length - 1 && (
                  <div className="w-16 h-[1px] bg-gray-200 mx-2" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="max-w-2xl mx-auto">
          {currentStep === "type" && (
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
                    onClick={() => setSelectedType(type.id)}
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
                  onClick={() => setCurrentStep("llm")}
                >
                  Continuar
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreateAgent;
