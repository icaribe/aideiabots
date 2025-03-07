
import { useParams } from "react-router-dom";
import { StepHeader } from "@/components/agent/StepHeader";
import { TypeStep } from "@/components/agent/TypeStep";
import { LLMStep } from "@/components/agent/LLMStep";
import { ConfigStep } from "@/components/agent/ConfigStep";
import { IntegrationsStep } from "@/components/agent/IntegrationsStep";
import { EditAgentHeader } from "@/components/agent/EditAgentHeader";
import { DeleteAgentButton } from "@/components/agent/DeleteAgentButton";
import { useEditAgent } from "@/hooks/useEditAgent";

const EditAgent = () => {
  const { id } = useParams<{ id: string }>();
  const {
    currentStep,
    setCurrentStep,
    selectedType,
    setSelectedType,
    selectedProvider,
    setSelectedProvider,
    selectedModel,
    setSelectedModel,
    agentName,
    setAgentName,
    agentDescription,
    setAgentDescription,
    whatsappNumber,
    setWhatsappNumber,
    intents,
    setIntents,
    handleUpdateAgent,
    handleDelete
  } = useEditAgent(id);

  if (!id) return null;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <EditAgentHeader />
        <StepHeader currentStep={currentStep} />

        <div className="max-w-2xl mx-auto">
          {currentStep === "type" && (
            <TypeStep
              selectedType={selectedType}
              onTypeSelect={setSelectedType}
              onNext={() => setCurrentStep("llm")}
            />
          )}

          {currentStep === "llm" && (
            <LLMStep
              selectedProvider={selectedProvider}
              selectedModel={selectedModel}
              onProviderSelect={setSelectedProvider}
              onModelSelect={setSelectedModel}
              onBack={() => setCurrentStep("type")}
              onNext={() => setCurrentStep("config")}
            />
          )}

          {currentStep === "config" && (
            <ConfigStep
              agentName={agentName}
              agentDescription={agentDescription}
              whatsappNumber={whatsappNumber}
              intents={intents}
              onAgentNameChange={setAgentName}
              onAgentDescriptionChange={setAgentDescription}
              onWhatsappNumberChange={setWhatsappNumber}
              onIntentsChange={setIntents}
              onBack={() => setCurrentStep("llm")}
              onSubmit={() => {
                handleUpdateAgent();
                setCurrentStep("integrations");
              }}
            />
          )}

          {currentStep === "integrations" && (
            <IntegrationsStep
              botId={id}
              onBack={() => setCurrentStep("config")}
            />
          )}
        </div>

        <div className="mt-8 border-t pt-8">
          <DeleteAgentButton onDelete={handleDelete} />
        </div>
      </div>
    </div>
  );
};

export default EditAgent;
