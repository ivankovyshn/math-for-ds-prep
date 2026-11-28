import type { QuestionTemplate } from '../../../types.ts';
import { r } from '../define.ts';
import { allDistinct, dec, frac } from '../gen.ts';

const r6 = (x: number) => Math.round(x * 1e6) / 1e6;

/** Extra practice (Practice 2): gentler questions on the same ideas, with new numbers every time. */
export const extra: QuestionTemplate[] = [
  {
    id: 'sm-04-x1',
    difficulty: 1,
    keyConceptTag: 'What a logarithm is',
    correctOptionId: 'a',
    generate: (g) => {
      const k = g.until(() => g.int(3, 10), (k) => allDistinct([k, 2 ** k / 2, k - 1, 2 * k]));
      const N = 2 ** k;
      return {
        params: { N },
        promptText: r`Compute $\log_2 ${N}$.`,
        options: [
          { id: 'a', label: `$${k}$`, value: k },
          { id: 'b', label: `$${N / 2}$`, value: N / 2, trapExplanation: r`$\log_2 ${N}$ is not $\frac{${N}}{2}$: it is the power of 2 that gives ${N}.` },
          { id: 'c', label: `$${k - 1}$`, value: k - 1, trapExplanation: r`$2^{${k - 1}} = ${2 ** (k - 1)}$, half of ${N}.` },
          { id: 'd', label: `$${2 * k}$`, value: 2 * k, trapExplanation: r`$2^{${2 * k}}$ is far larger than ${N}. Count the factors of 2 in ${N}.` },
        ],
        stepByStepSolution: [r`$\log_2 ${N} = x$ means $2^x = ${N}$.`, r`Halve ${N} until you reach 1: that takes ${k} steps.`, r`$2^{${k}} = ${N}$, so $\log_2 ${N} = ${k}$.`],
      };
    },
  },
  {
    id: 'sm-04-x2',
    difficulty: 1,
    keyConceptTag: 'e and ln undo each other',
    correctOptionId: 'a',
    generate: (g) => {
      const { a, k } = g.until(() => ({ a: g.int(2, 9), k: g.int(2, 9) }), ({ a, k }) => allDistinct([a + k, a * k, Math.log(a) + k, a + 1].map(r6)));
      return {
        params: { a, k },
        promptText: r`Compute $e^{\ln ${a}} + \ln\big(e^{${k}}\big)$.`,
        options: [
          { id: 'a', label: `$${a + k}$`, value: a + k },
          { id: 'b', label: `$${a * k}$`, value: a * k, trapExplanation: r`The two terms are added: $${a} + ${k}$.` },
          { id: 'c', label: r`$\ln ${a} + ${k}$`, value: Math.log(a) + k, trapExplanation: r`$e^{\ln ${a}} = ${a}$: the exponential undoes the logarithm completely.` },
          { id: 'd', label: `$${a + 1}$`, value: a + 1, trapExplanation: r`$\ln(e^{${k}}) = ${k}$, not 1. (It is $\ln e$ alone that equals 1.)` },
        ],
        stepByStepSolution: [r`$e^x$ and $\ln x$ are inverse functions.`, r`$e^{\ln ${a}} = ${a}$ and $\ln(e^{${k}}) = ${k}$.`, r`Sum: $${a + k}$.`],
      };
    },
  },
  {
    id: 'sm-04-x3',
    difficulty: 1,
    keyConceptTag: 'The product rule',
    correctOptionId: 'a',
    generate: (g) => {
      const [a, b] = g.pick([[2, 50], [2, 500], [4, 25], [4, 250], [5, 20], [5, 200], [8, 125], [20, 50], [25, 40], [25, 4000], [50, 200]]);
      const n = Math.round(Math.log10(a * b));
      return {
        params: { a, b },
        promptText: r`Compute $\log_{10} ${a} + \log_{10} ${b}$.`,
        options: [
          { id: 'a', label: `$${n}$`, value: n },
          { id: 'b', label: r`$\log_{10} ${a + b}$`, value: Math.log10(a + b), trapExplanation: r`Adding logarithms multiplies the numbers: $\log_{10}(${a}\cdot${b})$.` },
          { id: 'c', label: `$${a * b}$`, value: a * b, trapExplanation: r`${a * b} is the product; take its logarithm.` },
          { id: 'd', label: `$${n + 1}$`, value: n + 1, trapExplanation: r`$10^{${n}} = ${a * b}$: count the zeros of ${a * b}.` },
        ],
        stepByStepSolution: [r`$\log a + \log b = \log(ab)$.`, r`$${a}\cdot${b} = ${a * b} = 10^{${n}}$.`, r`$\log_{10} ${a * b} = ${n}$.`],
      };
    },
  },
  {
    id: 'sm-04-x4',
    difficulty: 2,
    keyConceptTag: 'Change of base',
    correctOptionId: 'a',
    generate: (g) => {
      const { b, p, q } = g.until(() => ({ b: g.pick([2, 3]), p: g.int(2, 3), q: g.int(1, 6) }), ({ b, p, q }) => p !== q && b ** q <= 729 && allDistinct([q / p, p / q, q, b ** (q - p)].map(r6)));
      return {
        params: { B: b ** p, N: b ** q },
        promptText: r`Compute $\log_{${b ** p}} ${b ** q}$.`,
        options: [
          { id: 'a', label: `$${frac(q, p)}$`, value: q / p },
          { id: 'b', label: `$${frac(p, q)}$`, value: p / q, trapExplanation: r`Upside down: $\log_{${b ** p}} ${b ** q} = \frac{\ln ${b ** q}}{\ln ${b ** p}}$, the base goes below.` },
          { id: 'c', label: `$${q}$`, value: q, trapExplanation: r`${q} is $\log_{${b}} ${b ** q}$. Here the base is $${b ** p} = ${b}^{${p}}$.` },
          { id: 'd', label: `$${frac(b ** Math.max(q - p, 0), b ** Math.max(p - q, 0))}$`, value: b ** (q - p), trapExplanation: r`That divides the numbers instead of their logarithms.` },
        ],
        stepByStepSolution: [
          r`Write both as powers of ${b}: $${b ** p} = ${b}^{${p}}$ and $${b ** q} = ${b}^{${q}}$.`,
          r`Change of base: $\log_{${b ** p}} ${b ** q} = \frac{\log_{${b}} ${b ** q}}{\log_{${b}} ${b ** p}} = \frac{${q}}{${p}}$.`,
          r`$= ${frac(q, p)}$. Check: $${b ** p}^{${frac(q, p)}} = ${b}^{${q}} = ${b ** q}$. ✓`,
        ],
      };
    },
  },
  {
    id: 'sm-04-x5',
    difficulty: 2,
    keyConceptTag: 'Solving an exponential equation',
    correctOptionId: 'a',
    generate: (g) => {
      const { a, b } = g.until(() => ({ a: g.int(2, 6), b: g.nonzero(-12, 12) }), ({ a, b }) => allDistinct([b / a, b - a, a / b, a * b].map(r6)));
      return {
        params: { a, b },
        promptText: r`Solve $e^{${a}x} = e^{${b}}$.`,
        options: [
          { id: 'a', label: `$x = ${frac(b, a)}$`, value: b / a },
          { id: 'b', label: `$x = ${b - a}$`, value: b - a, trapExplanation: r`$${a}x = ${b}$ is solved by dividing by ${a}, not by subtracting.` },
          { id: 'c', label: `$x = ${frac(a, b)}$`, value: a / b, trapExplanation: r`Upside down: $x = \frac{${b}}{${a}}$.` },
          { id: 'd', label: `$x = ${a * b}$`, value: a * b, trapExplanation: r`Divide by ${a}, do not multiply.` },
        ],
        stepByStepSolution: [r`Take $\ln$ of both sides: $${a}x = ${b}$.`, r`Divide by ${a}.`, r`$x = ${frac(b, a)}$.`],
      };
    },
  },
  {
    id: 'sm-04-x6',
    difficulty: 2,
    keyConceptTag: 'Compound growth',
    correctOptionId: 'a',
    generate: (g) => {
      const { P, rate, n } = g.until(
        () => ({ P: g.pick([500, 1000, 2000, 5000]), rate: g.pick([0.05, 0.1, 0.2]), n: g.int(2, 3) }),
        ({ P, rate, n }) => allDistinct([P * (1 + rate) ** n, P * (1 + n * rate), P * (1 + rate) * n, P * rate ** n].map((x) => Math.round(x * 100))),
      );
      const v = P * (1 + rate) ** n;
      const pct = Math.round(rate * 100);
      return {
        params: { P, rate, n },
        promptText: r`${P} € grow by ${pct}% per year, with the growth added each year. How much is it after ${n} years?`,
        options: [
          { id: 'a', label: `$${dec(v)}$ €`, value: v },
          { id: 'b', label: `$${dec(P * (1 + n * rate))}$ €`, value: P * (1 + n * rate), trapExplanation: r`That adds ${pct}% of the <i>original</i> amount each year. The growth is compounded: each year multiplies by ${dec(1 + rate)}.` },
          { id: 'c', label: `$${dec(P * (1 + rate) * n)}$ €`, value: P * (1 + rate) * n, trapExplanation: r`Growth for ${n} years multiplies by $${dec(1 + rate)}$ ${n} times: a power, not a multiplication by ${n}.` },
          { id: 'd', label: `$${dec(Math.round(P * rate ** n * 1e6) / 1e6)}$ €`, value: P * rate ** n, trapExplanation: r`The factor per year is $1 + ${dec(rate)} = ${dec(1 + rate)}$, not ${dec(rate)}.` },
        ],
        stepByStepSolution: [r`Each year multiplies by $1 + ${dec(rate)} = ${dec(1 + rate)}$.`, r`After ${n} years: $${P}\cdot${dec(1 + rate)}^{${n}}$.`, r`$= ${dec(v)}$ €.`],
      };
    },
  },
];
