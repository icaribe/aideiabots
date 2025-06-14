
-- Adicionar campo 'error' na tabela messages
ALTER TABLE public.messages 
ADD COLUMN IF NOT EXISTS error BOOLEAN DEFAULT false;

-- Adicionar campo 'examples' na tabela intents
ALTER TABLE public.intents 
ADD COLUMN IF NOT EXISTS examples TEXT[] DEFAULT ARRAY[]::TEXT[];

-- Implementar RLS policies para todas as tabelas
-- RLS para provider_credentials
ALTER TABLE public.provider_credentials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own provider credentials" 
  ON public.provider_credentials 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own provider credentials" 
  ON public.provider_credentials 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own provider credentials" 
  ON public.provider_credentials 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own provider credentials" 
  ON public.provider_credentials 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- RLS para bots
ALTER TABLE public.bots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own bots" 
  ON public.bots 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own bots" 
  ON public.bots 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own bots" 
  ON public.bots 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own bots" 
  ON public.bots 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- RLS para conversations
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own conversations" 
  ON public.conversations 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own conversations" 
  ON public.conversations 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own conversations" 
  ON public.conversations 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own conversations" 
  ON public.conversations 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- RLS para messages
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own messages" 
  ON public.messages 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own messages" 
  ON public.messages 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own messages" 
  ON public.messages 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own messages" 
  ON public.messages 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- RLS para intents
ALTER TABLE public.intents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view intents of own bots" 
  ON public.intents 
  FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM public.bots 
    WHERE bots.id = intents.bot_id 
    AND bots.user_id = auth.uid()
  ));

CREATE POLICY "Users can create intents for own bots" 
  ON public.intents 
  FOR INSERT 
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.bots 
    WHERE bots.id = intents.bot_id 
    AND bots.user_id = auth.uid()
  ));

CREATE POLICY "Users can update intents of own bots" 
  ON public.intents 
  FOR UPDATE 
  USING (EXISTS (
    SELECT 1 FROM public.bots 
    WHERE bots.id = intents.bot_id 
    AND bots.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete intents of own bots" 
  ON public.intents 
  FOR DELETE 
  USING (EXISTS (
    SELECT 1 FROM public.bots 
    WHERE bots.id = intents.bot_id 
    AND bots.user_id = auth.uid()
  ));

-- RLS para integrations
ALTER TABLE public.integrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view integrations of own bots" 
  ON public.integrations 
  FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM public.bots 
    WHERE bots.id = integrations.bot_id 
    AND bots.user_id = auth.uid()
  ));

CREATE POLICY "Users can create integrations for own bots" 
  ON public.integrations 
  FOR INSERT 
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.bots 
    WHERE bots.id = integrations.bot_id 
    AND bots.user_id = auth.uid()
  ));

CREATE POLICY "Users can update integrations of own bots" 
  ON public.integrations 
  FOR UPDATE 
  USING (EXISTS (
    SELECT 1 FROM public.bots 
    WHERE bots.id = integrations.bot_id 
    AND bots.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete integrations of own bots" 
  ON public.integrations 
  FOR DELETE 
  USING (EXISTS (
    SELECT 1 FROM public.bots 
    WHERE bots.id = integrations.bot_id 
    AND bots.user_id = auth.uid()
  ));

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON public.messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_user_id ON public.messages(user_id);
CREATE INDEX IF NOT EXISTS idx_conversations_bot_id ON public.conversations(bot_id);
CREATE INDEX IF NOT EXISTS idx_conversations_user_id ON public.conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_bots_user_id ON public.bots(user_id);
CREATE INDEX IF NOT EXISTS idx_intents_bot_id ON public.intents(bot_id);
CREATE INDEX IF NOT EXISTS idx_integrations_bot_id ON public.integrations(bot_id);
