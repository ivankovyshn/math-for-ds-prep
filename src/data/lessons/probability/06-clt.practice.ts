import type { QuestionTemplate } from '../../../types.ts';
import { r } from '../define.ts';
import { allDistinct, dec } from '../gen.ts';
import { approx } from './01-spaces.practice.ts';
import { RULE_CASES, ruleOptions, ruleQuestion } from './03-distributions.practice.ts';

const SQUARES = [4, 9, 16, 25, 36, 49, 64, 100];
const r4 = (x: number) => Math.round(x * 1e4) / 1e4;
/** Proportion settings with a tidy standard error √(p(1−p)/n). */
const PROPS = [[0.5, 100], [0.2, 64], [0.1, 36], [0.5, 25], [0.2, 16], [0.1, 9], [0.5, 400], [0.2, 100], [0.1, 100], [0.5, 2500]];

export const practice: QuestionTemplate[] = [
  {
    id: 'pr-06-1',
    difficulty: 1,
    keyConceptTag: 'The standard error',
    correctOptionId: 'a',
    generate: (g) => {
      const { s, n } = g.until(
        () => ({ s: g.int(2, 30), n: g.pick(SQUARES) }),
        ({ s, n }) => allDistinct([s / Math.sqrt(n), s / n, (s * s) / n, s].map(r4)),
      );
      return {
        params: { s, n },
        promptText: r`Each observation has standard deviation $\sigma = ${s}$. What is the standard error of the mean of $n = ${n}$ independent observations?`,
        options: [
          { id: 'a', label: `$${dec(r4(s / Math.sqrt(n)))}$`, value: s / Math.sqrt(n) },
          { id: 'b', label: `$${dec(r4(s / n))}$`, value: s / n, trapExplanation: r`Divide by $\sqrt n = ${Math.sqrt(n)}$, not by $n$: averaging reduces the <i>variance</i> by $n$.` },
          { id: 'c', label: `$${dec(r4((s * s) / n))}$`, value: (s * s) / n, trapExplanation: r`$\frac{\sigma^2}{n}$ is the variance of $\bar X$; take its square root.` },
          { id: 'd', label: `$${s}$`, value: s, trapExplanation: r`That is the spread of one observation. The mean of ${n} is less variable.` },
        ],
        stepByStepSolution: [
          r`$\operatorname{SD}(\bar X) = \frac{\sigma}{\sqrt n}$.`,
          r`$= \frac{${s}}{\sqrt{${n}}} = \frac{${s}}{${Math.sqrt(n)}}$.`,
          r`$= ${dec(r4(s / Math.sqrt(n)))}$.`,
        ],
      };
    },
  },
  {
    id: 'pr-06-2',
    difficulty: 1,
    keyConceptTag: 'The spread of a sum',
    correctOptionId: 'a',
    generate: (g) => {
      const { s, n } = g.until(
        () => ({ s: g.int(2, 12), n: g.pick(SQUARES) }),
        ({ s, n }) => allDistinct([s * Math.sqrt(n), n * s, s / Math.sqrt(n), s].map(r4)),
      );
      return {
        params: { s, n },
        promptText: r`A total is the sum of ${n} independent amounts, each with standard deviation ${s}. What is the standard deviation of the total?`,
        options: [
          { id: 'a', label: `$${dec(s * Math.sqrt(n))}$`, value: s * Math.sqrt(n) },
          { id: 'b', label: `$${n * s}$`, value: n * s, trapExplanation: r`Standard deviations do not add; independent <i>variances</i> add: $${n}\cdot${s * s}$.` },
          { id: 'c', label: `$${dec(r4(s / Math.sqrt(n)))}$`, value: s / Math.sqrt(n), trapExplanation: r`That is the standard error of the <i>average</i>; the sum spreads more, not less.` },
          { id: 'd', label: `$${s}$`, value: s, trapExplanation: r`Adding independent amounts increases the spread.` },
        ],
        stepByStepSolution: [
          r`$\operatorname{Var}\sum X_i = n\sigma^2 = ${n}\cdot${s * s} = ${n * s * s}$.`,
          r`$\operatorname{SD} = \sqrt{${n * s * s}}$.`,
          r`$= ${s}\sqrt{${n}} = ${dec(s * Math.sqrt(n))}$.`,
        ],
      };
    },
  },
  {
    id: 'pr-06-3',
    difficulty: 2,
    keyConceptTag: 'Choosing a sample size',
    correctOptionId: 'a',
    generate: (g) => {
      const { k, e } = g.until(
        () => ({ k: g.int(2, 10), e: g.pick([0.5, 1, 2, 5]) }),
        ({ k, e }) => {
          const s = k * e;
          return allDistinct([k * k, k, 2 * k, (s * s) / e]);
        },
      );
      const s = k * e;
      return {
        params: { s, e },
        promptText: r`Observations have standard deviation $\sigma = ${dec(s)}$. How many independent observations make the standard error of the mean equal to ${dec(e)}?`,
        options: [
          { id: 'a', label: `$${k * k}$`, value: k * k },
          { id: 'b', label: `$${k}$`, value: k, trapExplanation: r`With $n = ${k}$ the standard error is $\frac{${dec(s)}}{\sqrt{${k}}}$, not $\frac{${dec(s)}}{${k}}$. Solve $\sqrt n = ${k}$.` },
          { id: 'c', label: `$${2 * k}$`, value: 2 * k, trapExplanation: r`The error falls like $\frac{1}{\sqrt n}$, so $n$ must be squared, not doubled.` },
          { id: 'd', label: `$${dec((s * s) / e)}$`, value: (s * s) / e, trapExplanation: r`From $\frac{\sigma}{\sqrt n} = e$: $n = \big(\frac{\sigma}{e}\big)^2$; the target ${dec(e)} must be squared too.` },
        ],
        stepByStepSolution: [
          r`$\frac{\sigma}{\sqrt n} = ${dec(e)}$ gives $\sqrt n = \frac{${dec(s)}}{${dec(e)}} = ${k}$.`,
          r`$n = ${k}^2$.`,
          r`$n = ${k * k}$.`,
        ],
      };
    },
  },
  {
    id: 'pr-06-4',
    difficulty: 2,
    keyConceptTag: 'Standard error of a proportion',
    correctOptionId: 'a',
    generate: (g) => {
      const [p, n] = g.pick(PROPS);
      const v = (p * (1 - p)) / n;
      return {
        params: { p, n },
        promptText: r`A click-through rate is estimated by the share of clicks among $n = ${n}$ independent views. If the true rate is $p = ${p}$, what is the standard error of the estimate?`,
        options: [
          { id: 'a', label: `$${dec(r4(Math.sqrt(v)))}$`, value: Math.sqrt(v) },
          { id: 'b', label: `$${dec(r4(v))}$`, value: v, trapExplanation: r`$\frac{p(1 - p)}{n}$ is the variance; the standard error is its square root.` },
          { id: 'c', label: `$${approx(Math.sqrt(p * (1 - p)) / n, 4)}$`, value: Math.sqrt(p * (1 - p)) / n, trapExplanation: r`The share is an average of $n$ indicators, so its SD is $\frac{\sigma}{\sqrt n}$, not $\frac{\sigma}{n}$.` },
          { id: 'd', label: `$${approx(Math.sqrt(p / n), 4)}$`, value: Math.sqrt(p / n), trapExplanation: r`One click indicator has variance $p(1 - p)$, not $p$.` },
        ],
        stepByStepSolution: [
          r`One view is Bernoulli$(p)$ with variance $p(1 - p) = ${dec(r4(p * (1 - p)))}$.`,
          r`The share is an average of ${n} of them: $\operatorname{SD} = \sqrt{\frac{p(1 - p)}{n}} = \sqrt{${dec(r4(v))}}$.`,
          r`$= ${dec(r4(Math.sqrt(v)))}$.`,
        ],
      };
    },
  },
  {
    id: 'pr-06-5',
    difficulty: 3,
    keyConceptTag: 'Probabilities from the CLT',
    correctOptionId: 'a',
    generate: (g) => {
      const c = g.pick(RULE_CASES);
      const se = g.pick([1, 2, 5]);
      const n = g.pick([25, 36, 100]);
      const s = se * Math.sqrt(n);
      const m = g.pick([50, 100, 200, 500]);
      return {
        params: { m, s, n, lo: Number.isFinite(c.lo) ? c.lo : -1e9, hi: Number.isFinite(c.hi) ? c.hi : 1e9 },
        promptText: r`$\bar X$ is the mean of ${n} i.i.d. observations with mean ${m} and standard deviation ${s}. Approximately what is $${ruleQuestion(c, m, se).replace(/X/g, '\\bar X')}$?`,
        options: ruleOptions(c),
        stepByStepSolution: [
          r`Standard error: $\frac{${s}}{\sqrt{${n}}} = ${se}$; by the CLT $\bar X \approx N(${m}, ${se}^2)$.`,
          r`${[c.lo, c.hi].filter((z) => Number.isFinite(z)).map((z) => `$${m + z * se}$ is $${z}$ standard error${Math.abs(z) === 1 ? '' : 's'} from the mean`).join('; ')}.`,
          r`By the 68–95 rule the probability is about ${c.ans}%.`,
        ],
      };
    },
  },
  {
    id: 'pr-06-6',
    difficulty: 3,
    keyConceptTag: 'A confidence interval for the mean',
    correctOptionId: 'a',
    generate: (g) => {
      const { xb, s, n } = g.until(
        () => ({ xb: g.int(20, 120), s: g.pick([4, 6, 8, 10, 12, 15, 20]), n: g.pick([4, 16, 25, 36, 64, 100]) }),
        ({ s, n }) => Number.isInteger((2 * s) / Math.sqrt(n) * 10) && allDistinct([(2 * s) / Math.sqrt(n), 2 * s, s / Math.sqrt(n), (2 * s) / n].map(r4)),
      );
      const half = (2 * s) / Math.sqrt(n);
      const iv = (h: number) => [r4(xb - h), r4(xb + h)];
      const lab = (h: number) => `$[${dec(r4(xb - h))},\\ ${dec(r4(xb + h))}]$`;
      return {
        params: { xb, s, n },
        promptText: r`A sample of $n = ${n}$ has mean $\bar x = ${xb}$; the population standard deviation is known to be $\sigma = ${s}$. Using $\pm2$ standard errors, what is an approximate 95% confidence interval for $\mu$?`,
        options: [
          { id: 'a', label: lab(half), value: iv(half) },
          { id: 'b', label: lab(2 * s), value: iv(2 * s), trapExplanation: r`$\pm2\sigma$ describes single observations. For the mean use the standard error $\frac{\sigma}{\sqrt n}$.` },
          { id: 'c', label: lab(s / Math.sqrt(n)), value: iv(s / Math.sqrt(n)), trapExplanation: r`$\pm1$ standard error covers only about 68%. For 95% use $\pm2$.` },
          { id: 'd', label: lab((2 * s) / n), value: iv((2 * s) / n), trapExplanation: r`The standard error divides by $\sqrt n = ${Math.sqrt(n)}$, not by $n$.` },
        ],
        stepByStepSolution: [
          r`Standard error: $\frac{${s}}{\sqrt{${n}}} = ${dec(r4(s / Math.sqrt(n)))}$.`,
          r`Half-width: $2\cdot${dec(r4(s / Math.sqrt(n)))} = ${dec(r4(half))}$.`,
          r`Interval: $${xb} \pm ${dec(r4(half))}$, i.e. ${lab(half)}.`,
        ],
      };
    },
  },
];
