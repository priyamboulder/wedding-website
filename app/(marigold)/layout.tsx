import { Ticker } from '@/components/marigold-layout/Ticker';
import { Navbar } from '@/components/marigold-layout/Navbar';
import { Footer } from '@/components/marigold-layout/Footer';
import { ScrollToTop } from '@/components/marigold-ui/ScrollToTop';

export default function MarigoldLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="marigold-root">
      <Ticker />
      <Navbar />
      <main className="pt-[100px] min-h-screen">{children}</main>
      <Footer />
      <ScrollToTop />
    </div>
  );
}
