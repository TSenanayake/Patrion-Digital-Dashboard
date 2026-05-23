import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

export function useInfoBlocks(projectId: string | undefined) {
  return useQuery({
    queryKey: ['info_blocks', projectId],
    queryFn: async () => {
      if (!projectId) return [];
      const { data } = await supabase
        .from('info_blocks')
        .select('*')
        .eq('project_id', projectId)
        .order('sort_order');
      return (data as Tables<'info_blocks'>[]) || [];
    },
    enabled: !!projectId,
  });
}

export function useCreateInfoBlock() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      projectId,
      content,
      sortOrder,
    }: {
      projectId: string;
      content: string;
      sortOrder: number;
    }) => {
      const { error } = await supabase
        .from('info_blocks')
        .insert({
          project_id: projectId,
          content,
          sort_order: sortOrder,
        });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['info_blocks'] });
    },
  });
}

export function useUpdateInfoBlock() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      content,
    }: {
      id: string;
      content: string;
    }) => {
      const { error } = await supabase
        .from('info_blocks')
        .update({ content })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['info_blocks'] });
    },
  });
}

export function useDeleteInfoBlock() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('info_blocks')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['info_blocks'] });
    },
  });
}
