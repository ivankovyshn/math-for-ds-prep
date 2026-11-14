import type { ModuleId, NodeId } from '../types.ts';

export interface ModuleMeta {
  id: ModuleId;
  title: string;
  blurb: string;
}

export const MODULES: ModuleMeta[] = [
  { id: 'geometry', title: 'Geometry & Mensuration', blurb: 'Shaded areas, volumes, mental unit conversion' },
  { id: 'calculus', title: 'Calculus', blurb: 'Slopes, tangents, integrals, differential relations' },
  { id: 'combinatorics', title: 'Number Theory & Counting', blurb: 'Prime factorizations, divisors, counting principle' },
  { id: 'probability', title: 'Probability', blurb: 'Independent trials, complements, classic traps' },
  { id: 'algorithms', title: 'Algorithmic Logic', blurb: 'Dry-running pseudocode, loops and conditions' },
];

export const MODULE_BY_ID = Object.fromEntries(MODULES.map((m) => [m.id, m])) as Record<ModuleId, ModuleMeta>;

export interface NodeMeta {
  id: NodeId;
  title: string;
  blurb: string;
  /** Seconds per question; only the speed drill is timed. */
  secondsPerQuestion?: number;
  /** XP bonus for finishing the node. */
  bonusXp: number;
}

export const NODES: NodeMeta[] = [
  { id: 'intuition', title: 'Intuition', blurb: '5 questions · build the idea', bonusXp: 20 },
  { id: 'core', title: 'Core Mechanics', blurb: '6 questions · standard techniques', bonusXp: 20 },
  { id: 'speed', title: 'Exam Speed Drill', blurb: '6 questions · 75 s each', secondsPerQuestion: 75, bonusXp: 30 },
  { id: 'boss', title: 'Boss Quiz', blurb: '7 questions · exam level', bonusXp: 50 },
];

export const NODE_BY_ID = Object.fromEntries(NODES.map((n) => [n.id, n])) as Record<NodeId, NodeMeta>;

export const nodeKey = (moduleId: ModuleId, nodeId: NodeId) => `${moduleId}:${nodeId}`;

export const HEARTS_PER_SESSION = 3;
export const EXAM_QUESTIONS = 10;
export const EXAM_SECONDS = 15 * 60;
