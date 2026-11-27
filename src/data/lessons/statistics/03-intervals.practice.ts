import type { QuestionTemplate } from '../../../types.ts';
import { r } from '../define.ts';
import { allDistinct, dec } from '../gen.ts';

const r4 = (x: number) => Math.round(x * 1e4) / 1e4;
export const Z: Record<number, number> = { 90: 1.645, 95: 1.96, 99: 2.576 };
/** An interval centre ± half as a label and as a value. */
export const interval = (c: number, half: number) => ({ label: `$[${dec(r4(c - half))},\\ ${dec(r4(c + half))}]$`, value: [r4(c - half), r4(c + half)] });
/** Proportions with a tidy standard error √(p(1 − p)/n). */
export const PROPS = [[0.5, 100], [0.2, 100], [0.1, 100], [0.5, 400], [0.2, 400], [0.1, 400], [0.5, 2500], [0.2, 25], [0.1, 900], [0.4, 600], [0.6, 600], [0.3, 2100]];
/** Sample settings whose standard error σ/√n is a tidy number. */
export const meanSetting = (g: { pick<T>(xs: readonly T[]): T; until<T>(make: () => T, ok: (v: T) => boolean): T }) =>
  g.until(() => ({ se: g.pick([0.5, 1, 1.5, 2, 2.5, 3, 5]), n: g.pick([16, 25, 36, 64, 100]) }), ({ se, n }) => Number.isInteger(se * Math.sqrt(n)));

export const practice: QuestionTemplate[] = [
  {
    id: 'st-03-1',
    difficulty: 1,
    keyConceptTag: 'A confidence interval for a mean',
    correctOptionId: 'a',
    generate: (g) => {
      const { se, n } = meanSetting(g);
      const s = se * Math.sqrt(n);
      const xb = g.int(20, 200);
      const iv = (h: number) => interval(xb, h);
      return {
        params: { xb, s, n },
        promptText: r`A sample of $n = ${n}$ has mean $\bar x = ${xb}$. The population standard deviation is $\sigma = ${s}$. What is the 95% confidence interval for $\mu$?`,
        options: [
          { id: 'a', ...iv(1.96 * se) },
          { id: 'b', ...iv(1.96 * s), trapExplanation: r`$\pm1.96\sigma$ is the range of single observations. The mean uses the standard error $\frac{\sigma}{\sqrt n} = ${dec(se)}$.` },
          { id: 'c', ...iv(se), trapExplanation: r`$\pm1$ standard error is only about a 68% interval.` },
          { id: 'd', ...iv((1.96 * s) / n), trapExplanation: r`The standard error divides by $\sqrt n = ${Math.sqrt(n)}$, not by $n$.` },
        ],
        stepByStepSolution: [
          r`$\operatorname{SE} = \frac{${s}}{\sqrt{${n}}} = ${dec(se)}$.`,
          r`Margin: $1.96\cdot${dec(se)} = ${dec(r4(1.96 * se))}$.`,
          r`$${xb} \pm ${dec(r4(1.96 * se))}$, i.e. ${iv(1.96 * se).label}.`,
        ],
      };
    },
  },
  {
    id: 'st-03-2',
    difficulty: 1,
    keyConceptTag: 'Confidence level and margin of error',
    correctOptionId: 'a',
    generate: (g) => {
      const L = g.pick([90, 95, 99]);
      const se = g.pick([0.5, 1, 2, 2.5, 4, 5, 10]);
      const [o1, o2] = [90, 95, 99].filter((x) => x !== L);
      const m = (z: number) => r4(z * se);
      return {
        params: { L, se },
        promptText: r`An estimate has standard error ${se}. What is the margin of error of its ${L}% confidence interval?`,
        options: [
          { id: 'a', label: `$${dec(m(Z[L]))}$`, value: m(Z[L]) },
          { id: 'b', label: `$${dec(m(Z[o1]))}$`, value: m(Z[o1]), trapExplanation: r`That uses $z = ${Z[o1]}$, the value for ${o1}%.` },
          { id: 'c', label: `$${dec(m(Z[o2]))}$`, value: m(Z[o2]), trapExplanation: r`That uses $z = ${Z[o2]}$, the value for ${o2}%.` },
          { id: 'd', label: `$${se}$`, value: se, trapExplanation: r`One standard error gives only about 68% confidence.` },
        ],
        stepByStepSolution: [
          r`For ${L}% confidence, $z = ${Z[L]}$: $P(-${Z[L]} < Z < ${Z[L]}) = ${L / 100}$.`,
          r`Margin $= z\cdot\operatorname{SE} = ${Z[L]}\cdot${se}$.`,
          r`$= ${dec(m(Z[L]))}$.`,
        ],
      };
    },
  },
  {
    id: 'st-03-3',
    difficulty: 2,
    keyConceptTag: 'Choosing a sample size',
    correctOptionId: 'a',
    generate: (g) => {
      const { k, e } = g.until(() => ({ k: g.int(2, 12), e: g.pick([0.5, 1, 2, 5]) }), ({ k }) => {
        const n = Math.ceil((1.96 * k) ** 2 - 1e-9);
        return allDistinct([n, Math.ceil(1.96 * k), k * k, Math.ceil(1.96 * k * k)]);
      });
      const s = k * e;
      const n = Math.ceil((1.96 * k) ** 2 - 1e-9);
      return {
        params: { s, e },
        promptText: r`Observations have $\sigma = ${dec(s)}$. What is the smallest $n$ for which the 95% margin of error $1.96\frac{\sigma}{\sqrt n}$ is at most ${dec(e)}?`,
        options: [
          { id: 'a', label: `$${n}$`, value: n },
          { id: 'b', label: `$${Math.ceil(1.96 * k)}$`, value: Math.ceil(1.96 * k), trapExplanation: r`That is $\frac{z\sigma}{E}$, which equals $\sqrt n$. Square it.` },
          { id: 'c', label: `$${k * k}$`, value: k * k, trapExplanation: r`$\big(\frac\sigma E\big)^2$ leaves out $z = 1.96$; that would be a margin of one standard error.` },
          { id: 'd', label: `$${Math.ceil(1.96 * k * k)}$`, value: Math.ceil(1.96 * k * k), trapExplanation: r`$z$ is inside the square as well: $n = \big(\frac{1.96\sigma}{E}\big)^2$.` },
        ],
        stepByStepSolution: [
          r`$1.96\frac{${dec(s)}}{\sqrt n} \le ${dec(e)}$ means $\sqrt n \ge \frac{1.96\cdot${dec(s)}}{${dec(e)}} = ${dec(r4(1.96 * k))}$.`,
          r`$n \ge ${dec(r4((1.96 * k) ** 2))}$.`,
          r`Round up: $n = ${n}$.`,
        ],
      };
    },
  },
  {
    id: 'st-03-4',
    difficulty: 2,
    keyConceptTag: 'A confidence interval for a proportion',
    correctOptionId: 'a',
    generate: (g) => {
      const [p, n] = g.pick(PROPS);
      const k = Math.round(p * n);
      const se = Math.sqrt((p * (1 - p)) / n);
      const iv = (h: number) => interval(p, h);
      return {
        params: { k, n },
        promptText: r`In a survey, ${k} of ${n} respondents said yes. What is the 95% confidence interval for the true share?`,
        options: [
          { id: 'a', ...iv(1.96 * se) },
          { id: 'b', ...iv(se), trapExplanation: r`One standard error gives a 68% interval; multiply by 1.96.` },
          { id: 'c', ...iv((1.96 * p * (1 - p)) / n), trapExplanation: r`$\frac{\hat p(1 - \hat p)}{n}$ is the variance; take its square root to get the standard error.` },
          { id: 'd', ...iv(1.96 * Math.sqrt(p / n)), trapExplanation: r`One yes/no answer has variance $\hat p(1 - \hat p)$, not $\hat p$.` },
        ],
        stepByStepSolution: [
          r`$\hat p = \frac{${k}}{${n}} = ${p}$.`,
          r`$\operatorname{SE} = \sqrt{\frac{${p}\cdot${dec(1 - p)}}{${n}}} = ${dec(r4(se))}$; margin $1.96\cdot${dec(r4(se))} = ${dec(r4(1.96 * se))}$.`,
          r`$${p} \pm ${dec(r4(1.96 * se))}$, i.e. ${iv(1.96 * se).label}.`,
        ],
      };
    },
  },
  {
    id: 'st-03-5',
    difficulty: 3,
    keyConceptTag: 'How level and sample size change the width',
    correctOptionId: 'a',
    generate: (g) => {
      const w = g.pick([4, 6, 8, 10, 12]);
      const k = g.pick([4, 9, 16]);
      const L = g.pick([90, 99]);
      const q = Z[L] / 1.96;
      const val = (x: number) => Math.round(x * 100) / 100;
      const ans = (w * q) / Math.sqrt(k);
      return {
        params: { w, k, L },
        promptText: r`A 95% confidence interval for a mean has width ${w}. What is the approximate width of a ${L}% interval computed from ${k} times as many observations?`,
        options: [
          { id: 'a', label: `$\\approx ${dec(val(ans))}$`, value: val(ans) },
          { id: 'b', label: `$\\approx ${dec(val(w / Math.sqrt(k)))}$`, value: val(w / Math.sqrt(k)), trapExplanation: r`That accounts for the larger sample but not for the new level: $z$ changes from 1.96 to ${Z[L]}.` },
          { id: 'c', label: `$\\approx ${dec(val(w * q))}$`, value: val(w * q), trapExplanation: r`That changes the level but keeps the sample size. ${k} times the data divides the width by $\sqrt{${k}} = ${Math.sqrt(k)}$.` },
          { id: 'd', label: `$\\approx ${dec(val((w * q) / k))}$`, value: val((w * q) / k), trapExplanation: r`The width shrinks like $\frac{1}{\sqrt n}$, so divide by $\sqrt{${k}}$, not by ${k}.` },
        ],
        stepByStepSolution: [
          r`Width $= 2z\frac{\sigma}{\sqrt n}$. Changing the level multiplies it by $\frac{${Z[L]}}{1.96} \approx ${dec(Math.round(q * 1e4) / 1e4)}$.`,
          r`${k} times the data divides it by $\sqrt{${k}} = ${Math.sqrt(k)}$.`,
          r`$${w}\cdot\frac{${Z[L]}}{1.96}\cdot\frac{1}{${Math.sqrt(k)}} \approx ${dec(val(ans))}$.`,
        ],
      };
    },
  },
  {
    id: 'st-03-6',
    difficulty: 3,
    keyConceptTag: 'Many intervals at once',
    correctOptionId: 'a',
    generate: (g) => {
      const [c, N] = g.pick([[0.95, 5], [0.95, 10], [0.95, 14], [0.99, 20], [0.99, 50], [0.9, 5], [0.9, 8]]);
      const r3 = (x: number) => Math.round(x * 1000) / 1000;
      const ans = 1 - c ** N;
      return {
        params: { c, N },
        promptText: r`A dashboard shows ${N} independent ${Math.round(c * 100)}% confidence intervals, one per metric. What is the probability that at least one of them misses its true value?`,
        options: [
          { id: 'a', label: `$\\approx ${dec(r3(ans))}$`, value: r3(ans) },
          { id: 'b', label: `$${dec(r3(1 - c))}$`, value: r3(1 - c), trapExplanation: r`${dec(r3(1 - c))} is the miss chance of a single interval. With ${N} chances to miss, a miss somewhere is much more likely.` },
          { id: 'c', label: `$${dec(r3(N * (1 - c)))}$`, value: r3(N * (1 - c)), trapExplanation: r`$${N}\cdot${dec(r3(1 - c))}$ is the expected <i>number</i> of misses (and an upper bound on the probability), not the probability itself.` },
          { id: 'd', label: `$\\approx ${dec(r3(c ** N))}$`, value: r3(c ** N), trapExplanation: r`$${c}^{${N}}$ is the probability that <i>all</i> intervals cover; subtract it from 1.` },
        ],
        stepByStepSolution: [
          r`Each interval covers with probability ${c}, independently.`,
          r`$P(\text{all cover}) = ${c}^{${N}} \approx ${dec(r3(c ** N))}$.`,
          r`$P(\text{at least one misses}) = 1 - ${c}^{${N}} \approx ${dec(r3(ans))}$.`,
        ],
      };
    },
  },
];
