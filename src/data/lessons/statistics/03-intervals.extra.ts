import type { QuestionTemplate } from '../../../types.ts';
import { r } from '../define.ts';
import { allDistinct, dec } from '../gen.ts';
import { meanSetting, PROPS, Z } from './03-intervals.practice.ts';

const r4 = (x: number) => Math.round(x * 1e4) / 1e4;

/** Extra practice (Practice 2): gentler questions on the same ideas, with new numbers every time. */
export const extra: QuestionTemplate[] = [
  {
    id: 'st-03-x1',
    difficulty: 1,
    keyConceptTag: 'The margin of error',
    correctOptionId: 'a',
    generate: (g) => {
      const { se, n } = meanSetting(g);
      const s = se * Math.sqrt(n);
      return {
        params: { s, n },
        promptText: r`With $\sigma = ${s}$ and $n = ${n}$, what is the margin of error of a 95% confidence interval for the mean?`,
        options: [
          { id: 'a', label: `$${dec(r4(1.96 * se))}$`, value: r4(1.96 * se) },
          { id: 'b', label: `$${dec(r4(1.96 * s))}$`, value: r4(1.96 * s), trapExplanation: r`Use the standard error $\frac{\sigma}{\sqrt n}$, not $\sigma$.` },
          { id: 'c', label: `$${dec(se)}$`, value: se, trapExplanation: r`That is one standard error; 95% needs 1.96 of them.` },
          { id: 'd', label: `$${dec(r4((1.96 * s) / n))}$`, value: r4((1.96 * s) / n), trapExplanation: r`Divide $\sigma$ by $\sqrt n = ${Math.sqrt(n)}$, not by $n$.` },
        ],
        stepByStepSolution: [
          r`$\operatorname{SE} = \frac{${s}}{\sqrt{${n}}} = ${dec(se)}$.`,
          r`Margin $= 1.96\cdot${dec(se)}$.`,
          r`$= ${dec(r4(1.96 * se))}$.`,
        ],
      };
    },
  },
  {
    id: 'st-03-x2',
    difficulty: 1,
    keyConceptTag: 'Reading an interval',
    correctOptionId: 'a',
    generate: (g) => {
      const { c, h } = g.until(() => ({ c: g.int(10, 90), h: g.int(2, 9) }), ({ c, h }) => c - h > 0);
      const [a, b] = [c - h, c + h];
      const lab = (x: number, y: number) => `estimate $${x}$, margin $${y}$`;
      return {
        params: { a, b },
        promptText: r`A report gives the 95% confidence interval $[${a},\ ${b}]$ for a mean. What are the point estimate $\bar x$ and the margin of error?`,
        options: [
          { id: 'a', label: lab(c, h), value: [c, h] },
          { id: 'b', label: lab(c, 2 * h), value: [c, 2 * h], trapExplanation: r`${2 * h} is the full width $${b} - ${a}$; the margin is half of it.` },
          { id: 'c', label: lab(h, c), value: [h, c], trapExplanation: r`The estimate is the centre of the interval, ${c}.` },
          { id: 'd', label: lab(a, h), value: [a, h], trapExplanation: r`The interval is symmetric about $\bar x$: the estimate is the midpoint, not the lower end.` },
        ],
        stepByStepSolution: [
          r`The interval is $\bar x \pm E$.`,
          r`Centre: $\frac{${a} + ${b}}{2} = ${c}$.`,
          r`Margin: $\frac{${b} - ${a}}{2} = ${h}$.`,
        ],
      };
    },
  },
  {
    id: 'st-03-x3',
    difficulty: 1,
    keyConceptTag: 'What 95% means',
    correctOptionId: 'a',
    generate: (g) => {
      const L = g.pick([90, 95, 99]);
      const N = g.pick([200, 300, 500, 1000]);
      const miss = (N * (100 - L)) / 100;
      return {
        params: { L, N },
        promptText: r`${N} researchers each compute a ${L}% confidence interval for the same mean from independent samples. About how many intervals miss the true mean?`,
        options: [
          { id: 'a', label: `$${miss}$`, value: miss },
          { id: 'b', label: `$${N - miss}$`, value: N - miss, trapExplanation: r`That is the number that <i>cover</i> the mean.` },
          { id: 'c', label: `$${100 - L}$`, value: 100 - L, trapExplanation: r`${100 - L}% is the miss rate; apply it to ${N} intervals.` },
          { id: 'd', label: '$0$', value: 0, trapExplanation: r`A ${L}% interval misses ${100 - L}% of the time; with many intervals some will miss.` },
        ],
        stepByStepSolution: [
          r`Each interval misses with probability $1 - ${L / 100} = ${dec((100 - L) / 100)}$.`,
          r`Expected misses: $${N}\cdot${dec((100 - L) / 100)}$.`,
          r`$= ${miss}$.`,
        ],
      };
    },
  },
  {
    id: 'st-03-x4',
    difficulty: 2,
    keyConceptTag: 'Width and sample size',
    correctOptionId: 'a',
    generate: (g) => {
      const { w, k } = g.until(() => ({ w: g.pick([2, 4, 6, 8, 12, 18]), k: g.pick([4, 9, 16, 25]) }), ({ w, k }) => allDistinct([w / Math.sqrt(k), w / k, w * Math.sqrt(k), w].map(r4)));
      const n = g.pick([20, 30, 50, 80]);
      return {
        params: { w, k, n },
        promptText: r`A 95% interval from $n = ${n}$ observations has width ${w}. What width do you expect with $${k * n}$ observations?`,
        options: [
          { id: 'a', label: `$${dec(r4(w / Math.sqrt(k)))}$`, value: r4(w / Math.sqrt(k)) },
          { id: 'b', label: `$${dec(r4(w / k))}$`, value: r4(w / k), trapExplanation: r`The width falls like $\frac{1}{\sqrt n}$: ${k} times the data divides it by $\sqrt{${k}} = ${Math.sqrt(k)}$.` },
          { id: 'c', label: `$${dec(r4(w * Math.sqrt(k)))}$`, value: r4(w * Math.sqrt(k)), trapExplanation: r`More data narrows the interval.` },
          { id: 'd', label: `$${w}$`, value: w, trapExplanation: r`The width depends on $n$ through $\frac{\sigma}{\sqrt n}$.` },
        ],
        stepByStepSolution: [
          r`Width $= 2\cdot1.96\frac{\sigma}{\sqrt n}$.`,
          r`$${k}n$ in place of $n$ divides it by $\sqrt{${k}} = ${Math.sqrt(k)}$.`,
          r`$\frac{${w}}{${Math.sqrt(k)}} = ${dec(r4(w / Math.sqrt(k)))}$.`,
        ],
      };
    },
  },
  {
    id: 'st-03-x5',
    difficulty: 2,
    keyConceptTag: 'Margin of error for a proportion',
    correctOptionId: 'a',
    generate: (g) => {
      const [p, n] = g.pick(PROPS);
      const se = Math.sqrt((p * (1 - p)) / n);
      return {
        params: { p, n },
        promptText: r`A poll of $n = ${n}$ finds a share $\hat p = ${p}$. What is the 95% margin of error?`,
        options: [
          { id: 'a', label: `$${dec(r4(1.96 * se))}$`, value: r4(1.96 * se) },
          { id: 'b', label: `$${dec(r4(se))}$`, value: r4(se), trapExplanation: r`That is the standard error; the 95% margin is 1.96 times it.` },
          { id: 'c', label: `$${dec(r4((1.96 * p * (1 - p)) / n))}$`, value: r4((1.96 * p * (1 - p)) / n), trapExplanation: r`Take the square root: $\operatorname{SE} = \sqrt{\hat p(1 - \hat p)/n}$.` },
          { id: 'd', label: `$${dec(r4(1.96 * Math.sqrt(p * (1 - p))))}$`, value: r4(1.96 * Math.sqrt(p * (1 - p))), trapExplanation: r`That is the margin for a single answer; the share of $n = ${n}$ answers divides by $\sqrt n$.` },
        ],
        stepByStepSolution: [
          r`$\operatorname{SE} = \sqrt{\frac{${p}\cdot${dec(1 - p)}}{${n}}} = ${dec(r4(se))}$.`,
          r`Margin $= 1.96\cdot${dec(r4(se))}$.`,
          r`$= ${dec(r4(1.96 * se))}$.`,
        ],
      };
    },
  },
  {
    id: 'st-03-x6',
    difficulty: 1,
    keyConceptTag: 'Confidence level and z',
    correctOptionId: 'a',
    generate: (g) => {
      const L = g.pick([90, 95, 99]);
      const others = [90, 95, 99].filter((x) => x !== L);
      return {
        params: { L },
        promptText: r`Which multiplier $z$ gives a two-sided ${L}% confidence interval $\bar x \pm z\cdot\operatorname{SE}$?`,
        options: [
          { id: 'a', label: `$${Z[L]}$`, value: Z[L] },
          ...others.map((o, i) => ({ id: 'bc'[i], label: `$${Z[o]}$`, value: Z[o], trapExplanation: r`$${Z[o]}$ is the multiplier for ${o}%.` })),
          { id: 'd', label: '$1$', value: 1, trapExplanation: r`$z = 1$ gives only about 68%.` },
        ],
        stepByStepSolution: [
          r`$z$ is chosen with $P(-z < Z < z) = ${L / 100}$ for $Z \sim N(0, 1)$.`,
          r`So each tail holds $${dec((100 - L) / 200)}$.`,
          r`$z = ${Z[L]}$.`,
        ],
      };
    },
  },
];
