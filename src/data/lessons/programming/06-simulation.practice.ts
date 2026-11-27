import type { QuestionTemplate } from '../../../types.ts';
import { r } from '../define.ts';
import { allDistinct, dec } from '../gen.ts';
import { out } from './fmt.ts';

const r3 = (x: number) => Math.round(x * 1000) / 1000;
const r4 = (x: number) => Math.round(x * 1e4) / 1e4;
export const RNG = 'import numpy as np\n\nrng = np.random.default_rng(1)\n';
export const approxLab = (x: number) => `$\\approx ${dec(r3(x))}$`;
const WAYS = [0, 0, 1, 2, 3, 4, 5, 6, 5, 4, 3, 2, 1];

export const practice: QuestionTemplate[] = [
  {
    id: 'pg-06-1',
    difficulty: 1,
    keyConceptTag: 'What a simulation estimates',
    correctOptionId: 'a',
    generate: (g) => {
      const { k, m } = g.until(() => ({ k: g.pick([4, 6, 8, 10, 12, 20]), m: g.int(2, 6) }), ({ k, m }) => m < k && allDistinct([m / k, (m - 1) / k, m / (k + 1), 1 - m / k].map(r3)));
      return {
        params: { k, m },
        codeSnippet: `${RNG}x = rng.integers(1, ${k + 1}, size=100_000)\nprint((x <= ${m}).mean())`,
        promptText: r`About what number does this code print?`,
        options: [
          { id: 'a', label: approxLab(m / k), value: m / k },
          { id: 'b', label: approxLab((m - 1) / k), value: (m - 1) / k, trapExplanation: r`<c><=</c> includes ${m} itself: the values 1 to ${m} count.` },
          { id: 'c', label: approxLab(m / (k + 1)), value: m / (k + 1), trapExplanation: r`<c>rng.integers(1, ${k + 1})</c> excludes ${k + 1}: there are ${k} equally likely values, not ${k + 1}.` },
          { id: 'd', label: approxLab(1 - m / k), value: 1 - m / k, trapExplanation: r`That is the share of values <i>above</i> ${m}.` },
        ],
        stepByStepSolution: [
          r`<c>x</c> is uniform on 1, …, ${k} (the upper bound ${k + 1} is excluded).`,
          r`<c>(x <= ${m}).mean()</c> is the share of draws that are at most ${m}.`,
          r`It is close to $P(X \le ${m}) = \frac{${m}}{${k}} \approx ${dec(r3(m / k))}$.`,
        ],
      };
    },
  },
  {
    id: 'pg-06-2',
    difficulty: 1,
    keyConceptTag: 'Inclusive and exclusive bounds',
    correctOptionId: 'a',
    generate: (g) => {
      const { a, b } = g.until(() => ({ a: g.int(3, 10), b: g.int(12, 30) }), () => true);
      return {
        params: { a, b },
        codeSnippet: `import random\n\nx = random.randint(${a}, ${b})`,
        promptText: r`How many different values can <c>x</c> take?`,
        options: [
          { id: 'a', label: out(b - a + 1) },
          { id: 'b', label: out(b - a), trapExplanation: r`<c>random.randint</c> includes both ends, ${a} and ${b}. (NumPy's <c>rng.integers(${a}, ${b})</c> would give ${b - a}.)` },
          { id: 'c', label: out(b), trapExplanation: r`The values start at ${a}, not at 1.` },
          { id: 'd', label: out(b - a + 2), trapExplanation: r`Count from ${a} to ${b}: $${b} - ${a} + 1$.` },
        ],
        stepByStepSolution: [
          r`<c>randint(${a}, ${b})</c> returns any integer from ${a} to ${b}, both included.`,
          r`That is $${b} - ${a} + 1$ values.`,
          r`Answer: ${b - a + 1}.`,
        ],
      };
    },
  },
  {
    id: 'pg-06-3',
    difficulty: 2,
    keyConceptTag: 'The error of a simulation',
    correctOptionId: 'a',
    generate: (g) => {
      const [p, n] = g.pick([[0.5, 10000], [0.5, 2500], [0.2, 10000], [0.1, 10000], [0.5, 400], [0.2, 1600], [0.1, 900], [0.5, 40000]]);
      const se = Math.sqrt((p * (1 - p)) / n);
      return {
        params: { p, n },
        codeSnippet: `${RNG}hits = rng.random(${n}) < ${p}\nprint(hits.mean())`,
        promptText: r`About how much does the printed estimate typically differ from ${p}? Give its standard error.`,
        options: [
          { id: 'a', label: `$${dec(r4(se))}$`, value: r4(se) },
          { id: 'b', label: `$${dec((p * (1 - p)) / n)}$`, value: (p * (1 - p)) / n, trapExplanation: r`$\frac{p(1-p)}{n}$ is the variance of the estimate; the standard error is its square root.` },
          { id: 'c', label: `$${dec(r4(Math.sqrt(p * (1 - p))))}$`, value: r4(Math.sqrt(p * (1 - p))), trapExplanation: r`That is the spread of a single 0/1 draw; averaging ${n} of them divides it by $\sqrt{${n}}$.` },
          { id: 'd', label: `$${dec(r4(Math.sqrt(p * (1 - p)) / n))}$`, value: Math.sqrt(p * (1 - p)) / n, trapExplanation: r`The standard error divides by $\sqrt n$, not by $n$.` },
        ],
        stepByStepSolution: [
          r`The estimate is the mean of ${n} independent 0/1 values with $P(1) = ${p}$.`,
          r`$\mathrm{SE} = \sqrt{\frac{p(1-p)}{n}} = \sqrt{\frac{${dec(p * (1 - p))}}{${n}}}$.`,
          r`$= ${dec(r4(se))}$.`,
        ],
      };
    },
  },
  {
    id: 'pg-06-4',
    difficulty: 2,
    keyConceptTag: 'Simulating two dice',
    correctOptionId: 'a',
    generate: (g) => {
      const s = g.until(() => g.int(3, 11), (s) => s !== 7 && WAYS[s] !== 1);
      const w = WAYS[s];
      return {
        params: { s },
        codeSnippet: `${RNG}rolls = rng.integers(1, 7, size=(100_000, 2))\nprint((rolls.sum(axis=1) == ${s}).mean())`,
        promptText: r`About what number does this code print?`,
        options: [
          { id: 'a', label: approxLab(w / 36), value: w / 36 },
          { id: 'b', label: approxLab(1 / 11), value: 1 / 11, trapExplanation: r`The 11 possible sums are not equally likely: ${s} can be made in ${w} of the 36 ways.` },
          { id: 'c', label: approxLab(1 / 36), value: 1 / 36, trapExplanation: r`More than one pair of faces gives ${s}: there are ${w}.` },
          { id: 'd', label: approxLab(w / 30), value: w / 30, trapExplanation: r`<c>rng.integers(1, 7)</c> gives the faces 1 to 6, so there are 36 equally likely pairs.` },
        ],
        stepByStepSolution: [
          r`Each row holds two independent dice with faces 1 to 6.`,
          r`The sum ${s} arises in ${w} of the 36 equally likely pairs.`,
          r`The printed share is close to $\frac{${w}}{36} \approx ${dec(r3(w / 36))}$.`,
        ],
      };
    },
  },
  {
    id: 'pg-06-5',
    difficulty: 3,
    keyConceptTag: 'How many runs?',
    correctOptionId: 'a',
    generate: (g) => {
      const e = g.pick([0.01, 0.005, 0.02, 0.05, 0.025]);
      const n = Math.round(0.25 / (e * e));
      return {
        params: { e },
        codeSnippet: `${RNG}hits = rng.random(n) < 0.5\nestimate = hits.mean()`,
        promptText: r`How many runs <c>n</c> make the standard error of <c>estimate</c> equal to ${e}?`,
        options: [
          { id: 'a', label: `$${n}$`, value: n },
          { id: 'b', label: `$${Math.round(0.5 / e)}$`, value: Math.round(0.5 / e), trapExplanation: r`$\frac{0.5}{\sqrt n} = ${e}$ gives $\sqrt n = ${Math.round(0.5 / e)}$; $n$ is its square.` },
          { id: 'c', label: `$${Math.round(1 / (e * e))}$`, value: Math.round(1 / (e * e)), trapExplanation: r`One 0/1 draw with $p = 0.5$ has standard deviation 0.5, not 1.` },
          { id: 'd', label: `$${Math.round(0.25 / e)}$`, value: Math.round(0.25 / e), trapExplanation: r`The target error must be squared as well: $n = \frac{0.25}{${e}^2}$.` },
        ],
        stepByStepSolution: [
          r`$\mathrm{SE} = \sqrt{\frac{0.5\cdot0.5}{n}} = \frac{0.5}{\sqrt n}$.`,
          r`$\frac{0.5}{\sqrt n} = ${e}$ gives $\sqrt n = ${Math.round(0.5 / e)}$.`,
          r`$n = ${n}$.`,
        ],
      };
    },
  },
  {
    id: 'pg-06-6',
    difficulty: 3,
    keyConceptTag: 'A random walk',
    correctOptionId: 'a',
    generate: (g) => {
      const n = g.pick([16, 25, 36, 64, 100, 400, 900, 2500]);
      return {
        params: { n },
        codeSnippet: `${RNG}steps = rng.choice([-1, 1], size=${n})\nprint(steps.sum())`,
        promptText: r`The printed number is random. What is its standard deviation?`,
        options: [
          { id: 'a', label: `$${Math.sqrt(n)}$`, value: Math.sqrt(n) },
          { id: 'b', label: `$${n}$`, value: n, trapExplanation: r`That is the variance (each step has variance 1); the standard deviation is its square root.` },
          { id: 'c', label: `$${n / 2}$`, value: n / 2, trapExplanation: r`The steps go both ways and largely cancel; the typical distance grows like $\sqrt n$.` },
          { id: 'd', label: '$0$', value: 0, trapExplanation: r`0 is the <i>mean</i> of the sum; individual runs scatter around it.` },
        ],
        stepByStepSolution: [
          r`Each step is ±1 with equal chance: mean 0, variance 1.`,
          r`The steps are independent, so the variance of the sum is ${n}.`,
          r`Standard deviation: $\sqrt{${n}} = ${Math.sqrt(n)}$.`,
        ],
      };
    },
  },
];

