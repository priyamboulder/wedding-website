import styles from './PushPin.module.css';

export type PinColor = 'pink' | 'red' | 'gold' | 'blue';
export type PinPosition = 'left' | 'right' | 'center';

type PushPinProps = {
  color: PinColor;
  position: PinPosition;
  className?: string;
};

export function PushPin({ color, position, className }: PushPinProps) {
  const cls = [styles.pin, styles[color], styles[position], className]
    .filter(Boolean)
    .join(' ');
  return <div aria-hidden="true" className={cls} />;
}
