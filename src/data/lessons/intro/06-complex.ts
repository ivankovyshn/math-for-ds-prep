import { defineLesson, r } from '../define.ts';
import { extra } from './06-complex.extra.ts';
import { practice } from './06-complex.practice.ts';

export default defineLesson({
  id: 'ml-06',
  moduleId: 'intro',
  title: 'Complex arithmetic',
  blurb: 'The number i, conjugates, division and complex roots of quadratics',
  minutes: 8,
  deeper: [
    { title: 'Complex Number Primer: arithmetic', url: 'https://tutorial.math.lamar.edu/Extras/ComplexPrimer/Arithmetic.aspx', source: "Paul's Online Math Notes (Lamar University) · notes with many worked examples" },
  ],
  lecture: [
    {
      title: 'The number i',
      covers: ['7'],
      blocks: [
        {
          kind: 'text',
          text: r`The equation $x^2 = -1$ has no real solution. Complex numbers add one new number $i$ with $i^2 = -1$, and everything else follows from the usual rules of algebra.

A complex number is $z = a + bi$ with real $a = \operatorname{Re} z$ (real part) and $b = \operatorname{Im} z$ (imaginary part). Real numbers are the ones with $b = 0$.

Powers of $i$ go round in a cycle of four: $i^1 = i$, $i^2 = -1$, $i^3 = i^2\cdot i = -i$, $i^4 = (i^2)^2 = 1$, and then $i^5 = i$ again.`,
        },
        {
          kind: 'example',
          title: 'A high power of i',
          prompt: r`Compute $i^{27}$.`,
          steps: [
            r`The cycle has length 4, so only the remainder of 27 divided by 4 matters: $27 = 4\cdot 6 + 3$.`,
            r`$i^{27} = (i^4)^6\cdot i^3 = 1^6\cdot i^3$.`,
            r`$i^3 = -i$, so $i^{27} = -i$.`,
          ],
        },
        {
          kind: 'quiz',
          id: 'ml-06-q1',
          prompt: r`What is $i^3$?`,
          options: [
            { id: 'a', label: r`$-i$`, value: [0, -1] },
            { id: 'b', label: r`$i$`, value: [0, 1], trapExplanation: r`$i^3 = i^2 \cdot i = -i$. The powers of $i$ cycle $i, -1, -i, 1$.` },
            { id: 'c', label: r`$-1$`, value: [-1, 0], trapExplanation: r`$-1$ is $i^2$. One more factor of $i$ gives $-i$.` },
          ],
          correctOptionId: 'a',
          explanation: r`$i^3 = i^2 \cdot i = (-1) \cdot i = -i$.`,
        },
      ],
    },
    {
      title: 'Adding, multiplying, conjugating',
      covers: ['1', 'x1', 'x2', 'x3', 'x5'],
      blocks: [
        {
          kind: 'text',
          text: r`Add real parts to real parts and imaginary parts to imaginary parts. Multiply like two brackets in algebra, then replace $i^2$ by $-1$:`,
        },
        { kind: 'formula', tex: r`(a + bi)(c + di) = (ac - bd) + (ad + bc)\,i` },
        {
          kind: 'box',
          variant: 'definition',
          title: 'Conjugate',
          text: r`The <i>conjugate</i> of $z = a + bi$ is $\bar z = a - bi$: the same number with the sign of the imaginary part flipped. Their product is always a non-negative real number: $z\bar z = a^2 - (bi)^2 = a^2 + b^2$.`,
        },
        {
          kind: 'example',
          title: 'The four operations on one pair',
          prompt: r`Let $z = 3 - 2i$ and $w = 1 + 4i$. Compute $z + w$, $zw$, $\bar z$ and $z\bar z$.`,
          steps: [
            r`Sum: $(3 + 1) + (-2 + 4)i = 4 + 2i$.`,
            r`Product: $3\cdot1 + 3\cdot4i - 2i\cdot1 - 2i\cdot4i = 3 + 12i - 2i - 8i^2$.`,
            r`$-8i^2 = +8$, so $zw = 11 + 10i$.`,
            r`Conjugate: $\bar z = 3 + 2i$. Then $z\bar z = 3^2 + 2^2 = 13$, a real number.`,
          ],
        },
      ],
    },
    {
      title: 'Division',
      covers: ['3', 'x7'],
      blocks: [
        {
          kind: 'text',
          text: r`Dividing by $c + di$ is not done part by part. The trick is the conjugate: multiply top and bottom by $\overline{c + di} = c - di$. The denominator becomes the real number $c^2 + d^2$, and dividing by a real number is easy.`,
        },
        {
          kind: 'example',
          title: 'Division',
          prompt: r`Compute $\dfrac{3 + 2i}{1 - i}$.`,
          steps: [
            r`Multiply by $\frac{1 + i}{1 + i}$: the denominator becomes $(1 - i)(1 + i) = 1 + 1 = 2$.`,
            r`Numerator: $(3 + 2i)(1 + i) = 3 + 3i + 2i + 2i^2 = 1 + 5i$.`,
            r`Result: $\dfrac{1 + 5i}{2} = \tfrac12 + \tfrac52 i$.`,
          ],
        },
        {
          kind: 'box',
          variant: 'tip',
          title: 'The reciprocal',
          text: r`With top 1 the same trick gives a formula: $\dfrac{1}{a + bi} = \dfrac{a - bi}{a^2 + b^2}$. For example $\dfrac{1}{2 + i} = \dfrac{2 - i}{5}$. It is not $\frac1a + \frac1b i$.`,
        },
      ],
    },
    {
      title: 'The complex plane',
      covers: ['2', 'x4'],
      blocks: [
        {
          kind: 'text',
          text: r`Draw $z = a + bi$ as the point $(a, b)$: the horizontal axis is the real axis, the vertical one the imaginary axis. Adding complex numbers is adding vectors, and the conjugate $\bar z$ is the mirror image in the real axis.

The <i>modulus</i> $|z| = \sqrt{a^2 + b^2}$ is the distance from 0, by Pythagoras. Note that $|z|^2 = z\bar z$.`,
        },
        { kind: 'diagram', type: 'complexPlane', caption: r`The angle $\varphi$ is the subject of the next lesson.` },
        {
          kind: 'example',
          title: 'A modulus',
          prompt: r`Find $|-5 + 12i|$.`,
          steps: [
            r`$a = -5$, $b = 12$: the point $(-5, 12)$.`,
            r`$|z| = \sqrt{(-5)^2 + 12^2} = \sqrt{25 + 144} = \sqrt{169}$.`,
            r`$|z| = 13$. The sign of $a$ does not matter: it is squared.`,
          ],
        },
        {
          kind: 'quiz',
          id: 'ml-06-q2',
          prompt: r`In which quadrant of the complex plane does $z = -2 + i$ lie?`,
          options: [
            { id: 'a', label: 'Second (upper left)' },
            { id: 'b', label: 'First (upper right)', trapExplanation: r`The real part $-2$ is negative, so the point is left of the imaginary axis.` },
            { id: 'c', label: 'Third (lower left)', trapExplanation: r`The imaginary part $+1$ is positive, so the point is above the real axis.` },
          ],
          correctOptionId: 'a',
          explanation: r`$z = a + bi$ is the point $(a, b)$. Here $(-2, 1)$: left and up — the second quadrant.`,
        },
      ],
    },
    {
      title: 'Quadratic equations',
      covers: ['8', '9'],
      blocks: [
        {
          kind: 'text',
          text: r`The quadratic formula $z = \frac{-b \pm \sqrt{D}}{2a}$, $D = b^2 - 4ac$, works for a negative discriminant too: $\sqrt{D} = i\sqrt{-D}$, because $(i\sqrt{-D})^2 = -(-D) = D$. Where school algebra said "no solutions", there are two complex ones.`,
        },
        {
          kind: 'example',
          title: 'Two complex roots',
          prompt: r`Solve $z^2 - 4z + 13 = 0$.`,
          steps: [
            r`$D = (-4)^2 - 4\cdot13 = 16 - 52 = -36$.`,
            r`$\sqrt{-36} = 6i$, since $(6i)^2 = -36$.`,
            r`$z = \frac{4 \pm 6i}{2} = 2 \pm 3i$.`,
            r`Check $z = 2 + 3i$: $z^2 = 4 + 12i - 9 = -5 + 12i$; $-4z = -8 - 12i$; sum with 13: $0$. ✓`,
          ],
        },
        {
          kind: 'box',
          variant: 'theorem',
          title: 'Fundamental theorem of algebra',
          text: r`Every polynomial of degree $n \ge 1$ with complex coefficients has exactly $n$ complex roots, counted with multiplicity. If the coefficients are real, non-real roots come in conjugate pairs $z$, $\bar z$.`,
        },
        {
          kind: 'example',
          title: 'From a root back to the equation',
          prompt: r`A quadratic $z^2 + bz + c$ with real $b$, $c$ has the root $1 + 2i$. Find it.`,
          steps: [
            r`Real coefficients: the conjugate $1 - 2i$ is the other root.`,
            r`$(z - z_1)(z - z_2) = z^2 - (z_1 + z_2)z + z_1z_2$.`,
            r`Sum $z_1 + z_2 = 2$; product $(1 + 2i)(1 - 2i) = 1 + 4 = 5$.`,
            r`The quadratic is $z^2 - 2z + 5$.`,
          ],
        },
        {
          kind: 'quiz',
          id: 'ml-06-q3',
          prompt: r`Which numbers solve $z^2 + 2z + 5 = 0$?`,
          options: [
            { id: 'a', label: r`$z = -1 \pm 2i$` },
            { id: 'b', label: r`$z = 1 \pm 2i$`, trapExplanation: r`The roots have real part $-\frac{b}{2a} = -1$. A sign was lost.` },
            { id: 'c', label: r`$z = -1 \pm 4i$`, trapExplanation: r`$\sqrt{-16} = 4i$ must still be divided by $2a = 2$.` },
          ],
          correctOptionId: 'a',
          explanation: r`$z = \frac{-2 \pm \sqrt{4 - 20}}{2} = \frac{-2 \pm 4i}{2} = -1 \pm 2i$ — a conjugate pair, as expected for real coefficients.`,
        },
      ],
    },
    {
      title: 'Summary',
      blocks: [
        {
          kind: 'text',
          text: r`• $i^2 = -1$; powers of $i$ repeat every 4: $i, -1, -i, 1$.

• $z = a + bi$: add part by part, multiply like brackets, replace $i^2$ by $-1$.

• Conjugate $\bar z = a - bi$; $z\bar z = a^2 + b^2 = |z|^2$. Divide by multiplying top and bottom with the conjugate of the denominator.

• $z$ is the point $(a, b)$; $|z| = \sqrt{a^2 + b^2}$.

• A negative discriminant gives two conjugate roots: $\sqrt{D} = i\sqrt{-D}$.

Next lesson: the angle of a complex number, and why it makes powers and roots easy.`,
        },
      ],
    },
  ],
  extra,
  questions: practice,
});
