export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      chemical_products: {
        Row: {
          built_in_date: string | null
          created_at: string
          environmental_class: string | null
          finished_date: string | null
          first_delivery_date: string | null
          has_safety_datasheet: boolean
          hazard_code: string | null
          id: string
          manufacturer: string | null
          product_name: string
          project_id: string
          safety_datasheet_url: string | null
          sort_order: number
          storage_location: string | null
          updated_at: string
        }
        Insert: {
          built_in_date?: string | null
          created_at?: string
          environmental_class?: string | null
          finished_date?: string | null
          first_delivery_date?: string | null
          has_safety_datasheet?: boolean
          hazard_code?: string | null
          id?: string
          manufacturer?: string | null
          product_name: string
          project_id: string
          safety_datasheet_url?: string | null
          sort_order?: number
          storage_location?: string | null
          updated_at?: string
        }
        Update: {
          built_in_date?: string | null
          created_at?: string
          environmental_class?: string | null
          finished_date?: string | null
          first_delivery_date?: string | null
          has_safety_datasheet?: boolean
          hazard_code?: string | null
          id?: string
          manufacturer?: string | null
          product_name?: string
          project_id?: string
          safety_datasheet_url?: string | null
          sort_order?: number
          storage_location?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "chemical_products_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      document_images: {
        Row: {
          created_at: string
          document_id: string
          id: string
          image_index: number
          image_type: string
          image_url: string
          page_number: number | null
        }
        Insert: {
          created_at?: string
          document_id: string
          id?: string
          image_index?: number
          image_type?: string
          image_url: string
          page_number?: number | null
        }
        Update: {
          created_at?: string
          document_id?: string
          id?: string
          image_index?: number
          image_type?: string
          image_url?: string
          page_number?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "document_images_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
        ]
      }
      document_reads: {
        Row: {
          confirmed_at: string
          document_id: string
          document_version: number
          id: string
          user_id: string
        }
        Insert: {
          confirmed_at?: string
          document_id: string
          document_version: number
          id?: string
          user_id: string
        }
        Update: {
          confirmed_at?: string
          document_id?: string
          document_version?: number
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "document_reads_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "document_reads_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "project_users"
            referencedColumns: ["id"]
          },
        ]
      }
      document_slots: {
        Row: {
          created_at: string
          description: string | null
          id: string
          project_id: string
          slot_type: string
          sort_order: number
          title: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          project_id: string
          slot_type: string
          sort_order?: number
          title: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          project_id?: string
          slot_type?: string
          sort_order?: number
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "document_slots_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      document_translations: {
        Row: {
          created_at: string
          document_id: string
          id: string
          language: string
          translated_questions: Json | null
          translated_sections: Json | null
        }
        Insert: {
          created_at?: string
          document_id: string
          id?: string
          language: string
          translated_questions?: Json | null
          translated_sections?: Json | null
        }
        Update: {
          created_at?: string
          document_id?: string
          id?: string
          language?: string
          translated_questions?: Json | null
          translated_sections?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "document_translations_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
        ]
      }
      documents: {
        Row: {
          created_at: string
          document_category: string | null
          extracted_text: string | null
          extraction_error: string | null
          extraction_status: string
          id: string
          is_latest: boolean
          mime_type: string | null
          mobile_html: string | null
          original_file_url: string | null
          project_id: string
          slot_id: string | null
          smart_view_confidence: string | null
          smart_view_data: Json | null
          source_type: string | null
          title: string
          uploaded_by: string | null
          version_number: number
        }
        Insert: {
          created_at?: string
          document_category?: string | null
          extracted_text?: string | null
          extraction_error?: string | null
          extraction_status?: string
          id?: string
          is_latest?: boolean
          mime_type?: string | null
          mobile_html?: string | null
          original_file_url?: string | null
          project_id: string
          slot_id?: string | null
          smart_view_confidence?: string | null
          smart_view_data?: Json | null
          source_type?: string | null
          title: string
          uploaded_by?: string | null
          version_number?: number
        }
        Update: {
          created_at?: string
          document_category?: string | null
          extracted_text?: string | null
          extraction_error?: string | null
          extraction_status?: string
          id?: string
          is_latest?: boolean
          mime_type?: string | null
          mobile_html?: string | null
          original_file_url?: string | null
          project_id?: string
          slot_id?: string | null
          smart_view_confidence?: string | null
          smart_view_data?: Json | null
          source_type?: string | null
          title?: string
          uploaded_by?: string | null
          version_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "documents_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_slot_id_fkey"
            columns: ["slot_id"]
            isOneToOne: false
            referencedRelation: "document_slots"
            referencedColumns: ["id"]
          },
        ]
      }
      info_blocks: {
        Row: {
          content: string
          created_at: string
          id: string
          project_id: string
          requires_resign: boolean
          sort_order: number
          version_number: number
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          project_id: string
          requires_resign?: boolean
          sort_order?: number
          version_number?: number
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          project_id?: string
          requires_resign?: boolean
          sort_order?: number
          version_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "info_blocks_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_users: {
        Row: {
          company: string | null
          created_at: string
          id: string
          name: string
          p06_id: string | null
          phone: string | null
        }
        Insert: {
          company?: string | null
          created_at?: string
          id?: string
          name: string
          p06_id?: string | null
          phone?: string | null
        }
        Update: {
          company?: string | null
          created_at?: string
          id?: string
          name?: string
          p06_id?: string | null
          phone?: string | null
        }
        Relationships: []
      }
      projects: {
        Row: {
          address: string | null
          company: string | null
          created_at: string
          end_date: string | null
          id: string
          name: string
          project_number: string | null
          qr_code_url: string | null
          start_date: string | null
        }
        Insert: {
          address?: string | null
          company?: string | null
          created_at?: string
          end_date?: string | null
          id?: string
          name: string
          project_number?: string | null
          qr_code_url?: string | null
          start_date?: string | null
        }
        Update: {
          address?: string | null
          company?: string | null
          created_at?: string
          end_date?: string | null
          id?: string
          name?: string
          project_number?: string | null
          qr_code_url?: string | null
          start_date?: string | null
        }
        Relationships: []
      }
      question_answers: {
        Row: {
          answer_given: string
          answered_at: string
          correct: boolean
          id: string
          question_id: string
          user_id: string
        }
        Insert: {
          answer_given: string
          answered_at?: string
          correct?: boolean
          id?: string
          question_id: string
          user_id: string
        }
        Update: {
          answer_given?: string
          answered_at?: string
          correct?: boolean
          id?: string
          question_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "question_answers_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "question_answers_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "project_users"
            referencedColumns: ["id"]
          },
        ]
      }
      questions: {
        Row: {
          correct_answer: string
          created_at: string
          document_id: string | null
          id: string
          is_default: boolean
          options: Json | null
          question_text: string
          question_type: Database["public"]["Enums"]["question_type"]
          slot_id: string | null
          version_number: number
        }
        Insert: {
          correct_answer: string
          created_at?: string
          document_id?: string | null
          id?: string
          is_default?: boolean
          options?: Json | null
          question_text: string
          question_type?: Database["public"]["Enums"]["question_type"]
          slot_id?: string | null
          version_number?: number
        }
        Update: {
          correct_answer?: string
          created_at?: string
          document_id?: string | null
          id?: string
          is_default?: boolean
          options?: Json | null
          question_text?: string
          question_type?: Database["public"]["Enums"]["question_type"]
          slot_id?: string | null
          version_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "questions_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "questions_slot_id_fkey"
            columns: ["slot_id"]
            isOneToOne: false
            referencedRelation: "document_slots"
            referencedColumns: ["id"]
          },
        ]
      }
      signatures: {
        Row: {
          device_info: string | null
          id: string
          project_id: string
          signature_image_url: string | null
          signed_at: string
          user_id: string
        }
        Insert: {
          device_info?: string | null
          id?: string
          project_id: string
          signature_image_url?: string | null
          signed_at?: string
          user_id: string
        }
        Update: {
          device_info?: string | null
          id?: string
          project_id?: string
          signature_image_url?: string | null
          signed_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "signatures_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "signatures_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "project_users"
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
      question_type: "multiple_choice" | "true_false"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      question_type: ["multiple_choice", "true_false"],
    },
  },
} as const
