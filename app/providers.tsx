'use client';
import { TooltipProvider } from '@/components/UI/tooltip';
import ToasterProvider from '@/components/providers/ToasterProvider';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <TooltipProvider delayDuration={150}>
      {children}
      <ToasterProvider />
    </TooltipProvider>
  );
}
