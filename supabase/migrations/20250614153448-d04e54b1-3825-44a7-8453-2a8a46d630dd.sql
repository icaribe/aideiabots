
-- Create analytics tables for tracking bot usage and performance
CREATE TABLE public.analytics_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  bot_id UUID REFERENCES public.bots(id) ON DELETE CASCADE NOT NULL,
  user_id UUID NOT NULL,
  event_type TEXT NOT NULL, -- 'conversation_started', 'message_sent', 'message_received', 'conversation_ended'
  event_data JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create conversation metrics table
CREATE TABLE public.conversation_metrics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE NOT NULL,
  bot_id UUID REFERENCES public.bots(id) ON DELETE CASCADE NOT NULL,
  user_id UUID NOT NULL,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  ended_at TIMESTAMP WITH TIME ZONE,
  message_count INTEGER DEFAULT 0,
  response_time_avg FLOAT DEFAULT 0, -- average response time in seconds
  satisfaction_score INTEGER, -- 1-5 rating
  resolved BOOLEAN DEFAULT false
);

-- Create daily metrics aggregation table
CREATE TABLE public.daily_metrics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  bot_id UUID REFERENCES public.bots(id) ON DELETE CASCADE NOT NULL,
  user_id UUID NOT NULL,
  date DATE NOT NULL,
  conversations_started INTEGER DEFAULT 0,
  conversations_completed INTEGER DEFAULT 0,
  total_messages INTEGER DEFAULT 0,
  avg_response_time FLOAT DEFAULT 0,
  avg_satisfaction FLOAT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(bot_id, user_id, date)
);

-- Enable RLS on analytics tables
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_metrics ENABLE ROW LEVEL SECURITY;

-- RLS policies for analytics_events
CREATE POLICY "Users can view their own analytics events" 
  ON public.analytics_events 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own analytics events" 
  ON public.analytics_events 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- RLS policies for conversation_metrics
CREATE POLICY "Users can view their own conversation metrics" 
  ON public.conversation_metrics 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own conversation metrics" 
  ON public.conversation_metrics 
  FOR ALL 
  USING (auth.uid() = user_id);

-- RLS policies for daily_metrics
CREATE POLICY "Users can view their own daily metrics" 
  ON public.daily_metrics 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own daily metrics" 
  ON public.daily_metrics 
  FOR ALL 
  USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX idx_analytics_events_bot_id_created_at ON public.analytics_events(bot_id, created_at);
CREATE INDEX idx_analytics_events_user_id_created_at ON public.analytics_events(user_id, created_at);
CREATE INDEX idx_conversation_metrics_bot_id_started_at ON public.conversation_metrics(bot_id, started_at);
CREATE INDEX idx_daily_metrics_bot_id_date ON public.daily_metrics(bot_id, date);

-- Function to update daily metrics
CREATE OR REPLACE FUNCTION public.update_daily_metrics()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert or update daily metrics when conversation metrics are updated
  INSERT INTO public.daily_metrics (bot_id, user_id, date, conversations_started, conversations_completed, total_messages, avg_response_time)
  VALUES (
    NEW.bot_id,
    NEW.user_id,
    DATE(NEW.started_at),
    CASE WHEN TG_OP = 'INSERT' THEN 1 ELSE 0 END,
    CASE WHEN NEW.ended_at IS NOT NULL THEN 1 ELSE 0 END,
    NEW.message_count,
    NEW.response_time_avg
  )
  ON CONFLICT (bot_id, user_id, date)
  DO UPDATE SET
    conversations_completed = daily_metrics.conversations_completed + (CASE WHEN NEW.ended_at IS NOT NULL AND OLD.ended_at IS NULL THEN 1 ELSE 0 END),
    total_messages = daily_metrics.total_messages + (NEW.message_count - COALESCE(OLD.message_count, 0)),
    avg_response_time = (daily_metrics.avg_response_time + NEW.response_time_avg) / 2,
    created_at = now();
    
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for daily metrics updates
CREATE TRIGGER update_daily_metrics_trigger
  AFTER INSERT OR UPDATE ON public.conversation_metrics
  FOR EACH ROW
  EXECUTE FUNCTION public.update_daily_metrics();
