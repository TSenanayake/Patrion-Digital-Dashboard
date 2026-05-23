import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';

interface SignatureWithUser extends Tables<'signatures'> {
  project_users: { name: string; company: string | null; phone?: string | null } | null;
}

export function useSignatures(projectId: string | undefined) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['signatures', projectId],
    queryFn: async () => {
      if (!projectId) return [];
      const { data } = await supabase
        .from('signatures')
        .select('*, project_users(name, company, phone)')
        .eq('project_id', projectId)
        .order('signed_at', { ascending: false });
      return (data as SignatureWithUser[]) || [];
    },
    enabled: !!projectId,
  });

  return query;
}

export function useDeleteSignature() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (signatureId: string) => {
      const { error } = await supabase
        .from('signatures')
        .delete()
        .eq('id', signatureId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['signatures'] });
    },
  });
}
