'use client';
import { Toaster } from 'sonner';

export default function ToasterProvider() {
  return (
    <Toaster
      position="top-right"
      richColors
      closeButton
      expand // regroupe les toasts identiques
      theme="system"
      duration={4000}
    />
  );
}
