import { defineLesson, r } from '../define.ts';
import { extra } from './04-tests.extra.ts';
import { practice } from './04-tests.practice.ts';

export default defineLesson({
  id: 'st-04',
  moduleId: 'statistics',
  title: 'Hypothesis tests',
  blurb: 'Is the effect real or just noise? p-values, errors and A/B tests',
  minutes: 8,
  deeper: [
    { title: 'Hypothesis testing (including power)', url: 'https://www.statlect.com/fundamentals-of-statistics/hypothesis-testing', source: 'StatLect · free textbook page with proofs and exercises' },
    { title: 'Frequentist inference', url: 'https://seeing-theory.brown.edu/frequentist-inference/index.html', source: 'Seeing Theory (Brown University) · interactive visualisation' },
  ],
  lecture: [
    {
      title: 'Null hypothesis and test statistic',
      blocks: [
        {
          kind: 'text',
          text: r`A test starts from a <i>null hypothesis</i> $H_0$, the boring explanation ("the new page converts no better", "$\mu = \mu_0$"), and an alternative $H_1$ ("$\mu \ne \mu_0$"). The question is whether the data are surprising if $H_0$ is true. For a mean with known $\sigma$, measure the surprise in standard errors:`,
        },
        { kind: 'formula', tex: r`z = \frac{\bar x - \mu_0}{\sigma/\sqrt n} \;\sim\; N(0, 1) \text{ under } H_0` },
        {
          kind: 'quiz',
          id: 'st-04-q1',
          prompt: r`$H_0: \mu = 100$, $\sigma = 15$, $n = 25$, and the sample mean is 106. What is the test statistic $z$?`,
          options: [
            { id: 'a', label: '$2$', value: 2 },
            { id: 'b', label: '$0.4$', value: 0.4, trapExplanation: r`That divides by $\sigma = 15$. The mean of 25 values has standard error $\frac{15}{5} = 3$.` },
            { id: 'c', label: '$6$', value: 6, trapExplanation: r`6 is the raw difference; divide it by the standard error 3.` },
          ],
          correctOptionId: 'a',
          explanation: r`$z = \frac{106 - 100}{15/\sqrt{25}} = \frac{6}{3} = 2$.`,
        },
      ],
    },
    {
      title: 'The p-value',
      blocks: [
        {
          kind: 'box',
          variant: 'definition',
          title: 'p-value',
          text: r`The probability, computed under $H_0$, of a test statistic at least as extreme as the one observed. Two-sided: $p = P(|Z| \ge |z|)$; one-sided: $p = P(Z \ge z)$.`,
        },
        { kind: 'diagram', type: 'pValue', caption: r`Under $H_0$ the statistic is standard normal. With $z = 2.1$, the two-sided p-value is the area of both tails beyond $\pm2.1$.` },
        {
          kind: 'text',
          text: r`A small p-value means the data would be rare if $H_0$ were true. The 68–95–99.7 rule gives quick values: $|z| = 1$ gives $p \approx 0.32$, $|z| = 2$ gives $p \approx 0.05$, $|z| = 3$ gives $p \approx 0.003$ (two-sided).`,
        },
        {
          kind: 'quiz',
          id: 'st-04-q2',
          prompt: r`A test statistic is $z = 2$. Approximately what is the two-sided p-value?`,
          options: [
            { id: 'a', label: r`$\approx 0.05$`, value: 0.05 },
            { id: 'b', label: r`$\approx 0.025$`, value: 0.025, trapExplanation: r`That is one tail only, the one-sided p-value. Two-sided counts both.` },
            { id: 'c', label: r`$\approx 0.95$`, value: 0.95, trapExplanation: r`0.95 is the probability of falling <i>within</i> $\pm2$, the opposite of the p-value.` },
          ],
          correctOptionId: 'a',
          explanation: r`About 95% lies within $\pm2$, so the two tails hold about 5% (exactly 0.046).`,
        },
      ],
    },
    {
      title: 'Decisions and errors',
      blocks: [
        {
          kind: 'text',
          text: r`Fix a <i>significance level</i> $\alpha$ (often 0.05) in advance and reject $H_0$ when $p \le \alpha$. Two mistakes are possible:

• <i>Type I error</i>: rejecting a true $H_0$ (a false alarm). Its probability is $\alpha$.

• <i>Type II error</i>: not rejecting a false $H_0$ (a missed effect), with probability $\beta$. The <i>power</i> $1 - \beta$ is the chance of detecting a real effect; it grows with the effect size and with $n$.`,
        },
        {
          kind: 'box',
          variant: 'pitfall',
          title: '"Not rejected" is not "proven"',
          text: r`A large p-value means the data are compatible with $H_0$, not that $H_0$ is true; the study may simply be too small. And $p$ is not the probability that $H_0$ is true: it is computed assuming $H_0$.`,
        },
        {
          kind: 'quiz',
          id: 'st-04-q3',
          prompt: r`A lab runs 100 tests at $\alpha = 0.05$, and in all of them $H_0$ is actually true. About how many tests reject $H_0$?`,
          options: [
            { id: 'a', label: '$5$', value: 5 },
            { id: 'b', label: '$0$', value: 0, trapExplanation: r`Each true null is still rejected with probability $\alpha$: false alarms happen.` },
            { id: 'c', label: '$95$', value: 95, trapExplanation: r`95 is the number of tests that correctly do not reject.` },
          ],
          correctOptionId: 'a',
          explanation: r`Each rejects with probability 0.05: $100\cdot0.05 = 5$ false positives.`,
        },
      ],
    },
    {
      title: 'A/B tests and multiple testing',
      blocks: [
        {
          kind: 'text',
          text: r`Comparing two conversion rates $\hat p_A$ and $\hat p_B$ (with $n$ users each) uses the pooled share $\hat p$ under $H_0: p_A = p_B$:`,
        },
        { kind: 'formula', tex: r`z = \frac{\hat p_B - \hat p_A}{\sqrt{\hat p(1 - \hat p)\cdot\frac{2}{n}}}` },
        {
          kind: 'example',
          title: 'Two landing pages',
          prompt: r`Each page gets 800 visitors; A converts 72 (9%), B converts 88 (11%). Is the difference significant at 5%?`,
          steps: [
            r`Pooled share: $\hat p = \frac{160}{1600} = 0.1$; $\operatorname{SE} = \sqrt{0.1\cdot0.9\cdot\frac{2}{800}} = 0.015$.`,
            r`$z = \frac{0.11 - 0.09}{0.015} \approx 1.33$.`,
            r`Two-sided $p \approx 0.18 > 0.05$: not significant. A 2-point lift needs more traffic to be distinguished from noise.`,
          ],
        },
        {
          kind: 'box',
          variant: 'pitfall',
          title: 'Many tests, many false alarms',
          text: r`With $m$ independent tests of true nulls, $P(\text{at least one rejection}) = 1 - (1 - \alpha)^m$: about 64% for $m = 20$. The <i>Bonferroni correction</i> tests each at $\alpha/m$, which keeps the chance of any false alarm below $\alpha$.`,
        },
      ],
    },
    {
      title: 'Summary',
      blocks: [
        {
          kind: 'text',
          text: r`• Test statistic: $z = \frac{\bar x - \mu_0}{\sigma/\sqrt n}$, standard normal under $H_0$.

• p-value: chance under $H_0$ of a result at least as extreme. Reject if $p \le \alpha$.

• Type I error (false alarm) has probability $\alpha$; power $= 1 - \beta$ = chance of detecting a real effect.

• A/B test: pooled two-proportion $z$. Many tests: use $\alpha/m$ (Bonferroni).`,
        },
      ],
    },
  ],
  extra,
  questions: practice,
});
