export interface Message {
  id: string;
  content: string;
  is_from_user: boolean;
  conversation_id: string;
  created_at: string;
  bot_id: string;
  user_id: string;
  error: boolean;
}

export interface Conversation {
  id: string;
  title: string;
  user_id: string;
  bot_id: string;
  created_at: string;
}
