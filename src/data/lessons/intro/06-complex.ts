import { defineLesson, r } from '../define.ts';
import { extra } from './06-complex.extra.ts';

export default defineLesson({
  id: 'ml-06',
  moduleId: 'intro',
  title: 'Complex numbers',
  blurb: 'Arithmetic, the complex plane, polar form, roots',
  minutes: 8,
  lecture: [
    {
      title: 'The number i',
      blocks: [
        {
          kind: 'text',
          text: r`The equation $x^2 = -1$ has no real solution. Complex numbers add one new number $i$ with $i^2 = -1$, and everything else follows from the usual rules of algebra.

A complex number is $z = a + bi$ with real $a = \operatorname{Re} z$ (real part) and $b = \operatorname{Im} z$ (imaginary part). Add and multiply like polynomials in $i$, replacing $i^2$ by $-1$:`,
        },
        { kind: 'formula', tex: r`(a + bi)(c + di) = (ac - bd) + (ad + bc)\,i` },
        {
          kind: 'text',
          text: r`The <i>conjugate</i> of $z = a + bi$ is $\bar z = a - bi$, and $z\bar z = a^2 + b^2$ is a non-negative real number. That is the trick for division: multiply top and bottom by the conjugate of the denominator.`,
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
      title: 'The complex plane',
      blocks: [
        {
          kind: 'text',
          text: r`Draw $z = a + bi$ as the point $(a, b)$. Then a complex number has a length and a direction:

• the <i>modulus</i> $|z| = \sqrt{a^2 + b^2}$ (distance from 0);

• the <i>argument</i> $\arg z = \varphi$, the angle from the positive real axis.`,
        },
        { kind: 'diagram', type: 'complexPlane' },
        { kind: 'formula', tex: r`z = r(\cos\varphi + i\sin\varphi) = r\,e^{i\varphi}, \qquad r = |z|`, caption: r`Polar form. The notation $e^{i\varphi}$ comes from Euler's formula $e^{i\varphi} = \cos\varphi + i\sin\varphi$.` },
        {
          kind: 'box',
          variant: 'pitfall',
          title: 'Mind the quadrant',
          text: r`$\tan\varphi = b/a$ does not determine $\varphi$ on its own: $1 + i$ and $-1 - i$ have the same ratio but opposite directions. Always check which quadrant the point is in.`,
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
      title: 'Multiplying in polar form',
      blocks: [
        {
          kind: 'text',
          text: r`In polar form multiplication becomes simple: <i>moduli multiply, arguments add</i>. Geometrically, multiplying by $z$ scales by $|z|$ and rotates by $\arg z$ — multiplying by $i$ is a $90^\circ$ rotation.`,
        },
        { kind: 'formula', tex: r`r_1e^{i\varphi_1}\cdot r_2e^{i\varphi_2} = r_1r_2\,e^{i(\varphi_1 + \varphi_2)}, \qquad \big(re^{i\varphi}\big)^{n} = r^{n}e^{in\varphi}`, caption: "The second formula is De Moivre's theorem." },
        {
          kind: 'example',
          title: 'A high power',
          prompt: r`Compute $(1 + i)^8$.`,
          steps: [
            r`$|1 + i| = \sqrt2$, $\arg(1 + i) = 45^\circ$.`,
            r`$(1 + i)^8$ has modulus $(\sqrt2)^8 = 16$ and argument $8\cdot45^\circ = 360^\circ$.`,
            r`An angle of $360^\circ$ points along the positive real axis: $(1 + i)^8 = 16$.`,
          ],
        },
      ],
    },
    {
      title: 'Roots and polynomials',
      blocks: [
        {
          kind: 'text',
          text: r`Solving $z^n = w$ reverses the rule: take the $n$-th root of the modulus and divide the argument by $n$ — but the argument is only known up to multiples of $360^\circ$, which gives $n$ different answers, evenly spaced on a circle.`,
        },
        { kind: 'diagram', type: 'rootsOfUnity', caption: r`The six solutions of $z^6 = 1$: $e^{ik\cdot 60^\circ}$ for $k = 0, \dots, 5$.` },
        {
          kind: 'box',
          variant: 'theorem',
          title: 'Fundamental theorem of algebra',
          text: r`Every polynomial of degree $n \ge 1$ with complex coefficients has exactly $n$ complex roots, counted with multiplicity. If the coefficients are real, non-real roots come in conjugate pairs $z$, $\bar z$.`,
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
          text: r`• $i^2 = -1$; $z = a + bi$; divide by multiplying with the conjugate.

• $|z| = \sqrt{a^2 + b^2}$; $\arg z$ = angle, check the quadrant.

• $z = re^{i\varphi}$: multiply ⇒ moduli multiply, arguments add; $(re^{i\varphi})^n = r^ne^{in\varphi}$.

• $z^n = w$ has $n$ roots on a circle; degree-$n$ polynomials have $n$ complex roots.`,
        },
      ],
    },
  ],
  extra,
  questions: [
    {
      id: 'ml-06-1',
      difficulty: 1,
      promptText: r`Compute $(2 + 3i)(1 - i)$.`,
      options: [
        { id: 'a', label: r`$5 + i$`, value: [5, 1] },
        { id: 'b', label: r`$-1 + i$`, value: [-1, 1], trapExplanation: r`The term $-3i^2$ was treated as $-3$. Since $i^2 = -1$, it is $+3$.` },
        { id: 'c', label: r`$2 - 3i$`, value: [2, -3], trapExplanation: r`Multiplying real parts and imaginary parts separately is not complex multiplication. Expand all four products.` },
        { id: 'd', label: r`$5 - i$`, value: [5, -1], trapExplanation: r`The $i$ terms are $-2i + 3i = +i$. A sign was lost.` },
      ],
      correctOptionId: 'a',
      stepByStepSolution: [
        r`Expand: $2 - 2i + 3i - 3i^2$.`,
        r`$-3i^2 = +3$.`,
        r`$(2 + 3) + (-2 + 3)i = 5 + i$.`,
      ],
      keyConceptTag: 'Complex multiplication',
    },
    {
      id: 'ml-06-2',
      difficulty: 1,
      promptText: r`What is $|3 - 4i|$?`,
      options: [
        { id: 'a', label: '$5$', value: 5 },
        { id: 'b', label: '$7$', value: 7, trapExplanation: r`$3 + 4$ adds the absolute values. The modulus is a distance: $\sqrt{3^2 + 4^2}$.` },
        { id: 'c', label: '$-1$', value: -1, trapExplanation: r`A modulus is a length and is never negative.` },
        { id: 'd', label: '$25$', value: 25, trapExplanation: r`$25 = |z|^2 = z\bar z$. Take the square root.` },
      ],
      correctOptionId: 'a',
      stepByStepSolution: [
        r`$|a + bi| = \sqrt{a^2 + b^2}$.`,
        r`$\sqrt{9 + 16} = \sqrt{25}$.`,
        r`$= 5$.`,
      ],
      keyConceptTag: 'Modulus',
    },
    {
      id: 'ml-06-3',
      difficulty: 2,
      promptText: r`Compute $\dfrac{3 + 2i}{1 - i}$.`,
      options: [
        { id: 'a', label: r`$\tfrac12 + \tfrac52 i$`, value: [0.5, 2.5] },
        { id: 'b', label: r`$3 - 2i$`, value: [3, -2], trapExplanation: r`Dividing real by real and imaginary by imaginary is not complex division. Multiply by the conjugate $1 + i$.` },
        { id: 'c', label: r`$1 + 5i$`, value: [1, 5], trapExplanation: r`That is the numerator after multiplying by $1 + i$; the denominator $(1 - i)(1 + i) = 2$ still has to be divided out.` },
        { id: 'd', label: r`$\tfrac52 + \tfrac12 i$`, value: [2.5, 0.5], trapExplanation: r`Real and imaginary parts are swapped. $(3 + 2i)(1 + i) = 1 + 5i$, so the real part is $\tfrac12$.` },
      ],
      correctOptionId: 'a',
      stepByStepSolution: [
        r`Multiply top and bottom by $1 + i$: denominator $(1 - i)(1 + i) = 2$.`,
        r`Numerator: $3 + 3i + 2i + 2i^2 = 1 + 5i$.`,
        r`$\frac{1 + 5i}{2} = \tfrac12 + \tfrac52 i$.`,
      ],
      keyConceptTag: 'Complex division',
    },
    {
      id: 'ml-06-4',
      difficulty: 2,
      promptText: r`What is the argument of $z = -1 + i\sqrt3$ (in degrees, between $-180^\circ$ and $180^\circ$)?`,
      options: [
        { id: 'a', label: r`$120^\circ$`, value: 120 },
        { id: 'b', label: r`$-60^\circ$`, value: -60, trapExplanation: r`$\arctan(b/a) = \arctan(-\sqrt3) = -60^\circ$ points into the 4th quadrant. But $z$ has $a < 0$, $b > 0$: it lies in the 2nd quadrant, so add $180^\circ$.` },
        { id: 'c', label: r`$60^\circ$`, value: 60, trapExplanation: r`$60^\circ$ is the direction of $1 + i\sqrt3$. The real part here is negative.` },
        { id: 'd', label: r`$150^\circ$`, value: 150, trapExplanation: r`$150^\circ$ has $\tan = -\tfrac{1}{\sqrt3}$. Here $b/a = -\sqrt3$, which belongs to $120^\circ$.` },
      ],
      correctOptionId: 'a',
      stepByStepSolution: [
        r`$|z| = \sqrt{1 + 3} = 2$, so $\cos\varphi = -\tfrac12$, $\sin\varphi = \tfrac{\sqrt3}{2}$.`,
        r`Negative cosine and positive sine: the 2nd quadrant.`,
        r`$\varphi = 120^\circ$, i.e. $z = 2e^{i\cdot 120^\circ}$.`,
      ],
      keyConceptTag: 'Argument and quadrants',
    },
    {
      id: 'ml-06-5',
      difficulty: 3,
      promptText: r`Compute $(1 + i)^8$.`,
      options: [
        { id: 'a', label: '$16$', value: [16, 0] },
        { id: 'b', label: '$256$', value: [256, 0], trapExplanation: r`$2^8$ uses modulus 2, but $|1 + i| = \sqrt2$. So $|z^8| = (\sqrt2)^8 = 16$.` },
        { id: 'c', label: '$-16$', value: [-16, 0], trapExplanation: r`$8\cdot45^\circ = 360^\circ$, a full turn, which points along the <i>positive</i> real axis. $-16$ would need $180^\circ$.` },
        { id: 'd', label: r`$16i$`, value: [0, 16], trapExplanation: r`$16i$ would need argument $90^\circ$; $8\cdot45^\circ = 360^\circ$.` },
      ],
      correctOptionId: 'a',
      stepByStepSolution: [
        r`$1 + i = \sqrt2\,e^{i\cdot45^\circ}$.`,
        r`De Moivre: $(1 + i)^8 = (\sqrt2)^8 e^{i\cdot360^\circ} = 16\cdot1$.`,
        r`Check the shortcut: $(1 + i)^2 = 2i$, so $(1 + i)^8 = (2i)^4 = 16i^4 = 16$.`,
      ],
      keyConceptTag: "De Moivre's theorem",
    },
    {
      id: 'ml-06-6',
      difficulty: 3,
      promptText: r`Which number is a solution of $z^4 = -16$?`,
      options: [
        { id: 'a', label: r`$\sqrt2 + i\sqrt2$` },
        { id: 'b', label: r`$2i$`, trapExplanation: r`$(2i)^4 = 16i^4 = 16$, not $-16$. Its argument $90^\circ$ times 4 is $360^\circ$.` },
        { id: 'c', label: r`$-2$`, trapExplanation: r`An even power of a real number is non-negative: $(-2)^4 = 16$.` },
        { id: 'd', label: r`$2$`, trapExplanation: r`$2^4 = 16$. No real number solves $z^4 = -16$.` },
      ],
      correctOptionId: 'a',
      stepByStepSolution: [
        r`$-16 = 16e^{i\cdot180^\circ}$. Roots: modulus $\sqrt[4]{16} = 2$, arguments $45^\circ + k\cdot90^\circ$.`,
        r`For $k = 0$: $2e^{i\cdot45^\circ} = \sqrt2 + i\sqrt2$.`,
        r`Check: $(\sqrt2 + i\sqrt2)^2 = 2 - 2 + 4i = 4i$, and $(4i)^2 = -16$. ✓`,
      ],
      keyConceptTag: 'Complex roots',
    },
  ],
});
