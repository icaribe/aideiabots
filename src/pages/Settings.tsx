
import { useState, useEffect } from "react";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { ProviderCredentialsList } from "@/components/settings/ProviderCredentialsList";
import { LLMCredentialForm } from "@/components/settings/LLMCredentialForm";
import { VoiceCredentialForm } from "@/components/settings/VoiceCredentialForm";
import { ProviderCredential } from "@/types/provider";
import { getProviderCredentials } from "@/services/providerCredentials";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const Settings = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("llm");
  const [showForm, setShowForm] = useState(false);
  const [selectedCredential, setSelectedCredential] = useState<ProviderCredential | null>(null);
  const [credentials, setCredentials] = useState<ProviderCredential[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCredentials();
  }, []);

  const fetchCredentials = async () => {
    setLoading(true);
    try {
      const data = await getProviderCredentials();
      setCredentials(data);
    } catch (error) {
      toast.error("Erro ao carregar credenciais");
      console.error("Error fetching credentials:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddNew = () => {
    setSelectedCredential(null);
    setShowForm(true);
  };

  const handleEdit = (credential: ProviderCredential) => {
    setSelectedCredential(credential);
    setActiveTab(credential.provider_type);
    setShowForm(true);
  };

  const handleSaved = () => {
    fetchCredentials();
    setShowForm(false);
    setSelectedCredential(null);
  };

  const handleCancel = () => {
    setShowForm(false);
    setSelectedCredential(null);
  };

  const getLLMCredentials = () => {
    return credentials.filter(cred => cred.provider_type === 'llm');
  };

  const getVoiceCredentials = () => {
    return credentials.filter(cred => cred.provider_type === 'voice');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <Button
              variant="ghost"
              className="mr-2"
              onClick={() => navigate(-1)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-2xl font-bold">Configurações</h1>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Credenciais de Provedores</CardTitle>
            <CardDescription>
              Gerencie suas credenciais de API para provedores de LLM e Voz
            </CardDescription>
          </CardHeader>

          <CardContent>
            <Tabs
              defaultValue="llm"
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <div className="flex justify-between items-center mb-4">
                <TabsList>
                  <TabsTrigger value="llm">Provedores LLM</TabsTrigger>
                  <TabsTrigger value="voice">Provedores de Voz</TabsTrigger>
                </TabsList>

                {!showForm && (
                  <Button onClick={handleAddNew}>
                    Adicionar {activeTab === "llm" ? "LLM" : "Voz"}
                  </Button>
                )}
              </div>

              <TabsContent value="llm" className="mt-4">
                {showForm && activeTab === "llm" ? (
                  <LLMCredentialForm
                    credential={selectedCredential as any}
                    onSaved={handleSaved}
                    onCancel={handleCancel}
                  />
                ) : (
                  <ProviderCredentialsList
                    credentials={getLLMCredentials()}
                    onEdit={handleEdit}
                    onDeleted={fetchCredentials}
                  />
                )}
              </TabsContent>

              <TabsContent value="voice" className="mt-4">
                {showForm && activeTab === "voice" ? (
                  <VoiceCredentialForm
                    credential={selectedCredential as any}
                    onSaved={handleSaved}
                    onCancel={handleCancel}
                  />
                ) : (
                  <ProviderCredentialsList
                    credentials={getVoiceCredentials()}
                    onEdit={handleEdit}
                    onDeleted={fetchCredentials}
                  />
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Settings;
