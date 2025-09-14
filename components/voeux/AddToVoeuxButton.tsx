// components/voeux/AddToVoeuxButton.tsx
'use client';
import { useVoeux } from '@/lib/voeux';

export default function AddToVoeuxButton({ id }: { id: string }) {
  const { isSelected, toggle, isFull } = useVoeux();
  const selected = isSelected(id);
  const full = isFull;

  return (
    <button
      type="button"
      onClick={() => toggle(id)}
      disabled={!selected && full}
      className={[
        'mt-3 rounded-lg border px-3 py-1.5 text-sm transition-colors',
        selected
          ? 'border-red-300 bg-red-50 text-red-700 hover:bg-red-100'
          : full
            ? 'cursor-not-allowed border-gray-200 bg-gray-100 text-gray-400'
            : 'border-indigo-300 bg-indigo-50 text-indigo-700 hover:bg-indigo-100',
      ].join(' ')}
      aria-label={selected ? 'Retirer des vœux' : 'Ajouter aux vœux'}
    >
      {selected ? 'Retirer des vœux' : full ? 'Limite atteinte' : 'Ajouter aux vœux'}
    </button>
  );
}
