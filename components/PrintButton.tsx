'use client';

export default function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="rounded border border-gray-200 bg-white px-3 py-1.5 text-sm hover:bg-gray-50 print:hidden"
      title="Imprimer ou enregistrer en PDF"
    >
      Imprimer / PDF
    </button>
  );
}
