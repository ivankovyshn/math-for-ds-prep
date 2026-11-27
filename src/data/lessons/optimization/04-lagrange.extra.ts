import type { QuestionTemplate } from '../../../types.ts';
import { r } from '../define.ts';
import { allDistinct, frac, paren, PYTHAGOREAN } from '../gen.ts';
import { fv, linXY } from './04-lagrange.practice.ts';

/** Extra practice (Practice 2): gentler questions on the same ideas, with new numbers every time. */
export const extra: QuestionTemplate[] = [
  {
    id: 'op-04-x1',
    difficulty: 1,
    keyConceptTag: 'Closest point on a line',
    correctOptionId: 'a',
    generate: (g) => {
      const c = g.nonzero(-12, 12);
      return {
        params: { c },
        promptText: r`Which point minimises $x^2 + y^2$ subject to $x + y = ${c}$?`,
        options: [
          { id: 'a', label: fv([c, c], 2), value: [c / 2, c / 2] },
          { id: 'b', label: fv([c, 0]), value: [c, 0], trapExplanation: r`Feasible, but $f(${c}, 0) = ${c * c}$ is larger than $f$ at the equal split.` },
          { id: 'c', label: fv([0, 0]), value: [0, 0], trapExplanation: r`$(0, 0)$ does not satisfy $x + y = ${c}$.` },
          { id: 'd', label: fv([c, c]), value: [c, c], trapExplanation: r`$${c} + ${paren(c)} \ne ${c}$: the constraint fails.` },
        ],
        stepByStepSolution: [
          r`$\nabla f = (2x, 2y) = \lambda(1, 1)$ gives $x = y$.`,
          r`$2x = ${c}$.`,
          r`$(x, y) = ${fv([c, c], 2).slice(1, -1)}$.`,
        ],
      };
    },
  },
  {
    id: 'op-04-x2',
    difficulty: 1,
    keyConceptTag: 'Parallel gradients',
    correctOptionId: 'a',
    generate: (g) => {
      const { a, b, l } = g.until(() => ({ a: g.nonzero(-4, 4), b: g.nonzero(-4, 4), l: g.nonzero(-5, 5) }), ({ a, b, l }) => Math.abs(l) !== 1 && allDistinct([l, 1 / l, -l, l * (a + b)]));
      return {
        params: { a, b, l },
        promptText: r`At a constrained optimum, $\nabla f = (${l * a}, ${l * b})$ and $\nabla g = (${a}, ${b})$. What is the Lagrange multiplier $\lambda$ in $\nabla f = \lambda\nabla g$?`,
        options: [
          { id: 'a', label: `$${l}$`, value: l },
          { id: 'b', label: `$${frac(1, l)}$`, value: 1 / l, trapExplanation: r`That solves $\nabla g = \lambda\nabla f$, the reverse relation.` },
          { id: 'c', label: `$${-l}$`, value: -l, trapExplanation: r`Compare the components with their signs: $${l * a} = \lambda\cdot${a < 0 ? `(${a})` : a}$.` },
          { id: 'd', label: `$${l * (a + b)}$`, value: l * (a + b), trapExplanation: r`$\lambda$ is a scale factor between the vectors, not a sum of components.` },
        ],
        stepByStepSolution: [
          r`First components: $${l * a} = \lambda\cdot${a < 0 ? `(${a})` : a}$.`,
          r`Second components: $${l * b} = \lambda\cdot${b < 0 ? `(${b})` : b}$.`,
          r`Both give $\lambda = ${l}$.`,
        ],
      };
    },
  },
  {
    id: 'op-04-x3',
    difficulty: 2,
    keyConceptTag: 'A product under a budget',
    correctOptionId: 'a',
    generate: (g) => {
      const { a, b, s } = g.until(() => ({ a: g.int(1, 4), b: g.int(1, 4), s: g.pick([4, 6, 8, 12, 24]) }), ({ a, b, s }) => a * b > 1 && allDistinct([(s * s) / (4 * a * b), (s * s) / 4, (s * s) / (2 * a * b), (s * s) / (a * b)]));
      return {
        params: { a, b, s },
        promptText: r`Maximise $xy$ subject to $${linXY(a, b)} = ${s}$ (with $x, y > 0$). What is the maximum?`,
        options: [
          { id: 'a', label: `$${frac(s * s, 4 * a * b)}$`, value: (s * s) / (4 * a * b) },
          { id: 'b', label: `$${frac(s * s, 4)}$`, value: (s * s) / 4, trapExplanation: r`That ignores the weights ${a} and ${b} in the constraint.` },
          { id: 'c', label: `$${frac(s * s, 2 * a * b)}$`, value: (s * s) / (2 * a * b), trapExplanation: r`At the optimum each term uses half the budget: $${a}x = ${b}y = ${frac(s, 2)}$.` },
          { id: 'd', label: `$${frac(s * s, a * b)}$`, value: (s * s) / (a * b), trapExplanation: r`That would need $${a}x = ${b}y = ${s}$, twice the budget.` },
        ],
        stepByStepSolution: [
          r`$\nabla(xy) = (y, x) = \lambda(${a}, ${b})$ gives $y = ${a}\lambda$ and $x = ${b}\lambda$, so $${a}x = ${b}y$: each term gets half the budget.`,
          r`$${a}x = ${b}y = ${frac(s, 2)}$: $x = ${frac(s, 2 * a)}$, $y = ${frac(s, 2 * b)}$.`,
          r`$xy = ${frac(s * s, 4 * a * b)}$.`,
        ],
      };
    },
  },
  {
    id: 'op-04-x4',
    difficulty: 1,
    keyConceptTag: 'Counting the Lagrange equations',
    correctOptionId: 'a',
    generate: (g) => {
      const { n, m } = g.until(() => ({ n: g.int(2, 6), m: g.int(1, 3) }), ({ n, m }) => m < n && allDistinct([n + m, n, n * m, n - m]));
      return {
        params: { n, m },
        promptText: r`A problem has ${n} variables and ${m} equality constraint${m === 1 ? '' : 's'}, each with its own multiplier. How many equations does $\nabla\mathcal L = 0$ give?`,
        options: [
          { id: 'a', label: `$${n + m}$`, value: n + m },
          { id: 'b', label: `$${n}$`, value: n, trapExplanation: r`The derivatives with respect to the ${m} multiplier${m === 1 ? '' : 's'} add the constraints themselves.` },
          { id: 'c', label: `$${n * m}$`, value: n * m, trapExplanation: r`Each variable and each multiplier gives one equation: add, do not multiply.` },
          { id: 'd', label: `$${n - m}$`, value: n - m, trapExplanation: r`${n - m} is the number of free directions on the constraint set, not the number of equations.` },
        ],
        stepByStepSolution: [
          r`$\mathcal L$ depends on ${n} variables and ${m} multiplier${m === 1 ? '' : 's'}.`,
          r`One equation per variable ($\nabla f = \sum\lambda_j\nabla g_j$) and one per multiplier ($g_j = c_j$).`,
          r`${n} + ${m} = ${n + m} equations for ${n + m} unknowns.`,
        ],
      };
    },
  },
  {
    id: 'op-04-x5',
    difficulty: 2,
    keyConceptTag: 'Optimising on a circle',
    correctOptionId: 'a',
    generate: (g) => {
      const [p, q, h] = g.pick(PYTHAGOREAN);
      const R = g.int(2, 5);
      const [a, b] = g.pick([[p, q], [q, p]]);
      return {
        params: { a, b, R },
        promptText: r`What is the largest value of $${linXY(a, b)}$ subject to $x^2 + y^2 = ${R * R}$?`,
        options: [
          { id: 'a', label: `$${R * h}$`, value: R * h },
          { id: 'b', label: `$${R * (a + b)}$`, value: R * (a + b), trapExplanation: r`That needs $x = y = ${R}$, which is not on the circle.` },
          { id: 'c', label: `$${h}$`, value: h, trapExplanation: r`That is the maximum on the <i>unit</i> circle; the radius here is ${R}.` },
          { id: 'd', label: `$${R * R * h}$`, value: R * R * h, trapExplanation: r`The value scales with the radius ${R}, not with $r^2 = ${R * R}$.` },
        ],
        stepByStepSolution: [
          r`$\nabla f = (${a}, ${b}) = \lambda(2x, 2y)$: the optimum points along $(${a}, ${b})$.`,
          r`On the circle of radius ${R}: $(x, y) = \frac{${R}}{${h}}(${a}, ${b})$, since $|(${a}, ${b})| = ${h}$.`,
          r`$f = \frac{${R}}{${h}}(${a * a} + ${b * b}) = ${R}\cdot${h} = ${R * h}$.`,
        ],
      };
    },
  },
  {
    id: 'op-04-x6',
    difficulty: 2,
    keyConceptTag: 'The first principal direction',
    correctOptionId: 'a',
    generate: (g) => {
      const { d1, d2 } = g.until(() => ({ d1: g.int(1, 9), d2: g.int(1, 9) }), ({ d1, d2 }) => d1 !== d2);
      const top = d1 > d2 ? [1, 0] : [0, 1];
      const other = d1 > d2 ? [0, 1] : [1, 0];
      const s = r`\tfrac{1}{\sqrt2}`;
      return {
        params: { d1, d2 },
        promptText: r`A covariance matrix is $\Sigma = \operatorname{diag}(${d1}, ${d2})$. Which unit vector $u$ maximises the variance $u^\top\Sigma u$?`,
        options: [
          { id: 'a', label: fv(top), value: top },
          { id: 'b', label: fv(other), value: other, trapExplanation: r`Along $${fv(other).slice(1, -1)}$ the variance is only ${Math.min(d1, d2)}.` },
          { id: 'c', label: `$(${s},\\ ${s})$`, value: [Math.SQRT1_2, Math.SQRT1_2], trapExplanation: r`The diagonal direction averages the two variances: $\frac{${d1} + ${d2}}{2}$.` },
          { id: 'd', label: `$(${s},\\ -${s})$`, value: [Math.SQRT1_2, -Math.SQRT1_2], trapExplanation: r`With no covariance, a tilted direction mixes in the smaller variance.` },
        ],
        stepByStepSolution: [
          r`Lagrange: $\Sigma u = \lambda u$, so $u$ is an eigenvector; the variance is then $\lambda$.`,
          r`A diagonal $\Sigma$ has eigenvectors $(1, 0)$ and $(0, 1)$ with eigenvalues ${d1} and ${d2}.`,
          r`The larger is ${Math.max(d1, d2)}: $u = ${fv(top).slice(1, -1)}$.`,
        ],
      };
    },
  },
];
