import type { QuestionTemplate } from '../../../types.ts';
import { r } from '../define.ts';
import { allDistinct, dec, frac } from '../gen.ts';
import { out } from './fmt.ts';
import { approxLab, RNG } from './06-simulation.practice.ts';

/** Extra practice (Practice 2): gentler questions on the same ideas, with new numbers every time. */
export const extra: QuestionTemplate[] = [
  {
    id: 'pg-06-x1',
    difficulty: 1,
    keyConceptTag: 'Inclusive and exclusive bounds',
    correctOptionId: 'a',
    generate: (g) => {
      const a = g.int(2, 6);
      const b = a + g.int(4, 15);
      return {
        params: { a, b },
        codeSnippet: `${RNG}x = rng.integers(${a}, ${b})`,
        promptText: r`How many different values can <c>x</c> take?`,
        options: [
          { id: 'a', label: out(b - a), value: b - a },
          { id: 'b', label: out(b - a + 1), value: b - a + 1, trapExplanation: r`<c>rng.integers</c> excludes the upper bound ${b}, like <c>range</c>.` },
          { id: 'c', label: out(b), value: b, trapExplanation: r`The values start at ${a}.` },
          { id: 'd', label: out(b - a - 1), value: b - a - 1, trapExplanation: r`The lower bound ${a} is included.` },
        ],
        stepByStepSolution: [
          r`<c>rng.integers(${a}, ${b})</c> draws from ${a} up to ${b - 1}.`,
          r`That is $${b} - ${a}$ values.`,
          r`Answer: ${b - a}.`,
        ],
      };
    },
  },
  {
    id: 'pg-06-x2',
    difficulty: 1,
    keyConceptTag: 'Estimating a probability',
    correctOptionId: 'a',
    generate: (g) => {
      const t = g.pick([0.1, 0.2, 0.25, 0.3, 0.4, 0.6, 0.7, 0.75, 0.8, 0.9]);
      return {
        params: { t },
        codeSnippet: `${RNG}u = rng.random(100_000)\nprint((u < ${t}).mean())`,
        promptText: r`About what number does this code print?`,
        options: [
          { id: 'a', label: approxLab(t), value: t },
          { id: 'b', label: approxLab(1 - t), value: 1 - t, trapExplanation: r`<c>u < ${t}</c> counts the draws <i>below</i> ${t}.` },
          { id: 'c', label: approxLab(0.5), value: 0.5, trapExplanation: r`The share depends on the threshold: uniform draws fall below ${t} with probability ${t}.` },
          { id: 'd', label: approxLab(t / 2), value: t / 2, trapExplanation: r`For a uniform draw on [0, 1), $P(U < t) = t$.` },
        ],
        stepByStepSolution: [
          r`<c>rng.random</c> draws uniformly from [0, 1).`,
          r`$P(U < ${t}) = ${t}$.`,
          r`The printed share is close to ${t}.`,
        ],
      };
    },
  },
  {
    id: 'pg-06-x3',
    difficulty: 1,
    keyConceptTag: 'Seeds',
    correctOptionId: 'a',
    generate: (g) => {
      const s = g.int(1, 999);
      const k = g.int(3, 6);
      return {
        params: { s, k },
        codeSnippet: `import random\n\nrandom.seed(${s})\na = [random.randint(1, 100) for _ in range(${k})]\nrandom.seed(${s})\nb = [random.randint(1, 100) for _ in range(${k})]\nprint(a == b)`,
        promptText: r`What does this code print?`,
        options: [
          { id: 'a', label: out('True') },
          { id: 'b', label: out('False'), trapExplanation: r`Resetting the seed restarts the same pseudo-random sequence, so the two lists are identical.` },
          { id: 'c', label: r`It differs from run to run`, trapExplanation: r`With a fixed seed the output is reproducible; that is the point of a seed.` },
          { id: 'd', label: out('ValueError'), trapExplanation: r`Comparing two lists with <c>==</c> is allowed.` },
        ],
        stepByStepSolution: [
          r`<c>random.seed(${s})</c> sets the generator to a fixed state.`,
          r`Setting the same seed again restarts the same sequence, so <c>b</c> repeats <c>a</c>.`,
          r`Output: <c>True</c>.`,
        ],
      };
    },
  },
  {
    id: 'pg-06-x4',
    difficulty: 2,
    keyConceptTag: 'More runs, smaller error',
    correctOptionId: 'a',
    generate: (g) => {
      const { n, k } = g.until(() => ({ n: g.pick([1000, 2000, 5000, 10000]), k: g.int(2, 5) }), ({ n, k }) => allDistinct([n * k * k, n * k, n * 2 * k, n * k ** 3]));
      return {
        params: { n, k },
        codeSnippet: `${RNG}estimate = (rng.random(n) < 0.3).mean()`,
        promptText: r`With $n = ${n}$ runs the estimate has some standard error. How many runs make the standard error ${k} times smaller?`,
        options: [
          { id: 'a', label: `$${n * k * k}$`, value: n * k * k },
          { id: 'b', label: `$${n * k}$`, value: n * k, trapExplanation: r`The error scales like $\frac{1}{\sqrt n}$: ${k} times the runs only divides it by $\sqrt{${k}}$.` },
          { id: 'c', label: `$${n * 2 * k}$`, value: n * 2 * k, trapExplanation: r`To divide $\frac{1}{\sqrt n}$ by ${k}, $n$ must grow by ${k}^2.` },
          { id: 'd', label: `$${n * k ** 3}$`, value: n * k ** 3, trapExplanation: r`$\sqrt n$ must grow by ${k}, so $n$ grows by $${k}^2 = ${k * k}$.` },
        ],
        stepByStepSolution: [
          r`$\mathrm{SE} \propto \frac{1}{\sqrt n}$.`,
          r`Dividing it by ${k} needs $\sqrt n$ multiplied by ${k}, i.e. $n$ multiplied by ${k * k}.`,
          r`$${n}\cdot${k * k} = ${n * k * k}$ runs.`,
        ],
      };
    },
  },
  {
    id: 'pg-06-x5',
    difficulty: 2,
    keyConceptTag: 'The bootstrap',
    correctOptionId: 'a',
    generate: (g) => {
      const n = g.int(3, 5);
      const pNum = (n - 1) ** n;
      const pDen = n ** n;
      return {
        params: { n },
        codeSnippet: `${RNG}data = np.arange(${n})\nsample = rng.choice(data, size=${n}, replace=True)`,
        promptText: r`What is the probability that the value 0 does not appear in <c>sample</c> at all?`,
        options: [
          { id: 'a', label: `$${frac(pNum, pDen)}$`, value: pNum / pDen },
          { id: 'b', label: `$${frac(n - 1, n)}$`, value: (n - 1) / n, trapExplanation: r`That is the chance for one draw; all ${n} draws must miss 0.` },
          { id: 'c', label: '$0$', value: 0, trapExplanation: r`Drawing <i>with replacement</i> can repeat values and leave others out.` },
          { id: 'd', label: `$${frac(1, n ** n)}$`, value: 1 / n ** n, trapExplanation: r`That is the chance of one particular sequence; many sequences avoid 0.` },
        ],
        stepByStepSolution: [
          r`Each of the ${n} draws picks one of ${n} values, independently.`,
          r`A draw misses 0 with probability $\frac{${n - 1}}{${n}}$.`,
          r`All ${n} miss it: $\big(\frac{${n - 1}}{${n}}\big)^{${n}} = ${frac(pNum, pDen)} \approx ${dec(Math.round((pNum / pDen) * 1000) / 1000)}$. For large $n$ this tends to $e^{-1} \approx 0.37$.`,
        ],
      };
    },
  },
  {
    id: 'pg-06-x6',
    difficulty: 2,
    keyConceptTag: 'Estimating an expectation',
    correctOptionId: 'a',
    generate: (g) => {
      const k = g.pick([4, 6, 8, 10, 12, 20]);
      return {
        params: { k },
        codeSnippet: `${RNG}x = rng.integers(1, ${k + 1}, size=100_000)\nprint(x.mean())`,
        promptText: r`About what number does this code print?`,
        options: [
          { id: 'a', label: approxLab((k + 1) / 2), value: (k + 1) / 2 },
          { id: 'b', label: approxLab((k + 2) / 2), value: (k + 2) / 2, trapExplanation: r`The upper bound ${k + 1} is excluded: the values are 1 to ${k}.` },
          { id: 'c', label: approxLab(k / 2), value: k / 2, trapExplanation: r`The average of 1, …, ${k} is the midpoint $\frac{1 + ${k}}{2}$.` },
          { id: 'd', label: approxLab(k), value: k, trapExplanation: r`That is the largest value, not the average.` },
        ],
        stepByStepSolution: [
          r`<c>x</c> is uniform on 1, …, ${k}.`,
          r`$E[X] = \frac{1 + ${k}}{2} = ${dec((k + 1) / 2)}$.`,
          r`By the law of large numbers the sample mean is close to ${dec((k + 1) / 2)}.`,
        ],
      };
    },
  },
];
