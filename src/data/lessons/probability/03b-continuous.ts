import { defineLesson, r } from '../define.ts';
import { extra } from './03b-continuous.extra.ts';
import { practice } from './03b-continuous.practice.ts';

export default defineLesson({
  id: 'pr-03b',
  moduleId: 'probability',
  title: 'Continuous distributions',
  blurb: 'Densities, and the uniform, exponential and normal distributions',
  minutes: 8,
  deeper: [
    { title: 'Probability distributions', url: 'https://seeing-theory.brown.edu/probability-distributions/index.html', source: 'Seeing Theory (Brown University) · interactive visualisation' },
    { title: 'Probability density function', url: 'https://www.statlect.com/glossary/probability-density-function', source: 'StatLect · free textbook page with proofs and exercises' },
    { title: 'Normal distribution', url: 'https://www.statlect.com/probability-distributions/normal-distribution', source: 'StatLect · free textbook page with proofs and exercises' },
  ],
  lecture: [
    {
      title: 'Densities',
      covers: ['2', 'x1'],
      blocks: [
        {
          kind: 'text',
          text: r`A waiting time or a height can take any value in an interval, so we cannot list the values with their probabilities. Instead a continuous $X$ has a <i>density</i> $f(x) \ge 0$ with total area 1, and probabilities are areas under it:`,
        },
        { kind: 'formula', tex: r`P(a \le X \le b) = \int_a^b f(x)\,dx, \qquad F(x) = P(X \le x) = \int_{-\infty}^{x} f(t)\,dt` },
        {
          kind: 'text',
          text: r`A single value has probability 0 (an interval of length 0 has no area), so $<$ and $\le$ give the same answers. The CDF makes interval probabilities a subtraction: $P(a < X \le b) = F(b) - F(a)$.`,
        },
        {
          kind: 'example',
          title: 'A density on [0, 1]',
          prompt: r`$X$ has density $f(x) = 2x$ on $[0, 1]$. Find its CDF, $P(0.2 < X \le 0.5)$ and $P(X = 0.5)$.`,
          steps: [
            r`$F(x) = \int_0^x 2t\,dt = x^2$ for $0 \le x \le 1$. Check: $F(1) = 1$.`,
            r`$P(0.2 < X \le 0.5) = F(0.5) - F(0.2) = 0.25 - 0.04 = 0.21$.`,
            r`$P(X = 0.5) = 0$, although $f(0.5) = 1$: the density is probability <i>per unit length</i>, not a probability.`,
          ],
        },
        {
          kind: 'quiz',
          id: 'pr-03b-q1',
          prompt: r`$X$ is uniform on $[0, \frac12]$: its density is a constant $c$ there and 0 elsewhere. What is $c$?`,
          options: [
            { id: 'a', label: '$2$', value: 2 },
            { id: 'b', label: r`$\tfrac12$`, value: 0.5, trapExplanation: r`That is the length of the interval. The area $c\cdot\frac12$ must be 1.` },
            { id: 'c', label: '$1$', value: 1, trapExplanation: r`With $c = 1$ the area would be only $\frac12$. A density may exceed 1; only its area is fixed.` },
          ],
          correctOptionId: 'a',
          explanation: r`Area $= c\cdot\frac12 = 1$, so $c = 2$. A density above 1 is fine: densities are not probabilities.`,
        },
      ],
    },
    {
      title: 'Uniform',
      covers: ['1', '6', 'x3'],
      blocks: [
        {
          kind: 'text',
          text: r`<i>Uniform</i>$(a, b)$: every part of $[a, b]$ is equally likely. The density is the constant $\frac{1}{b - a}$ on $[a, b]$, so probability is proportional to length: $P(X \in I) = \frac{\text{length of } I \cap [a, b]}{b - a}$.`,
        },
        {
          kind: 'example',
          title: 'Overlapping intervals',
          prompt: r`$X \sim \text{Uniform}(2, 10)$. Find the density, $P(3 \le X \le 7)$ and $P(6 \le X \le 14)$.`,
          steps: [
            r`Density: $\frac{1}{10 - 2} = \frac18$ on $[2, 10]$.`,
            r`$P(3 \le X \le 7) = \frac{7 - 3}{8} = \frac12$.`,
            r`$[6, 14]$ sticks out of $[2, 10]$; beyond 10 the density is 0. Only $[6, 10]$ counts: $\frac{4}{8} = \frac12$, not $\frac{8}{8}$.`,
          ],
        },
      ],
    },
    {
      title: 'Exponential',
      covers: ['3', '4', 'x6'],
      blocks: [
        {
          kind: 'text',
          text: r`<i>Exponential</i>$(\lambda)$ models waiting times until the next event of a Poisson stream with rate $\lambda$: the density is $f(x) = \lambda e^{-\lambda x}$ for $x \ge 0$. The mean waiting time is $\frac1\lambda$: at 4 buses per hour, the average wait is a quarter of an hour.`,
        },
        { kind: 'formula', tex: r`P(X > t) = \int_t^\infty \lambda e^{-\lambda x}\,dx = e^{-\lambda t}, \qquad P(X \le t) = 1 - e^{-\lambda t}, \qquad E[X] = \frac1\lambda` },
        {
          kind: 'example',
          title: 'Waiting for a bus',
          prompt: r`The wait $X$ for a bus is exponential with mean 2 minutes. Find $P(X > 4)$ and $P(X \le 1)$.`,
          steps: [
            r`Mean 2 minutes means rate $\lambda = \frac12$ per minute.`,
            r`$P(X > 4) = e^{-\frac12\cdot 4} = e^{-2} \approx 0.135$.`,
            r`$P(X \le 1) = 1 - e^{-\frac12} \approx 0.393$.`,
            r`Using the mean as the rate ($e^{-2\cdot4}$) is the classic slip: check that a longer mean gives a longer wait.`,
          ],
        },
        {
          kind: 'quiz',
          id: 'pr-03b-q2',
          prompt: r`$X$ is exponential with rate $\lambda = 1$. What is $P(X > 2)$?`,
          options: [
            { id: 'a', label: r`$e^{-2} \approx 0.14$`, value: Math.exp(-2) },
            { id: 'b', label: r`$1 - e^{-2} \approx 0.86$`, value: 1 - Math.exp(-2), trapExplanation: r`That is $P(X \le 2)$.` },
            { id: 'c', label: r`$\tfrac12$`, value: 0.5, trapExplanation: r`The exponential distribution has no upper end, so there is no "half way". Use $e^{-\lambda t}$.` },
          ],
          correctOptionId: 'a',
          explanation: r`$P(X > t) = e^{-\lambda t} = e^{-2}$.`,
        },
      ],
    },
    {
      title: 'The normal distribution',
      covers: ['5', 'x2', 'x4', 'x5'],
      blocks: [
        {
          kind: 'text',
          text: r`<i>Normal</i> $N(\mu, \sigma^2)$: the bell curve centred at the mean $\mu$, with spread $\sigma$ (the standard deviation; $\sigma^2$ is the variance). Its density is $f(x) = \frac{1}{\sigma\sqrt{2\pi}}e^{-(x - \mu)^2/(2\sigma^2)}$, which has no elementary antiderivative — so we standardise and use known areas.

<i>Standardising</i>: $Z = \frac{X - \mu}{\sigma}$ counts how many standard deviations $X$ is from the mean, and $Z \sim N(0, 1)$.`,
        },
        { kind: 'diagram', type: 'normal', caption: r`The 68–95–99.7 rule: a normal variable lies within $1\sigma$ of the mean about 68% of the time, within $2\sigma$ about 95%, within $3\sigma$ about 99.7%.` },
        {
          kind: 'example',
          title: 'Bands and tails',
          prompt: r`$X \sim N(50, 10^2)$. Find $P(40 < X < 60)$, $P(X > 70)$ and the $z$-value of $x = 65$.`,
          steps: [
            r`40 and 60 are $\mu \pm 1\sigma$: about 68%.`,
            r`70 is $\mu + 2\sigma$. 95% lies within $2\sigma$, so 5% lies outside — split equally between the two tails: $P(X > 70) \approx 2.5\%$.`,
            r`$z = \frac{65 - 50}{10} = 1.5$: 65 is one and a half standard deviations above the mean.`,
          ],
        },
        {
          kind: 'quiz',
          id: 'pr-03b-q3',
          prompt: r`IQ scores are roughly $N(100, 15^2)$. About what share lies between 85 and 115?`,
          options: [
            { id: 'a', label: r`$68\%$`, value: 68 },
            { id: 'b', label: r`$95\%$`, value: 95, trapExplanation: r`95% is within $2\sigma$, i.e. 70 to 130.` },
            { id: 'c', label: r`$34\%$`, value: 34, trapExplanation: r`34% is one side only, 100 to 115.` },
          ],
          correctOptionId: 'a',
          explanation: r`85 and 115 are $\mu \pm \sigma$, so about 68%.`,
        },
      ],
    },
    {
      title: 'Summary',
      blocks: [
        {
          kind: 'text',
          text: r`• Density: $f \ge 0$, area 1; $P(a \le X \le b) = \int_a^b f = F(b) - F(a)$; single values have probability 0; $f$ may exceed 1.

• Uniform$(a, b)$: density $\frac{1}{b - a}$; probability = overlapping length / total length.

• Exponential$(\lambda)$: $P(X > t) = e^{-\lambda t}$, mean $\frac1\lambda$.

• Normal: $z = \frac{x - \mu}{\sigma}$; 68–95–99.7 within $1, 2, 3$ standard deviations, tails split equally.`,
        },
      ],
    },
  ],
  extra,
  questions: practice,
});
