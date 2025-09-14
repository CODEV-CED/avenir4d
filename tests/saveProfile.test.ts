// tests/saveProfile.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { saveProfile } from '@/lib/supabase/sweetspot-service';

const okResponse = { ok: true, id: 'abc123' };
const makeFetch = (status: number, json: any) => ({
  ok: status >= 200 && status < 300,
  status,
  json: async () => json,
});

describe('saveProfile', () => {
  const base = {
    profile4d: { plaisir: 0.5, competence: 0.5, utilite: 0.5, viabilite: 0.5, confidence_avg: 4 },
    keywords: {},
    qual: {
      dimancheMatin: 'x'.repeat(12),
      algoPersonnel: 'y'.repeat(12),
      talentReconnu: 'z'.repeat(12),
      indignationMax: 'w'.repeat(12),
    },
    rawChoices: [{ questionId: 'q1', optionId: 'a1', confidence: 4 }],
  };

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('returns success on 201 + ok:true', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(makeFetch(201, okResponse)));
    const res = await saveProfile(base as any);
    expect(res).toEqual({ success: true, profileId: 'abc123' });
  });

  it('propagates API error message', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(makeFetch(400, { ok: false, error: 'bad data' })),
    );
    const res = await saveProfile(base as any);
    expect(res.success).toBe(false);
    expect(res.error).toBe('bad data');
  });

  it('handles timeout AbortError', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockImplementation(() => {
        const err = new DOMException('Aborted', 'AbortError');
        return Promise.reject(err);
      }),
    );
    const res = await saveProfile(base as any);
    expect(res.success).toBe(false);
  });
});
