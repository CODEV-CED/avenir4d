'use client';

import { useEffect, useMemo } from 'react';
import { supabaseBrowser } from '@/lib/supabase/client';

export default function SupabaseSessionSync() {
  const supabase = useMemo(() => supabaseBrowser(), []);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange(async (event, session) => {
      try {
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          await fetch('/auth/callback', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ event, session }),
          });
        } else if (event === 'SIGNED_OUT') {
          await fetch('/auth/callback', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ event }),
          });
        }
      } catch {
        // noop
      }
    });
    return () => {
      sub.subscription.unsubscribe();
    };
  }, [supabase]);

  return null;
}
