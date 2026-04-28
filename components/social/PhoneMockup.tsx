"use client";

import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
  className?: string;
};

export default function PhoneMockup({ children, className = "" }: Props) {
  return (
    <div
      className={`relative mx-auto aspect-[9/16] w-[270px] overflow-hidden rounded-[28px] border-[3px] border-neutral-800 bg-black shadow-[0_20px_50px_-15px_rgba(0,0,0,0.6)] ${className}`}
    >
      <div className="pointer-events-none absolute left-1/2 top-1.5 z-20 h-4 w-20 -translate-x-1/2 rounded-full bg-neutral-900" />
      <div className="absolute inset-0 overflow-hidden rounded-[24px]">
        {children}
      </div>
    </div>
  );
}
