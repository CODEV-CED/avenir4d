import Header from '@/components/shell/Header';
import Footer from '@/components/shell/Footer';

export default function AppShellLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[var(--ny-bg)] text-[var(--ny-foreground)] antialiased">
      <Header id="app-shell-header" />
      <main className="min-h-[calc(100vh-140px)]">{children}</main>
      <Footer />
    </div>
  );
}
