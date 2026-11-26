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
    id: 'pr-03-4',
    difficulty: 2,
    keyConceptTag: 'The exponential distribution',
    correctOptionId: 'a',
    generate: (g) => {
      const lam = g.pick([0.5, 2, 3]);
      const t = g.int(1, 3);
      const lt = lam * t;
      const v = [Math.exp(-lt), 1 - Math.exp(-lt), lam * Math.exp(-lt), Math.exp(-t / lam)];
      return {
        params: { lam, t },
        promptText: r`The time $X$ (in minutes) until the next bus is exponential with rate $\lambda = ${lam}$ per minute. What is $P(X > ${t})$?`,
        options: [
          { id: 'a', label: `$e^{-${dec(lt)}} ${approx(v[0])}$`, value: v[0] },
          { id: 'b', label: `$1 - e^{-${dec(lt)}} ${approx(v[1])}$`, value: v[1], trapExplanation: r`That is $P(X \le ${t})$, the CDF. "Longer than ${t}" is the complement.` },
          { id: 'c', label: `$${dec(lam)}e^{-${dec(lt)}} ${approx(v[2])}$`, value: v[2], trapExplanation: r`That is the density $f(${t})$. A probability is an area: $\int_{${t}}^{\infty}\lambda e^{-\lambda x}dx$.` },
          { id: 'd', label: `$e^{-${dec(t / lam)}} ${approx(v[3])}$`, value: v[3], trapExplanation: r`That treats ${lam} as the mean waiting time. With rate $\lambda$, the mean is $\frac1\lambda = ${dec(1 / lam)}$.` },
        ],
        stepByStepSolution: [
          r`$P(X > t) = \int_t^\infty \lambda e^{-\lambda x}\,dx = e^{-\lambda t}$.`,
          r`$\lambda t = ${dec(lam)}\cdot${t} = ${dec(lt)}$.`,
          r`$P(X > ${t}) = e^{-${dec(lt)}} ${approx(v[0])}$.`,
        ],
      };
    },
  },
  {
    id: 'pr-03-5',
    difficulty: 3,
    keyConceptTag: 'The 68–95–99.7 rule',
    correctOptionId: 'a',
    generate: (g) => {
      const c = g.pick(RULE_CASES);
      const m = g.pick([50, 60, 70, 100, 170, 500]);
      const s = g.pick([2, 4, 5, 10, 15, 20]);
      return {
        params: { m, s, lo: c.lo === -Infinity ? -1e9 : c.lo, hi: c.hi === Infinity ? 1e9 : c.hi },
        promptText: r`$X \sim N(${m}, ${s}^2)$. Approximately what is $${ruleQuestion(c, m, s)}$?`,
        options: ruleOptions(c),
        stepByStepSolution: [
          r`Standardise: ${[c.lo, c.hi].filter((z) => Number.isFinite(z)).map((z) => `$${m + z * s}$ is $\\mu ${z < 0 ? '-' : '+'} ${Math.abs(z) === 1 ? '' : Math.abs(z)}\\sigma$`).join(' and ')}.`,
          r`Within $1\sigma$: 68%, so each tail beyond $1\sigma$ holds 16%; within $2\sigma$: 95%, so each tail beyond $2\sigma$ holds 2.5%.`,
          r`So the probability is about ${c.ans}%.`,
        ],
      };
    },
  },
  {
    id: 'pr-03-6',
    difficulty: 3,
    keyConceptTag: 'The uniform distribution',
    correctOptionId: 'a',
    generate: (g) => {
      const { a, b, c, d } = g.until(
        () => {
          const a = g.int(0, 5);
          const b = a + g.int(4, 10);
          const left = g.next() < 0.5;
          const c = left ? a - g.int(1, 3) : g.int(a + 1, b - 1);
          const d = left ? g.int(a + 1, b - 1) : b + g.int(1, 3);
          return { a, b, c, d };
        },
        ({ a, b, c, d }) => {
          const ov = Math.min(d, b) - Math.max(c, a);
          return allDistinct([ov / (b - a), (d - c) / (b - a), 1 / (b - a), (d - c) / b]);
        },
      );
      const lo = Math.max(c, a);
      const hi = Math.min(d, b);
      return {
        params: { a, b, c, d },
        promptText: r`$X \sim \text{Uniform}(${a}, ${b})$. What is $P(${c} \le X \le ${d})$?`,
        options: [
          { id: 'a', label: `$${frac(hi - lo, b - a)}$`, value: (hi - lo) / (b - a) },
          { id: 'b', label: `$${frac(d - c, b - a)}$`, value: (d - c) / (b - a), trapExplanation: r`$X$ never leaves $[${a}, ${b}]$: only the part of $[${c}, ${d}]$ inside it counts.` },
          { id: 'c', label: `$${frac(1, b - a)}$`, value: 1 / (b - a), trapExplanation: r`$\frac{1}{${b - a}}$ is the height of the density, not an area.` },
          { id: 'd', label: `$${frac(d - c, b)}$`, value: (d - c) / b, trapExplanation: r`Divide by the length of the whole range, $${b} - ${a} = ${b - a}$, and use only the overlap.` },
        ],
        stepByStepSolution: [
          r`The density is $\frac{1}{${b - a}}$ on $[${a}, ${b}]$ and 0 outside.`,
          r`$[${c}, ${d}] \cap [${a}, ${b}] = [${lo}, ${hi}]$, of length ${hi - lo}.`,
          r`$P = \frac{${hi - lo}}{${b - a}} = ${frac(hi - lo, b - a)}$.`,
        ],
      };
    },
  },
];
