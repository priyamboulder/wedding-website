type SectionHeaderProps = {
  scrawl?: string;
  heading: string;
  sub?: string;
  className?: string;
};

export function SectionHeader({ scrawl, heading, sub, className }: SectionHeaderProps) {
  return (
    <div className={['text-center mb-16', className].filter(Boolean).join(' ')}>
      {scrawl && (
        <span
          className="block font-scrawl text-pink"
          style={{ fontSize: '22px', fontWeight: 600 }}
        >
          {scrawl}
        </span>
      )}
      <h2
        className="font-serif text-wine scrapbook-heading"
        style={{
          fontSize: 'clamp(36px, 5.5vw, 56px)',
          lineHeight: 1.05,
        }}
        dangerouslySetInnerHTML={{ __html: heading }}
      />
      {sub && (
        <p
          className="font-body text-mauve mx-auto mt-2.5"
          style={{ fontSize: '15px', maxWidth: '480px', lineHeight: 1.6 }}
        >
          {sub}
        </p>
      )}
    </div>
  );
}
