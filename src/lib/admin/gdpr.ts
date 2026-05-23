import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';

export interface WorkerExportData {
  exported_at: string;
  project_id: string;
  worker: Tables<'project_users'> | null;
  signatures: Tables<'signatures'>[];
  document_reads: Tables<'document_reads'>[];
  question_answers: Tables<'question_answers'>[];
}

export async function exportWorkerData(
  userId: string,
  projectId: string
): Promise<WorkerExportData> {
  const [user, signatures, reads, answers] = await Promise.all([
    supabase.from('project_users').select('*').eq('id', userId).single(),
    supabase.from('signatures').select('*').eq('user_id', userId).eq('project_id', projectId),
    supabase.from('document_reads').select('*').eq('user_id', userId),
    supabase.from('question_answers').select('*').eq('user_id', userId),
  ]);

  return {
    exported_at: new Date().toISOString(),
    project_id: projectId,
    worker: user.data,
    signatures: signatures.data ?? [],
    document_reads: reads.data ?? [],
    question_answers: answers.data ?? [],
  };
}

export async function deleteWorkerData(
  userId: string,
  projectId: string
): Promise<void> {
  await supabase.from('question_answers').delete().eq('user_id', userId);
  await supabase.from('document_reads').delete().eq('user_id', userId);
  await supabase.from('signatures').delete().eq('user_id', userId).eq('project_id', projectId);
  await supabase.from('project_users').delete().eq('id', userId);
}

export async function findWorkersByPhone(
  phone: string,
  projectId: string
): Promise<string[]> {
  const { data: signatures } = await supabase
    .from('signatures')
    .select('user_id, project_users!inner(phone)')
    .eq('project_id', projectId)
    .eq('project_users.phone', phone.trim());
  const ids = (signatures ?? [])
    .map((s) => s.user_id)
    .filter((id): id is string => !!id);
  return Array.from(new Set(ids));
}