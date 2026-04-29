import { Ticker } from '@/components/marigold/layout/Ticker';
import { MarigoldNavbar } from '@/components/marigold/layout/Navbar';
import { MarigoldFooter } from '@/components/marigold/layout/Footer';
import { ScrollToTop } from '@/components/marigold/ui/ScrollToTop';
import { SignInModal } from '@/components/marketing/SignInModal';

export default function MarigoldPublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Ticker />
      <MarigoldNavbar />
      <main className="pt-[100px]">{children}</main>
      <MarigoldFooter />
      <ScrollToTop />
      <SignInModal />
    </>
  );
}