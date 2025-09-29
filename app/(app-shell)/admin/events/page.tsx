// app/page.tsx
import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="grid min-h-[70vh] place-items-center bg-neutral-900 text-neutral-100">
      <div className="space-y-6 text-center">
        <h1 className="text-4xl font-bold">
          Bienvenue sur <span className="ny-gradient-text">NextYou</span>
        </h1>
        <p className="mx-auto max-w-xl text-neutral-300">
          Calibre ton profil avec le SJT et construis ta liste de vœux en quelques minutes.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link
            href="/sjt"
            className="rounded-xl bg-indigo-600 px-6 py-3 font-semibold hover:bg-indigo-500"
          >
            ✍️ Passer le questionnaire
          </Link>
          <Link
            href="/voeux"
            className="rounded-xl border border-neutral-700 px-6 py-3 font-semibold hover:bg-neutral-800"
          >
            🎯 Voir mes vœux
          </Link>
        </div>
      </div>
    </div>
  );
}
