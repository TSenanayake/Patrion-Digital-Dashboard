import { supabase } from '@/integrations/supabase/client';
import type { Session } from '@supabase/supabase-js';

export async function sendPhoneOTP(phone: string): Promise<{ success: boolean; error?: string }> {
  const { error } = await supabase.auth.signInWithOtp({
    phone,
    options: {
      channel: 'sms',
    },
  });
  return { success: !error, error: error?.message };
}

export async function verifyPhoneOTP(phone: string, token: string): Promise<{ success: boolean; session?: Session; error?: string }> {
  const { data, error } = await supabase.auth.verifyOtp({
    phone,
    token,
    type: 'sms',
  });
  if (error) return { success: false, error: error.message };
  return { success: true, session: data.session };
}
