
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://hmmbolvudsckgzjzzwnr.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhtbWJvbHZ1ZHNja2d6anp6d25yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzkxMTIxMDMsImV4cCI6MjA1NDY4ODEwM30.rGUHvUPbkqNCBcF_JkaEpKPibF-QH5dNhWD2QLjDLqg"
);

const Index = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleAuth = useCallback(
    async (type: "login" | "register") => {
      try {
        setLoading(true);
        
        let result;
        if (type === "login") {
          result = await supabase.auth.signInWithPassword({
            email,
            password,
          });
        } else {
          result = await supabase.auth.signUp({
            email,
            password,
          });
        }

        if (result.error) throw result.error;

        toast({
          title: type === "login" ? "Login realizado!" : "Cadastro realizado!",
          description: type === "login" 
            ? "Bem-vindo de volta!"
            : "Verifique seu email para confirmar o cadastro.",
        });

        if (type === "login") {
          navigate("/dashboard");
        }
      } catch (error: any) {
        toast({
          variant: "destructive",
          title: "Erro",
          description: error.message,
        });
      } finally {
        setLoading(false);
      }
    },
    [email, password, navigate, toast]
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="max-w-md w-full p-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900">AideiaBots</h1>
          <p className="text-gray-600 mt-2">
            Crie e gerencie seus agentes de IA em um só lugar
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Acesse sua conta</CardTitle>
            <CardDescription>
              Faça login ou crie uma nova conta para começar
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="register">Cadastro</TabsTrigger>
              </TabsList>
              <TabsContent value="login">
                <form onSubmit={(e) => {
                  e.preventDefault();
                  handleAuth("login");
                }}>
                  <div className="grid gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="seu@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="password">Senha</Label>
                      <Input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                    </div>
                    <Button disabled={loading}>
                      {loading ? "Carregando..." : "Entrar"}
                    </Button>
                  </div>
                </form>
              </TabsContent>
              <TabsContent value="register">
                <form onSubmit={(e) => {
                  e.preventDefault();
                  handleAuth("register");
                }}>
                  <div className="grid gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="seu@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="password">Senha</Label>
                      <Input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                    </div>
                    <Button disabled={loading}>
                      {loading ? "Carregando..." : "Cadastrar"}
                    </Button>
                  </div>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter className="flex justify-center text-sm text-gray-600">
            Ao continuar, você concorda com nossos Termos de Serviço
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Index;
