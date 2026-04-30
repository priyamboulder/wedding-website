import styles from './TornDivider.module.css';

type TornDividerProps = {
  fromColor: string;
  toColor: string;
  className?: string;
};

export function TornDivider({ fromColor, toColor, className }: TornDividerProps) {
  return (
    <div
      className={[styles.wrap, className].filter(Boolean).join(' ')}
      style={{ background: fromColor }}
      aria-hidden="true"
    >
      <div className={styles.layer} style={{ background: toColor }} />
    </div>
  );
}
