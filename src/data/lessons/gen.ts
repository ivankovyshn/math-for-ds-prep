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
export const cross = ([a, b, c]: number[], [d, e, f]: number[]) => [b * f - c * e, c * d - a * f, a * e - b * d];
export const outer = (u: number[], v: number[]): Mat => u.map((x) => v.map((y) => x * y));
export const sumOf = (xs: number[]) => xs.reduce((s, x) => s + x, 0);

/** Primitive Pythagorean triples (a, b, c) with a² + b² = c². */
export const PYTHAGOREAN = [[3, 4, 5], [5, 12, 13], [8, 15, 17], [7, 24, 25]];

/** A vector with entries p_i / d, each in lowest terms: fvec([3, 4], 5) -> "(\tfrac{3}{5}, \tfrac{4}{5})". */
export const fvec = (v: number[], d: number) => `(${v.map((x) => frac(x, d)).join(', ')})`;

/** √n simplified: 9 -> "3", 45 -> "3\sqrt{5}", 7 -> "\sqrt{7}". */
export function sqrtTex(n: number): string {
  let f = 1;
  for (let k = 2; k * k <= n; k++) if (n % (k * k) === 0) f = k;
  const rest = n / (f * f);
  if (rest === 1) return `${f}`;
  return `${f === 1 ? '' : f}\\sqrt{${rest}}`;
}

/** "y = 5 - 3t" style: c + d·t with tidy signs and unit coefficients. */
export function lineTex(c: number, d: number, t = 't'): string {
  const dt = d === 0 ? '' : `${Math.abs(d) === 1 ? '' : Math.abs(d)}${t}`;
  if (c === 0) return d === 0 ? '0' : `${d < 0 ? '-' : ''}${dt}`;
  return d === 0 ? `${c}` : `${c} ${d < 0 ? '-' : '+'} ${dt}`;
}

/** A coefficient in front of a vector or symbol: 1 -> "", -1 -> "-", 3 -> "3". */
export const coef = (k: number) => (k === 1 ? '' : k === -1 ? '-' : `${k}`);

/** A polynomial from ascending coefficients: poly([1, -2, 3]) -> "3x^{2} - 2x + 1". */
export function poly(cs: number[], v = 'x'): string {
  let out = '';
  for (let i = cs.length - 1; i >= 0; i--) {
    const c = cs[i];
    if (c === 0) continue;
    const abs = Math.abs(c);
    const mono = i === 0 ? '' : i === 1 ? v : `${v}^{${i}}`;
    const body = i === 0 ? `${abs}` : `${abs === 1 ? '' : abs}${mono}`;
    out += out === '' ? (c < 0 ? `-${body}` : body) : ` ${c < 0 ? '-' : '+'} ${body}`;
  }
  return out || '0';
}

/** A decimal without floating-point noise: dec(0.1 + 0.2) -> "0.3". */
export const dec = (x: number) => `${Math.round(x * 1e6) / 1e6 + 0}`;

export const factorial = (n: number): number => (n <= 1 ? 1 : n * factorial(n - 1));

/** A polynomial with fractional coefficients, ascending [numerator, denominator] pairs: "1 + 2x + \tfrac{9}{2}x^{2}". */
export function fracPoly(cs: number[][], v = 'x'): string {
  let out = '';
  cs.forEach(([n, d], i) => {
    if (n === 0) return;
    const abs = frac(Math.abs(n), d);
    const mono = i === 0 ? '' : i === 1 ? v : `${v}^{${i}}`;
    const body = i === 0 ? abs : `${abs === '1' ? '' : abs}${mono}`;
    out += out === '' ? (n * d < 0 ? `-${body}` : body) : ` ${n * d < 0 ? '-' : '+'} ${body}`;
  });
  return out || '0';
}

/** Binomial coefficient C(n, k). */
export const binomial = (n: number, k: number): number => (k < 0 || k > n ? 0 : factorial(n) / (factorial(k) * factorial(n - k)));
