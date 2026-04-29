import type { CSSProperties, ReactNode } from 'react';
import { TapeStrip, type TapePosition } from './TapeStrip';
import { PushPin, type PinColor, type PinPosition } from './PushPin';
import styles from './MockupFrame.module.css';

type MockupFrameProps = {
  rotation?: number;
  tapes?: TapePosition[];
  pin?: { color: PinColor; position: PinPosition } | null;
  children: ReactNode;
  className?: string;
};

export function MockupFrame({
  rotation = 0,
  tapes = [],
  pin = null,
  children,
  className,
}: MockupFrameProps) {
  return (
    <div className="relative">
      {tapes.map((position) => (
        <TapeStrip key={position} position={position} />
      ))}
      {pin && <PushPin color={pin.color} position={pin.position} />}
      <div
        className={[styles.frame, className].filter(Boolean).join(' ')}
        style={{ '--mock-rotation': `${rotation}deg` } as CSSProperties}
      >
        {children}
      </div>
    </div>
  );
}
