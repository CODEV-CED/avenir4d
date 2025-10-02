import { redirect } from 'next/navigation';

type SearchParamsRecord = Record<string, string | string[] | undefined> & {
  demo?: string | string[];
  profile?: string | string[];
};

type SearchParamsInput = Promise<SearchParamsRecord> | SearchParamsRecord;

function pickParam(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) {
    return value.length > 0 ? value[0] : undefined;
  }
  return value;
}

export default async function Page({ searchParams }: { searchParams?: Promise<SearchParamsRecord> }) {
  const resolved = searchParams ? await searchParams : undefined;
  const qs = new URLSearchParams();

  const demo = pickParam(resolved?.demo);
  const profile = pickParam(resolved?.profile);

  if (demo === '1') {
    qs.set('demo', '1');
  }
  if (profile) {
    qs.set('profile', profile);
  }

  const suffix = qs.toString();
  redirect(`/sweet-spot/lab-teen${suffix ? `?${suffix}` : ''}`);
}

