
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useErrorHandler } from "@/hooks/useErrorHandler";

export interface AnalyticsEvent {
  id: string;
  bot_id: string;
  user_id: string;
  event_type: string;
  event_data: any;
  created_at: string;
}

export interface ConversationMetric {
  id: string;
  conversation_id: string;
  bot_id: string;
  user_id: string;
  started_at: string;
  ended_at: string | null;
  message_count: number;
  response_time_avg: number;
  satisfaction_score: number | null;
  resolved: boolean;
}

export interface DailyMetric {
  id: string;
  bot_id: string;
  user_id: string;
  date: string;
  conversations_started: number;
  conversations_completed: number;
  total_messages: number;
  avg_response_time: number;
  avg_satisfaction: number;
}

export function useAnalytics(timeRange: number = 7) {
  const [loading, setLoading] = useState(true);
  const [dailyMetrics, setDailyMetrics] = useState<DailyMetric[]>([]);
  const [conversationMetrics, setConversationMetrics] = useState<ConversationMetric[]>([]);
  const [totalStats, setTotalStats] = useState({
    totalConversations: 0,
    completedConversations: 0,
    totalMessages: 0,
    avgResponseTime: 0,
    avgSatisfaction: 0
  });
  const { handleError } = useErrorHandler();

  const trackEvent = async (botId: string, eventType: string, eventData?: any) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      await supabase
        .from('analytics_events')
        .insert({
          bot_id: botId,
          user_id: session.user.id,
          event_type: eventType,
          event_data: eventData || {}
        });
    } catch (error) {
      console.error('Error tracking analytics event:', error);
    }
  };

  const updateConversationMetrics = async (
    conversationId: string,
    botId: string,
    metrics: Partial<ConversationMetric>
  ) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      await supabase
        .from('conversation_metrics')
        .upsert({
          conversation_id: conversationId,
          bot_id: botId,
          user_id: session.user.id,
          ...metrics
        });
    } catch (error) {
      handleError(error, "updateConversationMetrics");
    }
  };

  const fetchAnalytics = async (botId?: string) => {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const startDate = new Date();
      startDate.setDate(startDate.getDate() - timeRange);

      // Fetch daily metrics
      let dailyQuery = supabase
        .from('daily_metrics')
        .select('*')
        .eq('user_id', session.user.id)
        .gte('date', startDate.toISOString().split('T')[0])
        .order('date', { ascending: true });

      if (botId) {
        dailyQuery = dailyQuery.eq('bot_id', botId);
      }

      const { data: daily, error: dailyError } = await dailyQuery;
      if (dailyError) throw dailyError;

      // Fetch conversation metrics
      let conversationQuery = supabase
        .from('conversation_metrics')
        .select('*')
        .eq('user_id', session.user.id)
        .gte('started_at', startDate.toISOString())
        .order('started_at', { ascending: false });

      if (botId) {
        conversationQuery = conversationQuery.eq('bot_id', botId);
      }

      const { data: conversations, error: conversationError } = await conversationQuery;
      if (conversationError) throw conversationError;

      setDailyMetrics(daily || []);
      setConversationMetrics(conversations || []);

      // Calculate total stats
      const stats = (daily || []).reduce((acc, metric) => ({
        totalConversations: acc.totalConversations + metric.conversations_started,
        completedConversations: acc.completedConversations + metric.conversations_completed,
        totalMessages: acc.totalMessages + metric.total_messages,
        avgResponseTime: (acc.avgResponseTime + metric.avg_response_time) / 2,
        avgSatisfaction: (acc.avgSatisfaction + metric.avg_satisfaction) / 2
      }), {
        totalConversations: 0,
        completedConversations: 0,
        totalMessages: 0,
        avgResponseTime: 0,
        avgSatisfaction: 0
      });

      setTotalStats(stats);

    } catch (error) {
      handleError(error, "fetchAnalytics");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  return {
    loading,
    dailyMetrics,
    conversationMetrics,
    totalStats,
    trackEvent,
    updateConversationMetrics,
    fetchAnalytics
  };
}
