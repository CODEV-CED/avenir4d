import { redirect } from 'next/navigation';

export default async function Page({ searchParams }: { searchParams?: Promise<{ demo?: string }> }) {
  const params = (await searchParams) ?? {};
  const qs = params.demo === '1' ? '?demo=1' : '';
  redirect(`/sweet-spot/lab-teen${qs}`);
}
