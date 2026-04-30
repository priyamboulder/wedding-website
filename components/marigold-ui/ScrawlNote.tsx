import type { ReactNode } from 'react';

type ScrawlNoteProps = {
  children: ReactNode;
  className?: string;
};

export function ScrawlNote({ children, className }: ScrawlNoteProps) {
  return (
    <span
      className={[
        'inline-block font-scrawl text-pink',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      style={{
        fontSize: '17px',
        transform: 'rotate(-1deg)',
      }}
    >
      {children}
    </span>
  );
}
