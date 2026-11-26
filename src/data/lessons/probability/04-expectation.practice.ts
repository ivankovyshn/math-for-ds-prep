import type { QuestionTemplate } from '../../../types.ts';
import { r } from '../define.ts';
import { allDistinct, dec, paren, sumOf } from '../gen.ts';
import { approx } from './01-spaces.practice.ts';
import { pmfTable, tenths } from './03-distributions.practice.ts';

/** Mean and variance of a PMF with probabilities in tenths. */
export const moments = (xs: number[], ps: number[]) => {
  const m = sumOf(xs.map((x, i) => x * ps[i])) / 10;
  const m2 = sumOf(xs.map((x, i) => x * x * ps[i])) / 10;
  return { m, m2, v: m2 - m * m };
};
const r4 = (x: number) => Math.round(x * 1e4) / 1e4;

export const practice: QuestionTemplate[] = [
  {
    id: 'pr-04-1',
    difficulty: 1,
    keyConceptTag: 'Expectation of a discrete variable',
    correctOptionId: 'a',
    generate: (g) => {
      const { xs, ps } = g.until(
        () => ({ xs: [...new Set([g.int(-2, 1), g.int(0, 3), g.int(2, 5), g.int(4, 8)])].sort((a, b) => a - b), ps: tenths(g, 4) }),
        ({ xs, ps }) => {
          if (xs.length !== 4) return false;
          const mode = xs[ps.indexOf(Math.max(...ps))];
          return ps.filter((p) => p === Math.max(...ps)).length === 1 && allDistinct([r4(moments(xs, ps).m), r4(sumOf(xs) / 4), mode, r4(sumOf(xs) / 10)]);
        },
      );
      const { m } = moments(xs, ps);
      const mode = xs[ps.indexOf(Math.max(...ps))];
      return {
        params: { xs, ps },
        promptText: r`$X$ has the distribution below. What is $E[X]$?`,
        mathFormula: pmfTable(xs, ps.map((p) => dec(p / 10))),
        options: [
          { id: 'a', label: `$${dec(r4(m))}$`, value: m },
          { id: 'b', label: `$${dec(r4(sumOf(xs) / 4))}$`, value: sumOf(xs) / 4, trapExplanation: r`That is the plain average of the four values. Each value must be weighted by its probability.` },
          { id: 'c', label: `$${mode}$`, value: mode, trapExplanation: r`${mode} is the most likely value (the mode), not the mean.` },
          { id: 'd', label: `$${dec(r4(sumOf(xs) / 10))}$`, value: sumOf(xs) / 10, trapExplanation: r`Each value is multiplied by <i>its own</i> probability, not by 0.1.` },
        ],
        stepByStepSolution: [
          r`$E[X] = \sum x\,P(X = x)$.`,
          r`$= ${xs.map((x, i) => `${paren(x)}\\cdot${dec(ps[i] / 10)}`).join(' + ')}$.`,
          r`$= ${dec(r4(m))}$.`,
        ],
      };
    },
  },
  {
    id: 'pr-04-2',
    difficulty: 1,
    keyConceptTag: 'Linearity of expectation',
    correctOptionId: 'a',
    generate: (g) => {
      const { m, a, b } = g.until(
        () => ({ m: g.int(-5, 9), a: g.pick([-4, -3, -2, 2, 3, 4, 5]), b: g.nonzero(-9, 9) }),
        ({ m, a, b }) => allDistinct([a * m + b, a * m, m + b, a * (m + b)]),
      );
      return {
        params: { m, a, b },
        promptText: r`$E[X] = ${m}$. What is $E[${a}X ${b < 0 ? '-' : '+'} ${Math.abs(b)}]$?`,
        options: [
          { id: 'a', label: `$${a * m + b}$`, value: a * m + b },
          { id: 'b', label: `$${a * m}$`, value: a * m, trapExplanation: r`The constant shifts every value by ${b}, so it shifts the mean too.` },
          { id: 'c', label: `$${m + b}$`, value: m + b, trapExplanation: r`Scaling $X$ by ${a} scales its mean by ${a}.` },
          { id: 'd', label: `$${a * (m + b)}$`, value: a * (m + b), trapExplanation: r`That is $${a}(E[X] ${b < 0 ? '-' : '+'} ${Math.abs(b)})$; the constant is added after multiplying.` },
        ],
        stepByStepSolution: [
          r`$E[aX + b] = a\,E[X] + b$.`,
          r`$= ${a}\cdot${paren(m)} + ${paren(b)}$.`,
          r`$= ${a * m + b}$.`,
        ],
      };
    },
  },
  {
    id: 'pr-04-3',
    difficulty: 2,
    keyConceptTag: 'Computing a variance',
    correctOptionId: 'a',
    generate: (g) => {
      const ps = g.until(
        () => tenths(g, 4),
        (ps) => {
          const { m, m2, v } = moments([0, 1, 2, 3], ps);
          return v > 0 && allDistinct([r4(v), r4(m2), r4(m2 - m), r4(Math.sqrt(v))]);
        },
      );
      const xs = [0, 1, 2, 3];
      const { m, m2, v } = moments(xs, ps);
      return {
        params: { xs, ps },
        promptText: r`$X$ has the distribution below. What is $\operatorname{Var}X$?`,
        mathFormula: pmfTable(xs, ps.map((p) => dec(p / 10))),
        options: [
          { id: 'a', label: `$${dec(r4(v))}$`, value: v },
          { id: 'b', label: `$${dec(r4(m2))}$`, value: m2, trapExplanation: r`That is $E[X^2]$. Subtract $(E[X])^2 = ${dec(r4(m * m))}$.` },
          { id: 'c', label: `$${dec(r4(m2 - m))}$`, value: m2 - m, trapExplanation: r`Subtract the <i>square</i> of the mean: $(${dec(m)})^2$, not $${dec(m)}$.` },
          { id: 'd', label: `$${approx(Math.sqrt(v))}$`, value: Math.sqrt(v), trapExplanation: r`That is the standard deviation $\sigma = \sqrt{\operatorname{Var}X}$.` },
        ],
        stepByStepSolution: [
          r`$E[X] = ${dec(m)}$ and $E[X^2] = ${ps.map((p, i) => `${xs[i] * xs[i]}\\cdot${dec(p / 10)}`).join(' + ')} = ${dec(m2)}$.`,
          r`$\operatorname{Var}X = E[X^2] - (E[X])^2 = ${dec(m2)} - ${dec(r4(m * m))}$.`,
          r`$= ${dec(r4(v))}$.`,
        ],
      };
    },
  },
  {
    id: 'pr-04-4',
    difficulty: 2,
    keyConceptTag: 'Variance of a linear transformation',
    correctOptionId: 'a',
    generate: (g) => {
      const { v, a, b } = g.until(
        () => ({ v: g.int(1, 9), a: g.pick([-5, -4, -3, -2, 2, 3, 4, 5]), b: g.nonzero(-6, 6) }),
        ({ v, a, b }) => allDistinct([a * a * v, a * v, a * a * v + b, a * a * v + b * b]),
      );
      return {
        params: { v, a, b },
        promptText: r`$\operatorname{Var}X = ${v}$. What is $\operatorname{Var}(${a}X ${b < 0 ? '-' : '+'} ${Math.abs(b)})$?`,
        options: [
          { id: 'a', label: `$${a * a * v}$`, value: a * a * v },
          { id: 'b', label: `$${a * v}$`, value: a * v, trapExplanation: r`Variance is in squared units: scaling by ${a} multiplies it by $${paren(a)}^2 = ${a * a}$.` },
          { id: 'c', label: `$${a * a * v + b}$`, value: a * a * v + b, trapExplanation: r`Adding a constant shifts all values equally; the spread does not change.` },
          { id: 'd', label: `$${a * a * v + b * b}$`, value: a * a * v + b * b, trapExplanation: r`A constant has no variance and adds none: $\operatorname{Var}(X + c) = \operatorname{Var}X$.` },
        ],
        stepByStepSolution: [
          r`$\operatorname{Var}(aX + b) = a^2\operatorname{Var}X$.`,
          r`$= ${paren(a)}^2\cdot${v}$.`,
          r`$= ${a * a * v}$.`,
        ],
      };
    },
  },
  {
    id: 'pr-04-5',
    difficulty: 3,
    keyConceptTag: 'Mean and variance of the binomial',
    correctOptionId: 'a',
    generate: (g) => {
      const { n, p } = g.until(
        () => ({ n: g.pick([10, 20, 40, 50, 100]), p: g.pick([0.1, 0.2, 0.25, 0.4]) }),
        ({ n, p }) => allDistinct([n * p * (1 - p), n * p, n * p * p, p * (1 - p)].map(r4)),
      );
      return {
        params: { n, p },
        promptText: r`A model makes ${n} independent predictions, each wrong with probability ${p}. Let $X$ be the number of wrong predictions. What is $\operatorname{Var}X$?`,
        options: [
          { id: 'a', label: `$${dec(r4(n * p * (1 - p)))}$`, value: n * p * (1 - p) },
          { id: 'b', label: `$${dec(r4(n * p))}$`, value: n * p, trapExplanation: r`$np = ${dec(n * p)}$ is the <i>mean</i>. The variance has the extra factor $1 - p$.` },
          { id: 'c', label: `$${dec(r4(n * p * p))}$`, value: n * p * p, trapExplanation: r`Each wrong/right indicator has variance $p(1 - p)$, not $p^2$.` },
          { id: 'd', label: `$${dec(r4(p * (1 - p)))}$`, value: p * (1 - p), trapExplanation: r`That is the variance of a single prediction. Independent variances add up over all ${n}.` },
        ],
        stepByStepSolution: [
          r`$X$ is a sum of ${n} independent Bernoulli$(${p})$ indicators, each with variance $p(1 - p)$.`,
          r`Independent variances add: $\operatorname{Var}X = np(1 - p) = ${n}\cdot${p}\cdot${dec(1 - p)}$.`,
          r`$= ${dec(r4(n * p * (1 - p)))}$ (standard deviation $${approx(Math.sqrt(n * p * (1 - p)), 2)}$).`,
        ],
      };
    },
  },
  {
    id: 'pr-04-6',
    difficulty: 3,
    keyConceptTag: 'Variance of a difference',
    correctOptionId: 'a',
    generate: (g) => {
      const { a, b, sx, sy } = g.until(
        () => ({ a: g.int(1, 3), b: g.int(1, 3), sx: g.int(1, 5), sy: g.int(1, 5) }),
        ({ a, b, sx, sy }) => allDistinct([a * a * sx * sx + b * b * sy * sy, (a * sx - b * sy) ** 2, a * a * sx * sx - b * b * sy * sy, a * sx * sx + b * sy * sy]),
      );
      const term = (c: number, s: string) => (c === 1 ? s : `${c}${s}`);
      return {
        params: { a, b, sx, sy },
        promptText: r`$X$ and $Y$ are independent with standard deviations $\sigma_X = ${sx}$ and $\sigma_Y = ${sy}$. What is $\operatorname{Var}(${term(a, 'X')} - ${term(b, 'Y')})$?`,
        options: [
          { id: 'a', label: `$${a * a * sx * sx + b * b * sy * sy}$`, value: a * a * sx * sx + b * b * sy * sy },
          { id: 'b', label: `$${(a * sx - b * sy) ** 2}$`, value: (a * sx - b * sy) ** 2, trapExplanation: r`Standard deviations do not subtract; for independent variables the <i>variances</i> add.` },
          { id: 'c', label: `$${a * a * sx * sx - b * b * sy * sy}$`, value: a * a * sx * sx - b * b * sy * sy, trapExplanation: r`A minus sign inside becomes $(-${b})^2 = ${b * b}$: variances of independent terms always add.` },
          { id: 'd', label: `$${a * sx * sx + b * sy * sy}$`, value: a * sx * sx + b * sy * sy, trapExplanation: r`The coefficients are squared too: $\operatorname{Var}(cX) = c^2\operatorname{Var}X$.` },
        ],
        stepByStepSolution: [
          r`Independent: $\operatorname{Var}(aX - bY) = a^2\operatorname{Var}X + b^2\operatorname{Var}Y$.`,
          r`$= ${a * a}\cdot${sx * sx} + ${b * b}\cdot${sy * sy}$.`,
          r`$= ${a * a * sx * sx + b * b * sy * sy}$ (standard deviation $${approx(Math.sqrt(a * a * sx * sx + b * b * sy * sy), 2)}$).`,
        ],
      };
    },
  },
];
