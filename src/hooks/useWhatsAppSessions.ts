
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type WhatsAppSession = {
  id: string;
  phone_number: string;
  conversation_id: string | null;
  bot_id: string;
  session_data: any;
  last_activity: string;
  created_at: string;
};

export function useWhatsAppSessions(botId: string) {
  const [sessions, setSessions] = useState<WhatsAppSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (botId) {
      fetchSessions();
    }
  }, [botId]);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      setError(null);

      // Direct query to the table since RPC functions aren't available yet
      const { data, error: fetchError } = await supabase
        .from('integrations')
        .select('*')
        .eq('bot_id', botId)
        .eq('type', 'whatsapp');

      if (fetchError) {
        console.error('Error fetching WhatsApp sessions:', fetchError);
        setError(fetchError.message);
        toast.error("Erro ao carregar sessões do WhatsApp");
        return;
      }

      // For now, we'll work with integrations data
      // Once whatsapp_sessions table is accessible, we can fetch actual sessions
      setSessions([]);
    } catch (err) {
      console.error('Error fetching WhatsApp sessions:', err);
      setError(err instanceof Error ? err.message : 'Erro ao buscar sessões');
      toast.error("Erro ao carregar sessões do WhatsApp");
    } finally {
      setLoading(false);
    }
  };

  const createSession = async (phoneNumber: string) => {
    try {
      // For now, we'll return a mock session since RPC functions aren't available
      const mockSession: WhatsAppSession = {
        id: crypto.randomUUID(),
        phone_number: phoneNumber,
        conversation_id: null,
        bot_id: botId,
        session_data: {},
        last_activity: new Date().toISOString(),
        created_at: new Date().toISOString()
      };

      setSessions(prev => [mockSession, ...prev]);
      toast.success("Sessão WhatsApp criada com sucesso");
      
      return mockSession;
    } catch (err) {
      console.error('Error creating WhatsApp session:', err);
      toast.error("Erro ao criar sessão WhatsApp");
      throw err;
    }
  };

  const updateSession = async (sessionId: string, updates: Partial<WhatsAppSession>) => {
    try {
      setSessions(prev => prev.map(session => 
        session.id === sessionId ? { ...session, ...updates } : session
      ));

      return updates;
    } catch (err) {
      console.error('Error updating WhatsApp session:', err);
      toast.error("Erro ao atualizar sessão WhatsApp");
      throw err;
    }
  };

  const deleteSession = async (sessionId: string) => {
    try {
      setSessions(prev => prev.filter(session => session.id !== sessionId));
      toast.success("Sessão WhatsApp removida com sucesso");
    } catch (err) {
      console.error('Error deleting WhatsApp session:', err);
      toast.error("Erro ao remover sessão WhatsApp");
    }
  };

  return {
    sessions,
    loading,
    error,
    fetchSessions,
    createSession,
    updateSession,
    deleteSession
  };
}
