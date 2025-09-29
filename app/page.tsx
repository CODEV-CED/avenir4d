import Navbar from '@/components/marketing/Navbar';
import Hero from '@/components/marketing/Hero';
import FeatureGrid from '@/components/marketing/FeatureGrid';
import ProcessTimeline from '@/components/landing/ProcessTimeline';
import ProductPreview from '@/components/landing/ProductPreview';
import Testimonials from '@/components/landing/Testimonials';
import Pricing from '@/components/landing/Pricing';
import FAQ from '@/components/landing/FAQ';
import FinalCTA from '@/components/landing/FinalCTA';

export const metadata = {
  title: 'NextYou - Ton futur, version toi',
  description: "Ikigaï + IA pour trouver ton Sweet Spot et passer à l'action.",
};

export default function HomePage() {
  return (
    <div className="marketing-scope min-h-dvh bg-[#05070f] text-white">
      <Navbar />
      <main>
        <Hero />

        <FeatureGrid />

        <ProcessTimeline />

        <ProductPreview />

        <Testimonials />

        <Pricing />

        <FAQ />

        <FinalCTA />
      </main>

      <footer className="border-t border-white/10">
        <div className="mx-auto max-w-6xl px-6 py-8 text-sm text-white/60">
          &copy; {new Date().getFullYear()} NextYou&gt; - Tous droits réservés.
        </div>
      </footer>
    </div>
  );
}
