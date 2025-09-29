import { redirect } from 'next/navigation';
import { getSupabaseServerClient } from '@/lib/supabase/server';

export default async function DashboardPage() {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  return <div>Bonjour {user.email}</div>;
}
