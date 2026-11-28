import { defineLesson, r } from '../define.ts';
import { extra } from './04-exp-log.extra.ts';
import { practice } from './04-exp-log.practice.ts';

export default defineLesson({
  id: 'sm-04',
  moduleId: 'school',
  title: 'Exponentials and logarithms',
  blurb: 'Growth, the number e, and the logarithm that undoes it',
  minutes: 8,
  lecture: [
    {
      title: 'Exponential functions',
      covers: ['x6'],
      blocks: [
        {
          kind: 'text',
          text: r`In $b^x$ the variable sits in the exponent. For $b > 1$ the function grows faster and faster, for $0 < b < 1$ it decays, and it is always positive. Repeated percentage growth is exponential: an amount $P$ growing by a rate $r$ per year is worth $P(1 + r)^n$ after $n$ years.

The most important base is $e \approx 2.718$. The function $e^x$ is the one whose slope at every point equals its own value, which makes it the natural choice in calculus, probability (the normal and exponential distributions) and machine learning (the sigmoid and softmax).`,
        },
        {
          kind: 'example',
          title: 'Compound growth',
          prompt: r`1000 € earn 4% per year, and the interest is added each year. How much is there after 3 years?`,
          steps: [
            r`Each year multiplies the amount by $1 + 0.04 = 1.04$.`,
            r`After 3 years: $1000\cdot 1.04^3 = 1000\cdot 1.124864 \approx 1124.86$ €.`,
            r`Adding $3\cdot 40 = 120$ € would be simple interest: it ignores the interest earned on interest.`,
          ],
        },
        {
          kind: 'quiz',
          id: 'sm-04-q1',
          prompt: r`What is $e^0$?`,
          options: [
            { id: 'a', label: '$1$', value: 1 },
            { id: 'b', label: '$0$', value: 0, trapExplanation: r`Any non-zero number to the power 0 is 1, because $a^0 = \frac{a^n}{a^n}$. $e^x$ is never 0.` },
            { id: 'c', label: '$e$', value: Math.E, trapExplanation: r`$e = e^1$. The power 0 gives 1.` },
          ],
          correctOptionId: 'a',
          explanation: r`$e^0 = 1$, like every $a^0$ with $a \ne 0$. The graph of $e^x$ passes through $(0, 1)$.`,
        },
      ],
    },
    {
      title: 'The logarithm',
      covers: ['1', '2', 'x1'],
      blocks: [
        {
          kind: 'text',
          text: r`The logarithm answers the question "which power?":`,
        },
        {
          kind: 'formula',
          tex: r`\log_b y = x \quad\Longleftrightarrow\quad b^x = y \qquad (b > 0,\ b \ne 1,\ y > 0)`,
        },
        {
          kind: 'text',
          text: r`So $\log_2 8 = 3$ because $2^3 = 8$, and $\log_{10} 0.01 = -2$ because $10^{-2} = 0.01$. The <i>natural logarithm</i> $\ln = \log_e$ is the inverse of $e^x$: $\ln(e^x) = x$ and $e^{\ln y} = y$. In particular $\ln 1 = 0$ and $\ln e = 1$. The logarithm is defined only for positive numbers, and it is negative between 0 and 1.`,
        },
        { kind: 'diagram', type: 'expLog' },
        {
          kind: 'quiz',
          id: 'sm-04-q2',
          prompt: r`What is $\log_2 32$?`,
          options: [
            { id: 'a', label: '$5$', value: 5 },
            { id: 'b', label: '$16$', value: 16, trapExplanation: r`A logarithm is not a division. It asks: 2 to which power gives 32?` },
            { id: 'c', label: r`$\tfrac15$`, value: 1 / 5, trapExplanation: r`That answers "32 to which power gives 2". The base is 2.` },
          ],
          correctOptionId: 'a',
          explanation: r`$2^5 = 32$, so $\log_2 32 = 5$.`,
        },
      ],
    },
    {
      title: 'Rules of logarithms',
      covers: ['3', '4', 'x2', 'x3', 'x4'],
      blocks: [
        {
          kind: 'text',
          text: r`Logarithms turn multiplication into addition, which is exactly why they are used everywhere (log-likelihoods, log scales). The rules are the power rules read backwards:`,
        },
        {
          kind: 'formula',
          tex: r`\log(ab) = \log a + \log b, \qquad \log\frac{a}{b} = \log a - \log b, \qquad \log(a^k) = k\log a, \qquad \log_b x = \frac{\ln x}{\ln b}`,
          caption: r`They hold for any base; the last one (change of base) turns every logarithm into natural logarithms.`,
        },
        {
          kind: 'example',
          title: 'Using the rules',
          prompt: r`Simplify $\ln\big(e^3\sqrt e\big)$ and compute $\log_2 12 + \log_2 6 - \log_2 9$.`,
          steps: [
            r`$\ln(e^3\sqrt e) = \ln e^3 + \ln e^{1/2} = 3 + \frac12 = \frac72$.`,
            r`$\log_2 12 + \log_2 6 - \log_2 9 = \log_2\frac{12\cdot6}{9} = \log_2 8$.`,
            r`$= 3$, since $2^3 = 8$.`,
          ],
        },
        {
          kind: 'box',
          variant: 'pitfall',
          title: 'No rule for sums',
          text: r`$\log(a + b) \ne \log a + \log b$: the product rule needs a product. And $(\ln x)^2 \ne \ln(x^2) = 2\ln x$.`,
        },
      ],
    },
    {
      title: 'Solving exponential equations',
      covers: ['5', '6', 'x5'],
      blocks: [
        {
          kind: 'text',
          text: r`When the unknown is in an exponent, take the logarithm of both sides: it brings the exponent down.`,
        },
        {
          kind: 'example',
          title: 'Half-life',
          prompt: r`A quantity decays as $N(t) = N_0e^{-0.2t}$. When is half of it left?`,
          steps: [
            r`Set $e^{-0.2t} = \frac12$ (the $N_0$ cancels).`,
            r`Take $\ln$: $-0.2t = \ln\frac12 = -\ln 2$.`,
            r`$t = \frac{\ln 2}{0.2} \approx \frac{0.693}{0.2} \approx 3.47$. Likewise $2^x = 20$ gives $x = \frac{\ln 20}{\ln 2} \approx 4.32$.`,
          ],
        },
        {
          kind: 'quiz',
          id: 'sm-04-q3',
          prompt: r`Solve $e^{2x} = e^{6}$.`,
          options: [
            { id: 'a', label: '$x = 3$', value: 3 },
            { id: 'b', label: '$x = 6$', value: 6, trapExplanation: r`The exponents are equal: $2x = 6$, then divide by 2.` },
            { id: 'c', label: '$x = 4$', value: 4, trapExplanation: r`$2x = 6$ is solved by dividing, not by subtracting 2.` },
          ],
          correctOptionId: 'a',
          explanation: r`Taking $\ln$ of both sides gives $2x = 6$, so $x = 3$.`,
        },
      ],
    },
    {
      title: 'Summary',
      blocks: [
        {
          kind: 'text',
          text: r`• $b^x > 0$ always; growth by a rate $r$ for $n$ periods multiplies by $(1 + r)^n$; $e \approx 2.718$.

• $\log_b y = x \iff b^x = y$; $\ln = \log_e$, $\ln 1 = 0$, $\ln e = 1$, defined only for $y > 0$.

• $\log(ab) = \log a + \log b$, $\log\frac ab = \log a - \log b$, $\log a^k = k\log a$, $\log_b x = \frac{\ln x}{\ln b}$. No rule for $\log(a + b)$.

• To free an exponent, take logarithms: $b^x = c \Rightarrow x = \frac{\ln c}{\ln b}$.`,
        },
      ],
    },
  ],
  extra,
  questions: practice,
});
