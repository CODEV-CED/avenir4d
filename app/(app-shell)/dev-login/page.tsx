'use client';

import { useState, useMemo } from 'react';
import { H1 } from '@/components/UI/Typography';
import { createClient } from '@supabase/supabase-js';

const getBrowserSupabase = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  if (!url || !anon) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY manquants');
  }
  return createClient(url, anon, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      flowType: 'pkce',
    },
  });
};

export default function DevLoginPage() {
  const supa = useMemo(getBrowserSupabase, []);
  const [email, setEmail] = useState('dev@test.com');
  const [password, setPassword] = useState('devdevdev');
  const [msg, setMsg] = useState<string | null>(null);

  const safeJson = async (r: Response) => {
    const ct = r.headers.get('content-type') || '';
    if (ct.includes('application/json')) {
      try {
        return await r.json();
      } catch {
        return null;
      }
    } else {
      await r.text().catch(() => null);
      return null;
    }
  };

  const onLogin = async () => {
    try {
      setMsg('Connexion…');
      const { error } = await supa.auth.signInWithPassword({ email, password });
      if (error) {
        setMsg('Erreur: ' + error.message);
        return;
      }

      const { data } = await supa.auth.getSession();
      const s = data.session;
      if (!s) {
        setMsg('Pas de session côté client');
        return;
      }

      // Notifie ton endpoint qui pose les cookies côté server (tu l’as déjà)
      const r = await fetch('/auth/callback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event: 'SIGNED_IN', session: s }),
        cache: 'no-store',
      });
      const j = await safeJson(r);

      // Ping debug (optionnel)
      await fetch('/api/debug/session', { cache: 'no-store' }).catch(() => {});

      setMsg(`Connecté ✅ (cookies posés: ${String(j?.hasSession ?? 'inconnu')})`);
    } catch (e: any) {
      setMsg('Erreur inattendue: ' + (e?.message ?? String(e)));
    }
  };

  const onLogout = async () => {
    try {
      await supa.auth.signOut();
      await fetch('/auth/callback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event: 'SIGNED_OUT' }),
        cache: 'no-store',
      }).catch(() => {});
      setMsg('Déconnecté');
    } catch (e: any) {
      setMsg('Erreur déconnexion: ' + (e?.message ?? String(e)));
    }
  };

  return (
    <div className="mx-auto max-w-sm p-6">
      <H1 className="mb-3 text-xl font-bold">Dev Login</H1>
      <input
        className="mb-2 w-full rounded border border-white/20 bg-transparent p-2"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="email"
      />
      <input
        className="mb-4 w-full rounded border border-white/20 bg-transparent p-2"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="password"
      />
      <div className="flex gap-2">
        <button onClick={onLogin} className="rounded border px-3 py-1">
          Se connecter
        </button>
        <button onClick={onLogout} className="rounded border px-3 py-1">
          Se déconnecter
        </button>
      </div>
      {msg && <p className="mt-3 text-sm opacity-80">{msg}</p>}
    </div>
  );
}
