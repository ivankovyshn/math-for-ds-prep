import type { QuestionTemplate, Rng } from '../../../types.ts';
import { r } from '../define.ts';
import { PYTHAGOREAN, add, allDistinct, coef, dot, frac, fvec, ints, paren, pm, shuffle, sqrtTex, sub, sumOf, times, vec } from '../gen.ts';

/** Legs (a, b) of a Pythagorean triple in random order and with random signs, and the hypotenuse c. */
export function legs(g: Rng, triples = PYTHAGOREAN) {
  const [p, q, c] = g.pick(triples);
  const [a, b] = shuffle(g, [p, q]).map((x) => x * g.pick([-1, 1]));
  return { a, b, c };
}
export const l1 = (v: number[]) => sumOf(v.map(Math.abs));
export const linf = (v: number[]) => Math.max(...v.map(Math.abs));

export const practice: QuestionTemplate[] = [
  {
    id: 'la-08-1',
    difficulty: 1,
    keyConceptTag: 'The L1 norm',
    correctOptionId: 'a',
    generate: (g) => {
      const v = g.until(
        () => Array.from({ length: 4 }, () => g.nonzero(-9, 9)),
        (v) => v.filter((x) => x < 0).length >= 1 && allDistinct([l1(v), sumOf(v), linf(v), dot(v, v)]),
      );
      const neg = v.find((x) => x < 0)!;
      return {
        params: { v },
        promptText: r`Compute $\|\mathbf{v}\|_1$ for $\mathbf{v} = ${vec(v)}$.`,
        options: [
          { id: 'a', label: `$${l1(v)}$`, value: l1(v) },
          { id: 'b', label: `$${sumOf(v)}$`, value: sumOf(v), trapExplanation: r`That keeps the signs. The L1 norm adds <i>absolute</i> values, so $${neg}$ counts as $${-neg}$.` },
          { id: 'c', label: `$${linf(v)}$`, value: linf(v), trapExplanation: r`${linf(v)} is the largest absolute entry, $\|\mathbf{v}\|_\infty$. The L1 norm adds all of them.` },
          { id: 'd', label: `$${dot(v, v)}$`, value: dot(v, v), trapExplanation: r`${dot(v, v)} is the sum of squares, $\|\mathbf{v}\|_2^2$. The L1 norm adds absolute values without squaring.` },
        ],
        stepByStepSolution: [
          r`$\|\mathbf{v}\|_1 = |v_1| + |v_2| + |v_3| + |v_4|$.`,
          r`$= ${v.map((x) => Math.abs(x)).join(' + ')}$.`,
          r`$= ${l1(v)}$.`,
        ],
      };
    },
  },
  {
    id: 'la-08-2',
    difficulty: 1,
    keyConceptTag: 'Normalising a vector',
    correctOptionId: 'a',
    generate: (g) => {
      const { a, b, c } = legs(g, PYTHAGOREAN.slice(0, 3));
      const k = c === 5 ? g.int(1, 3) : 1;
      const v = [k * a, k * b];
      const L = k * c;
      return {
        params: { v },
        promptText: r`Which unit vector points in the same direction as $\mathbf{v} = ${vec(v)}$?`,
        options: [
          { id: 'a', label: `$${fvec(v, L)}$`, value: v.map((x) => x / L) },
          { id: 'b', label: `$${fvec(v, L * L)}$`, value: v.map((x) => x / (L * L)), trapExplanation: r`That divides by $\|\mathbf{v}\|^2 = ${L * L}$; the result has length $\tfrac{1}{${L}}$, not 1.` },
          { id: 'c', label: `$${fvec(v, l1(v))}$`, value: v.map((x) => x / l1(v)), trapExplanation: r`That divides by $\|\mathbf{v}\|_1 = ${l1(v)}$. Its L1 norm is 1, but its length is $\tfrac{${L}}{${l1(v)}} < 1$.` },
          { id: 'd', label: `$${fvec([v[1], v[0]], L)}$`, value: [v[1] / L, v[0] / L], trapExplanation: r`The components are swapped: this unit vector points in a different direction.` },
        ],
        stepByStepSolution: [
          r`$\|\mathbf{v}\| = \sqrt{${v[0] * v[0]} + ${v[1] * v[1]}} = \sqrt{${L * L}} = ${L}$.`,
          r`$\dfrac{\mathbf{v}}{\|\mathbf{v}\|} = \tfrac{1}{${L}}${vec(v)} = ${fvec(v, L)}$.`,
          r`Check: $(${frac(v[0], L)})^2 + (${frac(v[1], L)})^2 = 1$. Dividing by a positive number keeps the direction.`,
        ],
      };
    },
  },
  {
    id: 'la-08-3',
    difficulty: 2,
    keyConceptTag: 'Coordinates in an orthonormal basis',
    correctOptionId: 'a',
    generate: (g) => {
      const { a, b, c } = legs(g, PYTHAGOREAN.slice(0, 2));
      const [k1, k2] = g.until(
        () => [g.nonzero(-3, 3), g.nonzero(-3, 3)],
        ([x, y]) => x !== y && allDistinct([[x * c, y * c], [y * c, x * c], add(times(x, [a, b]), times(y, [-b, a]))]),
      );
      const v = add(times(k1, [a, b]), times(k2, [-b, a]));
      return {
        params: { q1: [a, b], c, v },
        promptText: r`$\mathbf{q}_1 = ${fvec([a, b], c)}$ and $\mathbf{q}_2 = ${fvec([-b, a], c)}$ form an orthonormal basis of $\mathbb{R}^2$. Find the coordinates $(c_1, c_2)$ of $\mathbf{v} = ${vec(v)}$ in this basis.`,
        options: [
          { id: 'a', label: `$${vec([k1 * c, k2 * c])}$`, value: [k1 * c, k2 * c] },
          { id: 'b', label: `$${vec([k2 * c, k1 * c])}$`, value: [k2 * c, k1 * c], trapExplanation: r`The coordinates are swapped: $c_1 = \mathbf{v}\cdot\mathbf{q}_1 = ${k1 * c}$ belongs to $\mathbf{q}_1$.` },
          { id: 'c', label: `$${vec([k1 * c * c, k2 * c * c])}$`, value: [k1 * c * c, k2 * c * c], trapExplanation: r`That dots $\mathbf{v}$ with $${vec([a, b])}$ and $${vec([-b, a])}$, which have length ${c}. Use the unit vectors $\mathbf{q}_i$: divide by ${c}.` },
          { id: 'd', label: `$${vec([k1, k2])}$`, value: [k1, k2], trapExplanation: r`That divides by ${c} twice, as if solving $\mathbf{v} = c_1 ${vec([a, b])} + c_2 ${vec([-b, a])}$. The basis vectors are $\mathbf{q}_i$, already of length 1.` },
        ],
        stepByStepSolution: [
          r`In an orthonormal basis $c_i = \mathbf{v}\cdot\mathbf{q}_i$.`,
          r`$c_1 = \tfrac{1}{${c}}(${v[0]}\cdot ${paren(a)} + ${paren(v[1])}\cdot ${paren(b)}) = \tfrac{${k1 * c * c}}{${c}} = ${k1 * c}$, $\ c_2 = \tfrac{1}{${c}}(${v[0]}\cdot ${paren(-b)} + ${paren(v[1])}\cdot ${paren(a)}) = ${k2 * c}$.`,
          r`Check: $${k1 * c}\mathbf{q}_1 ${k2 < 0 ? '-' : '+'} ${Math.abs(k2 * c)}\mathbf{q}_2 = ${coef(k1)}${vec([a, b])} ${k2 < 0 ? '-' : '+'} ${coef(Math.abs(k2))}${vec([-b, a])} = ${vec(v)}$. ✓`,
        ],
      };
    },
  },
  {
    id: 'la-08-4',
    difficulty: 2,
    keyConceptTag: 'Inverse of an orthogonal matrix',
    correctOptionId: 'a',
    generate: (g) => {
      const { a, b, c } = legs(g, PYTHAGOREAN.slice(0, 3));
      const M = [[a, -b], [b, a]];
      const Mt = [[a, b], [-b, a]];
      const f = (A: number[][]) => A.flat().map((x) => x / c);
      const lab = (A: number[][], k = c) => `$\\tfrac{1}{${k}}${pm(A)}$`;
      return {
        params: { M, c },
        promptText: r`The matrix $Q = \tfrac{1}{${c}}${pm(M)}$ is orthogonal. What is $Q^{-1}$?`,
        options: [
          { id: 'a', label: lab(Mt), value: f(Mt) },
          { id: 'b', label: lab(M), value: f(M), trapExplanation: r`That is $Q$ itself. $Q$ is a rotation, and $Q \cdot Q$ rotates twice instead of undoing it.` },
          { id: 'c', label: `$${pm(Mt)}$`, value: Mt.flat(), trapExplanation: r`The factor $\tfrac{1}{${c}}$ belongs to $Q^T$ too: without it $Q$ times this matrix is $${c}I$, not $I$.` },
          { id: 'd', label: lab(Mt.map((row) => row.map((x) => -x))), value: f(Mt).map((x) => -x), trapExplanation: r`That is $-Q^T$, and $Q(-Q^T) = -I$. The inverse is $Q^T$ itself.` },
        ],
        stepByStepSolution: [
          r`The columns $\tfrac{1}{${c}}${vec([a, b])}$ and $\tfrac{1}{${c}}${vec([-b, a])}$ are perpendicular and have length $\tfrac{\sqrt{${a * a} + ${b * b}}}{${c}} = 1$.`,
          r`So $Q$ is orthogonal and $Q^{-1} = Q^T$: no determinant or adjugate needed.`,
          r`Transpose: $Q^{-1} = \tfrac{1}{${c}}${pm(Mt)}$.`,
        ],
      };
    },
  },
  {
    id: 'la-08-5',
    difficulty: 3,
    keyConceptTag: 'Gram–Schmidt step',
    correctOptionId: 'a',
    generate: (g) => {
      const { v1, w, t } = g.until(
        () => ({ v1: ints(g, 3, -2, 2), w: ints(g, 3, -3, 3), t: g.nonzero(-2, 2) }),
        ({ v1, w, t }) => {
          const n = dot(v1, v1);
          if (n < 2 || dot(w, w) === 0 || dot(v1, w) !== 0) return false;
          const v2 = add(times(t, v1), w);
          return v2.every((x) => Math.abs(x) <= 9) && allDistinct([w, times(t, v1), add(v2, times(t, v1)), sub(v2, times(dot(v2, v1), v1))]);
        },
      );
      const v2 = add(times(t, v1), w);
      const n = dot(v1, v1);
      const s = dot(v2, v1);
      return {
        params: { v1, v2 },
        promptText: r`Gram–Schmidt starts with $\mathbf{u}_1 = \mathbf{v}_1 = ${vec(v1)}$. What is $\mathbf{u}_2$ for $\mathbf{v}_2 = ${vec(v2)}$?`,
        options: [
          { id: 'a', label: `$${vec(w)}$`, value: w },
          { id: 'b', label: `$${vec(times(t, v1))}$`, value: times(t, v1), trapExplanation: r`That is the component of $\mathbf{v}_2$ along $\mathbf{u}_1$, the part Gram–Schmidt removes. $\mathbf{u}_2$ is what is left after subtracting it.` },
          { id: 'c', label: `$${vec(add(v2, times(t, v1)))}$`, value: add(v2, times(t, v1)), trapExplanation: r`The projection is subtracted, not added. Check: this vector's dot product with $\mathbf{u}_1$ is $${dot(add(v2, times(t, v1)), v1)} \ne 0$.` },
          { id: 'd', label: `$${vec(sub(v2, times(s, v1)))}$`, value: sub(v2, times(s, v1)), trapExplanation: r`The coefficient is $\frac{\mathbf{v}_2\cdot\mathbf{u}_1}{\mathbf{u}_1\cdot\mathbf{u}_1} = \frac{${s}}{${n}}$, not $\mathbf{v}_2\cdot\mathbf{u}_1 = ${s}$: $\mathbf{u}_1$ is not a unit vector.` },
        ],
        stepByStepSolution: [
          r`$\mathbf{v}_2\cdot\mathbf{u}_1 = ${s}$ and $\mathbf{u}_1\cdot\mathbf{u}_1 = ${n}$, so the coefficient is $\frac{${s}}{${n}} = ${t}$.`,
          r`$\mathbf{u}_2 = \mathbf{v}_2 - ${paren(t)}\,\mathbf{u}_1 = ${vec(v2)} - ${vec(times(t, v1))} = ${vec(w)}$.`,
          r`Check: $\mathbf{u}_2\cdot\mathbf{u}_1 = ${dot(w, v1)}$. ✓`,
        ],
      };
    },
  },
  {
    id: 'la-08-6',
    difficulty: 3,
    keyConceptTag: 'Orthogonal matrices preserve lengths',
    correctOptionId: 'a',
    generate: (g) => {
      const { p, q, m } = g.until(
        () => ({ p: g.int(2, 9), q: g.int(2, 9), m: g.int(1, 12) }),
        ({ p, q, m }) => {
          const twoS = p * p + q * q - m * m;
          return twoS % 2 === 0 && twoS !== 0 && Math.abs(p - q) < m && m < p + q && allDistinct([m, Math.abs(p - q), Math.sqrt(p * p + q * q), m * m]);
        },
      );
      const s = (p * p + q * q - m * m) / 2;
      const N = p * p + q * q;
      return {
        params: { p, q, s },
        promptText: r`$Q$ is an orthogonal matrix. The vectors $\mathbf{x}$ and $\mathbf{y}$ have $\|\mathbf{x}\| = ${p}$, $\|\mathbf{y}\| = ${q}$ and $\mathbf{x}\cdot\mathbf{y} = ${s}$. What is $\|Q\mathbf{x} - Q\mathbf{y}\|$?`,
        options: [
          { id: 'a', label: `$${m}$`, value: m },
          { id: 'b', label: `$${Math.abs(p - q)}$`, value: Math.abs(p - q), trapExplanation: r`$\|\mathbf{x} - \mathbf{y}\| = \big|\|\mathbf{x}\| - \|\mathbf{y}\|\big|$ only when the vectors point the same way. Expand $\|\mathbf{x} - \mathbf{y}\|^2$ instead.` },
          { id: 'c', label: `$${sqrtTex(N)}$`, value: Math.sqrt(N), trapExplanation: r`$\sqrt{${p}^2 + ${q}^2}$ drops the cross term $-2\,\mathbf{x}\cdot\mathbf{y} = ${-2 * s}$; it is right only for perpendicular vectors.` },
          { id: 'd', label: `$${m * m}$`, value: m * m, trapExplanation: r`${m * m} is $\|\mathbf{x} - \mathbf{y}\|^2$. Take the square root.` },
        ],
        stepByStepSolution: [
          r`$Q\mathbf{x} - Q\mathbf{y} = Q(\mathbf{x} - \mathbf{y})$, and an orthogonal $Q$ keeps lengths: the answer is $\|\mathbf{x} - \mathbf{y}\|$, whatever $Q$ is.`,
          r`$\|\mathbf{x} - \mathbf{y}\|^2 = \|\mathbf{x}\|^2 - 2\,\mathbf{x}\cdot\mathbf{y} + \|\mathbf{y}\|^2 = ${p * p} - ${paren(2 * s)} + ${q * q} = ${m * m}$.`,
          r`$\|Q\mathbf{x} - Q\mathbf{y}\| = \sqrt{${m * m}} = ${m}$.`,
        ],
      };
    },
  },
];
