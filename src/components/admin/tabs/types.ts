import type { Tables } from "@/integrations/supabase/types";

type Document = Tables<"documents">;

export interface DocumentSlot {
  id: string;
  project_id: string;
  slot_type: string;
  title: string;
  description: string | null;
  sort_order: number;
  created_at: string;
}

export interface ExtendedDocument extends Tables<"documents"> {
  smart_view_confidence?: string | null;
  extraction_status?: string;
}

export type { Document };
