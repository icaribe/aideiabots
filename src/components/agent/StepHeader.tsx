
import { Step } from "@/types/agent";

type StepHeaderProps = {
  currentStep: Step;
};

export const StepHeader = ({ currentStep }: StepHeaderProps) => {
  const steps: { id: Step; title: string }[] = [
    { id: "type", title: "Tipo" },
    { id: "llm", title: "Modelo" },
    { id: "config", title: "Configuração" },
    { id: "integrations", title: "Integrações" },
  ];

  return (
    <div className="mb-8">
      <div className="flex justify-between items-center">
        {steps.map((step, index) => (
          <div
            key={step.id}
            className="flex items-center"
          >
            <div
              className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                currentStep === step.id
                  ? "border-blue-500 bg-blue-500 text-white"
                  : "border-gray-300 text-gray-500"
              }`}
            >
              {index + 1}
            </div>
            <span
              className={`ml-2 ${
                currentStep === step.id
                  ? "text-blue-500 font-medium"
                  : "text-gray-500"
              }`}
            >
              {step.title}
            </span>
            {index < steps.length - 1 && (
              <div className="w-24 h-[2px] mx-4 bg-gray-300" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
