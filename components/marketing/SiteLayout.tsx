"use client";

// ── Marketing site layout ──────────────────────────────────────
// Wraps every public-site route with the persistent Nav + Footer
// and a gentle fade/lift page transition keyed to the pathname.
// The landing page opts out of the default top padding (it renders
// its own full-bleed hero underneath the nav) by passing
// `flushTop`.

import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import type { ReactNode } from "react";
import { Nav } from "./Nav";
import { Footer } from "./Footer";
import { SignInModal } from "./SignInModal";
import { OnboardingModal } from "./OnboardingModal";

const BODY = "'DM Sans', system-ui, sans-serif";

export function SiteLayout({
  children,
  flushTop = false,
}: {
  children: ReactNode;
  flushTop?: boolean;
}) {
  const pathname = usePathname();
  return (
    <div
      className="relative min-h-screen bg-[#F7F5F0] text-[#1C1917]"
      style={{ fontFamily: BODY }}
    >
      <Nav />
      <AnimatePresence mode="wait">
        <motion.main
          key={pathname}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className={flushTop ? "" : "pt-24 md:pt-32"}
        >
          {children}
        </motion.main>
      </AnimatePresence>
      <Footer />
      <SignInModal />
      <OnboardingModal />
    </div>
  );
}
