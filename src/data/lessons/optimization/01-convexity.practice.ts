import type { QuestionTemplate, Rng } from '../../../types.ts';
import { r } from '../define.ts';
import { allDistinct, coef, frac, paren, poly, shuffle } from '../gen.ts';

/**
 * Function families for "which is convex?", encoded as [type, p, q] so that the checker can rebuild them.
 * Types 0–4 are convex on all of ℝ, types 5–9 are not.
 */
const CONVEX_TYPES = [0, 1, 2, 3, 4];
const OTHER_TYPES = [5, 6, 7, 8, 9];
export function drawFn(g: Rng, type: number): number[] {
  switch (type) {
    case 0: return [0, g.pick([1, 2, -1]), g.int(1, 3)];
    case 1: return [1, g.int(1, 5), g.nonzero(-6, 6)];
    case 2: return [2, g.nonzero(-4, 4), g.int(1, 3)];
    case 3: return [3, g.int(1, 9), 0];
    case 4: { const p = g.int(-3, 3); return [4, p, g.until(() => g.int(-3, 3), (q) => q !== p)]; }
    case 5: return [5, g.int(1, 5), g.nonzero(-6, 6)];
    case 6: return [6, g.nonzero(-5, 5), 0];
    case 7: return [7, g.int(1, 6), 0];
    case 8: return [8, g.int(1, 3), 0];
    default: return [9, g.int(1, 3), 0];
  }
}
export function fnTex([type, p, q]: number[]): string {
  switch (type) {
    case 0: return `e^{${coef(p)}x} + ${coef(q)}x^2`;
    case 1: return poly([0, q, p]);
    case 2: return `|x ${p < 0 ? '+' : '-'} ${Math.abs(p)}| + ${coef(q)}x^2`;
    case 3: return `\\sqrt{x^2 + ${p}}`;
    case 4: return `\\max(${p === 0 ? '0' : `${coef(p)}x`},\\ ${q === 0 ? '0' : `${coef(q)}x`})`;
    case 5: return poly([0, q, -p]);
    case 6: return poly([0, p, 0, 1]);
    case 7: return poly([0, 0, -p, 0, 1]);
    case 8: return `\\sin x + ${coef(p)}x`;
    default: return `${coef(p)}x^2 - |x|`;
  }
}
/** Why a non-convex family fails. */
export function whyNot([type, p]: number[]): string {
  switch (type) {
    case 5: return `$f''(x) = ${-2 * p} < 0$: this function is concave.`;
    case 6: return `$f''(x) = 6x$ is negative for $x < 0$.`;
    case 7: return `$f''(x) = 12x^2 - ${2 * p}$ is negative near $x = 0$.`;
    case 8: return `$f''(x) = -\\sin x$ is negative on $(0, \\pi)$.`;
    default: return `At $x = 0$ the kink points upwards: the chord from $-a$ to $a$ lies below the graph for small $a$.`;
  }
}
/** Which of four functions is convex: option a is a convex one, b–d are not. */
export function convexPick(g: Rng) {
  const good = drawFn(g, g.pick(CONVEX_TYPES));
  const bad = shuffle(g, OTHER_TYPES).slice(0, 3).map((t) => drawFn(g, t));
  return { fns: [good, ...bad] };
}

export const practice: QuestionTemplate[] = [
  {
    id: 'op-01-1',
    difficulty: 1,
    keyConceptTag: 'Chords above the graph',
    correctOptionId: 'a',
    generate: (g) => {
      const { a, c, u, v } = g.until(
        () => ({ a: g.int(1, 4), c: g.int(-5, 5), u: g.int(-5, 2), v: g.int(1, 6) }),
        ({ a, c, u, v }) => {
          if (v - u < 2) return false;
          const f = (x: number) => a * x * x + c;
          const m = (u + v) / 2;
          return allDistinct([(a * (v - u) ** 2) / 4, -(a * (v - u) ** 2) / 4, (f(u) + f(v)) / 2, f(m)]);
        },
      );
      const f = (x: number) => a * x * x + c;
      const gap4 = a * (v - u) ** 2;
      const chord2 = f(u) + f(v);
      const fm4 = a * (u + v) ** 2 + 4 * c;
      return {
        params: { a, c, u, v },
        promptText: r`For $f(x) = ${poly([c, 0, a])}$, how far does the chord between $x = ${u}$ and $x = ${v}$ lie above the graph at the midpoint $x = ${frac(u + v, 2)}$?`,
        options: [
          { id: 'a', label: `$${frac(gap4, 4)}$`, value: gap4 / 4 },
          { id: 'b', label: `$${frac(-gap4, 4)}$`, value: -gap4 / 4, trapExplanation: r`For a convex function the chord is <i>above</i> the graph, so the gap is positive.` },
          { id: 'c', label: `$${frac(chord2, 2)}$`, value: chord2 / 2, trapExplanation: r`That is the height of the chord; subtract the graph's value $f\big(${frac(u + v, 2)}\big)$.` },
          { id: 'd', label: `$${frac(fm4, 4)}$`, value: fm4 / 4, trapExplanation: r`That is the graph's value at the midpoint, not the gap.` },
        ],
        stepByStepSolution: [
          r`Chord at the midpoint: $\frac{f(${u}) + f(${v})}{2} = \frac{${f(u)} + ${paren(f(v))}}{2} = ${frac(chord2, 2)}$.`,
          r`Graph: $f\big(${frac(u + v, 2)}\big) = ${frac(fm4, 4)}$.`,
          r`Gap: $${frac(chord2, 2)} - ${fm4 < 0 ? `(${frac(fm4, 4)})` : frac(fm4, 4)} = ${frac(gap4, 4)}$.`,
        ],
      };
    },
  },
  {
    id: 'op-01-2',
    difficulty: 1,
    keyConceptTag: 'The second-derivative test',
    correctOptionId: 'a',
    generate: (g) => {
      const p = g.nonzero(-6, 6);
      const b = g.nonzero(-5, 5);
      const cond = (op: string, t: number) => `$k ${op} ${t}$`;
      return {
        params: { p, b },
        promptText: r`For which values of $k$ is $f(x) = (k ${p < 0 ? '+' : '-'} ${Math.abs(p)})x^2 ${b < 0 ? '-' : '+'} ${Math.abs(b)}x$ convex on all of $\mathbb{R}$?`,
        options: [
          { id: 'a', label: cond(r`\ge`, p), value: [1, p] },
          { id: 'b', label: cond(r`\le`, p), value: [-1, p], trapExplanation: r`Then the coefficient of $x^2$ is negative or zero, and $f'' \le 0$: concave.` },
          { id: 'c', label: cond(r`\ge`, 0), value: [1, 0], trapExplanation: r`What matters is the coefficient $k ${p < 0 ? '+' : '-'} ${Math.abs(p)}$ of $x^2$, not $k$ itself.` },
          { id: 'd', label: cond(r`\ge`, -p), value: [1, -p], trapExplanation: r`Solve $k ${p < 0 ? '+' : '-'} ${Math.abs(p)} \ge 0$: the sign flips when the constant moves across.` },
        ],
        stepByStepSolution: [
          r`$f''(x) = 2(k ${p < 0 ? '+' : '-'} ${Math.abs(p)})$, a constant; the linear term does not matter.`,
          r`Convex means $f'' \ge 0$: $k ${p < 0 ? '+' : '-'} ${Math.abs(p)} \ge 0$.`,
          r`So $k \ge ${p}$.`,
        ],
      };
    },
  },
  {
    id: 'op-01-3',
    difficulty: 2,
    keyConceptTag: 'Recognising convex functions',
    correctOptionId: 'a',
    generate: (g) => {
      const { fns } = convexPick(g);
      return {
        params: { fns },
        promptText: r`Which of these functions is convex on all of $\mathbb{R}$?`,
        options: fns.map((fn, i) => ({
          id: 'abcd'[i],
          label: `$f(x) = ${fnTex(fn)}$`,
          ...(i === 0 ? {} : { trapExplanation: whyNot(fn) }),
        })),
        stepByStepSolution: [
          r`Check $f'' \ge 0$, or build the function from convex pieces with operations that keep convexity.`,
          r`$${fnTex(fns[0])}$ is ${['a sum of $e^{kx}$ and a non-negative multiple of $x^2$, both convex', 'a quadratic with a positive leading coefficient', 'a shifted $|x|$ plus a non-negative multiple of $x^2$', 'the length of the vector $(x, \\sqrt{c})$, a norm composed with a linear map', 'a maximum of two linear functions'][fns[0][0]]}.`,
          r`The other three each have a region where $f'' < 0$ or an upward kink, so a chord dips below the graph.`,
        ],
      };
    },
  },
  {
    id: 'op-01-4',
    difficulty: 2,
    keyConceptTag: 'Convexity in two variables',
    correctOptionId: 'a',
    generate: (g) => {
      const [a, c] = g.pick([[1, 1], [1, 4], [4, 1], [2, 2], [1, 9], [9, 1], [2, 8], [8, 2], [3, 3], [4, 9], [9, 4]]);
      const s = Math.sqrt(a * c);
      return {
        params: { a, c },
        promptText: r`For which values of $b$ is $f(x, y) = ${coef(a)}x^2 + bxy + ${coef(c)}y^2$ convex?`,
        options: [
          { id: 'a', label: `$|b| \\le ${2 * s}$`, value: [-2 * s, 2 * s] },
          { id: 'b', label: `$|b| \\le ${s}$`, value: [-s, s], trapExplanation: r`The Hessian is $\begin{pmatrix} ${2 * a} & b \\ b & ${2 * c} \end{pmatrix}$, with determinant $${4 * a * c} - b^2$; the 2s on the diagonal matter.` },
          { id: 'c', label: `$|b| \\le ${4 * a * c}$`, value: [-4 * a * c, 4 * a * c], trapExplanation: r`The condition is $b^2 \le ${4 * a * c}$; take the square root.` },
          { id: 'd', label: `$b \\le ${2 * s}$`, value: [-1e9, 2 * s], trapExplanation: r`$b$ enters the determinant squared, so large negative $b$ fails too.` },
        ],
        stepByStepSolution: [
          r`$H = \begin{pmatrix} ${2 * a} & b \\ b & ${2 * c} \end{pmatrix}$, the same at every point.`,
          r`The diagonal is positive, so $H$ is positive semidefinite exactly when $\det H = ${4 * a * c} - b^2 \ge 0$.`,
          r`$b^2 \le ${4 * a * c}$, i.e. $|b| \le ${2 * s}$.`,
        ],
      };
    },
  },
  {
    id: 'op-01-5',
    difficulty: 3,
    keyConceptTag: 'Bounding a convex function by a chord',
    correctOptionId: 'a',
    generate: (g) => {
      const { x1, x0, x2, A, B } = g.until(
        () => {
          const x1 = g.int(-4, 2);
          const x2 = x1 + g.int(3, 6);
          return { x1, x2, x0: g.int(x1 + 1, x2 - 1), A: g.int(-5, 12), B: g.int(-5, 12) };
        },
        ({ x1, x0, x2, A, B }) => {
          const d = x2 - x1;
          return A !== B && 2 * x0 !== x1 + x2 && allDistinct([((x2 - x0) * A + (x0 - x1) * B) / d, ((x0 - x1) * A + (x2 - x0) * B) / d, (A + B) / 2, Math.max(A, B)]);
        },
      );
      const d = x2 - x1;
      const num = (x2 - x0) * A + (x0 - x1) * B;
      const sw = (x0 - x1) * A + (x2 - x0) * B;
      return {
        params: { x1, x0, x2, A, B },
        promptText: r`A convex function has $f(${x1}) = ${A}$ and $f(${x2}) = ${B}$. What is the best upper bound on $f(${x0})$ that convexity guarantees?`,
        options: [
          { id: 'a', label: `$${frac(num, d)}$`, value: num / d },
          { id: 'b', label: `$${frac(sw, d)}$`, value: sw / d, trapExplanation: r`The weights are swapped: the nearer end point gets the larger weight. $${x0}$ is closer to $${Math.abs(x0 - x1) < Math.abs(x2 - x0) ? x1 : x2}$.` },
          { id: 'c', label: `$${frac(A + B, 2)}$`, value: (A + B) / 2, trapExplanation: r`That is the chord's height at the midpoint $${frac(x1 + x2, 2)}$, not at $${x0}$.` },
          { id: 'd', label: `$${Math.max(A, B)}$`, value: Math.max(A, B), trapExplanation: r`It is a valid bound but not the best: the chord itself is lower at $${x0}$.` },
        ],
        stepByStepSolution: [
          r`Write $${x0} = \lambda\cdot${paren(x1)} + (1 - \lambda)\cdot${paren(x2)}$: $\lambda = \frac{${x2} - ${paren(x0)}}{${d}} = ${frac(x2 - x0, d)}$.`,
          r`Convexity: $f(${x0}) \le \lambda f(${x1}) + (1 - \lambda)f(${x2}) = ${frac(x2 - x0, d)}\cdot${paren(A)} + ${frac(x0 - x1, d)}\cdot${paren(B)}$.`,
          r`$= ${frac(num, d)}$, and the straight line through both points shows the bound can be reached.`,
        ],
      };
    },
  },
  {
    id: 'op-01-6',
    difficulty: 3,
    keyConceptTag: 'Minimising a maximum of lines',
    correctOptionId: 'a',
    generate: (g) => {
      const { a1, a2, xs, ys } = g.until(
        () => ({ a1: g.int(-4, -1), a2: g.int(1, 4), xs: g.nonzero(-5, 5), ys: g.int(-6, 8) }),
        ({ a1, a2, xs, ys }) => {
          const b1 = ys - a1 * xs;
          const b2 = ys - a2 * xs;
          return allDistinct([ys, xs, Math.max(b1, b2), Math.min(b1, b2)]);
        },
      );
      const b1 = ys - a1 * xs;
      const b2 = ys - a2 * xs;
      const L = (a: number, b: number) => (b === 0 ? `${coef(a)}x` : `${coef(a)}x ${b < 0 ? "-" : "+"} ${Math.abs(b)}`);
      return {
        params: { a1, b1, a2, b2 },
        promptText: r`What is the minimum value of the convex function $f(x) = \max(${L(a1, b1)},\ ${L(a2, b2)})$?`,
        options: [
          { id: 'a', label: `$${ys}$`, value: ys },
          { id: 'b', label: `$${xs}$`, value: xs, trapExplanation: r`$x = ${xs}$ is where the minimum is attained; the question asks for the value $f(${xs})$.` },
          { id: 'c', label: `$${Math.max(b1, b2)}$`, value: Math.max(b1, b2), trapExplanation: r`That is $f(0)$. The minimum is where the falling line meets the rising one.` },
          { id: 'd', label: `$${Math.min(b1, b2)}$`, value: Math.min(b1, b2), trapExplanation: r`$f$ is the <i>larger</i> of the two lines, so at $x = 0$ it equals ${Math.max(b1, b2)}, not ${Math.min(b1, b2)}.` },
        ],
        stepByStepSolution: [
          r`One line falls (slope ${a1}) and one rises (slope ${a2}), so the maximum is smallest where they cross.`,
          r`$${L(a1, b1)} = ${L(a2, b2)}$ gives $${a1 - a2}x = ${b2 - b1}$, so $x = ${xs}$.`,
          r`$f(${xs}) = ${a1}\cdot${paren(xs)} + ${paren(b1)} = ${ys}$.`,
        ],
      };
    },
  },
];

