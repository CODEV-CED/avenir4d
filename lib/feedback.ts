// lib/feedback.ts
const FB_KEY = 'a4d:feedback:v1';
const isBrowser = () => typeof window !== 'undefined';

export type FeedbackMap = Record<string, 1 | -1>;

export function loadFeedback(): FeedbackMap {
  if (!isBrowser()) return {};
  try {
    return JSON.parse(localStorage.getItem(FB_KEY) || '{}');
  } catch {
    return {};
  }
}

export function saveFeedback(map: FeedbackMap) {
  if (!isBrowser()) return;
  try {
    localStorage.setItem(FB_KEY, JSON.stringify(map));
  } catch {}
}

export function applyFeedbackBoost(score: number, formationId: string, map: FeedbackMap): number {
  const fb = map[formationId];
  if (!fb) return score;

  const factor = fb === 1 ? 1.05 : 0.95; // +/-5%
  const s = score * factor;
  return Math.max(0, Math.min(1, s));
}

export function setFeedback(formationId: string, value: 1 | -1 | 0) {
  const map = loadFeedback();
  if (value === 0) delete map[formationId];
  else map[formationId] = value;
  saveFeedback(map);

  if (isBrowser()) {
    window.dispatchEvent(new CustomEvent('feedback-changed'));
  }
}
