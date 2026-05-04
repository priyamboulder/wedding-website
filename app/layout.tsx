import type { Metadata } from "next";
import "./globals.css";
import { Instrument_Serif, Syne, Space_Grotesk, Caveat } from "next/font/google";
import { FirstRunGate } from "@/components/events/FirstRunGate";

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: ["400"],
  style: ["normal", "italic"],
  variable: "--font-instrument-serif",
  display: "swap",
});
const syne = Syne({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-syne",
  display: "swap",
});
const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-space-grotesk",
  display: "swap",
});
const caveat = Caveat({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-caveat",
  display: "swap",
});
import MessagesLauncher from "@/components/messaging/MessagesLauncher";
import { HuddleHost } from "@/components/community/brides/huddles/HuddleHost";
import { RealtimeProvider } from "@/components/RealtimeProvider";
import { SessionSync } from "@/components/SessionSync";
import { SignInModal } from "@/components/marketing/SignInModal";

export const metadata: Metadata = {
  title: "Ananya — Wedding Planning",
  description: "Luxury Indian wedding planning platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const marigoldFonts = [
    instrumentSerif.variable,
    syne.variable,
    spaceGrotesk.variable,
    caveat.variable,
  ].join(" ");

  return (
    <html lang="en" data-scroll-behavior="smooth" className={marigoldFonts}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        {/* All fonts in one request — display=swap prevents render blocking */}
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,400;0,500;0,600;0,700;1,400&family=Inter:wght@400;500;600&family=Outfit:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,400;0,500;0,700;1,400&family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500;1,600&family=Noto+Serif+Devanagari:wght@400;500;600&family=JetBrains+Mono:wght@400;500&family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,500;1,9..144,400&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="text-foreground antialiased">
        <SessionSync />
        <SignInModal />
        <FirstRunGate>{children}</FirstRunGate>
        <MessagesLauncher />
        <HuddleHost />
        <RealtimeProvider />
      </body>
    </html>
  );
}
