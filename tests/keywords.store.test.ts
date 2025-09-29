import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useSweetSpotStore } from '@/store/useSweetSpotStore';

// Reset store and stub network before each test
beforeEach(() => {
  // Stub detect API to avoid network and keep isLoading cleanly finishing
  (globalThis as any).fetch = vi.fn().mockResolvedValue({
    json: vi.fn().mockResolvedValue({ convergences: [], score: 0, meta: null }),
    ok: true,
    status: 200,
  });

  useSweetSpotStore.setState({
    userKeywords: { passions: [], talents: [], utilite: [], viabilite: [] },
    keywordsDirty: false,
    savingKeywords: false,
  } as any);
});

describe('useSweetSpotStore keywords actions', () => {
  it('addKeyword adds and sets dirty, removeKeyword removes and stays dirty', () => {
    const { addKeyword, removeKeyword } = useSweetSpotStore.getState();

    addKeyword('passions', 'Design ');
    let { userKeywords, keywordsDirty } = useSweetSpotStore.getState();
    expect(userKeywords.passions).toContain('Design');
    expect(keywordsDirty).toBe(true);

    removeKeyword('passions', 'design'); // case-insensitive remove
    ({ userKeywords, keywordsDirty } = useSweetSpotStore.getState());
    expect(userKeywords.passions).not.toContain('Design');
    expect(keywordsDirty).toBe(true);
  });

  it('saveKeywords success clears dirty and saving flags', async () => {
    useSweetSpotStore.setState({
      userKeywords: { passions: ['ux'], talents: [], utilite: [], viabilite: [] },
      keywordsDirty: true,
    } as any);

    // mock endpoint response
    (globalThis as any).fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: vi.fn().mockResolvedValue({ ok: true, id: '00000000-0000-0000-0000-000000000000' }),
    });

    const { saveKeywords } = useSweetSpotStore.getState();
    await saveKeywords('00000000-0000-0000-0000-000000000000');

    const { keywordsDirty, savingKeywords } = useSweetSpotStore.getState();
    expect(keywordsDirty).toBe(false);
    expect(savingKeywords).toBe(false);

    // assert request payload
    expect((globalThis as any).fetch).toHaveBeenCalledWith(
      '/api/sweet-spot/keywords',
      expect.objectContaining({ method: 'POST' }),
    );
  });

  it('saveKeywords 401 keeps dirty and resets saving', async () => {
    useSweetSpotStore.setState({ keywordsDirty: true } as any);
    (globalThis as any).fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
      json: vi.fn().mockResolvedValue({ ok: false, error: 'not authorized' }),
    });

    const { saveKeywords } = useSweetSpotStore.getState();
    await saveKeywords('00000000-0000-0000-0000-000000000000');

    const { keywordsDirty, savingKeywords } = useSweetSpotStore.getState();
    expect(keywordsDirty).toBe(true);
    expect(savingKeywords).toBe(false);
  });
});
