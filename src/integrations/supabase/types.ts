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
      chat_tickets: {
        Row: {
          category: string | null
          common_issue: string | null
          company_name: string | null
          created_at: string | null
          extracted_keywords: string[] | null
          id: string
          issue: string | null
          issue_summary: string | null
          link: string | null
          priority: string | null
          read: boolean | null
          report_period: string | null
          responsible_department: string | null
          responsible_department_justification: string | null
          sentiment: string | null
          state: string | null
          summary: string | null
          theme: string | null
        }
        Insert: {
          category?: string | null
          common_issue?: string | null
          company_name?: string | null
          created_at?: string | null
          extracted_keywords?: string[] | null
          id: string
          issue?: string | null
          issue_summary?: string | null
          link?: string | null
          priority?: string | null
          read?: boolean | null
          report_period?: string | null
          responsible_department?: string | null
          responsible_department_justification?: string | null
          sentiment?: string | null
          state?: string | null
          summary?: string | null
          theme?: string | null
        }
        Update: {
          category?: string | null
          common_issue?: string | null
          company_name?: string | null
          created_at?: string | null
          extracted_keywords?: string[] | null
          id?: string
          issue?: string | null
          issue_summary?: string | null
          link?: string | null
          priority?: string | null
          read?: boolean | null
          report_period?: string | null
          responsible_department?: string | null
          responsible_department_justification?: string | null
          sentiment?: string | null
          state?: string | null
          summary?: string | null
          theme?: string | null
        }
        Relationships: []
      }
      chat_vectors: {
        Row: {
          embedding: string | null
          id: string
          metadata: Json | null
        }
        Insert: {
          embedding?: string | null
          id: string
          metadata?: Json | null
        }
        Update: {
          embedding?: string | null
          id?: string
          metadata?: Json | null
        }
        Relationships: []
      }
      embeddings: {
        Row: {
          embedding: string | null
          id: number
          text: string
          ticket_id: number
        }
        Insert: {
          embedding?: string | null
          id?: number
          text: string
          ticket_id: number
        }
        Update: {
          embedding?: string | null
          id?: number
          text?: string
          ticket_id?: number
        }
        Relationships: []
      }
      Mynt_Hypersight: {
        Row: {
          category: string | null
          common_issue: string | null
          company_name: string | null
          created_at: string | null
          id: number
          issue: string | null
          issue_summary: string | null
          link: string | null
          priority: string | null
          read: boolean | null
          report_period: string | null
          responsible_department: string | null
          responsible_department_justification: string | null
          sentiment: string | null
          state: string | null
          subcategory: string | null
          summary: string | null
        }
        Insert: {
          category?: string | null
          common_issue?: string | null
          company_name?: string | null
          created_at?: string | null
          id: number
          issue?: string | null
          issue_summary?: string | null
          link?: string | null
          priority?: string | null
          read?: boolean | null
          report_period?: string | null
          responsible_department?: string | null
          responsible_department_justification?: string | null
          sentiment?: string | null
          state?: string | null
          subcategory?: string | null
          summary?: string | null
        }
        Update: {
          category?: string | null
          common_issue?: string | null
          company_name?: string | null
          created_at?: string | null
          id?: number
          issue?: string | null
          issue_summary?: string | null
          link?: string | null
          priority?: string | null
          read?: boolean | null
          report_period?: string | null
          responsible_department?: string | null
          responsible_department_justification?: string | null
          sentiment?: string | null
          state?: string | null
          subcategory?: string | null
          summary?: string | null
        }
        Relationships: []
      }
      ticket_analysis: {
        Row: {
          category: string | null
          common_issue: string | null
          company_name: string | null
          created_at: string | null
          id: number | null
          issue: string | null
          issue_summary: string | null
          link: string | null
          priority: string | null
          read: boolean | null
          report_period: string | null
          responsible_department: string | null
          responsible_department_justification: string | null
          sentiment: string | null
          state: string | null
          subcategory: string | null
          summary: string | null
        }
        Insert: {
          category?: string | null
          common_issue?: string | null
          company_name?: string | null
          created_at?: string | null
          id?: number | null
          issue?: string | null
          issue_summary?: string | null
          link?: string | null
          priority?: string | null
          read?: boolean | null
          report_period?: string | null
          responsible_department?: string | null
          responsible_department_justification?: string | null
          sentiment?: string | null
          state?: string | null
          subcategory?: string | null
          summary?: string | null
        }
        Update: {
          category?: string | null
          common_issue?: string | null
          company_name?: string | null
          created_at?: string | null
          id?: number | null
          issue?: string | null
          issue_summary?: string | null
          link?: string | null
          priority?: string | null
          read?: boolean | null
          report_period?: string | null
          responsible_department?: string | null
          responsible_department_justification?: string | null
          sentiment?: string | null
          state?: string | null
          subcategory?: string | null
          summary?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_table_schema: {
        Args: {
          table_name: string
        }
        Returns: {
          column_name: string
          data_type: string
          description: string
        }[]
      }
      match_chat_vectors: {
        Args: {
          query_embedding: string
          match_count?: number
        }
        Returns: {
          id: string
          metadata: Json
          similarity: number
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
