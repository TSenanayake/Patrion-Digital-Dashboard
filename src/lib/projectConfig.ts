import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';

interface ProjectSettings {
  supportPhone: string;
  supportedLanguages: ('sv' | 'en' | 'pl' | 'es')[];
  retentionYears: number;
}

const DEFAULT_SETTINGS: ProjectSettings = {
  supportPhone: '+46 10 123 4567',
  supportedLanguages: ['sv', 'en', 'pl', 'es'],
  retentionYears: 2,
};

export function useProjectSettings(projectId: string | undefined) {
  return useQuery({
    queryKey: ['projectSettings', projectId],
    queryFn: async (): Promise<ProjectSettings> => {
      if (!projectId) return DEFAULT_SETTINGS;
      
      const { data, error } = await supabase
        .from('projects')
        .select('settings')
        .eq('id', projectId)
        .single();
      
      if (error || !data?.settings) {
        return DEFAULT_SETTINGS;
      }
      
      return {
        supportPhone: data.settings.support_phone || DEFAULT_SETTINGS.supportPhone,
        supportedLanguages: data.settings.supported_languages || DEFAULT_SETTINGS.supportedLanguages,
        retentionYears: data.settings.retention_years || DEFAULT_SETTINGS.retentionYears,
      };
    },
    enabled: !!projectId,
    staleTime: 5 * 60 * 1000,
  });
}

export const DEFAULT_SUPPORT_PHONE = DEFAULT_SETTINGS.supportPhone;
