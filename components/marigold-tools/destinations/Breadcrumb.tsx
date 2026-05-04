import Link from 'next/link';
import styles from './Breadcrumb.module.css';

export type BreadcrumbStep = {
  label: string;
  href?: string;
};

type BreadcrumbProps = {
  steps: BreadcrumbStep[];
};

export function Breadcrumb({ steps }: BreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb" className={styles.crumbs}>
      {steps.map((step, idx) => {
        const isLast = idx === steps.length - 1;
        return (
          <span key={`${step.label}-${idx}`} className={styles.crumbItem}>
            {step.href && !isLast ? (
              <Link href={step.href} className={styles.crumbLink}>
                {step.label}
              </Link>
            ) : (
              <span aria-current={isLast ? 'page' : undefined} className={styles.crumbCurrent}>
                {step.label}
              </span>
            )}
            {!isLast && (
              <span aria-hidden="true" className={styles.crumbSep}>
                /
              </span>
            )}
          </span>
        );
      })}
    </nav>
  );
}
