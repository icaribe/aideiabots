
export type Message = {
  id: string;
  content: string;
  is_from_user: boolean;
  conversation_id?: string;
  created_at: string;
  bot_id?: string;
  user_id?: string;
};

export type Conversation = {
  id: string;
  title: string;
  bot_id: string;
  user_id: string;
  created_at: string;
};
