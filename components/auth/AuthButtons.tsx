'use client';

import { supabaseBrowser } from '@/lib/supabase/client';

export function AuthButtons() {
  const supabase = supabaseBrowser();

  const signInWithGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: '/dashboard' },
    });
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    window.location.reload();
  };

  return (
    <div className="flex gap-2">
      <button onClick={signInWithGoogle} className="btn">
        Se connecter avec Google
      </button>
      <button onClick={signOut} className="btn-secondary">
        Se déconnecter
      </button>
    </div>
  );
}
