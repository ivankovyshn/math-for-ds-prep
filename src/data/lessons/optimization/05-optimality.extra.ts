import type { QuestionTemplate } from '../../../types.ts';
import { r } from '../define.ts';
import { allDistinct, coef, frac, poly, shuffle } from '../gen.ts';
import { pt } from './05-optimality.practice.ts';

/** 1D second-derivative verdicts. */
const VERDICTS = ['A local minimum', 'A local maximum', 'The test is inconclusive', 'Not a stationary point'];
/** KKT situations for min (x − a)² subject to x ≥ b. */
const KKT = [
  'Active: $x^* = b$ and $\\mu > 0$',
  'Inactive: $x^* = a$ and $\\mu = 0$',
  'Active: $x^* = b$ and $\\mu = 0$',
  'Inactive: $x^* = a$ and $\\mu > 0$',
];

/** Extra practice (Practice 2): gentler questions on the same ideas, with new numbers every time. */
export const extra: QuestionTemplate[] = [
  {
    id: 'op-05-x1',
    difficulty: 1,
    keyConceptTag: 'The first-order condition',
    correctOptionId: 'a',
    generate: (g) => {
      const { a, p } = g.until(() => ({ a: g.int(1, 4), p: g.nonzero(-6, 6) }), ({ a, p }) => allDistinct([p, -p, -2 * a * p, 2 * p]));
      return {
        params: { a, p },
        promptText: r`At which $x$ is $f'(x) = 0$ for $f(x) = ${poly([0, -2 * a * p, a])}$?`,
        options: [
          { id: 'a', label: `$${p}$`, value: p },
          { id: 'b', label: `$${-p}$`, value: -p, trapExplanation: r`$f'(x) = ${2 * a}x ${p > 0 ? '-' : '+'} ${Math.abs(2 * a * p)}$; solve for $x$ keeping the sign.` },
          { id: 'c', label: `$${-2 * a * p}$`, value: -2 * a * p, trapExplanation: r`That is the coefficient of $x$, not the root of $f'$.` },
          { id: 'd', label: `$${2 * p}$`, value: 2 * p, trapExplanation: r`Divide by $${2 * a}$, the derivative of $${coef(a)}x^2$ being $${2 * a}x$.` },
        ],
        stepByStepSolution: [
          r`$f'(x) = ${poly([-2 * a * p, 2 * a])}$.`,
          r`$${poly([-2 * a * p, 2 * a])} = 0$.`,
          r`$x = ${p}$, a minimum since $f'' = ${2 * a} > 0$.`,
        ],
      };
    },
  },
  {
    id: 'op-05-x2',
    difficulty: 1,
    keyConceptTag: 'Finding stationary points',
    correctOptionId: 'a',
    generate: (g) => {
      const k = g.int(1, 5);
      const lab = (xs: number[]) => `$x = ${xs.join(',\\ ')}$`;
      return {
        params: { k },
        promptText: r`What are the stationary points of $f(x) = ${poly([0, -3 * k * k, 0, 1])}$?`,
        options: [
          { id: 'a', label: lab([-k, k]), value: [-k, k] },
          { id: 'b', label: lab([k]), value: [k], trapExplanation: r`$x^2 = ${k * k}$ has two solutions, $\pm${k}$.` },
          { id: 'c', label: lab([0]), value: [0], trapExplanation: r`$f'(0) = ${-3 * k * k} \ne 0$.` },
          { id: 'd', label: lab([-k, 0, k]), value: [-k, 0, k], trapExplanation: r`$f'(x) = 3x^2 - ${3 * k * k}$ does not vanish at 0.` },
        ],
        stepByStepSolution: [
          r`$f'(x) = 3x^2 - ${3 * k * k}$.`,
          r`$3x^2 = ${3 * k * k}$, so $x^2 = ${k * k}$.`,
          r`$x = \pm${k}$ ($f'' = 6x$: a maximum at $-${k}$, a minimum at $${k}$).`,
        ],
      };
    },
  },
  {
    id: 'op-05-x3',
    difficulty: 1,
    keyConceptTag: 'The second-derivative test',
    correctOptionId: 'a',
    generate: (g) => {
      const x0 = g.int(-4, 4);
      const v = g.pick([-6, -4, -2, -1, 0, 1, 2, 3, 5]);
      const k = v > 0 ? 0 : v < 0 ? 1 : 2;
      const order = [k, ...shuffle(g, [0, 1, 2, 3].filter((x) => x !== k))];
      return {
        params: { x0, v, order },
        promptText: r`A function has $f'(${x0}) = 0$ and $f''(${x0}) = ${v}$. What can you conclude about $x = ${x0}$?`,
        options: order.map((s, i) => ({
          id: 'abcd'[i],
          label: VERDICTS[s],
          ...(i === 0 ? {} : { trapExplanation: s === 3 ? r`$f'(${x0}) = 0$, so it is stationary.` : r`$f''(${x0}) = ${v}$ is ${v > 0 ? 'positive' : v < 0 ? 'negative' : 'zero'}, which ${v === 0 ? 'decides nothing' : `means a local ${v > 0 ? 'minimum' : 'maximum'}`}.` }),
        })),
        stepByStepSolution: [
          r`The point is stationary: $f'(${x0}) = 0$.`,
          r`$f'' > 0$ means curving up (minimum), $f'' < 0$ curving down (maximum), $f'' = 0$ decides nothing.`,
          r`Here $f''(${x0}) = ${v}$: ${VERDICTS[k].toLowerCase()}.`,
        ],
      };
    },
  },
  {
    id: 'op-05-x4',
    difficulty: 2,
    keyConceptTag: 'Minimising a separable quadratic',
    correctOptionId: 'a',
    generate: (g) => {
      const { a, b, p, q } = g.until(
        () => ({ a: g.int(1, 4), b: g.int(1, 4), p: g.nonzero(-12, 12), q: g.nonzero(-12, 12) }),
        ({ a, b, p, q }) => allDistinct([[p / (2 * a), q / (2 * b)], [p / a, q / b], [-p / (2 * a), -q / (2 * b)], [p, q]]),
      );
      const lin = (c: number, v: string) => `${c < 0 ? '+' : '-'} ${Math.abs(c) === 1 ? '' : Math.abs(c)}${v}`;
      return {
        params: { a, b, p, q },
        promptText: r`Minimise $f(x, y) = ${coef(a)}x^2 + ${coef(b)}y^2 ${lin(p, 'x')} ${lin(q, 'y')}$.`,
        options: [
          { id: 'a', label: `$(${frac(p, 2 * a)},\\ ${frac(q, 2 * b)})$`, value: [p / (2 * a), q / (2 * b)] },
          { id: 'b', label: `$(${frac(p, a)},\\ ${frac(q, b)})$`, value: [p / a, q / b], trapExplanation: r`$\partial_x f = ${2 * a}x ${p < 0 ? '+' : '-'} ${Math.abs(p)}$: the factor 2 from $x^2$ is missing.` },
          { id: 'c', label: `$(${frac(-p, 2 * a)},\\ ${frac(-q, 2 * b)})$`, value: [-p / (2 * a), -q / (2 * b)], trapExplanation: r`Check the signs: $${2 * a}x = ${p}$.` },
          { id: 'd', label: pt([p, q]), value: [p, q], trapExplanation: r`Those are the linear coefficients; divide by the curvature.` },
        ],
        stepByStepSolution: [
          r`$\partial_x f = ${2 * a}x ${p < 0 ? '+' : '-'} ${Math.abs(p)} = 0$ and $\partial_y f = ${2 * b}y ${q < 0 ? '+' : '-'} ${Math.abs(q)} = 0$.`,
          r`$x = ${frac(p, 2 * a)}$, $y = ${frac(q, 2 * b)}$.`,
          r`The Hessian $\operatorname{diag}(${2 * a}, ${2 * b})$ is positive definite: a global minimum.`,
        ],
      };
    },
  },
  {
    id: 'op-05-x5',
    difficulty: 2,
    keyConceptTag: 'Active or inactive?',
    correctOptionId: 'a',
    generate: (g) => {
      const { a, b } = g.until(() => ({ a: g.nonzero(-5, 8), b: g.int(-4, 6) }), ({ a, b }) => a !== b);
      const k = a < b ? 0 : 1;
      const order = [k, ...shuffle(g, [0, 1, 2, 3].filter((x) => x !== k))];
      return {
        params: { a, b, order },
        promptText: r`Minimise $(x ${a < 0 ? '+' : '-'} ${Math.abs(a)})^2$ subject to $x \ge ${b}$, i.e. $a = ${a}$, $b = ${b}$. Which description of the solution is right?`,
        options: order.map((s, i) => ({
          id: 'abcd'[i],
          label: KKT[s],
          ...(i === 0 ? {} : { trapExplanation: r`The free minimum ${a} is ${a < b ? 'infeasible' : 'feasible'}, so the constraint is ${a < b ? 'active with a positive multiplier' : 'inactive and its multiplier is 0'} (complementary slackness).` }),
        })),
        stepByStepSolution: [
          r`Free minimum: $x = ${a}$.`,
          a < b ? r`$${a} < ${b}$ violates the constraint, so $x^* = ${b}$ on the boundary; $f$ would like to move left, so $\mu > 0$.` : r`$${a} \ge ${b}$ is feasible: $x^* = ${a}$ inside the region.`,
          a < b ? r`Active, $\mu = 2(${b} - ${a < 0 ? `(${a})` : a}) = ${2 * (b - a)} > 0$.` : r`Inactive, so $\mu = 0$.`,
        ],
      };
    },
  },
  {
    id: 'op-05-x6',
    difficulty: 2,
    keyConceptTag: 'Complementary slackness',
    correctOptionId: 'a',
    generate: (g) => {
      const { a, b } = g.until(() => ({ a: g.nonzero(-5, 8), b: g.int(-4, 6) }), ({ a, b }) => a !== b);
      const mu = Math.max(0, 2 * (a - b));
      const opts = a > b ? [mu, a - b, -mu, 0] : [0, 2 * (b - a), 2 * (a - b), b - a];
      const why = a > b
        ? [r``, r`$f'(x) = 2(x - a)$ carries a factor 2.`, r`A KKT multiplier is never negative.`, r`The free minimum ${a} is infeasible, so the constraint is active and $\mu > 0$.`]
        : [r``, r`The free minimum ${a} is feasible: the constraint is inactive, so $\mu = 0$ by complementary slackness.`, r`Multipliers are never negative; and an inactive constraint has $\mu = 0$.`, r`An inactive constraint has $\mu = 0$, whatever the distance to the boundary.`];
      return {
        params: { a, b },
        promptText: r`For $\min\ (x ${a < 0 ? '+' : '-'} ${Math.abs(a)})^2$ subject to $x \le ${b}$, what is the KKT multiplier $\mu$ of the constraint?`,
        options: opts.map((v, i) => ({ id: 'abcd'[i], label: `$${v}$`, value: v, ...(i === 0 ? {} : { trapExplanation: why[i] }) })),
        stepByStepSolution: [
          r`Free minimum: $x = ${a}$; it is ${a > b ? 'infeasible' : 'feasible'} for $x \le ${b}$.`,
          a > b ? r`So $x^* = ${b}$ and $f'(${b}) + \mu = 0$ with $f'(${b}) = ${2 * (b - a)}$.` : r`So $x^* = ${a}$ with $h(x^*) = ${a - b} < 0$, and $\mu\,h(x^*) = 0$ forces $\mu = 0$.`,
          r`$\mu = ${mu}$.`,
        ],
      };
    },
  },
];
