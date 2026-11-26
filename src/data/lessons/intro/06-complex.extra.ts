import type { QuestionDraft } from '../../../types.ts';
import { r } from '../define.ts';

/** Extra practice (Practice 2): gentler questions on the same ideas. */
export const extra: QuestionDraft[] = [
  {
    id: 'ml-06-x1',
    difficulty: 1,
    promptText: r`Compute $(1 + 2i) + (3 - i)$.`,
    options: [
      { id: 'a', label: r`$4 + i$`, value: [4, 1] },
      { id: 'b', label: r`$4 + 3i$`, value: [4, 3], trapExplanation: r`The imaginary parts are $2$ and $-1$; their sum is $1$, not $3$.` },
      { id: 'c', label: r`$5 + 5i$`, value: [5, 5], trapExplanation: r`$5 + 5i$ is the <i>product</i> $(1 + 2i)(3 - i)$. Addition works part by part.` },
      { id: 'd', label: r`$3 - 2i$`, value: [3, -2], trapExplanation: r`Multiplying real parts and imaginary parts separately is neither addition nor multiplication.` },
    ],
    correctOptionId: 'a',
    stepByStepSolution: [
      r`Add real parts and imaginary parts separately.`,
      r`Real: $1 + 3 = 4$. Imaginary: $2 + (-1) = 1$.`,
      r`$(1 + 2i) + (3 - i) = 4 + i$ — just like adding vectors $(1, 2) + (3, -1)$.`,
    ],
    keyConceptTag: 'Complex addition',
  },
  {
    id: 'ml-06-x2',
    difficulty: 1,
    promptText: r`Compute $(1 + i)^2$.`,
    options: [
      { id: 'a', label: r`$2i$`, value: [0, 2] },
      { id: 'b', label: r`$2$`, value: [2, 0], trapExplanation: r`$i^2 = -1$, not $+1$, so $1 + 2i + i^2 = 2i$.` },
      { id: 'c', label: r`$2 + 2i$`, value: [2, 2], trapExplanation: r`The term $i^2$ was counted as $+1$. It equals $-1$ and cancels the 1.` },
      { id: 'd', label: r`$1 + i^2 = 0$`, value: [0, 0], trapExplanation: r`$(a + b)^2 \ne a^2 + b^2$: the middle term $2i$ was dropped.` },
    ],
    correctOptionId: 'a',
    stepByStepSolution: [
      r`$(1 + i)^2 = 1 + 2i + i^2$.`,
      r`$i^2 = -1$.`,
      r`$1 + 2i - 1 = 2i$.`,
    ],
    keyConceptTag: 'Complex multiplication',
  },
  {
    id: 'ml-06-x3',
    difficulty: 1,
    promptText: r`What is the complex conjugate of $z = 3 - 5i$?`,
    options: [
      { id: 'a', label: r`$3 + 5i$`, value: [3, 5] },
      { id: 'b', label: r`$-3 + 5i$`, value: [-3, 5], trapExplanation: r`That is $-z$. Conjugation keeps the real part and flips only the sign of the imaginary part.` },
      { id: 'c', label: r`$-3 - 5i$`, value: [-3, -5], trapExplanation: r`Only the imaginary part changes sign; the real part 3 stays.` },
      { id: 'd', label: r`$5 - 3i$`, value: [5, -3], trapExplanation: r`Conjugation does not swap the real and imaginary parts; it reflects $z$ in the real axis.` },
    ],
    correctOptionId: 'a',
    stepByStepSolution: [
      r`$\overline{a + bi} = a - bi$.`,
      r`Here $a = 3$, $b = -5$.`,
      r`$\bar z = 3 + 5i$: the mirror image of $z$ in the real axis.`,
    ],
    keyConceptTag: 'Conjugate',
  },
  {
    id: 'ml-06-x4',
    difficulty: 2,
    promptText: r`What is $|6 + 8i|$?`,
    options: [
      { id: 'a', label: '$10$', value: 10 },
      { id: 'b', label: '$14$', value: 14, trapExplanation: r`The modulus is a length, $\sqrt{a^2 + b^2}$, not the sum $a + b$.` },
      { id: 'c', label: '$100$', value: 100, trapExplanation: r`$6^2 + 8^2 = 100$ is $|z|^2$; take the square root.` },
      { id: 'd', label: r`$\sqrt{14}$`, value: Math.sqrt(14), trapExplanation: r`Square the parts before adding: $36 + 64$, not $6 + 8$.` },
    ],
    correctOptionId: 'a',
    stepByStepSolution: [
      r`$|a + bi| = \sqrt{a^2 + b^2}$ — the distance from 0 in the plane.`,
      r`$\sqrt{36 + 64} = \sqrt{100}$.`,
      r`$= 10$.`,
    ],
    keyConceptTag: 'Modulus',
  },
  {
    id: 'ml-06-x5',
    difficulty: 2,
    promptText: r`For $z = 2 + 3i$, compute $z \cdot \bar z$.`,
    options: [
      { id: 'a', label: '$13$', value: 13 },
      { id: 'b', label: '$-5$', value: -5, trapExplanation: r`$(3i)(-3i) = -9i^2 = +9$. The $i^2$ turns the minus into a plus.` },
      { id: 'c', label: '$5$', value: 5, trapExplanation: r`$5 = 2 + 3$ adds the parts; the product gives $a^2 + b^2$.` },
      { id: 'd', label: '$25$', value: 25, trapExplanation: r`$25 = (2 + 3)^2$. The product $z \bar z$ equals $a^2 + b^2 = 4 + 9$.` },
    ],
    correctOptionId: 'a',
    stepByStepSolution: [
      r`$\bar z = 2 - 3i$.`,
      r`$(2 + 3i)(2 - 3i) = 4 - 6i + 6i - 9i^2 = 4 + 9$.`,
      r`$z \bar z = 13 = |z|^2$ — always a non-negative real number.`,
    ],
    keyConceptTag: 'Conjugate and modulus',
  },
  {
    id: 'ml-06-x6',
    difficulty: 2,
    promptText: r`Let $z = 2(\cos 30^\circ + i \sin 30^\circ)$ and $w = 3(\cos 60^\circ + i \sin 60^\circ)$. What is $zw$?`,
    options: [
      { id: 'a', label: r`$6i$`, value: [0, 6] },
      { id: 'b', label: r`$6$`, value: [6, 0], trapExplanation: r`The moduli multiply to 6, but the angles add to $90^\circ$, which points along the imaginary axis.` },
      { id: 'c', label: r`$5i$`, value: [0, 5], trapExplanation: r`Moduli multiply, they do not add: $2 \cdot 3 = 6$.` },
      { id: 'd', label: r`$6(\cos 1800^\circ + i \sin 1800^\circ)$`, value: [6, 0], trapExplanation: r`Angles add, they do not multiply: $30^\circ + 60^\circ = 90^\circ$.` },
    ],
    correctOptionId: 'a',
    stepByStepSolution: [
      r`In polar form: multiply the moduli and add the angles.`,
      r`$|zw| = 2 \cdot 3 = 6$, $\arg(zw) = 30^\circ + 60^\circ = 90^\circ$.`,
      r`$6(\cos 90^\circ + i \sin 90^\circ) = 6i$.`,
    ],
    keyConceptTag: 'Multiplying in polar form',
  },
];
