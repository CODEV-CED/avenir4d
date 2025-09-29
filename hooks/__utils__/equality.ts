export function shallowEqual<T extends object>(a: T, b: T): boolean {
  if (a === b) return true;

  const ak = Object.keys(a) as (keyof T)[];
  const bk = Object.keys(b) as (keyof T)[];

  if (ak.length !== bk.length) return false;

  for (const k of ak) {
    if (a[k] !== b[k]) return false;
  }

  return true;
}

export function arrayEqual<T>(a: T[], b: T[]): boolean {
  if (a === b) return true;
  if (a.length !== b.length) return false;

  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false;
  }

  return true;
}
