// app/sjt/SJTQuizPage.tsx
'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import type { Question } from '@/lib/sjt/types';
import SJTQuiz from '@/components/sjt/SJTQuiz';
import SJTQuizAdvanced from '@/components/sjt/SJTQuizAdvanced';

export default function SJTQuizPage({ questions }: { questions?: Question[] }) {
  return (
    <Suspense fallback={<SJTQuiz /> /* safe default while query loads */}>
      <SJTQuizPageInner questions={questions} />
    </Suspense>
  );
}

function SJTQuizPageInner({ questions }: { questions?: Question[] }) {
  const sp = useSearchParams();
  const mode = sp?.get('mode');
  if (mode === 'advanced') {
    return <SJTQuizAdvanced questions={questions ?? []} />;
  }
  return <SJTQuiz />;
}
