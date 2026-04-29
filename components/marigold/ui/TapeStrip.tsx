import styles from './TapeStrip.module.css';

export type TapePosition = 'tl' | 'tr' | 'bl' | 'center';

type TapeStripProps = {
  position: TapePosition;
  className?: string;
};

export function TapeStrip({ position, className }: TapeStripProps) {
  const cls = [styles.tape, styles[position], className].filter(Boolean).join(' ');
  return <div aria-hidden="true" className={cls} />;
}
