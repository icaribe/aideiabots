export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      analytics_events: {
        Row: {
          bot_id: string
          created_at: string
          event_data: Json | null
          event_type: string
          id: string
          user_id: string
        }
        Insert: {
          bot_id: string
          created_at?: string
          event_data?: Json | null
          event_type: string
          id?: string
          user_id: string
        }
        Update: {
          bot_id?: string
          created_at?: string
          event_data?: Json | null
          event_type?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "analytics_events_bot_id_fkey"
            columns: ["bot_id"]
            isOneToOne: false
            referencedRelation: "bots"
            referencedColumns: ["id"]
          },
        ]
      }
      bots: {
        Row: {
          api_key: string | null
          created_at: string | null
          description: string | null
          id: string
          llm_credential_id: string | null
          llm_provider: string
          model: string
          name: string
          provider: string | null
          updated_at: string | null
          user_id: string
          voice_credential_id: string | null
          voice_model: string | null
          voice_provider: string | null
          webhook_url: string | null
        }
        Insert: {
          api_key?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          llm_credential_id?: string | null
          llm_provider: string
          model: string
          name: string
          provider?: string | null
          updated_at?: string | null
          user_id: string
          voice_credential_id?: string | null
          voice_model?: string | null
          voice_provider?: string | null
          webhook_url?: string | null
        }
        Update: {
          api_key?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          llm_credential_id?: string | null
          llm_provider?: string
          model?: string
          name?: string
          provider?: string | null
          updated_at?: string | null
          user_id?: string
          voice_credential_id?: string | null
          voice_model?: string | null
          voice_provider?: string | null
          webhook_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bots_llm_credential_id_fkey"
            columns: ["llm_credential_id"]
            isOneToOne: false
            referencedRelation: "provider_credentials"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bots_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bots_voice_credential_id_fkey"
            columns: ["voice_credential_id"]
            isOneToOne: false
            referencedRelation: "provider_credentials"
            referencedColumns: ["id"]
          },
        ]
      }
      conversation_metrics: {
        Row: {
          bot_id: string
          conversation_id: string
          ended_at: string | null
          id: string
          message_count: number | null
          resolved: boolean | null
          response_time_avg: number | null
          satisfaction_score: number | null
          started_at: string
          user_id: string
        }
        Insert: {
          bot_id: string
          conversation_id: string
          ended_at?: string | null
          id?: string
          message_count?: number | null
          resolved?: boolean | null
          response_time_avg?: number | null
          satisfaction_score?: number | null
          started_at?: string
          user_id: string
        }
        Update: {
          bot_id?: string
          conversation_id?: string
          ended_at?: string | null
          id?: string
          message_count?: number | null
          resolved?: boolean | null
          response_time_avg?: number | null
          satisfaction_score?: number | null
          started_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversation_metrics_bot_id_fkey"
            columns: ["bot_id"]
            isOneToOne: false
            referencedRelation: "bots"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversation_metrics_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          bot_id: string
          created_at: string
          id: string
          title: string
          user_id: string
        }
        Insert: {
          bot_id: string
          created_at?: string
          id?: string
          title: string
          user_id: string
        }
        Update: {
          bot_id?: string
          created_at?: string
          id?: string
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversations_bot_id_fkey"
            columns: ["bot_id"]
            isOneToOne: false
            referencedRelation: "bots"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_metrics: {
        Row: {
          avg_response_time: number | null
          avg_satisfaction: number | null
          bot_id: string
          conversations_completed: number | null
          conversations_started: number | null
          created_at: string
          date: string
          id: string
          total_messages: number | null
          user_id: string
        }
        Insert: {
          avg_response_time?: number | null
          avg_satisfaction?: number | null
          bot_id: string
          conversations_completed?: number | null
          conversations_started?: number | null
          created_at?: string
          date: string
          id?: string
          total_messages?: number | null
          user_id: string
        }
        Update: {
          avg_response_time?: number | null
          avg_satisfaction?: number | null
          bot_id?: string
          conversations_completed?: number | null
          conversations_started?: number | null
          created_at?: string
          date?: string
          id?: string
          total_messages?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "daily_metrics_bot_id_fkey"
            columns: ["bot_id"]
            isOneToOne: false
            referencedRelation: "bots"
            referencedColumns: ["id"]
          },
        ]
      }
      integrations: {
        Row: {
          active: boolean
          bot_id: string
          config: Json
          created_at: string | null
          id: string
          type: string
          webhook_url: string | null
        }
        Insert: {
          active?: boolean
          bot_id: string
          config?: Json
          created_at?: string | null
          id?: string
          type: string
          webhook_url?: string | null
        }
        Update: {
          active?: boolean
          bot_id?: string
          config?: Json
          created_at?: string | null
          id?: string
          type?: string
          webhook_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "integrations_bot_id_fkey"
            columns: ["bot_id"]
            isOneToOne: false
            referencedRelation: "bots"
            referencedColumns: ["id"]
          },
        ]
      }
      intents: {
        Row: {
          bot_id: string
          created_at: string | null
          description: string | null
          examples: string[] | null
          id: string
          name: string
          webhook_url: string
        }
        Insert: {
          bot_id: string
          created_at?: string | null
          description?: string | null
          examples?: string[] | null
          id?: string
          name: string
          webhook_url: string
        }
        Update: {
          bot_id?: string
          created_at?: string | null
          description?: string | null
          examples?: string[] | null
          id?: string
          name?: string
          webhook_url?: string
        }
        Relationships: [
          {
            foreignKeyName: "intents_bot_id_fkey"
            columns: ["bot_id"]
            isOneToOne: false
            referencedRelation: "bots"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          bot_id: string | null
          content: string
          conversation_id: string | null
          created_at: string
          error: boolean | null
          id: string
          is_from_user: boolean | null
          user_id: string
        }
        Insert: {
          bot_id?: string | null
          content: string
          conversation_id?: string | null
          created_at?: string
          error?: boolean | null
          id?: string
          is_from_user?: boolean | null
          user_id: string
        }
        Update: {
          bot_id?: string | null
          content?: string
          conversation_id?: string | null
          created_at?: string
          error?: boolean | null
          id?: string
          is_from_user?: boolean | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_bot_id_fkey"
            columns: ["bot_id"]
            isOneToOne: false
            referencedRelation: "bots"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      provider_credentials: {
        Row: {
          api_key: string
          created_at: string | null
          id: string
          name: string
          provider_id: string
          provider_type: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          api_key: string
          created_at?: string | null
          id?: string
          name: string
          provider_id: string
          provider_type: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          api_key?: string
          created_at?: string | null
          id?: string
          name?: string
          provider_id?: string
          provider_type?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      users: {
        Row: {
          bot_count: number
          created_at: string | null
          email: string
          id: string
          plan: string
        }
        Insert: {
          bot_count?: number
          created_at?: string | null
          email: string
          id: string
          plan?: string
        }
        Update: {
          bot_count?: number
          created_at?: string | null
          email?: string
          id?: string
          plan?: string
        }
        Relationships: []
      }
      whatsapp_sessions: {
        Row: {
          bot_id: string
          conversation_id: string | null
          created_at: string | null
          id: string
          last_activity: string | null
          phone_number: string
          session_data: Json | null
        }
        Insert: {
          bot_id: string
          conversation_id?: string | null
          created_at?: string | null
          id?: string
          last_activity?: string | null
          phone_number: string
          session_data?: Json | null
        }
        Update: {
          bot_id?: string
          conversation_id?: string | null
          created_at?: string | null
          id?: string
          last_activity?: string | null
          phone_number?: string
          session_data?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "whatsapp_sessions_bot_id_fkey"
            columns: ["bot_id"]
            isOneToOne: false
            referencedRelation: "bots"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "whatsapp_sessions_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
