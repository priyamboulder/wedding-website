import type { ReactNode } from 'react';

type StickyTagProps = {
  children: ReactNode;
  className?: string;
};

export function StickyTag({ children, className }: StickyTagProps) {
  return (
    <span
      className={[
        'inline-block bg-wine text-hot-pink font-syne font-bold uppercase',
        'px-3 py-[5px] mb-3.5',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      style={{
        fontSize: '9px',
        letterSpacing: '1.5px',
        transform: 'rotate(2deg)',
      }}
    >
      {children}
    </span>
  );
}
