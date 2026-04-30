import type { ButtonHTMLAttributes, ReactNode } from 'react';
import Link from 'next/link';
import styles from './ChunkyButton.module.css';

export type ChunkyVariant = 'white' | 'pink' | 'outline';

type CommonProps = {
  variant?: ChunkyVariant;
  children: ReactNode;
  className?: string;
};

type ChunkyButtonProps = CommonProps &
  (
    | ({ href: string } & Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'href' | 'className' | 'children'>)
    | ({ href?: undefined } & Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'className' | 'children'>)
  );

export function ChunkyButton(props: ChunkyButtonProps) {
  const { variant = 'pink', children, className, href, ...rest } = props as CommonProps & {
    href?: string;
  };

  const cls = [styles.btn, styles[variant], className].filter(Boolean).join(' ');

  if (href) {
    return (
      <Link href={href} className={cls} {...(rest as React.AnchorHTMLAttributes<HTMLAnchorElement>)}>
        {children}
      </Link>
    );
  }

  return (
    <button type="button" className={cls} {...(rest as ButtonHTMLAttributes<HTMLButtonElement>)}>
      {children}
    </button>
  );
}
