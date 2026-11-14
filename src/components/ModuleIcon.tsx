import { Braces, Dices, Hash, Shapes, Sigma } from 'lucide-react';
import type { ModuleId } from '../types.ts';

const icons = { geometry: Shapes, calculus: Sigma, combinatorics: Hash, probability: Dices, algorithms: Braces };

const colors: Record<ModuleId, string> = {
  geometry: '#3fa9ff',
  calculus: '#b67cff',
  combinatorics: '#ff9d2e',
  probability: '#ff6f91',
  algorithms: '#2fd3b0',
};

export const moduleColor = (id: ModuleId) => colors[id];

export function ModuleIcon({ id, size = 44 }: { id: ModuleId; size?: number }) {
  const Icon = icons[id];
  return (
    <span
      className="flex shrink-0 items-center justify-center rounded-xl text-white"
      style={{ width: size, height: size, background: colors[id] }}
      aria-hidden
    >
      <Icon size={size * 0.55} strokeWidth={2.4} />
    </span>
  );
}
