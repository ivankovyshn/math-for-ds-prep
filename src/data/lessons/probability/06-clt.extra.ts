import type { QuestionTemplate } from '../../../types.ts';
import { r } from '../define.ts';
import { allDistinct, dec, frac } from '../gen.ts';
import { RULE_CASES, ruleOptions, ruleQuestion } from './03-distributions.practice.ts';

const r4 = (x: number) => Math.round(x * 1e4) / 1e4;

/** Extra practice (Practice 2): gentler questions on the same ideas, with new numbers every time. */
export const extra: QuestionTemplate[] = [
  {
    id: 'pr-06-x1',
    difficulty: 1,
    keyConceptTag: 'The mean of the sample mean',
    correctOptionId: 'a',
    generate: (g) => {
      const { m, n } = g.until(() => ({ m: g.int(2, 50), n: g.pick([4, 9, 16, 25, 100]) }), ({ m, n }) => allDistinct([m, m / n, n * m, m / Math.sqrt(n)].map(r4)));
      return {
        params: { m, n },
        promptText: r`Each of ${n} i.i.d. observations has mean ${m}. What is $E[\bar X]$?`,
        options: [
          { id: 'a', label: `$${m}$`, value: m },
          { id: 'b', label: `$${dec(r4(m / n))}$`, value: m / n, trapExplanation: r`The average divides the <i>sum</i> (mean ${n * m}) by ${n}, which brings it back to ${m}.` },
          { id: 'c', label: `$${n * m}$`, value: n * m, trapExplanation: r`That is the mean of the sum, not of the average.` },
          { id: 'd', label: `$${dec(r4(m / Math.sqrt(n)))}$`, value: m / Math.sqrt(n), trapExplanation: r`$\sqrt n$ appears in the standard error, not in the mean.` },
        ],
        stepByStepSolution: [
          r`$E[\bar X] = \frac1n\sum E[X_i]$ by linearity.`,
          r`$= \frac{1}{${n}}\cdot${n}\cdot${m}$.`,
          r`$= ${m}$: the sample mean is unbiased.`,
        ],
      };
    },
  },
  {
    id: 'pr-06-x2',
    difficulty: 1,
    keyConceptTag: 'Variance of the sample mean',
    correctOptionId: 'a',
    generate: (g) => {
      const { s, n } = g.until(() => ({ s: g.int(2, 12), n: g.pick([4, 9, 16, 25, 36, 100]) }), ({ s, n }) => allDistinct([(s * s) / n, s * s, (s * s) / Math.sqrt(n), s / n].map(r4)));
      return {
        params: { s, n },
        promptText: r`Observations have variance $\sigma^2 = ${s * s}$. What is $\operatorname{Var}\bar X$ for $n = ${n}$ i.i.d. observations?`,
        options: [
          { id: 'a', label: `$${frac(s * s, n)}$`, value: (s * s) / n },
          { id: 'b', label: `$${s * s}$`, value: s * s, trapExplanation: r`Averaging reduces the variance: $\operatorname{Var}\bar X = \frac{\sigma^2}{n}$.` },
          { id: 'c', label: `$${frac(s * s, Math.sqrt(n))}$`, value: (s * s) / Math.sqrt(n), trapExplanation: r`$\sqrt n$ belongs to the standard deviation; the variance divides by $n$.` },
          { id: 'd', label: `$${frac(s, n)}$`, value: s / n, trapExplanation: r`That divides $\sigma$, not $\sigma^2$, by $n$.` },
        ],
        stepByStepSolution: [
          r`$\operatorname{Var}\bar X = \frac{1}{n^2}\operatorname{Var}\sum X_i = \frac{1}{n^2}\cdot n\sigma^2$.`,
          r`$= \frac{\sigma^2}{n} = \frac{${s * s}}{${n}}$.`,
          r`$= ${frac(s * s, n)}$.`,
        ],
      };
    },
  },
  {
    id: 'pr-06-x3',
    difficulty: 1,
    keyConceptTag: 'The law of large numbers',
    correctOptionId: 'a',
    generate: (g) => {
      const n = g.pick([600, 1200, 3000, 6000, 12000]);
      return {
        params: { n },
        promptText: r`A fair die is rolled ${n} times. About how many sixes do you expect?`,
        options: [
          { id: 'a', label: `$${n / 6}$`, value: n / 6 },
          { id: 'b', label: `$${n / 2}$`, value: n / 2, trapExplanation: r`A six is one face out of six, not one of two outcomes.` },
          { id: 'c', label: `$${n / 36}$`, value: n / 36, trapExplanation: r`$\frac1{36}$ is the chance of two sixes in two rolls; here each roll counts once.` },
          { id: 'd', label: '$6$', value: 6, trapExplanation: r`The count grows with the number of rolls: about one in six.` },
        ],
        stepByStepSolution: [
          r`Each roll is a six with probability $\frac16$.`,
          r`Expected count: $${n}\cdot\frac16$; by the law of large numbers the actual share will be close to $\frac16$.`,
          r`$\approx ${n / 6}$ sixes.`,
        ],
      };
    },
  },
  {
    id: 'pr-06-x4',
    difficulty: 2,
    keyConceptTag: 'How the error shrinks',
    correctOptionId: 'a',
    generate: (g) => {
      const { k, se } = g.until(() => ({ k: g.pick([4, 9, 16, 25]), se: g.pick([2, 3, 4, 6, 10, 12]) }), ({ k, se }) => allDistinct([se / Math.sqrt(k), se / k, se * Math.sqrt(k), se].map(r4)));
      return {
        params: { k, se },
        promptText: r`With $n$ observations the standard error is ${se}. What is it with $${k}n$ observations?`,
        options: [
          { id: 'a', label: `$${dec(r4(se / Math.sqrt(k)))}$`, value: se / Math.sqrt(k) },
          { id: 'b', label: `$${dec(r4(se / k))}$`, value: se / k, trapExplanation: r`The error scales like $\frac{1}{\sqrt n}$: ${k} times the data divides it by $\sqrt{${k}} = ${Math.sqrt(k)}$.` },
          { id: 'c', label: `$${dec(se * Math.sqrt(k))}$`, value: se * Math.sqrt(k), trapExplanation: r`More data makes the mean more precise, not less.` },
          { id: 'd', label: `$${se}$`, value: se, trapExplanation: r`The standard error depends on $n$: $\frac{\sigma}{\sqrt n}$.` },
        ],
        stepByStepSolution: [
          r`$\operatorname{SE} = \frac{\sigma}{\sqrt n}$.`,
          r`Replacing $n$ by $${k}n$ divides it by $\sqrt{${k}} = ${Math.sqrt(k)}$.`,
          r`$\frac{${se}}{${Math.sqrt(k)}} = ${dec(r4(se / Math.sqrt(k)))}$.`,
        ],
      };
    },
  },
  {
    id: 'pr-06-x5',
    difficulty: 2,
    keyConceptTag: 'Probabilities from the CLT',
    correctOptionId: 'a',
    generate: (g) => {
      const c = g.pick(RULE_CASES.filter((x) => Number.isFinite(x.lo) && Number.isFinite(x.hi)));
      const se = g.pick([1, 2, 3]);
      const n = g.pick([25, 100]);
      const m = g.pick([40, 75, 100]);
      return {
        params: { m, s: se * Math.sqrt(n), n, lo: c.lo, hi: c.hi },
        promptText: r`$\bar X$ is the mean of ${n} i.i.d. observations with mean ${m} and standard deviation ${se * Math.sqrt(n)}. Approximately what is $${ruleQuestion(c, m, se).replace(/X/g, '\\bar X')}$?`,
        options: ruleOptions(c),
        stepByStepSolution: [
          r`Standard error: $\frac{${se * Math.sqrt(n)}}{\sqrt{${n}}} = ${se}$.`,
          r`The interval is $${m} \pm ${c.hi === 1 ? '' : c.hi}\cdot${se}$: within ${c.hi} standard error${c.hi === 1 ? '' : 's'} of the mean.`,
          r`By the CLT and the 68–95 rule: about ${c.ans}%.`,
        ],
      };
    },
  },
  {
    id: 'pr-06-x6',
    difficulty: 2,
    keyConceptTag: 'The spread of a sum',
    correctOptionId: 'a',
    generate: (g) => {
      const { s, n } = g.until(() => ({ s: g.int(2, 9), n: g.pick([4, 9, 16, 25, 36, 49, 100]) }), ({ s, n }) => allDistinct([s * Math.sqrt(n), s * n, s * s * n, s / Math.sqrt(n)].map(r4)));
      return {
        params: { s, n },
        promptText: r`A delivery route has ${n} independent stops, each taking a random time with standard deviation ${s} minutes. What is the standard deviation of the total time?`,
        options: [
          { id: 'a', label: `$${s * Math.sqrt(n)}$`, value: s * Math.sqrt(n) },
          { id: 'b', label: `$${s * n}$`, value: s * n, trapExplanation: r`Independent random parts partly cancel; standard deviations grow like $\sqrt n$, not $n$.` },
          { id: 'c', label: `$${s * s * n}$`, value: s * s * n, trapExplanation: r`That is the variance of the total; take the square root.` },
          { id: 'd', label: `$${dec(r4(s / Math.sqrt(n)))}$`, value: s / Math.sqrt(n), trapExplanation: r`That is the standard error of the <i>average</i> stop time.` },
        ],
        stepByStepSolution: [
          r`Variances of independent parts add: $${n}\cdot${s * s} = ${n * s * s}$.`,
          r`$\operatorname{SD} = \sqrt{${n * s * s}} = ${s}\sqrt{${n}}$.`,
          r`$= ${s * Math.sqrt(n)}$ minutes.`,
        ],
      };
    },
  },
];
