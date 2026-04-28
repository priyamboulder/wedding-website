import type { Metadata } from "next";
import "./globals.css";
import { FirstRunGate } from "@/components/events/FirstRunGate";
import MessagesLauncher from "@/components/messaging/MessagesLauncher";
import { HuddleHost } from "@/components/community/brides/huddles/HuddleHost";
import { RealtimeProvider } from "@/components/RealtimeProvider";
import { SessionSync } from "@/components/SessionSync";

export const metadata: Metadata = {
  title: "Ananya — Wedding Planning",
  description: "Luxury Indian wedding planning platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        {/* All fonts in one request — display=swap prevents render blocking */}
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,400;0,500;0,600;0,700;1,400&family=Inter:wght@400;500;600&family=Playfair+Display:ital,wght@0,400;0,500;0,700;1,400&family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&family=Noto+Serif+Devanagari:wght@400;500;600&family=JetBrains+Mono:wght@400;500&family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,500;1,9..144,400&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-background text-foreground antialiased">
        <SessionSync />
        <FirstRunGate>{children}</FirstRunGate>
        <MessagesLauncher />
        <HuddleHost />
        <RealtimeProvider />
      </body>
    </html>
  );
}
