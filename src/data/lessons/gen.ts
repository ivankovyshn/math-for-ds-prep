/**
 * Helpers for parametric questions (QuestionTemplate.generate): TeX formatting and small exact
 * integer computations. scripts/verify.mjs re-checks every variant with its own, independent code.
 */
import type { Rng } from '../../types.ts';

export type Mat = number[][];

// ---------- formatting ----------

/** A number inside a product or after an operator: negatives get parentheses. */
export const paren = (x: number) => (x < 0 ? `(${x})` : `${x}`);

/** A vector as $(a, b, c)$ content. */
export const vec = (v: number[]) => `(${v.join(', ')})`;

/** A matrix as a pmatrix. */
export const pm = (A: Mat) => `\\begin{pmatrix} ${A.map((row) => row.join(' & ')).join(' \\\\ ')} \\end{pmatrix}`;

/** "+ 3" or "- 3", for continuing a sum. */
export const signed = (x: number) => (x < 0 ? `- ${-x}` : `+ ${x}`);

/** A sum of numbers written out: [2, -4, 6] -> "2 - 4 + 6". */
export const chain = (xs: number[]) => xs.map((x, i) => (i === 0 ? `${x}` : signed(x))).join(' ');

/** A linear expression: lin([2, -1, 0, 1], ['x', 'y', 'z', 'w']) -> "2x - y + w". */
export function lin(coefs: number[], vars: string[]): string {
  let out = '';
  coefs.forEach((c, i) => {
    if (c === 0) return;
    const abs = Math.abs(c);
    const body = (abs === 1 ? '' : `${abs}`) + vars[i];
    out += out === '' ? (c < 0 ? `-${body}` : body) : c < 0 ? ` - ${body}` : ` + ${body}`;
  });
  return out === '' ? '0' : out;
}

/** A linear system as a cases block: system([[1, 2], [3, 4]], [5, 6], ['x', 'y']). */
export const system = (A: Mat, b: number[], vars: string[]) =>
  `\\begin{cases} ${A.map((row, i) => `${lin(row, vars)} = ${b[i]}`).join(' \\\\ ')} \\end{cases}`;

/** An augmented matrix (A | b). */
export const aug = (A: Mat, b: number[]) =>
  `\\left(\\begin{array}{${'c'.repeat(A[0].length)}|c} ${A.map((row, i) => [...row, b[i]].join(' & ')).join(' \\\\ ')} \\end{array}\\right)`;

/** A row of an augmented matrix as $(a, b \mid c)$ content. */
export const augRow = (row: number[], rhs: number) => `(${row.join(', ')} \\mid ${rhs})`;

export const gcd =(a: number, b: number): number => (b === 0 ? Math.abs(a) : gcd(b, a % b));

/** A fraction p/q in lowest terms as TeX ("\tfrac{3}{4}", "-\tfrac{1}{2}", "5"). */
export function frac(p: number, q: number): string {
  if (q < 0) [p, q] = [-p, -q];
  const d = gcd(p, q) || 1;
  [p, q] = [p / d, q / d];
  if (q === 1) return `${p}`;
  return `${p < 0 ? '-' : ''}\\tfrac{${Math.abs(p)}}{${q}}`;
}

/** True if no two values coincide (values compared as JSON). */
export const allDistinct = (values: unknown[]) => new Set(values.map((v) => JSON.stringify(v))).size === values.length;

// ---------- random draws ----------

/** A shuffled copy (Fisher–Yates driven by the seeded source). */
export function shuffle<T>(g: Rng, items: readonly T[]): T[] {
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) {
    const j = g.int(0, i);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export const ints = (g: Rng, n: number, lo = -5, hi = 5) => Array.from({ length: n }, () => g.int(lo, hi));
export const mat = (g: Rng, rows: number, cols: number, lo = -5, hi = 5): Mat =>
  Array.from({ length: rows }, () => ints(g, cols, lo, hi));

// ---------- exact integer linear algebra ----------

export const dot = (u: number[], v: number[]) => u.reduce((s, x, i) => s + x * v[i], 0);
export const add = (u: number[], v: number[]) => u.map((x, i) => x + v[i]);
export const sub = (u: number[], v: number[]) => u.map((x, i) => x - v[i]);
export const times = (c: number, u: number[]) => u.map((x) => c * x);
export const mv = (A: Mat, v: number[]) => A.map((row) => dot(row, v));
export const mm = (A: Mat, B: Mat): Mat => A.map((row) => B[0].map((_, j) => row.reduce((s, a, k) => s + a * B[k][j], 0)));
export const tr = (A: Mat): Mat => A[0].map((_, j) => A.map((row) => row[j]));
export const flat = (A: Mat) => A.flat();
export const det2 = ([[a, b], [c, d]]: Mat) => a * d - b * c;
export const det3 = (A: Mat) =>
  A[0][0] * (A[1][1] * A[2][2] - A[1][2] * A[2][1]) -
  A[0][1] * (A[1][0] * A[2][2] - A[1][2] * A[2][0]) +
  A[0][2] * (A[1][0] * A[2][1] - A[1][1] * A[2][0]);
