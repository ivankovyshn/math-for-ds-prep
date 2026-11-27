import type { QuestionTemplate } from '../../../types.ts';
import { r } from '../define.ts';
import { allDistinct, binomial, dec, frac, ints, shuffle, sumOf } from '../gen.ts';
import { intMeanData, list, meanOf } from './01-estimators.practice.ts';

const r6 = (x: number) => Math.round(x * 1e6) / 1e6;

/** Extra practice (Practice 2): gentler questions on the same ideas, with new numbers every time. */
export const extra: QuestionTemplate[] = [
  {
    id: 'st-02-x1',
    difficulty: 1,
    keyConceptTag: 'MLE of a probability',
    correctOptionId: 'a',
    generate: (g) => {
      const n = g.pick([8, 10, 12]);
      const seq = g.until(() => ints(g, n, 0, 1), (s) => {
        const h = sumOf(s);
        return h > 0 && h < n && allDistinct([h / n, (n - h) / n, 0.5, h / (n - h)]);
      });
      const h = sumOf(seq);
      return {
        params: { seq },
        promptText: r`A coin is tossed ${n} times: ${seq.map((x) => (x ? 'H' : 'T')).join(' ')}. What is the maximum likelihood estimate of $p = P(\text{H})$?`,
        options: [
          { id: 'a', label: `$${frac(h, n)}$`, value: h / n },
          { id: 'b', label: `$${frac(n - h, n)}$`, value: (n - h) / n, trapExplanation: r`That is the share of tails.` },
          { id: 'c', label: r`$\tfrac12$`, value: 0.5, trapExplanation: r`$\frac12$ is what a fair coin would have; the MLE follows the data.` },
          { id: 'd', label: `$${frac(h, n - h)}$`, value: h / (n - h), trapExplanation: r`Heads divided by tails is the odds, not the probability.` },
        ],
        stepByStepSolution: [
          r`Count the heads: ${h} of ${n}.`,
          r`$L(p) = p^{${h}}(1-p)^{${n - h}}$ peaks at $\hat p = \frac kn$.`,
          r`$\hat p = ${frac(h, n)}$.`,
        ],
      };
    },
  },
  {
    id: 'st-02-x2',
    difficulty: 1,
    keyConceptTag: 'MLE for a Poisson rate',
    correctOptionId: 'a',
    generate: (g) => {
      const xs = g.until(() => ints(g, 4, 0, 12), (xs) => allDistinct([sumOf(xs) / 4, sumOf(xs), sumOf(xs) / 3, Math.min(...xs)]));
      const s = sumOf(xs);
      return {
        params: { xs },
        promptText: r`Goals per match in four matches: $${list(xs)}$. If goals are Poisson$(\lambda)$, what is the MLE of $\lambda$?`,
        options: [
          { id: 'a', label: `$${dec(s / 4)}$`, value: s / 4 },
          { id: 'b', label: `$${s}$`, value: s, trapExplanation: r`${s} is the total over four matches; $\lambda$ is per match.` },
          { id: 'c', label: `$${dec(Math.round((s / 3) * 1e4) / 1e4)}$`, value: s / 3, trapExplanation: r`Divide by the number of matches, 4.` },
          { id: 'd', label: `$${Math.min(...xs)}$`, value: Math.min(...xs), trapExplanation: r`The quietest match is not the average one.` },
        ],
        stepByStepSolution: [
          r`For a Poisson sample, $\hat\lambda = \bar x$.`,
          r`$\bar x = \frac{${xs.join(' + ')}}{4} = \frac{${s}}{4}$.`,
          r`$\hat\lambda = ${dec(s / 4)}$ goals per match.`,
        ],
      };
    },
  },
  {
    id: 'st-02-x3',
    difficulty: 1,
    keyConceptTag: 'MLE of a normal mean',
    correctOptionId: 'a',
    generate: (g) => {
      const xs = g.until(() => intMeanData(g, 5, 10, 40), (xs) => {
        const s = [...xs].sort((a, b) => a - b);
        return allDistinct([meanOf(xs), s[2], (s[0] + s[4]) / 2, sumOf(xs) / 4]);
      });
      const s = [...xs].sort((a, b) => a - b);
      return {
        params: { xs },
        promptText: r`Temperatures $${list(xs)}$ are modelled as i.i.d. $N(\mu, 4)$. What is the MLE of $\mu$?`,
        options: [
          { id: 'a', label: `$${meanOf(xs)}$`, value: meanOf(xs) },
          { id: 'b', label: `$${s[2]}$`, value: s[2], trapExplanation: r`That is the median. The normal likelihood is maximised by the mean (the median maximises a Laplace likelihood).` },
          { id: 'c', label: `$${dec((s[0] + s[4]) / 2)}$`, value: (s[0] + s[4]) / 2, trapExplanation: r`The midpoint of the smallest and largest values uses only two of the five observations.` },
          { id: 'd', label: `$${dec(sumOf(xs) / 4)}$`, value: sumOf(xs) / 4, trapExplanation: r`The mean divides by $n = 5$.` },
        ],
        stepByStepSolution: [
          r`$\ell(\mu) = -\frac{1}{8}\sum (x_i - \mu)^2 + \text{const}$, largest where $\sum (x_i - \mu)^2$ is smallest.`,
          r`Setting $\sum (x_i - \mu) = 0$ gives $\mu = \bar x$.`,
          r`$\hat\mu = \frac{${sumOf(xs)}}{5} = ${meanOf(xs)}$.`,
        ],
      };
    },
  },
  {
    id: 'st-02-x4',
    difficulty: 2,
    keyConceptTag: 'Evaluating a likelihood',
    correctOptionId: 'a',
    generate: (g) => {
      const { seq, p } = g.until(
        () => ({ seq: ints(g, g.pick([3, 4]), 0, 1), p: g.pick([0.2, 0.3, 0.4, 0.6, 0.7, 0.8]) }),
        ({ seq, p }) => {
          const k = sumOf(seq);
          const L = p ** k * (1 - p) ** (seq.length - k);
          return k > 0 && k < seq.length && allDistinct([L, binomial(seq.length, k) * L, p ** k, k * p].map(r6));
        },
      );
      const n = seq.length;
      const k = sumOf(seq);
      const L = r6(p ** k * (1 - p) ** (n - k));
      return {
        params: { seq, p },
        promptText: r`The outcomes of ${n} independent trials are ${seq.map((x) => (x ? 'S' : 'F')).join(', ')} (S = success). What is the likelihood of this sequence at $p = ${p}$?`,
        options: [
          { id: 'a', label: `$${dec(L)}$`, value: L },
          { id: 'b', label: `$${dec(r6(binomial(n, k) * L))}$`, value: r6(binomial(n, k) * L), trapExplanation: r`The factor $\binom{${n}}{${k}}$ counts every order; this question is about one specific sequence.` },
          { id: 'c', label: `$${dec(r6(p ** k))}$`, value: r6(p ** k), trapExplanation: r`The failures contribute too, each with probability $1 - p = ${dec(1 - p)}$.` },
          { id: 'd', label: `$${dec(r6(k * p))}$`, value: r6(k * p), trapExplanation: r`Probabilities of independent outcomes multiply, they do not add.` },
        ],
        stepByStepSolution: [
          r`Each S contributes $p = ${p}$ and each F contributes $1 - p = ${dec(1 - p)}$.`,
          r`$L = ${p}^{${k}}\cdot${dec(1 - p)}^{${n - k}}$.`,
          r`$= ${dec(L)}$.`,
        ],
      };
    },
  },
  {
    id: 'st-02-x5',
    difficulty: 2,
    keyConceptTag: 'MLE for an exponential rate',
    correctOptionId: 'a',
    generate: (g) => {
      const { m, n } = g.until(() => ({ m: g.pick([2, 4, 5, 8, 10, 20]), n: g.pick([5, 10, 20, 50]) }), ({ m, n }) => allDistinct([1 / m, m, n / m, 1 / (n * m)]));
      return {
        params: { m, n },
        promptText: r`${n} customers waited on average ${m} minutes. Modelling waits as Exponential$(\lambda)$, what is the MLE of the rate $\lambda$ (per minute)?`,
        options: [
          { id: 'a', label: `$${frac(1, m)}$`, value: 1 / m },
          { id: 'b', label: `$${m}$`, value: m, trapExplanation: r`${m} is the mean wait $\frac1\lambda$; the rate is the reciprocal.` },
          { id: 'c', label: `$${frac(n, m)}$`, value: n / m, trapExplanation: r`$\hat\lambda = \frac{n}{\sum x_i} = \frac{${n}}{${n}\cdot${m}}$: the $n$ cancels.` },
          { id: 'd', label: `$${frac(1, n * m)}$`, value: 1 / (n * m), trapExplanation: r`That is one over the total waiting time; the MLE is $n$ over the total.` },
        ],
        stepByStepSolution: [
          r`$\ell(\lambda) = n\log\lambda - \lambda\sum x_i$, with $\sum x_i = ${n}\cdot${m} = ${n * m}$.`,
          r`$\frac{n}{\lambda} = \sum x_i$ gives $\hat\lambda = \frac{${n}}{${n * m}}$.`,
          r`$\hat\lambda = ${frac(1, m)}$.`,
        ],
      };
    },
  },
  {
    id: 'st-02-x6',
    difficulty: 2,
    keyConceptTag: 'Comparing likelihoods',
    correctOptionId: 'a',
    generate: (g) => {
      const n = g.pick([5, 10, 15, 20]);
      const p = g.pick([0.2, 0.4, 0.6, 0.8]);
      const k = Math.round(n * p);
      const others = shuffle(g, [0.2, 0.4, 0.6, 0.8].filter((q) => q !== p));
      return {
        params: { n, k, cands: [p, ...others] },
        promptText: r`In ${n} independent trials there were ${k} successes. Which of $p = 0.2, 0.4, 0.6, 0.8$ gives the data the highest likelihood?`,
        options: [
          { id: 'a', label: `$p = ${p}$`, value: p },
          ...others.map((q, i) => ({
            id: 'bcd'[i],
            label: `$p = ${q}$`,
            value: q,
            trapExplanation: r`$L(${q}) = ${q}^{${k}}\cdot${dec(1 - q)}^{${n - k}}$ is smaller: the likelihood peaks at the observed share $\frac{${k}}{${n}} = ${p}$.`,
          })),
        ],
        stepByStepSolution: [
          r`$L(p) = p^{${k}}(1 - p)^{${n - k}}$ has a single peak at $\hat p = \frac{${k}}{${n}}$.`,
          r`$\frac{${k}}{${n}} = ${p}$, one of the candidates.`,
          r`So $p = ${p}$ has the highest likelihood.`,
        ],
      };
    },
  },
];
