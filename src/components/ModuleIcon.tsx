import { Axis3d, Database, Grid3x3, Infinity as InfinityIcon, Sigma } from 'lucide-react';
import type { ModuleId } from '../types.ts';

const icons = { intro: InfinityIcon, linalg: Grid3x3, geometry: Axis3d, analysis: Sigma, datasci: Database };

const colors: Record<ModuleId, string> = {
  intro: '#ff9d2e',
  linalg: '#3fa9ff',
  geometry: '#2fd3b0',
  analysis: '#b67cff',
  datasci: '#ff6f91',
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
