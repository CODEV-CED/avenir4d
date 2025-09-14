// lib/supabase/sweetspot-service.ts
// Avoid eager supabase import at module load to prevent test env failures
const getClient = async () => (await import('@/lib/supabase/client')).supabase;
import { assertHasChoices, toSubmitChoices } from '@/lib/utils/assertHasChoices';
import type { Profile4D, SJTChoice } from '@/lib/sweetspot/types';

// QualInputs côté client (aligne avec zSJTSubmit.qual)
export type QualInputs = {
  dimancheMatin: string;
  algoPersonnel: string;
  talentReconnu: string;
  indignationMax: string;
};

interface SaveProfileParams {
  profile4d: Profile4D;
  keywords: Partial<Record<string, string[]>>;
  qual: QualInputs;
  rawChoices: SJTChoice[];
  metadata?: {
    userAgent?: string; // utilisé côté API
    completionTimeMs?: number; // utilisé côté API
    idempotencyKey?: string;
  };
}

interface SaveProfileResult {
  success: boolean;
  profileId?: string;
  error?: string;
  isConflict?: boolean;
}

// Typage de la réponse API pour éviter les any silencieux
type SubmitResponse = {
  ok: boolean;
  id?: string;
  error?: string;
  profile?: { version?: number; createdAt?: string };
};

/**
 * Sauvegarde du profil via l'API server (service role) → bypass RLS
 * Ne tente PAS d'insérer directement depuis le client.
 */
export async function saveProfile(params: SaveProfileParams): Promise<SaveProfileResult> {
  try {
    // ✅ sécurise + affine le type (plus de undefined possible ensuite)
    assertHasChoices(params, 1);

    const choices = toSubmitChoices(params.rawChoices);

    const payload = {
      choices,
      qual: params.qual,
      profile4d: {
        ...params.profile4d,
        version: params.profile4d.version ?? 1,
        source: params.profile4d.source ?? 'sjt_v2',
      },
      keywords: params.keywords,
      surveyVersion: 'sjt_v2',
      idempotencyKey: params.metadata?.idempotencyKey,
    };

    // Robustesse réseau avec timeout et keepalive
    const ctrl = new AbortController();
    const timeout = setTimeout(() => ctrl.abort(), 12_000); // 12s timeout

    const res = await fetch('/api/sjt/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      cache: 'no-store',
      keepalive: true, // Survit à la fermeture onglet
      signal: ctrl.signal,
    }).finally(() => clearTimeout(timeout));

    // Typage strict de la réponse JSON
    const json = (await res.json().catch(() => ({}))) as Partial<SubmitResponse>;

    if (!res.ok || !json?.ok) {
      // Messages d'erreur plus parlants
      const msg =
        json?.error ??
        (res.status === 413
          ? 'Payload trop volumineux'
          : res.status === 429
            ? 'Trop de requêtes - patientez'
            : `HTTP ${res.status}`);
      return {
        success: false,
        error: msg,
        isConflict: res.status === 409,
      };
    }

    return { success: true, profileId: json.id };
  } catch (e: any) {
    // Gestion spécifique timeout
    if (e.name === 'AbortError') {
      return { success: false, error: 'Timeout - Veuillez réessayer' };
    }

    console.error('saveProfile client error:', e);
    return { success: false, error: e?.message ?? 'Erreur réseau' };
  }
}

/**
 * Lectures: OK côté client (SELECT public)
 */
export async function getRecentStats() {
  const supabase = await getClient();
  const { data, error } = await supabase
    .from('sweetspot_stats')
    .select('*')
    .order('date', { ascending: false })
    .limit(7);
  if (error) {
    console.error('Erreur stats:', error);
    return null;
  }
  return data;
}

export async function getRecentProfiles(limit = 10) {
  const supabase = await getClient();
  const { data, error } = await supabase
    .from('sweetspot_profiles')
    .select('id, created_at, survey_version, profile4d')
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) {
    console.error('Erreur profils:', error);
    return null;
  }
  return data;
}

/**
 * Logging client → passe aussi par l'API (ou noop)
 * Ici: noop + console pour éviter RLS/admin-only.
 */
export async function logError(
  errorType: string,
  errorMessage: string,
  errorData?: any,
  profileId?: string,
) {
  // Option 1 (simple): noop + console
  console.warn('[client-logError]', { errorType, errorMessage, errorData, profileId });

  // Option 2 (si tu crées /api/log):
  // await fetch('/api/log', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ errorType, errorMessage, errorData, profileId }) });
}

export async function cleanupOldErrors(): Promise<number> {
  // Client: pas de RPC admin (bypass RLS). Retourne 0.
  return 0;
}

export async function testConnection(): Promise<boolean> {
  const supabase = await getClient();
  const { error } = await supabase
    .from('sweetspot_profiles')
    .select('id', { head: true, count: 'exact' })
    .limit(1);
  return !error;
}
