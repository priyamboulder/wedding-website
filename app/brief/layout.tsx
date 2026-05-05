// /brief lives outside the marigold layout group so the quiz gets its own
// minimal full-bleed canvas — no navbar, no footer, no ticker. The brand
// is reduced to a small "the brief" mark in the corner per spec.

export default function BriefLayout({ children }: { children: React.ReactNode }) {
  return <div className="brief-root">{children}</div>;
}
