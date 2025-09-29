// app/providers.tsx
'use client';

import { useState, type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { TooltipProvider } from '@/components/UI/tooltip';
import ToasterProvider from '@/components/providers/ToasterProvider';
import SupabaseSessionSync from '@/components/providers/SupabaseSessionSync';

export default function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            retry: 1,
            refetchOnWindowFocus: false,
            // optionnel: ajuster ces valeurs si tu veux
            // staleTime: 5 * 60 * 1000,
            // gcTime: 30 * 60 * 1000,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        {/* Synchronisation de session Supabase (si utilisée dans ton app) */}
        <SupabaseSessionSync />
        {/* Toaster global */}
        <ToasterProvider />
        {children}
      </TooltipProvider>

      {process.env.NODE_ENV === 'development' && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  );
}
