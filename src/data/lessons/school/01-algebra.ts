import { defineLesson, r } from '../define.ts';
import { extra } from './01-algebra.extra.ts';
import { practice } from './01-algebra.practice.ts';

export default defineLesson({
  id: 'sm-01',
  moduleId: 'school',
  title: 'Fractions, powers and roots',
  blurb: 'The algebra every formula in this course is written in',
  minutes: 8,
  lecture: [
    {
      title: 'Fractions',
      covers: ['1', '3', 'x1'],
      blocks: [
        {
          kind: 'text',
          text: r`Almost every answer in this course is a fraction, so the four operations have to be automatic.

• <i>Multiply</i>: tops times tops, bottoms times bottoms: $\frac{a}{b}\cdot\frac{c}{d} = \frac{ac}{bd}$.

• <i>Divide</i>: multiply by the flipped second fraction: $\frac{a}{b} \div \frac{c}{d} = \frac{a}{b}\cdot\frac{d}{c}$.

• <i>Add or subtract</i>: first bring both to a common denominator, then add the tops: $\frac{a}{b} + \frac{c}{d} = \frac{ad + cb}{bd}$.

• <i>Simplify</i>: divide top and bottom by a common factor: $\frac{12}{18} = \frac{2}{3}$.`,
        },
        {
          kind: 'example',
          title: 'Adding and dividing',
          prompt: r`Compute $\frac{2}{3} + \frac{3}{4}$ and $\frac{2}{3} \div \frac{4}{9}$.`,
          steps: [
            r`Common denominator 12: $\frac{2}{3} = \frac{8}{12}$ and $\frac{3}{4} = \frac{9}{12}$, so the sum is $\frac{17}{12}$.`,
            r`Dividing by $\frac{4}{9}$ means multiplying by $\frac{9}{4}$: $\frac{2}{3}\cdot\frac{9}{4} = \frac{18}{12}$.`,
            r`Simplify by 6: $\frac{18}{12} = \frac{3}{2}$.`,
          ],
        },
        {
          kind: 'quiz',
          id: 'sm-01-q1',
          prompt: r`What is $\frac{1}{2} + \frac{1}{3}$?`,
          options: [
            { id: 'a', label: r`$\tfrac{5}{6}$`, value: 5 / 6 },
            { id: 'b', label: r`$\tfrac{2}{5}$`, value: 2 / 5, trapExplanation: r`Tops and bottoms are not added separately. Use the common denominator 6: $\frac{3}{6} + \frac{2}{6}$.` },
            { id: 'c', label: r`$\tfrac{1}{6}$`, value: 1 / 6, trapExplanation: r`That is the product $\frac12\cdot\frac13$, not the sum.` },
          ],
          correctOptionId: 'a',
          explanation: r`$\frac{1}{2} + \frac{1}{3} = \frac{3}{6} + \frac{2}{6} = \frac{5}{6}$.`,
        },
      ],
    },
    {
      title: 'Powers',
      covers: ['2', 'x2', 'x3'],
      blocks: [
        {
          kind: 'text',
          text: r`$a^n$ means $n$ factors of $a$. Counting factors gives every rule:`,
        },
        {
          kind: 'formula',
          tex: r`a^m a^n = a^{m+n}, \qquad \frac{a^m}{a^n} = a^{m-n}, \qquad (a^m)^n = a^{mn}, \qquad (ab)^n = a^n b^n`,
        },
        {
          kind: 'text',
          text: r`The division rule explains the strange-looking cases: $a^0 = \frac{a^n}{a^n} = 1$, and $a^{-n} = \frac{a^0}{a^n} = \frac{1}{a^n}$. A negative exponent means "one over", not "negative": $2^{-3} = \frac18$.`,
        },
        {
          kind: 'box',
          variant: 'pitfall',
          title: 'Two classic slips',
          text: r`• $(a + b)^2 \ne a^2 + b^2$: the rules above are for products, not sums. $(1 + 2)^2 = 9$, but $1^2 + 2^2 = 5$.

• $-3^2 = -9$: the power binds tighter than the minus sign. $(-3)^2 = 9$.`,
        },
        {
          kind: 'quiz',
          id: 'sm-01-q2',
          prompt: r`What is $2^3 \cdot 2^4$?`,
          options: [
            { id: 'a', label: '$128$', value: 128 },
            { id: 'b', label: '$4096$', value: 4096, trapExplanation: r`That is $2^{12}$: the exponents were multiplied. For a product of powers they add: $2^{3+4} = 2^7$.` },
            { id: 'c', label: '$16\,384$', value: 16384, trapExplanation: r`That is $4^7$: the bases are not multiplied. Keep the base 2 and add the exponents.` },
          ],
          correctOptionId: 'a',
          explanation: r`$2^3\cdot2^4 = 2^{3+4} = 2^7 = 128$: three factors of 2 and four more make seven.`,
        },
      ],
    },
    {
      title: 'Roots and fractional powers',
      covers: ['4', '5', 'x4'],
      blocks: [
        {
          kind: 'text',
          text: r`$\sqrt{a}$ is the non-negative number whose square is $a$, and $\sqrt[n]{a}$ the number whose $n$-th power is $a$. Written as powers, roots obey the same rules:`,
        },
        {
          kind: 'formula',
          tex: r`\sqrt[n]{a} = a^{1/n}, \qquad a^{m/n} = \big(\sqrt[n]{a}\big)^m, \qquad \sqrt{ab} = \sqrt a\,\sqrt b`,
        },
        {
          kind: 'example',
          title: 'Simplifying roots',
          prompt: r`Compute $27^{2/3}$, simplify $\sqrt{50}$ and write $\frac{1}{\sqrt2}$ without a root in the denominator.`,
          steps: [
            r`$27^{2/3} = (\sqrt[3]{27})^2 = 3^2 = 9$: take the root first, then the power, and the numbers stay small.`,
            r`$\sqrt{50} = \sqrt{25\cdot2} = \sqrt{25}\,\sqrt2 = 5\sqrt2$: pull out the largest square factor.`,
            r`$\frac{1}{\sqrt2} = \frac{\sqrt2}{\sqrt2\,\sqrt2} = \frac{\sqrt2}{2}$, about $0.707$. You will meet this number in every lesson about angles and unit vectors.`,
          ],
        },
        {
          kind: 'box',
          variant: 'pitfall',
          title: 'Roots of sums',
          text: r`$\sqrt{a + b} \ne \sqrt a + \sqrt b$: $\sqrt{9 + 16} = 5$, not $3 + 4 = 7$. Products split under a root; sums do not. The same is true of powers.`,
        },
        {
          kind: 'quiz',
          id: 'sm-01-q3',
          prompt: r`What is $8^{2/3}$?`,
          options: [
            { id: 'a', label: '$4$', value: 4 },
            { id: 'b', label: r`$\tfrac{16}{3}$`, value: 16 / 3, trapExplanation: r`A power is not a product: $8^{2/3} \ne 8\cdot\frac23$. Take the cube root, then square it.` },
            { id: 'c', label: '$2$', value: 2, trapExplanation: r`$2 = \sqrt[3]{8}$ is only the first step; the exponent 2 still squares it.` },
          ],
          correctOptionId: 'a',
          explanation: r`$8^{2/3} = (\sqrt[3]{8})^2 = 2^2 = 4$.`,
        },
      ],
    },
    {
      title: 'Expanding and factoring',
      covers: ['6', 'x5', 'x6'],
      blocks: [
        {
          kind: 'text',
          text: r`<i>Expanding</i> multiplies every term of one bracket by every term of the other: $a(b + c) = ab + ac$. <i>Factoring</i> goes the other way and is how fractions with letters are simplified. Three products are worth knowing by heart:`,
        },
        {
          kind: 'formula',
          tex: r`(a + b)^2 = a^2 + 2ab + b^2, \qquad (a - b)^2 = a^2 - 2ab + b^2, \qquad (a + b)(a - b) = a^2 - b^2`,
        },
        { kind: 'diagram', type: 'binomialSquare', caption: r`The square of side $a + b$ holds $a^2$, $b^2$ and <i>two</i> rectangles $ab$: that is where the $2ab$ comes from.` },
        {
          kind: 'example',
          title: 'Cancelling a common factor',
          prompt: r`Simplify $\dfrac{x^2 - 9}{x - 3}$ for $x \ne 3$.`,
          steps: [
            r`Recognise a difference of squares: $x^2 - 9 = (x - 3)(x + 3)$.`,
            r`The factor $x - 3$ appears on top and bottom, and it is not zero because $x \ne 3$.`,
            r`Cancel it: $\dfrac{(x - 3)(x + 3)}{x - 3} = x + 3$.`,
          ],
        },
        {
          kind: 'box',
          variant: 'pitfall',
          title: 'Cancel factors, never terms',
          text: r`In $\frac{x + 3}{3}$ the 3 is part of a sum, so it cannot be cancelled: the result is not $x$ (try $x = 3$: $\frac{6}{3} = 2$). Only a factor of the <i>whole</i> top and the <i>whole</i> bottom may be cancelled.`,
        },
      ],
    },
    {
      title: 'Summary',
      blocks: [
        {
          kind: 'text',
          text: r`• Multiply fractions straight across; divide by multiplying with the flipped fraction; add only over a common denominator.

• $a^m a^n = a^{m+n}$, $(a^m)^n = a^{mn}$, $a^0 = 1$, $a^{-n} = \frac{1}{a^n}$.

• $a^{m/n} = (\sqrt[n]{a})^m$; $\sqrt{ab} = \sqrt a\sqrt b$, but $\sqrt{a + b} \ne \sqrt a + \sqrt b$.

• $(a \pm b)^2 = a^2 \pm 2ab + b^2$ and $a^2 - b^2 = (a + b)(a - b)$. Cancel factors, never terms.`,
        },
      ],
    },
  ],
  extra,
  questions: practice,
});
