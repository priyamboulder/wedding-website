export const metadata = {
  title: 'Welcome — The Marigold',
  robots: { index: false, follow: false },
};

export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  return <main className="min-h-screen w-full">{children}</main>;
}
