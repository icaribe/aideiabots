
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

      const { data, error: fetchError } = await supabase
        .from('whatsapp_sessions')
        .select('*')
        .eq('bot_id', botId)
        .order('last_activity', { ascending: false });

      if (fetchError) {
        console.error('Error fetching WhatsApp sessions:', fetchError);
        setError(fetchError.message);
        toast.error("Erro ao carregar sessões do WhatsApp");
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
      const { data, error: createError } = await supabase
        .from('whatsapp_sessions')
        .insert({
          phone_number: phoneNumber,
          bot_id: botId,
          session_data: {},
          last_activity: new Date().toISOString()
        })
        .select()
        .single();

      if (createError) {
        console.error('Error creating WhatsApp session:', createError);
        toast.error("Erro ao criar sessão WhatsApp");
        throw createError;
      }

      setSessions(prev => [data, ...prev]);
      toast.success("Sessão WhatsApp criada com sucesso");
      
      return data;
    } catch (err) {
      console.error('Error creating WhatsApp session:', err);
      toast.error("Erro ao criar sessão WhatsApp");
      throw err;
    }
  };

  const updateSession = async (sessionId: string, updates: Partial<WhatsAppSession>) => {
    try {
      const { data, error: updateError } = await supabase
        .from('whatsapp_sessions')
        .update({
          ...updates,
          last_activity: new Date().toISOString()
        })
        .eq('id', sessionId)
        .select()
        .single();

      if (updateError) {
        console.error('Error updating WhatsApp session:', updateError);
        toast.error("Erro ao atualizar sessão WhatsApp");
        throw updateError;
      }

      setSessions(prev => prev.map(session => 
        session.id === sessionId ? data : session
      ));

      return data;
    } catch (err) {
      console.error('Error updating WhatsApp session:', err);
      toast.error("Erro ao atualizar sessão WhatsApp");
      throw err;
    }
  };

  const deleteSession = async (sessionId: string) => {
    try {
      const { error: deleteError } = await supabase
        .from('whatsapp_sessions')
        .delete()
        .eq('id', sessionId);

      if (deleteError) {
        console.error('Error deleting WhatsApp session:', deleteError);
        toast.error("Erro ao remover sessão WhatsApp");
        throw deleteError;
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
