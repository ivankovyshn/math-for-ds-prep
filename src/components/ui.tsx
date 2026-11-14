import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { motion } from 'framer-motion';

type Tone = 'primary' | 'accent' | 'danger' | 'neutral';

const tones: Record<Tone, string> = {
  primary: 'bg-primary text-white border-primary-deep',
  accent: 'bg-accent text-white border-accent-deep',
  danger: 'bg-danger text-white border-danger-deep',
  neutral: 'bg-surface text-fg border-line',
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  tone?: Tone;
  full?: boolean;
  children: ReactNode;
}

/** Chunky "pressable" button: the thick bottom border collapses while pressed. */
export function Button({ tone = 'primary', full, className = '', children, ...rest }: ButtonProps) {
  return (
    <button
      {...rest}
      className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl border-2 border-b-4 px-5 py-2.5 text-[15px] font-extrabold uppercase tracking-wide transition-[transform,border-width,filter] duration-75 enabled:hover:brightness-110 enabled:active:translate-y-[2px] enabled:active:border-b-2 disabled:border-line disabled:bg-surface2 disabled:text-muted ${tones[tone]} ${full ? 'w-full' : ''} ${className}`}
    >
      {children}
    </button>
  );
}

export function IconButton({ label, className = '', children, ...rest }: ButtonHTMLAttributes<HTMLButtonElement> & { label: string }) {
  return (
    <button
      {...rest}
      aria-label={label}
      title={label}
      className={`inline-flex h-11 w-11 items-center justify-center rounded-xl border-2 border-line bg-surface text-muted transition-colors hover:text-fg ${className}`}
    >
      {children}
    </button>
  );
}

/** Animated horizontal progress bar. `value` is between 0 and 1. */
export function ProgressBar({ value, tone = 'primary', className = '' }: { value: number; tone?: 'primary' | 'accent' | 'warn' | 'danger'; className?: string }) {
  const color = { primary: 'bg-primary', accent: 'bg-accent', warn: 'bg-warn', danger: 'bg-danger' }[tone];
  return (
    <div className={`h-4 overflow-hidden rounded-full bg-surface2 ${className}`} role="progressbar" aria-valuenow={Math.round(value * 100)} aria-valuemin={0} aria-valuemax={100}>
      <motion.div
        className={`relative h-full rounded-full ${color}`}
        initial={false}
        animate={{ width: `${Math.max(0, Math.min(1, value)) * 100}%` }}
        transition={{ type: 'spring', stiffness: 140, damping: 22 }}
      >
        <div className="absolute inset-x-2 top-1 h-1 rounded-full bg-white/25" />
      </motion.div>
    </div>
  );
}

export function Kbd({ children }: { children: ReactNode }) {
  return (
    <kbd className="hidden rounded-md border border-line bg-bg px-1.5 py-0.5 font-mono text-[11px] font-bold text-muted sm:inline-block">
      {children}
    </kbd>
  );
}
