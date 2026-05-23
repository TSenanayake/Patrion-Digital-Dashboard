import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Tables, TablesInsert } from '@/integrations/supabase/types';

export interface DocumentSlot {
  id: string;
  project_id: string;
  slot_type: string;
  title: string;
  description: string | null;
  sort_order: number;
  created_at: string;
}

export interface DocumentWithSlot extends Tables<'documents'> {
  smart_view_confidence?: string | null;
  extraction_status?: string;
}

export function useSlots(projectId: string | undefined) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['slots', projectId],
    queryFn: async () => {
      if (!projectId) return { slots: [], documents: {}, questions: [] };
      const { data: slotsData } = await supabase
        .from('document_slots')
        .select('*')
        .eq('project_id', projectId)
        .order('sort_order');

      const slots = (slotsData as DocumentSlot[]) || [];

      if (slots.length === 0) {
        return { slots: [], documents: {}, questions: [] };
      }

      const slotIds = slots.map(s => s.id);
      const { data: docs } = await supabase
        .from('documents')
        .select('*')
        .in('slot_id', slotIds)
        .order('version_number', { ascending: false });

      const grouped: Record<string, DocumentWithSlot[]> = {};
      for (const doc of (docs || [])) {
        const sid = doc.slot_id;
        if (sid && !grouped[sid]) grouped[sid] = [];
        if (sid) grouped[sid].push(doc as DocumentWithSlot);
      }

      const allDocIds = (docs || []).map(d => d.id);
      const allSlotIds = slots.map(s => s.id);

      let allQuestions: Tables<'questions'>[] = [];
      if (allDocIds.length > 0) {
        const { data: docQ } = await supabase
          .from('questions')
          .select('*')
          .in('document_id', allDocIds)
          .is('slot_id', null);
        allQuestions = [...(docQ || [])];
      }
      if (allSlotIds.length > 0) {
        const { data: slotQ } = await supabase
          .from('questions')
          .select('*')
          .in('slot_id', allSlotIds);
        allQuestions = [...allQuestions, ...(slotQ || [])];
      }

      return { slots, documents: grouped, questions: allQuestions };
    },
    enabled: !!projectId,
  });

  return query;
}

export function useDeleteDocument() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (documentId: string) => {
      const { error } = await supabase
        .from('documents')
        .delete()
        .eq('id', documentId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['slots'] });
    },
  });
}

export function useRetryExtraction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (documentId: string) => {
      await supabase
        .from('documents')
        .update({ extraction_status: 'pending', extraction_error: null })
        .eq('id', documentId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['slots'] });
    },
  });
}

export function useUploadDocument() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      projectId,
      slotId,
      slotType,
      file,
      title,
      fileUrl,
      mimeType,
    }: {
      projectId: string;
      slotId: string;
      slotType: string;
      file: File;
      title: string;
      fileUrl: string;
      mimeType: string;
    }) => {
      const { data: newDoc } = await supabase
        .from('documents')
        .insert({
          project_id: projectId,
          slot_id: slotId,
          title,
          original_file_url: fileUrl,
          version_number: 1,
          is_latest: true,
          mime_type: mimeType,
          extraction_status: 'pending',
          document_category: slotType,
        } as TablesInsert<'documents'>)
        .select()
        .single();
      return newDoc;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['slots'] });
    },
  });
}
