import type { QuestionTemplate } from '../../../types.ts';
import { r } from '../define.ts';
import { allDistinct, dec, shuffle } from '../gen.ts';
import { meanSetting } from './03-intervals.practice.ts';

const r4 = (x: number) => Math.round(x * 1e4) / 1e4;
/** Settings for "what kind of outcome is this?": the null, how it can be true or false, and the two decisions. */
const SCENES = [
  { h0: 'the drug has no effect', truth: ['the drug has no effect', 'the drug works'], act: ['the trial rejects $H_0$', 'the trial does not reject $H_0$'] },
  { h0: 'the email is legitimate', truth: ['the email is legitimate', 'the email is spam'], act: ['the filter flags it as spam', 'the filter delivers it to the inbox'] },
  { h0: 'there is no fire', truth: ['there is no fire', 'there is a fire'], act: ['the alarm sounds', 'the alarm stays silent'] },
  { h0: 'the new design converts no better', truth: ['the new design converts no better', 'the new design converts better'], act: ['the test declares the new design the winner', 'the test finds no significant difference'] },
];
/** Outcome kinds by [H₀ true?][rejected?]. */
const KINDS = ['Type I error (false positive)', 'Type II error (false negative)', 'Correct rejection of a false $H_0$', 'Correct: a true $H_0$ is not rejected'];
const kindOf = (h0True: boolean, rejected: boolean) => (h0True ? (rejected ? 0 : 3) : rejected ? 2 : 1);
const KIND_WHY = [
  'A Type I error rejects a true $H_0$.',
  'A Type II error fails to reject a false $H_0$.',
  'A correct rejection needs $H_0$ to be false and rejected.',
  'This would need $H_0$ to be true and not rejected.',
];

/** Extra practice (Practice 2): gentler questions on the same ideas, with new numbers every time. */
export const extra: QuestionTemplate[] = [
  {
    id: 'st-04-x1',
    difficulty: 1,
    keyConceptTag: 'The z statistic',
    correctOptionId: 'a',
    generate: (g) => {
      const { se, n, z } = g.until(() => ({ ...meanSetting(g), z: g.pick([1, 1.5, 2, 2.5, 3, 4]) }), ({ se, n, z }) => allDistinct([z, r4(z / Math.sqrt(n)), z * se, r4(z * se * se)]));
      const s = se * Math.sqrt(n);
      const m0 = g.int(10, 100);
      return {
        params: { xb: m0 + z * se, m0, s, n },
        promptText: r`$H_0: \mu = ${m0}$, $\sigma = ${s}$, $n = ${n}$, and $\bar x = ${dec(m0 + z * se)}$. What is $z = \frac{\bar x - \mu_0}{\sigma/\sqrt n}$?`,
        options: [
          { id: 'a', label: `$${z}$`, value: z },
          { id: 'b', label: `$${dec(r4(z / Math.sqrt(n)))}$`, value: r4(z / Math.sqrt(n)), trapExplanation: r`Divide by $\frac{\sigma}{\sqrt n} = ${dec(se)}$, not by $\sigma$.` },
          { id: 'c', label: `$${dec(z * se)}$`, value: z * se, trapExplanation: r`That is the difference before dividing by the standard error.` },
          { id: 'd', label: `$${dec(r4(z * se * se))}$`, value: r4(z * se * se), trapExplanation: r`The standard error belongs in the denominator.` },
        ],
        stepByStepSolution: [
          r`$\operatorname{SE} = \frac{${s}}{${Math.sqrt(n)}} = ${dec(se)}$.`,
          r`$\bar x - \mu_0 = ${dec(z * se)}$.`,
          r`$z = ${z}$.`,
        ],
      };
    },
  },
  {
    id: 'st-04-x2',
    difficulty: 1,
    keyConceptTag: 'False positives',
    correctOptionId: 'a',
    generate: (g) => {
      const m = g.pick([20, 40, 100, 200, 1000]);
      const a = g.pick([0.01, 0.05, 0.1]);
      const fp = Math.round(m * a * 100) / 100;
      return {
        params: { m, a },
        promptText: r`A genetics study tests ${m} genes at $\alpha = ${a}$. Suppose none of them is actually linked to the disease. About how many genes will be flagged as significant?`,
        options: [
          { id: 'a', label: `$${dec(fp)}$`, value: fp },
          { id: 'b', label: '$0$', value: 0, trapExplanation: r`Each true null is rejected with probability $\alpha$; false alarms are expected.` },
          { id: 'c', label: `$${dec(m - fp)}$`, value: m - fp, trapExplanation: r`That is the number correctly <i>not</i> flagged.` },
          { id: 'd', label: `$${dec(a)}$`, value: a, trapExplanation: r`$\alpha$ is a probability per test; multiply by ${m} tests.` },
        ],
        stepByStepSolution: [
          r`Each test of a true null rejects with probability $\alpha = ${a}$.`,
          r`Expected count: $${m}\cdot${a}$.`,
          r`$= ${dec(fp)}$ false positives.`,
        ],
      };
    },
  },
  {
    id: 'st-04-x3',
    difficulty: 1,
    keyConceptTag: 'The Bonferroni correction',
    correctOptionId: 'a',
    generate: (g) => {
      const m = g.pick([2, 4, 5, 10, 20, 25, 50]);
      const a = g.pick([0.05, 0.1, 0.01]);
      const v = (x: number) => Math.round(x * 1e6) / 1e6;
      return {
        params: { m, a },
        promptText: r`You run ${m} tests and want the chance of any false positive to stay below $${a}$. What per-test threshold does the Bonferroni correction use?`,
        options: [
          { id: 'a', label: `$${dec(v(a / m))}$`, value: v(a / m) },
          { id: 'b', label: `$${dec(v(a * m))}$`, value: v(a * m), trapExplanation: r`More tests need a <i>stricter</i> threshold: divide by $m$.` },
          { id: 'c', label: `$${a}$`, value: a, trapExplanation: r`Testing each at $${a}$ lets the overall false-alarm chance grow with $m$.` },
          { id: 'd', label: `$${dec(v(a / Math.sqrt(m)))}$`, value: v(a / Math.sqrt(m)), trapExplanation: r`Bonferroni divides by $m = ${m}$, not by $\sqrt m$.` },
        ],
        stepByStepSolution: [
          r`$P(\text{any false positive}) \le \sum P(\text{false positive in test } i) = m\cdot\text{threshold}$.`,
          r`Set $${m}\cdot\text{threshold} = ${a}$.`,
          r`Threshold $= \frac{${a}}{${m}} = ${dec(v(a / m))}$.`,
        ],
      };
    },
  },
  {
    id: 'st-04-x4',
    difficulty: 1,
    keyConceptTag: 'Type I and Type II errors',
    correctOptionId: 'a',
    generate: (g) => {
      const sc = g.pick(SCENES);
      const h0True = g.pick([true, false]);
      const rejected = g.pick([true, false]);
      const k = kindOf(h0True, rejected);
      const order = [k, ...shuffle(g, [0, 1, 2, 3].filter((x) => x !== k))];
      return {
        params: { h0True: h0True ? 1 : 0, rejected: rejected ? 1 : 0, order },
        promptText: r`$H_0$: ${sc.h0}. In fact ${sc.truth[h0True ? 0 : 1]}, and ${sc.act[rejected ? 0 : 1]}. What kind of outcome is this?`,
        options: order.map((kind, i) => ({
          id: 'abcd'[i],
          label: KINDS[kind],
          ...(i === 0 ? {} : { trapExplanation: `${KIND_WHY[kind]} Here $H_0$ is ${h0True ? 'true' : 'false'} and it was ${rejected ? '' : 'not '}rejected.` }),
        })),
        stepByStepSolution: [
          r`Is $H_0$ true? ${h0True ? 'Yes' : 'No'}: ${sc.truth[h0True ? 0 : 1]}.`,
          r`Was it rejected? ${rejected ? 'Yes' : 'No'}: ${sc.act[rejected ? 0 : 1]}.`,
          r`So this is: ${KINDS[k]}.`,
        ],
      };
    },
  },
  {
    id: 'st-04-x5',
    difficulty: 2,
    keyConceptTag: 'One-sided and two-sided p-values',
    correctOptionId: 'a',
    generate: (g) => {
      const q = g.pick([0.02, 0.04, 0.06, 0.08, 0.1, 0.2, 0.3, 0.5]);
      return {
        params: { q },
        promptText: r`A two-sided test gives $p = ${q}$, and the effect is in the direction you predicted. What is the one-sided p-value for that direction?`,
        options: [
          { id: 'a', label: `$${dec(q / 2)}$`, value: q / 2 },
          { id: 'b', label: `$${dec(2 * q)}$`, value: 2 * q, trapExplanation: r`The one-sided test counts only one tail, so its p-value is smaller.` },
          { id: 'c', label: `$${q}$`, value: q, trapExplanation: r`The two-sided p-value counts both tails; one-sided keeps only one.` },
          { id: 'd', label: `$${dec(1 - q / 2)}$`, value: 1 - q / 2, trapExplanation: r`That would be the one-sided p-value for the <i>opposite</i> direction.` },
        ],
        stepByStepSolution: [
          r`The normal curve is symmetric, so the two tails are equal.`,
          r`Two-sided: both tails together hold $${q}$.`,
          r`One tail: $\frac{${q}}{2} = ${dec(q / 2)}$.`,
        ],
      };
    },
  },
  {
    id: 'st-04-x6',
    difficulty: 2,
    keyConceptTag: 'Applying Bonferroni',
    correctOptionId: 'a',
    generate: (g) => {
      const ps = g.until(
        () => shuffle(g, [0.001, 0.004, 0.008, 0.012, 0.02, 0.03, 0.045, 0.07, 0.2, 0.5]).slice(0, 5),
        (ps) => ps.filter((p) => p <= 0.01).length !== ps.filter((p) => p <= 0.05).length,
      );
      const strict = ps.filter((p) => p <= 0.01).length;
      const loose = ps.filter((p) => p <= 0.05).length;
      const others = shuffle(g, [0, 1, 2, 3, 4, 5].filter((c) => c !== strict && c !== loose)).slice(0, 2);
      return {
        params: { ps },
        promptText: r`Five tests give p-values $${ps.join(',\ ')}$. With a Bonferroni correction for an overall $\alpha = 0.05$, how many results are significant?`,
        options: [
          { id: 'a', label: `$${strict}$`, value: strict },
          { id: 'b', label: `$${loose}$`, value: loose, trapExplanation: r`That compares each $p$ with 0.05. Bonferroni uses $\frac{0.05}{5} = 0.01$.` },
          ...others.map((c, i) => ({ id: 'cd'[i], label: `$${c}$`, value: c, trapExplanation: r`Count the p-values at or below 0.01: there are ${strict}.` })),
        ],
        stepByStepSolution: [
          r`Per-test threshold: $\frac{0.05}{5} = 0.01$.`,
          r`At or below 0.01: $${ps.filter((p) => p <= 0.01).join(',\ ') || r`\text{none}`}$.`,
          r`${strict} significant result${strict === 1 ? '' : 's'}.`,
        ],
      };
    },
  },
];
