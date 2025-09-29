'use client';

import { useEffect, useMemo, useState } from 'react';
import { supabaseBrowser } from '@/lib/supabase/client';

export default function DebugAuthPage() {
  const supabase = useMemo(() => supabaseBrowser(), []);
  const [email, setEmail] = useState('dev@test.com');
  const [password, setPassword] = useState('devdevdev');
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user ?? null));
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => {
      sub.subscription.unsubscribe();
    };
  }, [supabase]);

  const signIn = async () => {
    setLoading(true);
    setMsg(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setMsg(error.message);
    setLoading(false);
  };

  const signOut = async () => {
    setLoading(true);
    setMsg(null);
    const { error } = await supabase.auth.signOut();
    if (error) setMsg(error.message);
    setLoading(false);
  };

  return (
    <div style={{ maxWidth: 520, margin: '40px auto', fontFamily: 'system-ui' }}>
      <h1 style={{ fontSize: 22, fontWeight: 700 }}>Debug Auth</h1>
      <p style={{ color: '#555' }}>Sign in as a dev user to test session.</p>
      <div style={{ display: 'grid', gap: 8, marginTop: 16 }}>
        <label>
          Email
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ width: '100%', padding: 8, border: '1px solid #ddd', borderRadius: 6 }}
          />
        </label>
        <label>
          Password
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ width: '100%', padding: 8, border: '1px solid #ddd', borderRadius: 6 }}
          />
        </label>
        <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
          <button onClick={signIn} disabled={loading} style={{ padding: '8px 12px' }}>
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
          <button onClick={signOut} disabled={loading} style={{ padding: '8px 12px' }}>
            Sign out
          </button>
        </div>
        {msg && <div style={{ color: 'crimson' }}>{msg}</div>}
      </div>

      <pre style={{ marginTop: 24, background: '#f7f7f7', padding: 12, borderRadius: 6 }}>
        {JSON.stringify(user, null, 2)}
      </pre>

      <p style={{ marginTop: 12 }}>
        Also see <code>/api/debug/session</code> for the server session.
      </p>
    </div>
  );
}
