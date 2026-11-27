import type { QuestionTemplate } from '../../../types.ts';
import { r } from '../define.ts';
import { allDistinct, coef, frac, paren, pm } from '../gen.ts';
import { symFrom } from '../linalg/10-spectral.practice.ts';

/** "(a, b)" with fractions p/d. */
export const fv = (ps: number[], d = 1) => `$(${ps.map((p) => frac(p, d)).join(',\\ ')})$`;
/** "px + qy" with tidy signs and unit coefficients. */
export const linXY = (p: number, q: number) => `${coef(p)}x ${q < 0 ? '-' : '+'} ${coef(Math.abs(q))}y`;

export const practice: QuestionTemplate[] = [
  {
    id: 'op-04-1',
    difficulty: 1,
    keyConceptTag: 'Closest point on a line',
    correctOptionId: 'a',
    generate: (g) => {
      const { p, q, t } = g.until(
        () => ({ p: g.nonzero(-3, 3), q: g.nonzero(-3, 3), t: g.nonzero(-3, 3) }),
        ({ p, q, t }) => {
          const c = t * (p * p + q * q);
          return allDistinct([[t * p, t * q], [c / (2 * p), c / (2 * q)], [p, q], [t * q, t * p]]);
        },
      );
      const n = p * p + q * q;
      const c = t * n;
      return {
        params: { p, q, c },
        promptText: r`Which point minimises $f(x, y) = x^2 + y^2$ subject to $${linXY(p, q)} = ${c}$?`,
        options: [
          { id: 'a', label: fv([t * p, t * q]), value: [t * p, t * q] },
          { id: 'b', label: `$(${frac(c, 2 * p)},\\ ${frac(c, 2 * q)})$`, value: [c / (2 * p), c / (2 * q)], trapExplanation: r`That splits the constraint equally between the two terms; it is feasible, but $\nabla f$ is not parallel to $(${p}, ${q})$ there.` },
          { id: 'c', label: fv([p, q]), value: [p, q], trapExplanation: r`$(${p}, ${q})$ is the direction of $\nabla g$; the optimum is a multiple of it that satisfies the constraint.` },
          { id: 'd', label: fv([t * q, t * p]), value: [t * q, t * p], trapExplanation: r`The coordinates are swapped: $\nabla f = (2x, 2y)$ must be parallel to $(${p}, ${q})$.` },
        ],
        stepByStepSolution: [
          r`$\nabla f = (2x, 2y) = \lambda(${p}, ${q})$, so $(x, y) = s\,(${p}, ${q})$ for some $s$.`,
          r`Constraint: $s(${paren(p)}^2 + ${paren(q)}^2) = ${n}s = ${c}$, so $s = ${t}$.`,
          r`$(x, y) = (${t * p}, ${t * q})$: the point of the line closest to the origin.`,
        ],
      };
    },
  },
  {
    id: 'op-04-2',
    difficulty: 1,
    keyConceptTag: 'A product under a fixed sum',
    correctOptionId: 'a',
    generate: (g) => {
      const s = g.pick([4, 6, 8, 10, 12, 14, 16, 20, 30]);
      return {
        params: { s },
        promptText: r`What is the largest value of $xy$ subject to $x + y = ${s}$?`,
        options: [
          { id: 'a', label: `$${(s * s) / 4}$`, value: (s * s) / 4 },
          { id: 'b', label: `$${s * s}$`, value: s * s, trapExplanation: r`That would need $x = y = ${s}$, which breaks $x + y = ${s}$.` },
          { id: 'c', label: `$${(s * s) / 2}$`, value: (s * s) / 2, trapExplanation: r`At the optimum $x = y = ${s / 2}$, so $xy = ${s / 2}^2$.` },
          { id: 'd', label: `$${(s / 2 - 1) * (s / 2 + 1)}$`, value: (s / 2 - 1) * (s / 2 + 1), trapExplanation: r`$${s / 2 - 1}\cdot${s / 2 + 1}$ is feasible but not the best; an equal split gives more.` },
        ],
        stepByStepSolution: [
          r`$\mathcal L = xy - \lambda(x + y - ${s})$: $y = \lambda$ and $x = \lambda$.`,
          r`So $x = y$, and $x + y = ${s}$ gives $x = y = ${s / 2}$.`,
          r`$xy = ${(s * s) / 4}$.`,
        ],
      };
    },
  },
  {
    id: 'op-04-3',
    difficulty: 2,
    keyConceptTag: 'Finding the multiplier',
    correctOptionId: 'a',
    generate: (g) => {
      const { p, q, t } = g.until(() => ({ p: g.nonzero(-3, 3), q: g.nonzero(-3, 3), t: g.nonzero(-3, 3) }), ({ p, q, t }) => allDistinct([2 * t, t, -2 * t, t * (p * p + q * q)]));
      const n = p * p + q * q;
      const c = t * n;
      return {
        params: { p, q, c },
        promptText: r`For $\min\ x^2 + y^2$ subject to $${linXY(p, q)} = ${c}$, with $\mathcal L = f - \lambda(g - c)$, what is the Lagrange multiplier $\lambda$ at the optimum?`,
        options: [
          { id: 'a', label: `$${2 * t}$`, value: 2 * t },
          { id: 'b', label: `$${t}$`, value: t, trapExplanation: r`$(x, y) = ${t}\cdot(${p}, ${q})$, but $\nabla f = (2x, 2y)$ is twice that.` },
          { id: 'c', label: `$${-2 * t}$`, value: -2 * t, trapExplanation: r`With $\mathcal L = f - \lambda(g - c)$ the condition is $\nabla f = +\lambda\nabla g$.` },
          { id: 'd', label: `$${c}$`, value: c, trapExplanation: r`$\lambda$ is the factor between the gradients, not the constraint level.` },
        ],
        stepByStepSolution: [
          r`The optimum is $(x, y) = (${t * p}, ${t * q})$.`,
          r`$\nabla f = (${2 * t * p}, ${2 * t * q})$ and $\nabla g = (${p}, ${q})$.`,
          r`$\nabla f = ${2 * t}\,\nabla g$, so $\lambda = ${2 * t}$; it equals $\frac{df^*}{dc}$ for $f^* = \frac{c^2}{${n}}$.`,
        ],
      };
    },
  },
  {
    id: 'op-04-4',
    difficulty: 2,
    keyConceptTag: 'Weighted costs under a constraint',
    correctOptionId: 'a',
    generate: (g) => {
      const { a, b, k } = g.until(() => ({ a: g.int(1, 5), b: g.int(1, 5), k: g.int(1, 4) }), ({ a, b }) => a !== b);
      const c = k * (a + b);
      const opt = (v: number[]) => ({ label: fv(v), value: v });
      return {
        params: { a, b, c },
        promptText: r`Two machines produce $x$ and $y$ units with costs $${coef(a)}x^2$ and $${coef(b)}y^2$. Which split minimises the total cost if $x + y = ${c}$?`,
        options: [
          { id: 'a', ...opt([k * b, k * a]) },
          { id: 'b', ...opt([k * a, k * b]), trapExplanation: r`The cheaper machine should produce <i>more</i>: at the optimum $${2 * a}x = ${2 * b}y$, so $x : y = ${b} : ${a}$.` },
          { id: 'c', label: fv([c, c], 2), value: [c / 2, c / 2], trapExplanation: r`An equal split ignores that the costs differ; the marginal costs $${2 * a}x$ and $${2 * b}y$ must be equal.` },
          { id: 'd', ...opt([a < b ? c : 0, a < b ? 0 : c]), trapExplanation: r`Putting everything on the cheaper machine makes its marginal cost too high; quadratic costs favour sharing.` },
        ],
        stepByStepSolution: [
          r`$\nabla f = (${2 * a}x, ${2 * b}y) = \lambda(1, 1)$: the marginal costs are equal, $${2 * a}x = ${2 * b}y$.`,
          r`So $x : y = ${b} : ${a}$; with $x + y = ${c}$: $x = ${c}\cdot\frac{${b}}{${a + b}}$.`,
          r`$(x, y) = (${k * b}, ${k * a})$.`,
        ],
      };
    },
  },
  {
    id: 'op-04-5',
    difficulty: 3,
    keyConceptTag: 'The multiplier as a shadow price',
    correctOptionId: 'a',
    generate: (g) => {
      const c0 = g.int(2, 12);
      const d = g.pick([0.1, 0.2, 0.25]);
      const f0 = (c0 * c0) / 2;
      const v = (x: number) => Math.round(x * 1e6) / 1e6;
      return {
        params: { c0, d },
        promptText: r`For $\min\ x^2 + y^2$ subject to $x + y = c$, the optimum at $c = ${c0}$ is $f^* = ${f0}$ with multiplier $\lambda = ${c0}$. Use $\lambda$ to estimate $f^*$ for $c = ${v(c0 + d)}$.`,
        options: [
          { id: 'a', label: `$${v(f0 + c0 * d)}$`, value: v(f0 + c0 * d) },
          { id: 'b', label: `$${v(f0 + 2 * c0 * d)}$`, value: v(f0 + 2 * c0 * d), trapExplanation: r`$\lambda = ${c0}$ already is the rate $\frac{df^*}{dc}$; do not double it.` },
          { id: 'c', label: `$${v(f0 + d)}$`, value: v(f0 + d), trapExplanation: r`The change is $\lambda$ times $\Delta c$, not $\Delta c$ alone.` },
          { id: 'd', label: `$${v(f0 + c0)}$`, value: v(f0 + c0), trapExplanation: r`$\lambda$ is the change per <i>unit</i> of $c$; here $c$ grows by only ${d}.` },
        ],
        stepByStepSolution: [
          r`$\frac{df^*}{dc} = \lambda = ${c0}$.`,
          r`$\Delta f^* \approx \lambda\,\Delta c = ${c0}\cdot${d} = ${v(c0 * d)}$.`,
          r`$f^* \approx ${f0} + ${v(c0 * d)} = ${v(f0 + c0 * d)}$ (exactly $\frac{${v(c0 + d)}^2}{2} = ${v((c0 + d) ** 2 / 2)}$).`,
        ],
      };
    },
  },
  {
    id: 'op-04-6',
    difficulty: 3,
    keyConceptTag: 'PCA as a constrained problem',
    correctOptionId: 'a',
    generate: (g) => {
      const { A, l1, l2 } = g.until(() => symFrom(g, undefined, [1, 2], [1, 2, 3, 4]), ({ A, l1, l2 }) => allDistinct([l1, l2, A[0][0] + A[1][1], Math.max(A[0][0], A[1][1])]));
      return {
        params: { A },
        promptText: r`A covariance matrix is $\Sigma = ${pm(A)}$. What is the largest value of the variance $u^\top\Sigma u$ over unit vectors $u$ ($u^\top u = 1$)?`,
        options: [
          { id: 'a', label: `$${l1}$`, value: l1 },
          { id: 'b', label: `$${l2}$`, value: l2, trapExplanation: r`${l2} is the <i>smallest</i> eigenvalue, the minimum of $u^\top\Sigma u$.` },
          { id: 'c', label: `$${A[0][0] + A[1][1]}$`, value: A[0][0] + A[1][1], trapExplanation: r`The trace is the total variance over both directions, not the variance along one.` },
          { id: 'd', label: `$${Math.max(A[0][0], A[1][1])}$`, value: Math.max(A[0][0], A[1][1]), trapExplanation: r`That is the variance along a coordinate axis; a tilted direction does better because of the covariance ${A[0][1]}.` },
        ],
        stepByStepSolution: [
          r`$\mathcal L = u^\top\Sigma u - \lambda(u^\top u - 1)$; $\nabla_u\mathcal L = 2\Sigma u - 2\lambda u = 0$: $u$ is an eigenvector.`,
          r`Then $u^\top\Sigma u = \lambda u^\top u = \lambda$. The eigenvalues are ${l1} and ${l2} (trace ${A[0][0] + A[1][1]}, determinant ${l1 * l2}).`,
          r`The maximum is the top eigenvalue ${l1}, attained along $u \propto (${A[0][1]}, ${l1 - A[0][0]})$.`,
        ],
      };
    },
  },
];
