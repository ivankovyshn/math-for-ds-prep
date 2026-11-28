import type { QuestionTemplate, Rng } from '../../../types.ts';
import { r } from '../define.ts';
import { allDistinct, binomial, dec, factorial, frac, sumOf } from '../gen.ts';
import { approx } from './01-spaces.practice.ts';

/** A PMF table as a display formula. */
export const pmfTable = (xs: number[], ps: string[]) =>
  `\\begin{array}{c|${'c'.repeat(xs.length)}} x & ${xs.join(' & ')} \\\\ \\hline P(X = x) & ${ps.join(' & ')} \\end{array}`;

/** Probabilities in tenths for the values 0..n-1, each at least 0.1, adding up to 1. */
export function tenths(g: Rng, n: number) {
  return g.until(
    () => {
      const ps = Array.from({ length: n - 1 }, () => g.int(1, 4));
      return [...ps, 10 - sumOf(ps)];
    },
    (ps) => ps[n - 1] >= 1,
  );
}

/** What each normal-rule percentage means, for trap explanations. */
const MEANING: Record<number, string> = {
  2.5: 'one tail beyond $2\\sigma$',
  5: 'both tails beyond $2\\sigma$ together',
  16: 'one tail beyond $1\\sigma$',
  32: 'both tails beyond $1\\sigma$ together',
  34: 'the band from $\\mu$ to $\\mu + \\sigma$ only',
  47.5: 'the band from $\\mu$ to $\\mu + 2\\sigma$ only',
  68: 'the share within $1\\sigma$ on both sides',
  84: 'everything below $\\mu + \\sigma$',
  95: 'the share within $2\\sigma$ on both sides',
  97.5: 'everything below $\\mu + 2\\sigma$',
  99.7: 'the share within $3\\sigma$',
};
/** Normal-rule questions: bounds in units of σ around μ, the answer and three tempting wrong answers. */
export const RULE_CASES = [
  { lo: 1, hi: Infinity, ans: 16, wrong: [32, 84, 2.5] },
  { lo: 2, hi: Infinity, ans: 2.5, wrong: [5, 95, 16] },
  { lo: -Infinity, hi: -1, ans: 16, wrong: [84, 32, 68] },
  { lo: -1, hi: 1, ans: 68, wrong: [95, 34, 84] },
  { lo: -2, hi: 2, ans: 95, wrong: [68, 47.5, 99.7] },
  { lo: -Infinity, hi: 1, ans: 84, wrong: [68, 16, 34] },
  { lo: -Infinity, hi: -2, ans: 2.5, wrong: [5, 16, 97.5] },
];
/** "P(X > 75)", "P(60 < X < 80)" … for a case with mean m and SD s. */
export function ruleQuestion(c: { lo: number; hi: number }, m: number, s: number) {
  if (c.hi === Infinity) return `P(X > ${m + c.lo * s})`;
  if (c.lo === -Infinity) return `P(X < ${m + c.hi * s})`;
  return `P(${m + c.lo * s} < X < ${m + c.hi * s})`;
}
export const ruleOptions = (c: { ans: number; wrong: number[] }) =>
  [c.ans, ...c.wrong].map((v, i) => ({
    id: 'abcd'[i],
    label: `$\\approx ${v}\\%$`,
    value: v,
    ...(i === 0 ? {} : { trapExplanation: `${v}% is ${MEANING[v]}.` }),
  }));

export const practice: QuestionTemplate[] = [
  {
    id: 'pr-03-1',
    difficulty: 1,
    keyConceptTag: 'The cumulative distribution function',
    correctOptionId: 'a',
    generate: (g) => {
      const { ps, k } = g.until(
        () => ({ ps: tenths(g, 4), k: g.int(1, 2) }),
        ({ ps, k }) => {
          const le = sumOf(ps.slice(0, k + 1));
          return allDistinct([le, le - ps[k], ps[k], 10 - le]);
        },
      );
      const le = sumOf(ps.slice(0, k + 1));
      return {
        params: { ps, k },
        promptText: r`$X$ has the distribution below. What is $P(X \le ${k})$?`,
        mathFormula: pmfTable([0, 1, 2, 3], ps.map((p) => dec(p / 10))),
        options: [
          { id: 'a', label: `$${dec(le / 10)}$`, value: le / 10 },
          { id: 'b', label: `$${dec((le - ps[k]) / 10)}$`, value: (le - ps[k]) / 10, trapExplanation: r`That is $P(X < ${k})$. "$\le$" includes $X = ${k}$.` },
          { id: 'c', label: `$${dec(ps[k] / 10)}$`, value: ps[k] / 10, trapExplanation: r`That is $P(X = ${k})$ only. The CDF adds all values up to ${k}.` },
          { id: 'd', label: `$${dec((10 - le) / 10)}$`, value: (10 - le) / 10, trapExplanation: r`That is $P(X > ${k})$, the complement.` },
        ],
        stepByStepSolution: [
          r`$P(X \le ${k}) = ${Array.from({ length: k + 1 }, (_, x) => `P(X = ${x})`).join(' + ')}$.`,
          r`$= ${ps.slice(0, k + 1).map((p) => dec(p / 10)).join(' + ')}$.`,
          r`$= ${dec(le / 10)}$.`,
        ],
      };
    },
  },
  {
    id: 'pr-03-2',
    difficulty: 1,
    keyConceptTag: 'The binomial distribution',
    correctOptionId: 'a',
    generate: (g) => {
      const { n, a, d, k } = g.until(
        () => {
          const [a, d] = g.pick([[1, 2], [1, 3], [1, 4], [2, 3]]);
          const n = g.int(3, 5);
          return { n, a, d, k: g.int(1, n - 1) };
        },
        ({ n, a, d, k }) => allDistinct([binomial(n, k) * a ** k * (d - a) ** (n - k) / d ** n, a ** k * (d - a) ** (n - k) / d ** n, binomial(n, k) * a ** k / d ** k, k / n]),
      );
      const C = binomial(n, k);
      const num = a ** k * (d - a) ** (n - k);
      return {
        params: { n, pn: a, pd: d, k },
        promptText: r`$X \sim \text{Binomial}(${n}, ${frac(a, d)})$. What is $P(X = ${k})$?`,
        options: [
          { id: 'a', label: `$${frac(C * num, d ** n)}$`, value: (C * num) / d ** n },
          { id: 'b', label: `$${frac(num, d ** n)}$`, value: num / d ** n, trapExplanation: r`That is one particular sequence. Multiply by the $\binom{${n}}{${k}} = ${C}$ ways to place the successes.` },
          { id: 'c', label: `$${frac(C * a ** k, d ** k)}$`, value: (C * a ** k) / d ** k, trapExplanation: r`The ${n - k} failures also have to happen: include $(1 - p)^{${n - k}} = \big(${frac(d - a, d)}\big)^{${n - k}}$.` },
          { id: 'd', label: `$${frac(k, n)}$`, value: k / n, trapExplanation: r`$\frac{${k}}{${n}}$ is a proportion, not the probability of exactly ${k} successes.` },
        ],
        stepByStepSolution: [
          r`$P(X = k) = \binom nk p^k(1 - p)^{n-k}$ with $n = ${n}$, $p = ${frac(a, d)}$, $k = ${k}$.`,
          r`$= ${C}\cdot\big(${frac(a, d)}\big)^{${k}}\big(${frac(d - a, d)}\big)^{${n - k}} = \frac{${C}\cdot${num}}{${d ** n}}$.`,
          r`$= ${frac(C * num, d ** n)}$.`,
        ],
      };
    },
  },
  {
    id: 'pr-03-3',
    difficulty: 2,
    keyConceptTag: 'The Poisson distribution',
    correctOptionId: 'a',
    generate: (g) => {
      const { lam, k } = g.until(
        () => ({ lam: g.int(1, 4), k: g.int(1, 4) }),
        ({ lam, k }) => {
          const e = Math.exp(-lam);
          return lam !== k && allDistinct([e * lam ** k / factorial(k), lam ** k / factorial(k), e * lam ** k, Math.exp(-k) * k ** lam / factorial(lam)].map((x) => Math.round(x * 1000)));
        },
      );
      const e = Math.exp(-lam);
      const c = frac(lam ** k, factorial(k));
      const ex = (m: number) => `e^{-${m}}`;
      const v = [e * lam ** k / factorial(k), lam ** k / factorial(k), e * lam ** k, Math.exp(-k) * k ** lam / factorial(lam)];
      return {
        params: { lam, k },
        promptText: r`Website requests arrive as a Poisson process with on average ${lam} per second. What is the probability of exactly ${k} request${k === 1 ? '' : 's'} in a given second?`,
        options: [
          { id: 'a', label: `$${c === '1' ? '' : c}${ex(lam)} ${approx(v[0])}$`, value: v[0] },
          { id: 'b', label: `$${c} ${v[1] === Math.round(v[1]) ? '' : approx(v[1])}$`, value: v[1], trapExplanation: r`The factor $e^{-${lam}}$ is what makes the probabilities add up to 1.` },
          { id: 'c', label: `$${lam ** k}${ex(lam)} ${approx(v[2])}$`, value: v[2], trapExplanation: r`Divide by $${k}! = ${factorial(k)}$.` },
          { id: 'd', label: `$${frac(k ** lam, factorial(lam))}${ex(k)} ${approx(v[3])}$`, value: v[3], trapExplanation: r`The rate $\lambda = ${lam}$ and the count $k = ${k}$ have swapped places.` },
        ],
        stepByStepSolution: [
          r`$P(X = k) = e^{-\lambda}\frac{\lambda^k}{k!}$ with $\lambda = ${lam}$, $k = ${k}$.`,
          r`$= e^{-${lam}}\cdot\frac{${lam ** k}}{${factorial(k)}}$.`,
          r`$${approx(v[0])}$.`,
        ],
      };
    },
  },
  {
    id: 'pr-03-7',
    difficulty: 2,
    keyConceptTag: 'At least one: the complement',
    correctOptionId: 'a',
    generate: (g) => {
      const { n, d } = g.until(
        () => ({ n: g.int(2, 4), d: g.int(3, 6) }),
        ({ n, d }) => allDistinct([1 - ((d - 1) / d) ** n, n / d, 1 - 1 / d ** n, ((d - 1) / d) ** n].map((x) => Math.round(x * 1e9))),
      );
      const N = d ** n;
      const none = (d - 1) ** n;
      return {
        params: { n, d },
        promptText: r`A quiz question has ${d} options, and you guess at random. You guess on ${n} questions. What is the probability of at least one correct guess?`,
        options: [
          { id: 'a', label: `$${frac(N - none, N)}$`, value: (N - none) / N },
          { id: 'b', label: `$${frac(n, d)}$`, value: n / d, trapExplanation: r`Adding $\frac{1}{${d}}$ ${n} times counts the outcomes with several correct guesses more than once. Use the complement "none correct".` },
          { id: 'c', label: `$${frac(N - 1, N)}$`, value: (N - 1) / N, trapExplanation: r`$1 - \big(\frac{1}{${d}}\big)^{${n}}$ subtracts "all correct". The complement of "at least one correct" is "none correct".` },
          { id: 'd', label: `$${frac(none, N)}$`, value: none / N, trapExplanation: r`That is $P(\text{none correct}) = \big(\frac{${d - 1}}{${d}}\big)^{${n}}$; subtract it from 1.` },
        ],
        stepByStepSolution: [
          r`The complement of "at least one correct" is "none correct".`,
          r`$P(\text{none}) = \big(\frac{${d - 1}}{${d}}\big)^{${n}} = ${frac(none, N)}$, because the guesses are independent.`,
          r`$P(\text{at least one}) = 1 - ${frac(none, N)} = ${frac(N - none, N)}$.`,
        ],
      };
    },
  },
  {
    id: 'pr-03-8',
    difficulty: 3,
    keyConceptTag: 'Poisson: scale the rate to the window',
    correctOptionId: 'a',
    generate: (g) => {
      const { lam, t, k } = g.until(
        () => ({ lam: g.int(1, 2), t: g.int(2, 3), k: g.int(2, 3) }),
        ({ lam, t, k }) => {
          const P = (m: number) => (Math.exp(-m) * m ** k) / factorial(k);
          return allDistinct([P(lam * t), P(lam), t * P(lam), Math.exp(-lam * t) * (lam * t) ** k].map((x) => Math.round(x * 1e9)));
        },
      );
      const mu = lam * t;
      const P = (m: number) => (Math.exp(-m) * m ** k) / factorial(k);
      const term = (m: number) => `${frac(m ** k, factorial(k))}e^{-${m}}`;
      return {
        params: { lam, t, k },
        promptText: r`Messages arrive at ${lam} per minute on average (a Poisson stream). What is the probability of exactly ${k} messages in ${t} minutes?`,
        options: [
          { id: 'a', label: `$${term(mu)} ${approx(P(mu))}$`, value: P(mu) },
          { id: 'b', label: `$${term(lam)} ${approx(P(lam))}$`, value: P(lam), trapExplanation: r`That uses the one-minute average $\lambda = ${lam}$. Over ${t} minutes the average count is $${lam}\cdot${t} = ${mu}$.` },
          { id: 'c', label: `$${t}\\cdot ${term(lam)} ${approx(t * P(lam))}$`, value: t * P(lam), trapExplanation: r`The ${k} messages can be spread over the ${t} minutes in many ways, so multiplying a one-minute probability by ${t} does not work. Use one Poisson with $\lambda = ${mu}$.` },
          { id: 'd', label: `$${mu ** k}e^{-${mu}} ${approx(Math.exp(-mu) * mu ** k)}$`, value: Math.exp(-mu) * mu ** k, trapExplanation: r`The $k!$ in the denominator is missing: $\frac{${mu}^{${k}}}{${k}!}$.` },
        ],
        stepByStepSolution: [
          r`The count in ${t} minutes is Poisson with $\lambda = ${lam}\cdot${t} = ${mu}$: the average scales with the window.`,
          r`$P(X = ${k}) = e^{-${mu}}\frac{${mu}^{${k}}}{${k}!} = ${term(mu)}$.`,
          r`$${term(mu)} ${approx(P(mu))}$.`,
        ],
      };
    },
  },
  {
    id: 'pr-03-9',
    difficulty: 3,
    keyConceptTag: 'At least two: subtract zero and one',
    correctOptionId: 'a',
    generate: (g) => {
      const n = g.int(4, 6);
      const N = 2 ** n;
      return {
        params: { n },
        promptText: r`A fair coin is tossed ${n} times. What is the probability of at least two heads?`,
        options: [
          { id: 'a', label: `$${frac(N - 1 - n, N)}$`, value: (N - 1 - n) / N },
          { id: 'b', label: `$${frac(binomial(n, 2), N)}$`, value: binomial(n, 2) / N, trapExplanation: r`That is exactly two heads. "At least two" also includes 3, 4, … heads.` },
          { id: 'c', label: `$${frac(N - 1, N)}$`, value: (N - 1) / N, trapExplanation: r`That is $1 - P(\text{0 heads})$, i.e. at least <i>one</i> head. For at least two, also subtract $P(\text{exactly 1}) = \frac{${n}}{${N}}$.` },
          { id: 'd', label: `$${frac(1 + n, N)}$`, value: (1 + n) / N, trapExplanation: r`That is $P(X \le 1)$, the complement. Subtract it from 1.` },
        ],
        stepByStepSolution: [
          r`The complement of "at least two heads" is "zero or one head".`,
          r`$P(X = 0) = \frac{1}{${N}}$ and $P(X = 1) = \binom{${n}}{1}\frac{1}{${N}} = \frac{${n}}{${N}}$.`,
          r`$P(X \ge 2) = 1 - \frac{${1 + n}}{${N}} = ${frac(N - 1 - n, N)}$.`,
        ],
      };
    },
  },
];
