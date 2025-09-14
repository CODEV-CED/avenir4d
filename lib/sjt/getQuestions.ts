import 'server-only';
import { Question } from './types';
import { getSupabaseServerClient } from '@/lib/supabase/server';

export async function getQuestions(): Promise<Question[]> {
  try {
    const supabase = await getSupabaseServerClient();
    // ⚠️ adapte le nom de ta table/colonnes si différent
    const { data, error } = await supabase
      .from('sjt_questions')
      .select('id, label, type, options')
      .order('id', { ascending: true });

    if (!error && Array.isArray(data) && data.length > 0) {
      return data as Question[];
    }
  } catch (_) {
    // ignore → fallback mock
  }

  // Fallback mock pour dev si la table n’existe pas encore
  const mock: Question[] = [
    { id: 'q1', label: 'Je préfère résoudre des problèmes concrets.', type: 'likert' },
    { id: 'q2', label: 'J’aime guider une équipe vers un objectif.', type: 'likert' },
  ];
  return mock;
}
