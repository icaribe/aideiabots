
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://hmmbolvudsckgzjzzwnr.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhtbWJvbHZ1ZHNja2d6anp6d25yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzkxMTIxMDMsImV4cCI6MjA1NDY4ODEwM30.rGUHvUPbkqNCBcF_JkaEpKPibF-QH5dNhWD2QLjDLqg"
);

const Dashboard = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/");
      }
    };

    checkAuth();
  }, [navigate]);

  return (
    <div className="min-h-screen p-8">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      <p className="mt-4">Bem-vindo ao AideiaBots! Aqui você poderá gerenciar seus agentes de IA.</p>
    </div>
  );
};

export default Dashboard;
