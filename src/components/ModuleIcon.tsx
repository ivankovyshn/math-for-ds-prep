import { ChartSpline, CodeXml, Dices, Grid3x3, Infinity as InfinityIcon, Mountain, PencilRuler, Sigma } from 'lucide-react';
import type { ModuleId } from '../types.ts';

const icons = { school: PencilRuler, intro: InfinityIcon, linalg: Grid3x3, calculus: Sigma, probability: Dices, statistics: ChartSpline, optimization: Mountain, programming: CodeXml };

const colors: Record<ModuleId, string> = {
  school: '#d4925a',
  intro: '#ff9d2e',
  linalg: '#3fa9ff',
  calculus: '#b67cff',
  probability: '#2fd3b0',
  statistics: '#ff6f91',
  optimization: '#f5c518',
  programming: '#7c8cff',
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
