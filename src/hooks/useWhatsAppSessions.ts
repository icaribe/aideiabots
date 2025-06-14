
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

      // Using raw SQL query through RPC to access whatsapp_sessions table
      const { data, error: fetchError } = await supabase.rpc('get_whatsapp_sessions', { 
        p_bot_id: botId 
      });

      if (fetchError) {
        console.error('Error fetching WhatsApp sessions:', fetchError);
        // If RPC doesn't exist, we'll handle it gracefully
        setSessions([]);
        return;
      }

      setSessions(data || []);
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
      // Using RPC to create session
      const { data, error: createError } = await supabase.rpc('create_whatsapp_session', {
        p_phone_number: phoneNumber,
        p_bot_id: botId
      });

      if (createError) {
        console.error('Error creating WhatsApp session:', createError);
        toast.error("Erro ao criar sessão WhatsApp");
        return null;
      }

      if (data) {
        setSessions(prev => [data, ...prev]);
        toast.success("Sessão WhatsApp criada com sucesso");
      }
      
      return data;
    } catch (err) {
      console.error('Error creating WhatsApp session:', err);
      toast.error("Erro ao criar sessão WhatsApp");
      throw err;
    }
  };

  const updateSession = async (sessionId: string, updates: Partial<WhatsAppSession>) => {
    try {
      const { data, error: updateError } = await supabase.rpc('update_whatsapp_session', {
        p_session_id: sessionId,
        p_updates: updates
      });

      if (updateError) {
        console.error('Error updating WhatsApp session:', updateError);
        toast.error("Erro ao atualizar sessão WhatsApp");
        return null;
      }

      if (data) {
        setSessions(prev => prev.map(session => 
          session.id === sessionId ? { ...session, ...data } : session
        ));
      }

      return data;
    } catch (err) {
      console.error('Error updating WhatsApp session:', err);
      toast.error("Erro ao atualizar sessão WhatsApp");
      throw err;
    }
  };

  const deleteSession = async (sessionId: string) => {
    try {
      const { error: deleteError } = await supabase.rpc('delete_whatsapp_session', {
        p_session_id: sessionId
      });

      if (deleteError) {
        console.error('Error deleting WhatsApp session:', deleteError);
        toast.error("Erro ao remover sessão WhatsApp");
        return;
      }

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
