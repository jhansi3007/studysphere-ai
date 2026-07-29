import { supabase } from '@/lib/supabase';

export async function logActivity(type: string, title: string, metadata: Record<string, unknown> = {}) {
  try {
    await supabase.from('activities').insert({ type, title, metadata });
  } catch (e) {
    console.error('Failed to log activity:', e);
  }
}
