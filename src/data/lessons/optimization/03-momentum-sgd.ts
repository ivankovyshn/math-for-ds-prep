import { defineLesson, r } from '../define.ts';
import { extra } from './03-momentum-sgd.extra.ts';
import { practice } from './03-momentum-sgd.practice.ts';

export default defineLesson({
  id: 'op-03',
  moduleId: 'optimization',
  title: 'Momentum and stochastic gradients',
  blurb: 'Cheap noisy steps, a heavy ball and adaptive learning rates',
  minutes: 8,
  lecture: [
    {
      title: 'Stochastic gradients',
      blocks: [
        {
          kind: 'text',
          text: r`A training loss is an average over $n$ examples, $L(w) = \frac1n\sum_{i=1}^n \ell_i(w)$, so its gradient is an average of $n$ per-example gradients. With millions of examples one exact gradient is expensive. <i>Stochastic gradient descent</i> (SGD) estimates it from a random mini-batch $B$ of $|B|$ examples:`,
        },
        { kind: 'formula', tex: r`g = \frac{1}{|B|}\sum_{i \in B}\nabla\ell_i(w), \qquad w \leftarrow w - \eta\,g` },
        {
          kind: 'text',
          text: r`The estimate is unbiased, $E[g] = \nabla L$, and costs $|B|$ instead of $n$ gradient evaluations. One pass through all the data is an <i>epoch</i>: $\frac{n}{|B|}$ steps.`,
        },
        {
          kind: 'quiz',
          id: 'op-03-q1',
          prompt: r`A dataset has 50 000 examples and the batch size is 100. How many SGD steps make one epoch?`,
          options: [
            { id: 'a', label: '$500$', value: 500 },
            { id: 'b', label: '$100$', value: 100, trapExplanation: r`100 is the batch size; the number of steps is how many batches fit into the data.` },
            { id: 'c', label: '$5\\,000\\,000$', value: 5000000, trapExplanation: r`That multiplies instead of dividing.` },
          ],
          correctOptionId: 'a',
          explanation: r`$\frac{50\,000}{100} = 500$ batches per epoch.`,
        },
      ],
    },
    {
      title: 'Noise and batch size',
      blocks: [
        {
          kind: 'text',
          text: r`A mini-batch gradient is an average of $|B|$ independent noisy terms, so its noise has standard deviation $\frac{\sigma}{\sqrt{|B|}}$ (the standard error from probability). Larger batches give cleaner but more expensive steps; four times the batch halves the noise.

Because of the noise, SGD with a fixed learning rate does not settle exactly at the minimum; it keeps jittering around it. In practice the learning rate is decreased over training (a <i>schedule</i>), and the noise is even useful: it helps escape flat saddle regions.`,
        },
        {
          kind: 'quiz',
          id: 'op-03-q2',
          prompt: r`The batch size goes from 25 to 100. What happens to the standard deviation of the gradient noise?`,
          options: [
            { id: 'a', label: 'It halves', value: 0.5 },
            { id: 'b', label: 'It drops to a quarter', value: 0.25, trapExplanation: r`The <i>variance</i> drops to a quarter; the standard deviation scales with $\frac{1}{\sqrt{|B|}}$.` },
            { id: 'c', label: 'It stays the same', value: 1, trapExplanation: r`Averaging more examples reduces the noise.` },
          ],
          correctOptionId: 'a',
          explanation: r`$\frac{\sigma/\sqrt{100}}{\sigma/\sqrt{25}} = \frac{5}{10} = \frac12$.`,
        },
      ],
    },
    {
      title: 'Momentum',
      blocks: [
        {
          kind: 'text',
          text: r`Plain gradient descent zigzags across narrow valleys. <i>Momentum</i> keeps a running velocity, like a heavy ball rolling downhill:`,
        },
        { kind: 'formula', tex: r`v_{k+1} = \beta v_k + \nabla f(x_k), \qquad x_{k+1} = x_k - \eta\,v_{k+1}` },
        {
          kind: 'text',
          text: r`Gradients that keep the same sign (along the valley) accumulate; those that flip sign (across it) cancel. With a constant gradient $g$ the velocity grows to $g(1 + \beta + \beta^2 + \dots) = \frac{g}{1 - \beta}$, so the effective step is $\frac{\eta}{1 - \beta}$: ten times larger for the common choice $\beta = 0.9$.`,
        },
        { kind: 'diagram', type: 'momentum', caption: r`On a long, narrow valley plain gradient descent (red) bounces between the walls; momentum (green) damps the zigzag and builds up speed along the valley.` },
        {
          kind: 'quiz',
          id: 'op-03-q3',
          prompt: r`With momentum $\beta = 0.9$ and a constant gradient, the steps eventually become how many times longer than plain gradient descent's?`,
          options: [
            { id: 'a', label: '$10$', value: 10 },
            { id: 'b', label: '$0.9$', value: 0.9, trapExplanation: r`$\beta$ is the fraction of velocity kept each step; the accumulated factor is $\frac{1}{1-\beta}$.` },
            { id: 'c', label: '$1.9$', value: 1.9, trapExplanation: r`$1 + \beta$ counts only one past step; the velocity sums the whole geometric series.` },
          ],
          correctOptionId: 'a',
          explanation: r`$\frac{1}{1 - 0.9} = 10$.`,
        },
      ],
    },
    {
      title: 'Adaptive methods: Adam',
      blocks: [
        {
          kind: 'text',
          text: r`Adam combines momentum with a per-coordinate learning rate. It keeps exponential moving averages of the gradient and of its square,

$m_k = \beta_1 m_{k-1} + (1 - \beta_1)g_k$, $\quad s_k = \beta_2 s_{k-1} + (1 - \beta_2)g_k^2$,

and steps by $\eta\frac{\hat m_k}{\sqrt{\hat s_k} + \varepsilon}$. Coordinates with consistently large gradients get smaller steps, rarely updated ones get larger steps. Because $m_0 = s_0 = 0$, the early averages are biased towards 0; the corrections $\hat m_k = \frac{m_k}{1 - \beta_1^k}$ and $\hat s_k = \frac{s_k}{1 - \beta_2^k}$ remove that bias.`,
        },
        {
          kind: 'example',
          title: 'Why the bias correction',
          prompt: r`The gradient is constantly $g = 4$ and $\beta_1 = 0.9$. Compute $m_1$, $m_2$ and their corrected values.`,
          steps: [
            r`$m_1 = 0.9\cdot0 + 0.1\cdot4 = 0.4$, far below the true 4.`,
            r`$m_2 = 0.9\cdot0.4 + 0.1\cdot4 = 0.76$.`,
            r`$\hat m_1 = \frac{0.4}{1 - 0.9} = 4$ and $\hat m_2 = \frac{0.76}{1 - 0.81} = 4$: the correction recovers the right value from the start.`,
          ],
        },
      ],
    },
    {
      title: 'Summary',
      blocks: [
        {
          kind: 'text',
          text: r`• SGD: estimate the gradient from a mini-batch; an epoch is $\frac{n}{|B|}$ steps.

• Gradient noise $\propto \frac{1}{\sqrt{|B|}}$; decay the learning rate to settle.

• Momentum: $v \leftarrow \beta v + \nabla f$, $x \leftarrow x - \eta v$; effective step $\frac{\eta}{1 - \beta}$, less zigzag.

• Adam: momentum plus per-coordinate scaling by the RMS of past gradients, with bias correction $\frac{1}{1 - \beta^k}$.`,
        },
      ],
    },
  ],
  extra,
  questions: practice,
});
