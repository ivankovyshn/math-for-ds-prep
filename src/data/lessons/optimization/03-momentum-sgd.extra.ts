import type { QuestionTemplate } from '../../../types.ts';
import { r } from '../define.ts';
import { allDistinct, dec, frac, paren, sumOf } from '../gen.ts';
import { D } from './03-momentum-sgd.practice.ts';

const r6 = (x: number) => Math.round(x * 1e6) / 1e6;

/** Extra practice (Practice 2): gentler questions on the same ideas, with new numbers every time. */
export const extra: QuestionTemplate[] = [
  {
    id: 'op-03-x1',
    difficulty: 1,
    keyConceptTag: 'Epochs and batches',
    correctOptionId: 'a',
    generate: (g) => {
      const { n, B } = g.until(() => ({ n: g.pick([1000, 1500, 2000, 5000, 3000]), B: g.pick([32, 64, 128, 256]) }), ({ n, B }) => n % B !== 0 && n / B > 3 && Math.ceil(n / B) !== B && Math.ceil(n / B) - 1 !== B);
      const up = Math.ceil(n / B);
      return {
        params: { n, B },
        promptText: r`A dataset of ${n} examples is split into mini-batches of ${B}, with a smaller last batch for the leftover examples. How many steps does one epoch take?`,
        options: [
          { id: 'a', label: `$${up}$`, value: up },
          { id: 'b', label: `$${up - 1}$`, value: up - 1, trapExplanation: r`$${up - 1}\cdot${B} = ${(up - 1) * B}$ examples leave ${n - (up - 1) * B} unused; they form one more, smaller batch.` },
          { id: 'c', label: `$${dec(n / B)}$`, value: n / B, trapExplanation: r`A number of steps is a whole number: round up.` },
          { id: 'd', label: `$${B}$`, value: B, trapExplanation: r`${B} is the batch size, not the number of batches.` },
        ],
        stepByStepSolution: [
          r`$\frac{${n}}{${B}} = ${dec(n / B)}$.`,
          r`${up - 1} full batches cover ${(up - 1) * B} examples; ${n - (up - 1) * B} remain.`,
          r`They form one more batch: ${up} steps.`,
        ],
      };
    },
  },
  {
    id: 'op-03-x2',
    difficulty: 1,
    keyConceptTag: 'One SGD step',
    correctOptionId: 'a',
    generate: (g) => {
      const { w0, gs, eta } = g.until(
        () => ({ w0: g.int(-5, 5), gs: [g.int(-6, 10), g.int(-6, 10)], eta: g.pick([0.1, 0.2, 0.5]) }),
        ({ w0, gs, eta }) => {
          const m = sumOf(gs) / 2;
          return m !== 0 && allDistinct([w0 - eta * m, w0 - eta * sumOf(gs), w0 + eta * m, w0 - m].map(r6));
        },
      );
      const m = sumOf(gs) / 2;
      return {
        params: { w0, gs, eta },
        promptText: r`A weight is $w = ${w0}$. A mini-batch of two examples gives per-example gradients ${gs[0]} and ${gs[1]}. What is $w$ after one SGD step with $\eta = ${eta}$?`,
        options: [
          { id: 'a', label: `$${D(w0 - eta * m)}$`, value: r6(w0 - eta * m) },
          { id: 'b', label: `$${D(w0 - eta * sumOf(gs))}$`, value: r6(w0 - eta * sumOf(gs)), trapExplanation: r`Use the batch average ${D(m)}, not the sum.` },
          { id: 'c', label: `$${D(w0 + eta * m)}$`, value: r6(w0 + eta * m), trapExplanation: r`SGD steps against the gradient.` },
          { id: 'd', label: `$${D(w0 - m)}$`, value: r6(w0 - m), trapExplanation: r`Scale the gradient by $\eta = ${eta}$.` },
        ],
        stepByStepSolution: [
          r`Batch gradient: $\frac{${gs[0]} + ${paren(gs[1])}}{2} = ${D(m)}$.`,
          r`$w \leftarrow ${w0} - ${eta}\cdot${paren(m)}$.`,
          r`$w = ${D(w0 - eta * m)}$.`,
        ],
      };
    },
  },
  {
    id: 'op-03-x3',
    difficulty: 1,
    keyConceptTag: 'Momentum amplifies steps',
    correctOptionId: 'a',
    generate: (g) => {
      const beta = g.pick([0.75, 0.8, 0.9, 0.95, 0.98, 0.99]);
      const v = (x: number) => ({ label: `$${D(x)}$`, value: r6(x) });
      return {
        params: { beta },
        promptText: r`With momentum coefficient $\beta = ${beta}$ and a constant gradient, the steps grow to how many times the plain gradient-descent step?`,
        options: [
          { id: 'a', ...v(1 / (1 - beta)) },
          { id: 'b', ...v(1 / beta), trapExplanation: r`The factor is the geometric series $1 + \beta + \beta^2 + \dots = \frac{1}{1 - \beta}$.` },
          { id: 'c', ...v(1 + beta), trapExplanation: r`That counts only one earlier gradient; the velocity remembers all of them.` },
          { id: 'd', ...v(beta / (1 - beta)), trapExplanation: r`The series starts at 1 (the current gradient): $\frac{1}{1-\beta}$, not $\frac{\beta}{1-\beta}$.` },
        ],
        stepByStepSolution: [
          r`$v = g(1 + \beta + \beta^2 + \dots)$.`,
          r`$= \frac{g}{1 - ${beta}}$.`,
          r`Factor $\frac{1}{${D(1 - beta)}} = ${D(1 / (1 - beta))}$.`,
        ],
      };
    },
  },
  {
    id: 'op-03-x4',
    difficulty: 2,
    keyConceptTag: 'A momentum step',
    correctOptionId: 'a',
    generate: (g) => {
      const { x0, v0, gr, eta, beta } = g.until(
        () => ({ x0: g.int(-5, 5), v0: g.nonzero(-6, 6), gr: g.nonzero(-6, 6), eta: g.pick([0.1, 0.5]), beta: g.pick([0.5, 0.9]) }),
        ({ x0, v0, gr, eta, beta }) => {
          const v1 = beta * v0 + gr;
          return v1 !== 0 && allDistinct([x0 - eta * v1, x0 - eta * gr, x0 - eta * (v0 + gr), x0 + eta * v1].map(r6));
        },
      );
      const v1 = beta * v0 + gr;
      return {
        params: { x0, v0, gr, eta, beta },
        promptText: r`Momentum update: $v \leftarrow \beta v + \nabla f$, then $x \leftarrow x - \eta v$. Currently $x = ${x0}$, $v = ${v0}$, the gradient is ${gr}, $\beta = ${beta}$ and $\eta = ${eta}$. What is the new $x$?`,
        options: [
          { id: 'a', label: `$${D(x0 - eta * v1)}$`, value: r6(x0 - eta * v1) },
          { id: 'b', label: `$${D(x0 - eta * gr)}$`, value: r6(x0 - eta * gr), trapExplanation: r`That ignores the stored velocity ${v0}.` },
          { id: 'c', label: `$${D(x0 - eta * (v0 + gr))}$`, value: r6(x0 - eta * (v0 + gr)), trapExplanation: r`The old velocity is first scaled by $\beta = ${beta}$.` },
          { id: 'd', label: `$${D(x0 + eta * v1)}$`, value: r6(x0 + eta * v1), trapExplanation: r`The position moves against the velocity: $x - \eta v$.` },
        ],
        stepByStepSolution: [
          r`$v = ${beta}\cdot${paren(v0)} + ${paren(gr)} = ${D(v1)}$.`,
          r`$x = ${x0} - ${eta}\cdot${paren(r6(v1))}$.`,
          r`$x = ${D(x0 - eta * v1)}$.`,
        ],
      };
    },
  },
  {
    id: 'op-03-x5',
    difficulty: 2,
    keyConceptTag: 'Gradient noise and batch size',
    correctOptionId: 'a',
    generate: (g) => {
      const { s, B } = g.until(() => ({ s: g.int(2, 20), B: g.pick([4, 9, 16, 25, 64, 100]) }), ({ s, B }) => allDistinct([s / Math.sqrt(B), s / B, (s * s) / B, s].map(r6)));
      return {
        params: { s, B },
        promptText: r`Per-example gradients have standard deviation ${s}. What is the standard deviation of a gradient averaged over a mini-batch of ${B} examples?`,
        options: [
          { id: 'a', label: `$${frac(s, Math.sqrt(B))}$`, value: s / Math.sqrt(B) },
          { id: 'b', label: `$${frac(s, B)}$`, value: s / B, trapExplanation: r`Averaging divides the <i>variance</i> by $|B|$, so the SD is divided by $\sqrt{${B}} = ${Math.sqrt(B)}$.` },
          { id: 'c', label: `$${frac(s * s, B)}$`, value: (s * s) / B, trapExplanation: r`That is the variance of the average; take its square root.` },
          { id: 'd', label: `$${s}$`, value: s, trapExplanation: r`Averaging ${B} independent gradients reduces the noise.` },
        ],
        stepByStepSolution: [
          r`$\operatorname{SD}(g) = \frac{\sigma}{\sqrt{|B|}}$.`,
          r`$= \frac{${s}}{\sqrt{${B}}} = \frac{${s}}{${Math.sqrt(B)}}$.`,
          r`$= ${frac(s, Math.sqrt(B))}$.`,
        ],
      };
    },
  },
  {
    id: 'op-03-x6',
    difficulty: 2,
    keyConceptTag: 'Moving averages start at zero',
    correctOptionId: 'a',
    generate: (g) => {
      const { beta, g1 } = g.until(() => ({ beta: g.pick([0.8, 0.9, 0.99]), g1: g.nonzero(-10, 20) }), ({ beta, g1 }) => allDistinct([(1 - beta) * g1, beta * g1, g1, 0].map(r6)));
      return {
        params: { beta, g1 },
        promptText: r`A moving average $m_k = \beta m_{k-1} + (1 - \beta)g_k$ starts at $m_0 = 0$ with $\beta = ${beta}$. The first gradient is $g_1 = ${g1}$. What is $m_1$, before any bias correction?`,
        options: [
          { id: 'a', label: `$${D((1 - beta) * g1)}$`, value: r6((1 - beta) * g1) },
          { id: 'b', label: `$${D(beta * g1)}$`, value: r6(beta * g1), trapExplanation: r`The new gradient gets weight $1 - \beta = ${D(1 - beta)}$; $\beta$ multiplies the old average.` },
          { id: 'c', label: `$${g1}$`, value: g1, trapExplanation: r`That is the bias-corrected $\hat m_1 = \frac{m_1}{1 - \beta}$; the raw average is much smaller.` },
          { id: 'd', label: '$0$', value: 0, trapExplanation: r`The first gradient already enters with weight $1 - \beta$.` },
        ],
        stepByStepSolution: [
          r`$m_1 = ${beta}\cdot0 + ${D(1 - beta)}\cdot${paren(g1)}$.`,
          r`$m_1 = ${D((1 - beta) * g1)}$, only ${D((1 - beta) * 100)}% of the gradient.`,
          r`This pull towards 0 is why Adam divides by $1 - \beta^k$.`,
        ],
      };
    },
  },
];
