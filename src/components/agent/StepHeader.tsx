
import { Step } from "@/types/agent";
import { steps } from "@/constants/agent";

interface StepHeaderProps {
  currentStep: Step;
}

export const StepHeader = ({ currentStep }: StepHeaderProps) => {
  return (
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
  );
};
