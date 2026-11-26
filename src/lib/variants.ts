import type { Question, Rng } from '../types.ts';

/** mulberry32: a tiny, fast, seedable PRNG. Good enough for picking exercise numbers. */
export function makeRng(seed: number): Rng {
  let a = seed >>> 0;
  const next = () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const int = (lo: number, hi: number) => lo + Math.floor(next() * (hi - lo + 1));
  return {
    next,
    int,
    nonzero(lo, hi) {
      for (;;) {
        const v = int(lo, hi);
        if (v !== 0) return v;
      }
    },
    pick: (items) => items[Math.floor(next() * items.length)],
    until(make, ok) {
      for (let i = 0; i < 10_000; i++) {
        const v = make();
        if (ok(v)) return v;
      }
      throw new Error('could not draw values that satisfy the constraints');
    },
  };
}

export const newSeed = () => 1 + Math.floor(Math.random() * 2 ** 31);

/** The variant of a question for a seed. Non-parametric questions are returned unchanged. */
export function variantOf(q: Question, seed: number = newSeed()): Question {
  if (!q.generate) return q;
  return { ...q, ...q.generate(makeRng(seed)), seed };
}

/** Seed of the fixed variant stored on a parametric question (and shown on the #all page by default). */
export const CANONICAL_SEED = 1;
