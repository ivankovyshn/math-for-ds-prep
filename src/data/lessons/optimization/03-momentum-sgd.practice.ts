import type { QuestionTemplate } from '../../../types.ts';
import { r } from '../define.ts';
import { allDistinct, dec, paren, sumOf } from '../gen.ts';

const r6 = (x: number) => Math.round(x * 1e6) / 1e6;
export const D = (x: number) => dec(r6(x));

export const practice: QuestionTemplate[] = [
  {
    id: 'op-03-1',
    difficulty: 1,
    keyConceptTag: 'Epochs and batches',
    correctOptionId: 'a',
    generate: (g) => {
      const { n, B } = g.until(() => ({ n: g.pick([10000, 20000, 50000, 60000, 100000, 120000]), B: g.pick([50, 100, 200, 250, 500, 1000]) }), ({ n, B }) => n % B === 0 && n / B !== B);
      return {
        params: { n, B },
        promptText: r`A training set has $n = ${n}$ examples and SGD uses mini-batches of ${B}. How many update steps make one epoch?`,
        options: [
          { id: 'a', label: `$${n / B}$`, value: n / B },
          { id: 'b', label: `$${B}$`, value: B, trapExplanation: r`${B} is the batch size; count how many batches cover the ${n} examples.` },
          { id: 'c', label: `$${n}$`, value: n, trapExplanation: r`That would be one step per example, i.e. batches of size 1.` },
          { id: 'd', label: `$${n * B}$`, value: n * B, trapExplanation: r`Divide the data into batches; do not multiply.` },
        ],
        stepByStepSolution: [
          r`An epoch processes every example once.`,
          r`Each step uses ${B} examples.`,
          r`$\frac{${n}}{${B}} = ${n / B}$ steps.`,
        ],
      };
    },
  },
  {
    id: 'op-03-2',
    difficulty: 1,
    keyConceptTag: 'A mini-batch gradient',
    correctOptionId: 'a',
    generate: (g) => {
      const gs = g.until(() => [g.int(-8, 12), g.int(-8, 12), g.int(-8, 12), g.int(-8, 12)], (gs) => allDistinct([sumOf(gs) / 4, sumOf(gs), gs[3], sumOf(gs) / 3]));
      return {
        params: { gs },
        promptText: r`For a weight $w$, the four examples in a mini-batch have gradients $${gs.join(',\ ')}$. What gradient does SGD use for this step?`,
        options: [
          { id: 'a', label: `$${D(sumOf(gs) / 4)}$`, value: sumOf(gs) / 4 },
          { id: 'b', label: `$${sumOf(gs)}$`, value: sumOf(gs), trapExplanation: r`The loss is an average, so its gradient estimate is the average, not the sum.` },
          { id: 'c', label: `$${gs[3]}$`, value: gs[3], trapExplanation: r`All examples of the batch contribute, not only the last one.` },
          { id: 'd', label: `$${D(sumOf(gs) / 3)}$`, value: sumOf(gs) / 3, trapExplanation: r`There are 4 examples; divide by 4.` },
        ],
        stepByStepSolution: [
          r`$g = \frac{1}{|B|}\sum_{i \in B}\nabla\ell_i$.`,
          r`$= \frac{${gs.join(' + ').replace(/\+ -/g, '- ')}}{4} = \frac{${sumOf(gs)}}{4}$.`,
          r`$g = ${D(sumOf(gs) / 4)}$.`,
        ],
      };
    },
  },
  {
    id: 'op-03-3',
    difficulty: 2,
    keyConceptTag: 'Two steps with momentum',
    correctOptionId: 'a',
    generate: (g) => {
      const { c, eta, beta, x0 } = g.until(
        () => ({ c: g.pick([0.5, 1]), eta: g.pick([0.1, 0.2, 0.25]), beta: g.pick([0.5, 0.9]), x0: g.nonzero(-10, 10) }),
        ({ c, eta, beta, x0 }) => {
          const x1 = x0 - eta * 2 * c * x0;
          const x2 = x1 - eta * (beta * 2 * c * x0 + 2 * c * x1);
          const gd2 = x1 - eta * 2 * c * x1;
          return allDistinct([x2, gd2, x1, x1 - eta * beta * 2 * c * x0].map(r6));
        },
      );
      const g0 = 2 * c * x0;
      const x1 = x0 - eta * g0;
      const g1 = 2 * c * x1;
      const v2 = beta * g0 + g1;
      const x2 = x1 - eta * v2;
      const fx = c === 0.5 ? r`\tfrac12 x^2` : 'x^2';
      return {
        params: { c, eta, beta, x0 },
        promptText: r`Minimise $f(x) = ${fx}$ with momentum: $v_{k+1} = \beta v_k + f'(x_k)$, $x_{k+1} = x_k - \eta v_{k+1}$, where $\eta = ${eta}$, $\beta = ${beta}$, $x_0 = ${x0}$ and $v_0 = 0$. What is $x_2$?`,
        options: [
          { id: 'a', label: `$${D(x2)}$`, value: r6(x2) },
          { id: 'b', label: `$${D(x1 - eta * g1)}$`, value: r6(x1 - eta * g1), trapExplanation: r`That is plain gradient descent; momentum adds $\beta v_1 = ${D(beta * g0)}$ to the second step's velocity.` },
          { id: 'c', label: `$${D(x1)}$`, value: r6(x1), trapExplanation: r`That is $x_1$, after the first step only.` },
          { id: 'd', label: `$${D(x1 - eta * beta * g0)}$`, value: r6(x1 - eta * beta * g0), trapExplanation: r`The new velocity also includes the fresh gradient $f'(x_1) = ${D(g1)}$.` },
        ],
        stepByStepSolution: [
          r`$v_1 = f'(${x0}) = ${D(g0)}$, so $x_1 = ${x0} - ${eta}\cdot${paren(r6(g0))} = ${D(x1)}$.`,
          r`$v_2 = ${beta}\cdot${paren(r6(g0))} + f'(${D(x1)}) = ${D(beta * g0)} ${g1 < 0 ? '-' : '+'} ${D(Math.abs(g1))} = ${D(v2)}$.`,
          r`$x_2 = ${D(x1)} - ${eta}\cdot${paren(r6(v2))} = ${D(x2)}$.`,
        ],
      };
    },
  },
  {
    id: 'op-03-4',
    difficulty: 2,
    keyConceptTag: 'The effective step of momentum',
    correctOptionId: 'a',
    generate: (g) => {
      const { gr, eta, beta } = g.until(
        () => ({ gr: g.int(1, 10), eta: g.pick([0.01, 0.02, 0.05, 0.1]), beta: g.pick([0.5, 0.75, 0.8, 0.9, 0.95]) }),
        ({ gr, eta, beta }) => allDistinct([(eta * gr) / (1 - beta), eta * gr, eta * gr * beta, (eta * gr) / beta].map(r6)),
      );
      return {
        params: { gr, eta, beta },
        promptText: r`On a long slope the gradient is constantly ${gr}. Gradient descent with momentum uses $\eta = ${eta}$ and $\beta = ${beta}$. Once the velocity has built up, how far does each step move?`,
        options: [
          { id: 'a', label: `$${D((eta * gr) / (1 - beta))}$`, value: r6((eta * gr) / (1 - beta)) },
          { id: 'b', label: `$${D(eta * gr)}$`, value: r6(eta * gr), trapExplanation: r`That is the plain gradient step; the velocity accumulates past gradients.` },
          { id: 'c', label: `$${D(eta * gr * beta)}$`, value: r6(eta * gr * beta), trapExplanation: r`$\beta$ keeps a fraction of the old velocity; the sum $1 + \beta + \beta^2 + \dots$ is larger than 1.` },
          { id: 'd', label: `$${D((eta * gr) / beta)}$`, value: r6((eta * gr) / beta), trapExplanation: r`The geometric series gives $\frac{1}{1 - \beta}$, not $\frac1\beta$.` },
        ],
        stepByStepSolution: [
          r`With a constant gradient $g$: $v = g + \beta g + \beta^2 g + \dots = \frac{g}{1 - \beta}$.`,
          r`$v = \frac{${gr}}{1 - ${beta}} = ${D(gr / (1 - beta))}$.`,
          r`Step: $\eta v = ${eta}\cdot${D(gr / (1 - beta))} = ${D((eta * gr) / (1 - beta))}$.`,
        ],
      };
    },
  },
  {
    id: 'op-03-5',
    difficulty: 3,
    keyConceptTag: 'Choosing a batch size',
    correctOptionId: 'a',
    generate: (g) => {
      const { k, s } = g.until(() => ({ k: g.int(2, 10), s: g.pick([0.5, 1, 2, 3]) }), ({ k }) => allDistinct([k * k, k, 2 * k, k ** 3]));
      return {
        params: { sigma: k * s, s },
        promptText: r`Per-example gradients of a weight have standard deviation ${D(k * s)}. What batch size makes the standard deviation of the mini-batch gradient ${D(s)}?`,
        options: [
          { id: 'a', label: `$${k * k}$`, value: k * k },
          { id: 'b', label: `$${k}$`, value: k, trapExplanation: r`The noise falls like $\frac{1}{\sqrt{|B|}}$: dividing it by ${k} needs $\sqrt{|B|} = ${k}$.` },
          { id: 'c', label: `$${2 * k}$`, value: 2 * k, trapExplanation: r`Solve $\frac{${D(k * s)}}{\sqrt{|B|}} = ${D(s)}$: the batch size is a square.` },
          { id: 'd', label: `$${k ** 3}$`, value: k ** 3, trapExplanation: r`$\sqrt{|B|} = ${k}$ gives $|B| = ${k}^2$, not $${k}^3$.` },
        ],
        stepByStepSolution: [
          r`Mini-batch noise: $\frac{\sigma}{\sqrt{|B|}}$.`,
          r`$\frac{${D(k * s)}}{\sqrt{|B|}} = ${D(s)}$ gives $\sqrt{|B|} = ${k}$.`,
          r`$|B| = ${k * k}$.`,
        ],
      };
    },
  },
  {
    id: 'op-03-6',
    difficulty: 3,
    keyConceptTag: 'Bias correction in Adam',
    correctOptionId: 'a',
    generate: (g) => {
      const { beta, g1, g2 } = g.until(
        () => ({ beta: g.pick([0.5, 0.8, 0.9]), g1: g.int(-6, 10), g2: g.int(-6, 10) }),
        ({ beta, g1, g2 }) => {
          const m2 = beta * (1 - beta) * g1 + (1 - beta) * g2;
          return g1 !== g2 && allDistinct([m2 / (1 - beta * beta), m2, (g1 + g2) / 2, g2].map(r6));
        },
      );
      const m1 = (1 - beta) * g1;
      const m2 = beta * m1 + (1 - beta) * g2;
      const hat = m2 / (1 - beta * beta);
      return {
        params: { beta, g1, g2 },
        promptText: r`An Adam-style moving average uses $m_k = \beta m_{k-1} + (1 - \beta)g_k$ with $m_0 = 0$ and $\beta = ${beta}$. The first two gradients are $g_1 = ${g1}$ and $g_2 = ${g2}$. What is the bias-corrected $\hat m_2 = \frac{m_2}{1 - \beta^2}$?`,
        options: [
          { id: 'a', label: `$${D(hat)}$`, value: r6(hat) },
          { id: 'b', label: `$${D(m2)}$`, value: r6(m2), trapExplanation: r`That is $m_2$ before the correction; it is pulled towards the starting value 0.` },
          { id: 'c', label: `$${D((g1 + g2) / 2)}$`, value: r6((g1 + g2) / 2), trapExplanation: r`The moving average weights recent gradients more: $g_2$ gets $\frac{1}{1 + \beta}$ of the weight, not half.` },
          { id: 'd', label: `$${g2}$`, value: g2, trapExplanation: r`The average still remembers $g_1$.` },
        ],
        stepByStepSolution: [
          r`$m_1 = (1 - ${beta})\cdot${paren(g1)} = ${D(m1)}$.`,
          r`$m_2 = ${beta}\cdot${paren(r6(m1))} + ${D(1 - beta)}\cdot${paren(g2)} = ${D(m2)}$.`,
          r`$\hat m_2 = \frac{${D(m2)}}{1 - ${D(beta * beta)}} = ${D(hat)}$.`,
        ],
      };
    },
  },
];
