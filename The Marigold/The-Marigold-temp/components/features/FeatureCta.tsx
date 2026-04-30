import { ChunkyButton } from '@/components/ui/ChunkyButton';

type FeatureCtaProps = {
  scrawl?: string;
  heading: string;
  buttonLabel: string;
  buttonHref?: string;
  secondary?: { label: string; href: string };
};

export function FeatureCta({
  scrawl,
  heading,
  buttonLabel,
  buttonHref = '/pricing',
  secondary,
}: FeatureCtaProps) {
  return (
    <section
      className="relative overflow-hidden text-center"
      style={{
        background: 'var(--wine)',
        padding: '110px 24px',
      }}
    >
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: -120,
          left: -80,
          width: 380,
          height: 380,
          borderRadius: '50%',
          background: 'var(--pink)',
          opacity: 0.1,
          animation: 'bob 6s ease-in-out infinite',
        }}
      />
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          bottom: -100,
          right: -60,
          width: 280,
          height: 280,
          borderRadius: '50%',
          background: 'var(--gold)',
          opacity: 0.08,
          animation: 'bob 8s ease-in-out infinite 2s',
        }}
      />

      <div className="relative" style={{ maxWidth: 720, margin: '0 auto' }}>
        {scrawl && (
          <span
            className="block font-scrawl"
            style={{ color: 'var(--hot-pink)', fontSize: '21px', marginBottom: '12px' }}
          >
            {scrawl}
          </span>
        )}
        <h2
          className="font-serif text-white"
          style={{
            fontSize: 'clamp(34px, 5.5vw, 58px)',
            lineHeight: 1.05,
            marginBottom: '32px',
            fontWeight: 400,
          }}
          dangerouslySetInnerHTML={{ __html: heading }}
        />
        <div className="flex flex-wrap justify-center gap-4">
          <ChunkyButton variant="white" href={buttonHref}>
            {buttonLabel}
          </ChunkyButton>
          {secondary && (
            <ChunkyButton variant="outline" href={secondary.href}>
              {secondary.label}
            </ChunkyButton>
          )}
        </div>
      </div>
    </section>
  );
}
