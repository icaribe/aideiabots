
-- Create whatsapp_sessions table
CREATE TABLE public.whatsapp_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  phone_number TEXT NOT NULL,
  conversation_id UUID REFERENCES public.conversations(id),
  bot_id UUID NOT NULL REFERENCES public.bots(id),
  session_data JSONB DEFAULT '{}',
  last_activity TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add Row Level Security
ALTER TABLE public.whatsapp_sessions ENABLE ROW LEVEL SECURITY;

-- Create policies for whatsapp_sessions
CREATE POLICY "Users can view whatsapp sessions for their bots" 
  ON public.whatsapp_sessions 
  FOR SELECT 
  USING (
    bot_id IN (
      SELECT id FROM public.bots WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create whatsapp sessions for their bots" 
  ON public.whatsapp_sessions 
  FOR INSERT 
  WITH CHECK (
    bot_id IN (
      SELECT id FROM public.bots WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update whatsapp sessions for their bots" 
  ON public.whatsapp_sessions 
  FOR UPDATE 
  USING (
    bot_id IN (
      SELECT id FROM public.bots WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete whatsapp sessions for their bots" 
  ON public.whatsapp_sessions 
  FOR DELETE 
  USING (
    bot_id IN (
      SELECT id FROM public.bots WHERE user_id = auth.uid()
    )
  );

-- Create index for better performance
CREATE INDEX idx_whatsapp_sessions_bot_id ON public.whatsapp_sessions(bot_id);
CREATE INDEX idx_whatsapp_sessions_phone_number ON public.whatsapp_sessions(phone_number);

-- Add webhook_url column to integrations table if it doesn't exist
ALTER TABLE public.integrations ADD COLUMN IF NOT EXISTS webhook_url TEXT;
