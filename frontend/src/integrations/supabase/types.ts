export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      claims: {
        Row: {
          affected_assets: string[];
          amount: number;
          claim_number: string;
          created_at: string;
          description: string | null;
          evidence_url: string | null;
          id: string;
          insurance_id: string | null;
          reason: string;
          status: string;
          transaction_hash: string | null;
          updated_at: string;
          user_id: string;
          wallet_id: string;
        };
        Insert: {
          affected_assets?: string[];
          amount: number;
          claim_number?: string;
          created_at?: string;
          description?: string | null;
          evidence_url?: string | null;
          id?: string;
          insurance_id?: string | null;
          reason: string;
          status: string;
          transaction_hash?: string | null;
          updated_at?: string;
          user_id: string;
          wallet_id: string;
        };
        Update: {
          affected_assets?: string[];
          amount?: number;
          claim_number?: string;
          created_at?: string;
          description?: string | null;
          evidence_url?: string | null;
          id?: string;
          insurance_id?: string | null;
          reason?: string;
          status?: string;
          transaction_hash?: string | null;
          updated_at?: string;
          user_id?: string;
          wallet_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "claims_insurance_id_fkey";
            columns: ["insurance_id"];
            isOneToOne: false;
            referencedRelation: "insurance_policies";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "claims_wallet_id_fkey";
            columns: ["wallet_id"];
            isOneToOne: false;
            referencedRelation: "wallets";
            referencedColumns: ["id"];
          },
        ];
      };
      global_protection_settings: {
        Row: {
          auto_swap: boolean;
          created_at: string;
          id: string;
          notifications: boolean;
          portfolio_threshold: number;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          auto_swap?: boolean;
          created_at?: string;
          id?: string;
          notifications?: boolean;
          portfolio_threshold?: number;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          auto_swap?: boolean;
          created_at?: string;
          id?: string;
          notifications?: boolean;
          portfolio_threshold?: number;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      insurance_policies: {
        Row: {
          created_at: string;
          expires_at: string;
          id: string;
          max_coverage: number;
          monthly_premium: number;
          status: string;
          tier: string;
          user_id: string;
          wallet_id: string;
        };
        Insert: {
          created_at?: string;
          expires_at: string;
          id?: string;
          max_coverage: number;
          monthly_premium: number;
          status: string;
          tier: string;
          user_id: string;
          wallet_id: string;
        };
        Update: {
          created_at?: string;
          expires_at?: string;
          id?: string;
          max_coverage?: number;
          monthly_premium?: number;
          status?: string;
          tier?: string;
          user_id?: string;
          wallet_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "insurance_policies_wallet_id_fkey";
            columns: ["wallet_id"];
            isOneToOne: false;
            referencedRelation: "wallets";
            referencedColumns: ["id"];
          },
        ];
      };
      notifications: {
        Row: {
          action_url: string | null;
          created_at: string;
          id: string;
          message: string;
          read: boolean;
          title: string;
          type: string;
          user_id: string;
          civic_id: string;
        };
        Insert: {
          action_url?: string | null;
          created_at?: string;
          id?: string;
          message: string;
          read?: boolean;
          title: string;
          type: string;
          user_id: string;
          civic_id: string;
        };
        Update: {
          action_url?: string | null;
          created_at?: string;
          id?: string;
          message?: string;
          read?: boolean;
          title?: string;
          type?: string;
          user_id?: string;
          civic_id: string;
        };
        Relationships: [];
      };
      payment_history: {
        Row: {
          amount: number;
          duration_days: number;
          id: string;
          insurance_id: string | null;
          payment_date: string;
          payment_method: string;
          status: string;
          user_id: string;
        };
        Insert: {
          amount: number;
          duration_days?: number;
          id?: string;
          insurance_id?: string | null;
          payment_date?: string;
          payment_method?: string;
          status: string;
          user_id: string;
        };
        Update: {
          amount?: number;
          duration_days?: number;
          id?: string;
          insurance_id?: string | null;
          payment_date?: string;
          payment_method?: string;
          status?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "payment_history_insurance_id_fkey";
            columns: ["insurance_id"];
            isOneToOne: false;
            referencedRelation: "insurance_policies";
            referencedColumns: ["id"];
          },
        ];
      };
      profiles: {
        Row: {
          avatar_url: string | null;
          created_at: string;
          display_name: string | null;
          id: string;
          theme_preference: string | null;
          updated_at: string;
        };
        Insert: {
          avatar_url?: string | null;
          created_at?: string;
          display_name?: string | null;
          id: string;
          theme_preference?: string | null;
          updated_at?: string;
        };
        Update: {
          avatar_url?: string | null;
          created_at?: string;
          display_name?: string | null;
          id?: string;
          theme_preference?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      protection_settings: {
        Row: {
          created_at: string;
          id: string;
          is_protected: boolean;
          risk_threshold: number;
          token_name: string;
          token_symbol: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          is_protected?: boolean;
          risk_threshold?: number;
          token_name: string;
          token_symbol: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          is_protected?: boolean;
          risk_threshold?: number;
          token_name?: string;
          token_symbol?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      user_preferences: {
        Row: {
          accent_color: string;
          claim_status_notifications: boolean;
          created_at: string;
          email_notifications: boolean;
          id: string;
          language: string;
          marketing_notifications: boolean;
          push_notifications: boolean;
          reduce_animations: boolean;
          risk_alert_notifications: boolean;
          theme_mode: string;
          timezone: string;
          transaction_notifications: boolean;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          accent_color?: string;
          claim_status_notifications?: boolean;
          created_at?: string;
          email_notifications?: boolean;
          id?: string;
          language?: string;
          marketing_notifications?: boolean;
          push_notifications?: boolean;
          reduce_animations?: boolean;
          risk_alert_notifications?: boolean;
          theme_mode?: string;
          timezone?: string;
          transaction_notifications?: boolean;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          accent_color?: string;
          claim_status_notifications?: boolean;
          created_at?: string;
          email_notifications?: boolean;
          id?: string;
          language?: string;
          marketing_notifications?: boolean;
          push_notifications?: boolean;
          reduce_animations?: boolean;
          risk_alert_notifications?: boolean;
          theme_mode?: string;
          timezone?: string;
          transaction_notifications?: boolean;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      waitlist: {
        Row: {
          created_at: string;
          email: string;
          id: string;
        };
        Insert: {
          created_at?: string;
          email: string;
          id?: string;
        };
        Update: {
          created_at?: string;
          email?: string;
          id?: string;
        };
        Relationships: [];
      };
      wallets: {
        Row: {
          address: string;
          created_at: string;
          id: string;
          is_primary: boolean | null;
          name: string | null;
          updated_at: string;
          user_id: string;
          civic_id: string | null;
        };
        Insert: {
          address: string;
          created_at?: string;
          id?: string;
          is_primary?: boolean | null;
          name?: string | null;
          updated_at?: string;
          user_id: string;
          civic_id: string | null;
        };
        Update: {
          address?: string;
          created_at?: string;
          id?: string;
          is_primary?: boolean | null;
          name?: string | null;
          updated_at?: string;
          user_id?: string;
          civic_id: string | null;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DefaultSchema = Database[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {},
  },
} as const;
