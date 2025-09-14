import { useMemo } from 'react';
import type { FormationStatic, FormationType } from '@/types/formation';

export const TYPE_LABEL: Record<FormationType, string> = {
  BUT: 'BUT',
  BTS: 'BTS',
  CPGE: 'CPGE',
  LICENCE: 'Licence',
  ECOLE_COM: 'École de commerce',
  ECOLE_ING: 'École d’ingénieurs',
  SANTE: 'Santé',
  ARTS: 'Arts',
};

export function useFormationsIndex(list: FormationStatic[] = []) {
  return useMemo(() => {
    const byId = new Map<string, FormationStatic>();
    for (const f of list) byId.set(f.id, f);
    return byId;
  }, [list]);
}
