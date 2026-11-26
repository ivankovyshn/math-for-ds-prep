import type { QuestionDraft } from '../../../types.ts';
import { r } from '../define.ts';

/** Extra practice (Practice 2): gentler questions on the same ideas. */
export const extra: QuestionDraft[] = [
  {
    id: 'la-01-x1',
    difficulty: 1,
    promptText: r`Let $\mathbf{u} = (1, 2, 3)$ and $\mathbf{v} = (4, 0, -1)$. Compute $\mathbf{u} + \mathbf{v}$.`,
    options: [
      { id: 'a', label: r`$(5, 2, 2)$`, value: [5, 2, 2] },
      { id: 'b', label: r`$(-3, 2, 4)$`, value: [-3, 2, 4], trapExplanation: r`That is $\mathbf{u} - \mathbf{v}$. For the sum, add matching components.` },
      { id: 'c', label: r`$(4, 0, -3)$`, value: [4, 0, -3], trapExplanation: r`Multiplying components is not vector addition (and not the dot product either).` },
      { id: 'd', label: r`$(5, 2, 4)$`, value: [5, 2, 4], trapExplanation: r`The third component is $3 + (-1) = 2$; the sign of $-1$ was lost.` },
    ],
    correctOptionId: 'a',
    stepByStepSolution: [
      r`Vectors are added component by component.`,
      r`$(1 + 4,\ 2 + 0,\ 3 + (-1))$.`,
      r`$= (5, 2, 2)$.`,
    ],
    keyConceptTag: 'Vector operations are componentwise',
  },
  {
    id: 'la-01-x2',
    difficulty: 1,
    promptText: r`Compute $3 \cdot (2, -1)$.`,
    options: [
      { id: 'a', label: r`$(6, -3)$`, value: [6, -3] },
      { id: 'b', label: r`$(6, -1)$`, value: [6, -1], trapExplanation: r`A scalar multiplies <i>every</i> component, not just the first.` },
      { id: 'c', label: r`$(5, 2)$`, value: [5, 2], trapExplanation: r`Scaling multiplies; adding 3 to each component is a different operation (and not a linear one).` },
      { id: 'd', label: r`$(6, 3)$`, value: [6, 3], trapExplanation: r`$3 \cdot (-1) = -3$: the sign stays.` },
    ],
    correctOptionId: 'a',
    stepByStepSolution: [
      r`$c\,(x, y) = (cx, cy)$.`,
      r`$3 \cdot 2 = 6$ and $3 \cdot (-1) = -3$.`,
      r`$(6, -3)$: the same direction as $(2, -1)$, three times as long.`,
    ],
    keyConceptTag: 'Scalar multiplication',
  },
  {
    id: 'la-01-x3',
    difficulty: 1,
    promptText: r`What is the length of $\mathbf{v} = (3, 4)$?`,
    options: [
      { id: 'a', label: '$5$', value: 5 },
      { id: 'b', label: '$7$', value: 7, trapExplanation: r`Length is not the sum of the components; use Pythagoras.` },
      { id: 'c', label: '$25$', value: 25, trapExplanation: r`$3^2 + 4^2 = 25$ is the <i>squared</i> length; take the square root.` },
      { id: 'd', label: r`$\sqrt7$`, value: Math.sqrt(7), trapExplanation: r`Square the components before adding: $9 + 16$, not $3 + 4$.` },
    ],
    correctOptionId: 'a',
    stepByStepSolution: [
      r`$\|\mathbf{v}\| = \sqrt{v_1^2 + v_2^2}$.`,
      r`$\sqrt{9 + 16} = \sqrt{25}$.`,
      r`$= 5$.`,
    ],
    keyConceptTag: 'Length is the root of the sum of squares',
  },
  {
    id: 'la-01-x4',
    difficulty: 2,
    promptText: r`Compute the dot product $(2, -1, 3) \cdot (1, 4, 2)$.`,
    options: [
      { id: 'a', label: '$4$', value: 4 },
      { id: 'b', label: '$12$', value: 12, trapExplanation: r`$(-1) \cdot 4 = -4$, not $+4$. Keep the signs.` },
      { id: 'c', label: r`$(2, -4, 6)$`, value: [2, -4, 6], trapExplanation: r`The dot product is a <i>number</i>: multiply matching components, then add them up.` },
      { id: 'd', label: '$0$', value: 0, trapExplanation: r`A zero dot product would mean the vectors are perpendicular. Here the products sum to $2 - 4 + 6 = 4$.` },
    ],
    correctOptionId: 'a',
    stepByStepSolution: [
      r`$\mathbf{u} \cdot \mathbf{v} = u_1 v_1 + u_2 v_2 + u_3 v_3$.`,
      r`$2 \cdot 1 + (-1) \cdot 4 + 3 \cdot 2 = 2 - 4 + 6$.`,
      r`$= 4$.`,
    ],
    keyConceptTag: 'Dot product',
  },
  {
    id: 'la-01-x5',
    difficulty: 2,
    promptText: r`What is the angle between $\mathbf{u} = (2, 3)$ and $\mathbf{v} = (-3, 2)$?`,
    options: [
      { id: 'a', label: r`$90^\circ$`, value: 90 },
      { id: 'b', label: r`$0^\circ$`, value: 0, trapExplanation: r`$0^\circ$ would mean the same direction. These vectors are not multiples of each other.` },
      { id: 'c', label: r`$180^\circ$`, value: 180, trapExplanation: r`$180^\circ$ would need $\mathbf{v} = c\,\mathbf{u}$ with $c < 0$, which is not the case.` },
      { id: 'd', label: r`$45^\circ$`, value: 45, trapExplanation: r`Compute $\mathbf{u} \cdot \mathbf{v}$ first: it is 0, which gives $\cos\theta = 0$.` },
    ],
    correctOptionId: 'a',
    stepByStepSolution: [
      r`$\mathbf{u} \cdot \mathbf{v} = 2 \cdot (-3) + 3 \cdot 2 = 0$.`,
      r`$\cos\theta = \dfrac{\mathbf{u} \cdot \mathbf{v}}{\|\mathbf{u}\|\,\|\mathbf{v}\|} = 0$.`,
      r`So $\theta = 90^\circ$: rotating $(a, b)$ to $(-b, a)$ always gives a perpendicular vector.`,
    ],
    keyConceptTag: 'Zero dot product means perpendicular',
  },
  {
    id: 'la-01-x6',
    difficulty: 2,
    promptText: r`Find $a$ and $b$ such that $a(1, 1) + b(1, -1) = (5, 1)$.`,
    options: [
      { id: 'a', label: r`$a = 3,\ b = 2$`, value: [3, 2] },
      { id: 'b', label: r`$a = 2,\ b = 3$`, value: [2, 3], trapExplanation: r`Check the second component: $a - b = 2 - 3 = -1$, not 1.` },
      { id: 'c', label: r`$a = 5,\ b = 1$`, value: [5, 1], trapExplanation: r`The coefficients are not the target's components: $5(1, 1) + 1(1, -1) = (6, 4)$.` },
      { id: 'd', label: r`$a = 3,\ b = -2$`, value: [3, -2], trapExplanation: r`$3(1, 1) - 2(1, -1) = (1, 5)$ — the components came out swapped.` },
    ],
    correctOptionId: 'a',
    stepByStepSolution: [
      r`Componentwise: $a + b = 5$ and $a - b = 1$.`,
      r`Adding the equations: $2a = 6$, so $a = 3$; then $b = 2$.`,
      r`Check: $3(1, 1) + 2(1, -1) = (5, 1)$.`,
    ],
    keyConceptTag: 'Coefficients of a linear combination',
  },
];
