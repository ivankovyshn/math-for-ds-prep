import type { QuestionTemplate } from '../../../types.ts';
import { r } from '../define.ts';
import { allDistinct, coef, frac, mv, paren, pm, poly } from '../gen.ts';
import { kindOf, kindOptions } from '../calculus/07-jacobian-hessian.practice.ts';

/** "(a, b)" from numbers or fractions p/d. */
export const pt = (v: number[], d = 1) => `$(${v.map((x) => frac(x, d)).join(',\\ ')})$`;

export const practice: QuestionTemplate[] = [
  {
    id: 'op-05-1',
    difficulty: 1,
    keyConceptTag: 'The first-order condition',
    correctOptionId: 'a',
    generate: (g) => {
      const { a, b, c } = g.until(
        () => ({ a: g.int(1, 5), b: g.nonzero(-12, 12), c: g.int(-5, 5) }),
        ({ a, b, c }) => allDistinct([-b / (2 * a), b / (2 * a), -b / a, c - (b * b) / (4 * a)].map((x) => Math.round(x * 1e6))),
      );
      return {
        params: { a, b, c },
        promptText: r`Where is the minimum of $f(x) = ${poly([c, b, a])}$?`,
        options: [
          { id: 'a', label: `$x = ${frac(-b, 2 * a)}$`, value: -b / (2 * a) },
          { id: 'b', label: `$x = ${frac(b, 2 * a)}$`, value: b / (2 * a), trapExplanation: r`Solve $${2 * a}x ${b < 0 ? '-' : '+'} ${Math.abs(b)} = 0$ carefully: the sign flips.` },
          { id: 'c', label: `$x = ${frac(-b, a)}$`, value: -b / a, trapExplanation: r`$f'(x) = ${2 * a}x ${b < 0 ? '-' : '+'} ${Math.abs(b)}$: the derivative of $${coef(a)}x^2$ is $${2 * a}x$.` },
          { id: 'd', label: `$x = ${frac(4 * a * c - b * b, 4 * a)}$`, value: c - (b * b) / (4 * a), trapExplanation: r`That is the minimum <i>value</i> $f(x^*)$, not the place where it is attained.` },
        ],
        stepByStepSolution: [
          r`$f'(x) = ${poly([b, 2 * a])} = 0$.`,
          r`$x^* = ${frac(-b, 2 * a)}$.`,
          r`$f''(x) = ${2 * a} > 0$, so this is the global minimum (the function is convex).`,
        ],
      };
    },
  },
  {
    id: 'op-05-2',
    difficulty: 1,
    keyConceptTag: 'The second-order test',
    correctOptionId: 'a',
    generate: (g) => {
      const { a, b, c } = g.until(() => ({ a: g.nonzero(-4, 4), b: g.int(-6, 6), c: g.nonzero(-4, 4) }), ({ a, b, c }) => 4 * a * c - b * b !== 0);
      const det = 4 * a * c - b * b;
      const kind = kindOf(2 * a, det);
      const { order, options } = kindOptions(g, kind, 2 * a, det);
      const fxy = `${coef(a)}x^2 ${b === 0 ? '' : `${b < 0 ? '-' : '+'} ${coef(Math.abs(b))}xy `}${c < 0 ? '-' : '+'} ${coef(Math.abs(c))}y^2`;
      return {
        params: { a, b, c, order },
        promptText: r`The origin is a stationary point of $f(x, y) = ${fxy}$. What kind of point is it?`,
        options,
        stepByStepSolution: [
          r`$H = \begin{pmatrix} ${2 * a} & ${b} \\ ${b} & ${2 * c} \end{pmatrix}$, constant.`,
          r`$\det H = ${2 * a}\cdot${paren(2 * c)} - ${paren(b)}^2 = ${det}$ and $f_{xx} = ${2 * a}$.`,
          r`${['$\\det H > 0$ and $f_{xx} > 0$: a local (here global) minimum.', '$\\det H > 0$ and $f_{xx} < 0$: a maximum.', '$\\det H < 0$: a saddle point.', ''][kind]}`,
        ],
      };
    },
  },
  {
    id: 'op-05-3',
    difficulty: 2,
    keyConceptTag: 'Minimising a quadratic',
    correctOptionId: 'a',
    generate: (g) => {
      const { A, x } = g.until(
        () => {
          const p = g.int(1, 5);
          const q = g.int(1, 5);
          const rr = g.int(-2, 2);
          return { A: [[p, rr], [rr, q]], x: [g.nonzero(-3, 3), g.nonzero(-3, 3)] };
        },
        ({ A, x }) => {
          const b = mv(A, x);
          return A[0][0] * A[1][1] - A[0][1] ** 2 > 0 && A[0][1] !== 0 && allDistinct([x, x.map((t) => -t), [b[0] / A[0][0], b[1] / A[1][1]], mv(A, b)]);
        },
      );
      const b = mv(A, x);
      const Ab = mv(A, b);
      return {
        params: { A, b },
        promptText: r`Minimise $f(x) = \tfrac12 x^\top Ax - b^\top x$ with $A = ${pm(A)}$ (positive definite) and $b = (${b[0]}, ${b[1]})$.`,
        options: [
          { id: 'a', label: pt(x), value: x },
          { id: 'b', label: pt(x.map((t) => -t)), value: x.map((t) => -t), trapExplanation: r`$\nabla f = Ax - b = 0$ gives $Ax = +b$.` },
          { id: 'c', label: `$(${frac(b[0], A[0][0])},\\ ${frac(b[1], A[1][1])})$`, value: [b[0] / A[0][0], b[1] / A[1][1]], trapExplanation: r`Dividing by the diagonal ignores the coupling ${A[0][1]}; solve the full system $Ax = b$.` },
          { id: 'd', label: pt(Ab), value: Ab, trapExplanation: r`That is $Ab$; the minimiser is $A^{-1}b$.` },
        ],
        stepByStepSolution: [
          r`$\nabla f = Ax - b = 0$, and $A$ positive definite makes this the global minimum.`,
          r`Solve $${A[0][0]}x_1 ${A[0][1] < 0 ? '-' : '+'} ${Math.abs(A[0][1])}x_2 = ${b[0]}$ and $${A[1][0]}x_1 ${A[1][1] < 0 ? '-' : '+'} ${Math.abs(A[1][1])}x_2 = ${b[1]}$.`,
          r`$x^* = (${x[0]}, ${x[1]})$; check: $A x^* = (${b[0]}, ${b[1]})$.`,
        ],
      };
    },
  },
  {
    id: 'op-05-4',
    difficulty: 2,
    keyConceptTag: 'A constraint that may or may not bind',
    correctOptionId: 'a',
    generate: (g) => {
      const { a, b, up } = g.until(
        () => ({ a: g.nonzero(-6, 8), b: g.int(-4, 6), up: g.pick([true, false]) }),
        ({ a, b, up }) => {
          const xs = up ? Math.min(a, b) : Math.max(a, b);
          return a !== b && allDistinct([xs, xs === a ? b : a, (a + b) / 2, 2 * b - a]);
        },
      );
      const xs = up ? Math.min(a, b) : Math.max(a, b);
      const active = xs === b;
      return {
        params: { a, b, up: up ? 1 : 0 },
        promptText: r`Minimise $(x ${a < 0 ? '+' : '-'} ${Math.abs(a)})^2$ subject to $x ${up ? r`\le` : r`\ge`} ${b}$.`,
        options: [
          { id: 'a', label: `$${xs}$`, value: xs },
          { id: 'b', label: `$${active ? a : b}$`, value: active ? a : b, trapExplanation: active ? r`$x = ${a}$ is the free minimum, but it violates $x ${up ? r`\le` : r`\ge`} ${b}$.` : r`The free minimum ${a} is feasible, so the constraint does not bind.` },
          { id: 'c', label: `$${frac(a + b, 2)}$`, value: (a + b) / 2, trapExplanation: r`Nothing splits the difference: the optimum is the feasible point closest to ${a}.` },
          { id: 'd', label: `$${2 * b - a}$`, value: 2 * b - a, trapExplanation: r`Reflecting ${a} across the boundary moves away from it; the best feasible point is ${xs}.` },
        ],
        stepByStepSolution: [
          r`Without the constraint the minimum is at $x = ${a}$.`,
          active ? r`$${a}$ violates $x ${up ? r`\le` : r`\ge`} ${b}$, so the constraint is active: the closest feasible point is the boundary.` : r`$${a}$ satisfies $x ${up ? r`\le` : r`\ge`} ${b}$: the constraint is inactive ($\mu = 0$).`,
          r`$x^* = ${xs}$.`,
        ],
      };
    },
  },
  {
    id: 'op-05-5',
    difficulty: 3,
    keyConceptTag: 'The KKT multiplier',
    correctOptionId: 'a',
    generate: (g) => {
      const { a, b } = g.until(() => ({ a: g.nonzero(-2, 9), b: g.int(-5, 6) }), ({ a, b }) => a > b);
      const mu = 2 * (a - b);
      return {
        params: { a, b },
        promptText: r`Minimise $f(x) = (x ${a < 0 ? '+' : '-'} ${Math.abs(a)})^2$ subject to $h(x) = x - ${paren(b)} \le 0$. With KKT conditions $f'(x) + \mu h'(x) = 0$, $\mu \ge 0$, what is $\mu$ at the optimum?`,
        options: [
          { id: 'a', label: `$${mu}$`, value: mu },
          { id: 'b', label: `$${a - b}$`, value: a - b, trapExplanation: r`$f'(x) = 2(x ${a < 0 ? '+' : '-'} ${Math.abs(a)})$: the factor 2 is part of the gradient.` },
          { id: 'c', label: `$${-mu}$`, value: -mu, trapExplanation: r`A KKT multiplier is never negative; $\mu = -f'(x^*)$ here, and $f'(${b}) = ${-mu} < 0$.` },
          { id: 'd', label: '$0$', value: 0, trapExplanation: r`$\mu = 0$ only for an inactive constraint, but the free minimum ${a} is infeasible.` },
        ],
        stepByStepSolution: [
          r`The free minimum $x = ${a}$ violates $x \le ${b}$, so $x^* = ${b}$ and the constraint is active.`,
          r`$f'(${b}) = 2(${b} - ${paren(a)}) = ${-mu}$ and $h' = 1$.`,
          r`$${-mu} + \mu = 0$ gives $\mu = ${mu} \ge 0$: loosening the bound by $\delta$ would lower $f^*$ by about $${mu}\delta$.`,
        ],
      };
    },
  },
  {
    id: 'op-05-6',
    difficulty: 3,
    keyConceptTag: 'Non-negativity constraints',
    correctOptionId: 'a',
    generate: (g) => {
      const { a, b } = g.until(
        () => ({ a: g.nonzero(-6, 6), b: g.nonzero(-6, 6) }),
        ({ a, b }) => (a < 0 || b < 0) && allDistinct([[Math.max(a, 0), Math.max(b, 0)], [a, b], [Math.abs(a), Math.abs(b)], [0, 0]]),
      );
      const sol = [Math.max(a, 0), Math.max(b, 0)];
      return {
        params: { a, b },
        promptText: r`Minimise $(x ${a < 0 ? '+' : '-'} ${Math.abs(a)})^2 + (y ${b < 0 ? '+' : '-'} ${Math.abs(b)})^2$ subject to $x \ge 0$ and $y \ge 0$.`,
        options: [
          { id: 'a', label: pt(sol), value: sol },
          { id: 'b', label: pt([a, b]), value: [a, b], trapExplanation: r`That is the free minimum, but it has a negative coordinate.` },
          { id: 'c', label: pt([Math.abs(a), Math.abs(b)]), value: [Math.abs(a), Math.abs(b)], trapExplanation: r`Flipping the sign moves far away; the closest feasible value of a negative target is 0.` },
          { id: 'd', label: pt([0, 0]), value: [0, 0], trapExplanation: r`Only the coordinate whose target is negative is pushed to the boundary.` },
        ],
        stepByStepSolution: [
          r`The problem separates: minimise each square over its own half-line.`,
          r`A target $\ge 0$ is feasible and kept; a negative target is replaced by the boundary 0 (active constraint, $\mu > 0$).`,
          r`$(x^*, y^*) = (${sol[0]}, ${sol[1]})$: the free minimum clipped to the feasible box.`,
        ],
      };
    },
  },
];
