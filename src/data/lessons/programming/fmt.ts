/** Formatting helpers for programming questions: printed output as option labels. */

/** Printed output shown in monospace: "<c>…</c>". */
export const out = (s: string | number) => `<c>${s}</c>`;
/** Python's repr of a list of numbers: "[1, 2, 3]". */
export const pyList = (xs: (number | string)[]) => `[${xs.map((x) => (typeof x === 'string' ? `'${x}'` : x)).join(', ')}]`;
/** A shape tuple: (3, 4) or (5,). */
export const shape = (s: number[]) => (s.length === 1 ? `(${s[0]},)` : `(${s.join(', ')})`);
/** How NumPy prints a 1-D integer array: entries padded to a common width, e.g. "[  1  10 100]". */
export function npInts(xs: number[]): string {
  const w = Math.max(...xs.map((x) => String(x).length));
  return `[${xs.map((x) => String(x).padStart(w)).join(' ')}]`;
}
/** How NumPy prints a 1-D float array whose entries are whole numbers, e.g. "[10.  3.]". */
export function npWholeFloats(xs: number[]): string {
  const s = xs.map((x) => `${x}.`);
  const w = Math.max(...s.map((t) => t.length));
  return `[${s.map((t) => t.padStart(w)).join(' ')}]`;
}
/** How Python prints a float with a short exact decimal: 3 -> "3.0", 2.5 -> "2.5". */
export const pyFloat = (x: number) => (Number.isInteger(x) ? `${x}.0` : `${x}`);
/** Python source for a list literal. */
export const src = (xs: number[]) => `[${xs.join(', ')}]`;
/** Python source for a 2-D list literal. */
export const src2 = (A: number[][]) => `[${A.map(src).join(', ')}]`;
