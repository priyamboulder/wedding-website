import { Ticker } from '@/components/layout/Ticker';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { ScrollToTop } from '@/components/ui/ScrollToTop';

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Ticker />
      <Navbar />
      <main className="pt-[100px] min-h-screen">{children}</main>
      <Footer />
      <ScrollToTop />
    </>
  );
}
