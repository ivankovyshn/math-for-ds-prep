import type { QuestionTemplate } from '../../../types.ts';
import { r } from '../define.ts';
import { allDistinct, dec } from '../gen.ts';
import { meanSetting } from './03-intervals.practice.ts';

const r3 = (x: number) => Math.round(x * 1000) / 1000;
const r4 = (x: number) => Math.round(x * 1e4) / 1e4;
/** A/B settings: pooled share p and users per group n with a tidy SE = √(p(1 − p)·2/n). */
const AB = [[0.5, 50], [0.5, 200], [0.5, 800], [0.5, 1250], [0.5, 5000], [0.2, 800], [0.2, 3200], [0.1, 450], [0.1, 1800], [0.1, 800], [0.4, 1200], [0.3, 4200]];
/** Rule-of-thumb p-values: [z, two-sided?, answer, three tempting wrong answers]. */
const P_CASES: [number, boolean, number, number[]][] = [
  [2, true, 0.05, [0.025, 0.95, 0.32]],
  [2, false, 0.025, [0.05, 0.975, 0.16]],
  [1, true, 0.32, [0.16, 0.68, 0.05]],
  [1, false, 0.16, [0.32, 0.84, 0.025]],
];
const P_MEANING: Record<number, string> = {
  0.025: 'the area of one tail beyond $2$',
  0.05: 'the area of both tails beyond $\\pm2$',
  0.16: 'the area of one tail beyond $1$',
  0.32: 'the area of both tails beyond $\\pm1$',
  0.68: 'the probability of landing <i>within</i> $\\pm1$',
  0.84: 'the probability of landing <i>below</i> $1$',
  0.95: 'the probability of landing <i>within</i> $\\pm2$',
  0.975: 'the probability of landing <i>below</i> $2$',
};
/** Power when the true mean is k standard errors above μ₀ and H₀ is rejected beyond 2 SE: [k, answer %, wrong %, explanations]. */
const POWER: [number, number, [number, string][]][] = [
  [1, 16, [[84, 'That is $\\beta$, the chance of <i>missing</i> the effect.'], [2.5, 'That is $\\alpha$, the rejection chance when $H_0$ is true.'], [50, 'Power 50% needs the true mean right at the cut-off, 2 standard errors up.']]],
  [2, 50, [[2.5, 'That is $\\alpha$, the rejection chance when $H_0$ is true.'], [97.5, 'The true mean sits exactly at the cut-off, so half of the sample means fall below it.'], [16, 'That would be the power for a true mean only 1 standard error above $\\mu_0$.']]],
  [3, 84, [[16, 'That is $\\beta$, the chance of <i>missing</i> the effect.'], [2.5, 'That is $\\alpha$, the rejection chance when $H_0$ is true.'], [50, 'The true mean is 1 standard error <i>above</i> the cut-off, so more than half of the sample means exceed it.']]],
  [4, 97.5, [[2.5, 'That is $\\beta$ (here equal to $\\alpha$), the chance of missing the effect.'], [84, 'That would be the power for a true mean 3 standard errors above $\\mu_0$.'], [50, 'The true mean is 2 standard errors <i>above</i> the cut-off.']]],
];

export const practice: QuestionTemplate[] = [
  {
    id: 'st-04-1',
    difficulty: 1,
    keyConceptTag: 'The z statistic',
    correctOptionId: 'a',
    generate: (g) => {
      const { se, n, z } = g.until(
        () => ({ ...meanSetting(g), z: g.pick([-3, -2.5, -2, -1.5, -1, 1, 1.5, 2, 2.5, 3]) }),
        ({ se, n, z }) => allDistinct([z, r4(z / Math.sqrt(n)), z * se, -z]),
      );
      const s = se * Math.sqrt(n);
      const m0 = g.int(20, 200);
      const xb = m0 + z * se;
      return {
        params: { xb, m0, s, n },
        promptText: r`Test $H_0: \mu = ${m0}$ with known $\sigma = ${s}$. A sample of $n = ${n}$ has mean $\bar x = ${dec(xb)}$. What is the test statistic $z$?`,
        options: [
          { id: 'a', label: `$${z}$`, value: z },
          { id: 'b', label: `$${dec(r4(z / Math.sqrt(n)))}$`, value: r4(z / Math.sqrt(n)), trapExplanation: r`That divides by $\sigma$. The sample mean has standard error $\frac{\sigma}{\sqrt n} = ${dec(se)}$.` },
          { id: 'c', label: `$${dec(z * se)}$`, value: z * se, trapExplanation: r`$\bar x - \mu_0 = ${dec(z * se)}$ is the raw difference; divide it by the standard error.` },
          { id: 'd', label: `$${-z}$`, value: -z, trapExplanation: r`The order is $\bar x - \mu_0$: the sign shows on which side of $\mu_0$ the sample fell.` },
        ],
        stepByStepSolution: [
          r`$\operatorname{SE} = \frac{${s}}{\sqrt{${n}}} = ${dec(se)}$.`,
          r`$\bar x - \mu_0 = ${dec(xb)} - ${m0} = ${dec(z * se)}$.`,
          r`$z = \frac{${dec(z * se)}}{${dec(se)}} = ${z}$.`,
        ],
      };
    },
  },
  {
    id: 'st-04-2',
    difficulty: 1,
    keyConceptTag: 'Making a decision',
    correctOptionId: 'a',
    generate: (g) => {
      const { p, alpha } = g.until(
        () => ({ p: g.pick([0.001, 0.003, 0.008, 0.02, 0.03, 0.04, 0.07, 0.09, 0.12, 0.2, 0.35, 0.6]), alpha: g.pick([0.01, 0.05, 0.1]) }),
        ({ p, alpha }) => p !== alpha,
      );
      const reject = p <= alpha;
      const R = { label: r`Reject $H_0$`, why: r`$p = ${p} \le \alpha = ${alpha}$: data this extreme would be rare under $H_0$.` };
      const K = { label: r`Do not reject $H_0$`, why: r`$p = ${p} > \alpha = ${alpha}$: the data are compatible with $H_0$.` };
      const [right, wrong] = reject ? [R, K] : [K, R];
      return {
        params: { p, alpha, rejectIsA: reject ? 1 : 0 },
        promptText: r`A test at significance level $\alpha = ${alpha}$ gives $p = ${p}$. What is the conclusion?`,
        options: [
          { id: 'a', label: right.label },
          { id: 'b', label: wrong.label, trapExplanation: right.why },
          { id: 'c', label: r`Accept $H_0$: the data prove it is true`, trapExplanation: r`A test never proves $H_0$; at most it fails to find evidence against it.` },
          { id: 'd', label: r`$H_0$ is true with probability $${p}$`, trapExplanation: r`The p-value is computed <i>assuming</i> $H_0$; it is not the probability that $H_0$ is true.` },
        ],
        stepByStepSolution: [
          r`The rule: reject $H_0$ when $p \le \alpha$.`,
          r`Here $p = ${p}$ and $\alpha = ${alpha}$, so $p ${reject ? r`\le` : '>'} \alpha$.`,
          r`${right.label}.`,
        ],
      };
    },
  },
  {
    id: 'st-04-3',
    difficulty: 2,
    keyConceptTag: 'p-values from the normal rule',
    correctOptionId: 'a',
    generate: (g) => {
      const [z, two, ans, wrong] = g.pick(P_CASES);
      const zs = two ? z * g.pick([-1, 1]) : z;
      return {
        params: { z: zs, two: two ? 1 : 0 },
        promptText: two
          ? r`A two-sided test ($H_1: \mu \ne \mu_0$) gives $z = ${zs}$. Approximately what is the p-value?`
          : r`A one-sided test ($H_1: \mu > \mu_0$) gives $z = ${zs}$. Approximately what is the p-value?`,
        options: [ans, ...wrong].map((v, i) => ({
          id: 'abcd'[i],
          label: `$\\approx ${v}$`,
          value: v,
          ...(i === 0 ? {} : { trapExplanation: `${v} is ${P_MEANING[v]}.` }),
        })),
        stepByStepSolution: [
          two ? r`Two-sided: $p = P(|Z| \ge ${z})$, both tails.` : r`One-sided: $p = P(Z \ge ${z})$, the upper tail only.`,
          r`About ${z === 1 ? 68 : 95}% of $N(0, 1)$ lies within $\pm${z}$, so the two tails hold about ${z === 1 ? 32 : 5}%${two ? '' : ' and one tail half of that'}.`,
          r`$p \approx ${ans}$.`,
        ],
      };
    },
  },
  {
    id: 'st-04-4',
    difficulty: 2,
    keyConceptTag: 'Multiple testing',
    correctOptionId: 'a',
    generate: (g) => {
      const [m, a] = g.pick([[5, 0.05], [10, 0.05], [10, 0.01], [20, 0.01], [50, 0.01], [5, 0.1]]);
      const ans = 1 - (1 - a) ** m;
      return {
        params: { m, a },
        promptText: r`A team runs ${m} independent tests at $\alpha = ${a}$, and every null hypothesis is actually true. What is the probability of at least one false positive?`,
        options: [
          { id: 'a', label: `$\\approx ${dec(r3(ans))}$`, value: r3(ans) },
          { id: 'b', label: `$${dec(r3(m * a))}$`, value: r3(m * a), trapExplanation: r`$${m}\cdot${a}$ is the expected number of false positives (and an upper bound on the probability).` },
          { id: 'c', label: `$${a}$`, value: a, trapExplanation: r`$\alpha$ is the false-alarm rate of one test; ${m} tests give ${m} chances.` },
          { id: 'd', label: `$\\approx ${dec(r3((1 - a) ** m))}$`, value: r3((1 - a) ** m), trapExplanation: r`That is the probability of <i>no</i> false positive.` },
        ],
        stepByStepSolution: [
          r`Each test avoids a false alarm with probability $1 - ${a} = ${dec(1 - a)}$.`,
          r`All ${m} avoid it: $${dec(1 - a)}^{${m}} \approx ${dec(r3((1 - a) ** m))}$.`,
          r`At least one false positive: $1 - ${dec(r3((1 - a) ** m))} \approx ${dec(r3(ans))}$.`,
        ],
      };
    },
  },
  {
    id: 'st-04-5',
    difficulty: 3,
    keyConceptTag: 'An A/B test',
    correctOptionId: 'a',
    generate: (g) => {
      const { p, n, z, kA } = g.until(
        () => {
          const [p, n] = g.pick(AB);
          const z = g.pick([1, 1.5, 2, 2.5, 3]);
          const se = Math.sqrt((p * (1 - p) * 2) / n);
          return { p, n, z, kA: n * (p - (z * se) / 2) };
        },
        ({ p, n, kA }) => Math.abs(kA - Math.round(kA)) < 1e-6 && kA > 0 && Math.abs(2 * n * p - Math.round(2 * n * p)) < 1e-6,
      );
      const se = Math.sqrt((p * (1 - p) * 2) / n);
      const A = Math.round(kA);
      const B = Math.round(2 * n * p) - A;
      const d = (B - A) / n;
      return {
        params: { kA: A, kB: B, n },
        promptText: r`In an A/B test each version had $n = ${n}$ users. Version A converted ${A} users and version B ${B}. Using the pooled share, what is the $z$ statistic for $H_0: p_A = p_B$?`,
        options: [
          { id: 'a', label: `$${z}$`, value: z },
          { id: 'b', label: `$${dec(r4(z * Math.SQRT2))}$`, value: r4(z * Math.SQRT2), trapExplanation: r`The difference of two shares has variance $\hat p(1 - \hat p)\big(\frac1n + \frac1n\big)$: the factor 2 is missing.` },
          { id: 'c', label: `$${2 * z}$`, value: 2 * z, trapExplanation: r`Each group has $n = ${n}$ users, so the variance is $\hat p(1 - \hat p)\cdot\frac{2}{n}$, not $\frac{1}{2n}$.` },
          { id: 'd', label: `$${dec(r4(d / (se * se)))}$`, value: r4(d / (se * se)), trapExplanation: r`Divide by the standard error, the square root of the variance.` },
        ],
        stepByStepSolution: [
          r`$\hat p_A = ${dec(A / n)}$, $\hat p_B = ${dec(B / n)}$; pooled $\hat p = \frac{${A + B}}{${2 * n}} = ${p}$.`,
          r`$\operatorname{SE} = \sqrt{${p}\cdot${dec(1 - p)}\cdot\frac{2}{${n}}} = ${dec(r4(se))}$.`,
          r`$z = \frac{${dec(B / n)} - ${dec(A / n)}}{${dec(r4(se))}} = ${z}$.`,
        ],
      };
    },
  },
  {
    id: 'st-04-6',
    difficulty: 3,
    keyConceptTag: 'Power of a test',
    correctOptionId: 'a',
    generate: (g) => {
      const [k, ans, wrong] = g.pick(POWER);
      const { se, n } = meanSetting(g);
      const s = se * Math.sqrt(n);
      const m0 = g.int(20, 200);
      const cut = m0 + 2 * se;
      const mu = m0 + k * se;
      return {
        params: { m0, s, n, mu },
        promptText: r`A one-sided test of $H_0: \mu = ${m0}$ uses $\sigma = ${s}$ and $n = ${n}$, and rejects when $\bar x > ${dec(cut)}$ (2 standard errors above $\mu_0$). If in fact $\mu = ${dec(mu)}$, approximately what is the power of the test?`,
        options: [
          { id: 'a', label: `$\\approx ${ans}\\%$`, value: ans },
          ...wrong.map(([v, why], i) => ({ id: 'bcd'[i], label: `$\\approx ${v}\\%$`, value: v, trapExplanation: why })),
        ],
        stepByStepSolution: [
          r`$\operatorname{SE} = \frac{${s}}{\sqrt{${n}}} = ${dec(se)}$; under $\mu = ${dec(mu)}$, $\bar X \approx N(${dec(mu)}, ${dec(se)}^2)$.`,
          r`The cut-off ${dec(cut)} is $\frac{${dec(cut)} - ${dec(mu)}}{${dec(se)}} = ${2 - k}$ standard errors from the true mean.`,
          r`Power $= P(Z > ${2 - k}) \approx ${ans}\%$ by the 68–95 rule.`,
        ],
      };
    },
  },
];
