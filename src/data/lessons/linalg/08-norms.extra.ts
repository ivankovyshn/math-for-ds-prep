import type { QuestionTemplate } from '../../../types.ts';
import { r } from '../define.ts';
import { PYTHAGOREAN, add, allDistinct, dot, frac, fvec, sumOf, times, vec } from '../gen.ts';
import { l1, legs, linf } from './08-norms.practice.ts';

/** Extra practice (Practice 2): gentler questions on the same ideas, with new numbers every time. */
export const extra: QuestionTemplate[] = [
  {
    id: 'la-08-x1',
    difficulty: 1,
    keyConceptTag: 'The max norm',
    correctOptionId: 'a',
    generate: (g) => {
      const v = g.until(
        () => Array.from({ length: 4 }, () => g.nonzero(-9, 9)),
        (v) => {
          const big = v.find((x) => Math.abs(x) === linf(v))!;
          return big < 0 && v.filter((x) => Math.abs(x) === linf(v)).length === 1 && allDistinct([linf(v), Math.max(...v), l1(v), sumOf(v)]);
        },
      );
      const big = v.find((x) => Math.abs(x) === linf(v))!;
      return {
        params: { v },
        promptText: r`Compute $\|\mathbf{v}\|_\infty$ for $\mathbf{v} = ${vec(v)}$.`,
        options: [
          { id: 'a', label: `$${linf(v)}$`, value: linf(v) },
          { id: 'b', label: `$${Math.max(...v)}$`, value: Math.max(...v), trapExplanation: r`${Math.max(...v)} is the largest entry, but the norm compares absolute values: $|${big}| = ${-big}$ is bigger.` },
          { id: 'c', label: `$${l1(v)}$`, value: l1(v), trapExplanation: r`That adds all the absolute values: it is $\|\mathbf{v}\|_1$. The max norm keeps only the largest one.` },
          { id: 'd', label: `$${sumOf(v)}$`, value: sumOf(v), trapExplanation: r`That is the plain sum of the entries, which is not a norm at all (it can be negative).` },
        ],
        stepByStepSolution: [
          r`$\|\mathbf{v}\|_\infty = \max_i |v_i|$.`,
          r`The absolute values are $${v.map(Math.abs).join(', ')}$.`,
          r`The largest is $${linf(v)}$, from the entry $${big}$.`,
        ],
      };
    },
  },
  {
    id: 'la-08-x2',
    difficulty: 1,
    keyConceptTag: 'The L1 norm',
    correctOptionId: 'a',
    generate: (g) => {
      const v = g.until(
        () => Array.from({ length: 3 }, () => g.nonzero(-7, 7)),
        (v) => v.some((x) => x < 0) && allDistinct([l1(v), sumOf(v), linf(v), dot(v, v)]),
      );
      return {
        params: { v },
        promptText: r`The taxicab distance from the origin to $${vec(v)}$ is its L1 norm. Compute $\|${vec(v)}\|_1$.`,
        options: [
          { id: 'a', label: `$${l1(v)}$`, value: l1(v) },
          { id: 'b', label: `$${sumOf(v)}$`, value: sumOf(v), trapExplanation: r`A distance cannot shrink because a step goes in the negative direction: add absolute values.` },
          { id: 'c', label: `$${linf(v)}$`, value: linf(v), trapExplanation: r`That is only the longest single step, $\|\mathbf{v}\|_\infty$. The taxicab walks all three.` },
          { id: 'd', label: `$${dot(v, v)}$`, value: dot(v, v), trapExplanation: r`That is the sum of squares, the squared straight-line length $\|\mathbf{v}\|_2^2$.` },
        ],
        stepByStepSolution: [
          r`The L1 norm adds the absolute values of the coordinates: the steps along each axis.`,
          r`$${v.map((x) => `|${x}|`).join(' + ')} = ${v.map(Math.abs).join(' + ')}$.`,
          r`$= ${l1(v)}$.`,
        ],
      };
    },
  },
  {
    id: 'la-08-x3',
    difficulty: 1,
    keyConceptTag: 'Unit vectors',
    correctOptionId: 'a',
    generate: (g) => {
      const { a, b, c } = legs(g);
      const v = [a, b];
      return {
        params: { v, c },
        promptText: r`Which of these is a unit vector?`,
        options: [
          { id: 'a', label: `$${fvec(v, c)}$` },
          { id: 'b', label: `$${fvec(v, Math.abs(a) + Math.abs(b))}$`, trapExplanation: r`Its entries' absolute values add up to 1, but the length is $\tfrac{${c}}{${Math.abs(a) + Math.abs(b)}}$. Length uses squares.` },
          { id: 'c', label: r`$(\tfrac12, \tfrac12)$`, trapExplanation: r`Small entries do not make a unit vector: $\sqrt{\tfrac14 + \tfrac14} = \tfrac{1}{\sqrt2}$.` },
          { id: 'd', label: `$${fvec(v, c * c)}$`, trapExplanation: r`Dividing by $${c * c} = \|${vec(v)}\|^2$ overshoots: the length is $\tfrac{1}{${c}}$.` },
        ],
        stepByStepSolution: [
          r`A unit vector has length 1, i.e. the squares of its entries add up to 1.`,
          r`$${vec(v)}$ has length $\sqrt{${a * a} + ${b * b}} = ${c}$, so $${fvec(v, c)}$ has length 1.`,
          r`Check: $\tfrac{${a * a}}{${c * c}} + \tfrac{${b * b}}{${c * c}} = 1$. ✓`,
        ],
      };
    },
  },
  {
    id: 'la-08-x4',
    difficulty: 1,
    keyConceptTag: 'Orthogonal matrices preserve lengths',
    correctOptionId: 'a',
    generate: (g) => {
      const { a, b, c } = legs(g);
      const kind = g.pick(['rotation', 'reflection']);
      return {
        params: { x: [a, b], reflect: kind === 'reflection' ? 1 : 0 },
        promptText: r`$Q$ is an orthogonal $2\times2$ matrix (a ${kind}) and $\mathbf{x} = ${vec([a, b])}$. What is $\|Q\mathbf{x}\|$?`,
        options: [
          { id: 'a', label: `$${c}$`, value: c },
          { id: 'b', label: `$${c * c}$`, value: c * c, trapExplanation: r`${c * c} is $\|\mathbf{x}\|^2$; the length itself is ${c}.` },
          { id: 'c', label: `$${Math.abs(a) + Math.abs(b)}$`, value: Math.abs(a) + Math.abs(b), trapExplanation: r`That is the L1 norm. The length is $\sqrt{${a * a} + ${b * b}}$.` },
          { id: 'd', label: 'It depends on $Q$', value: -1, trapExplanation: r`$Q\mathbf{x}$ itself depends on $Q$, but its length does not: every orthogonal matrix keeps lengths.` },
        ],
        stepByStepSolution: [
          r`An orthogonal matrix preserves lengths: $\|Q\mathbf{x}\|^2 = (Q\mathbf{x})^T Q\mathbf{x} = \mathbf{x}^TQ^TQ\mathbf{x} = \mathbf{x}^T\mathbf{x}$.`,
          r`$\|\mathbf{x}\| = \sqrt{${a * a} + ${b * b}} = \sqrt{${c * c}}$.`,
          r`$\|Q\mathbf{x}\| = ${c}$.`,
        ],
      };
    },
  },
  {
    id: 'la-08-x5',
    difficulty: 2,
    keyConceptTag: 'Gram–Schmidt coefficient',
    correctOptionId: 'a',
    generate: (g) => {
      const { u, t, s } = g.until(
        () => ({ u: [g.nonzero(-3, 3), g.nonzero(-3, 3)], t: g.nonzero(-3, 3), s: g.nonzero(-2, 2) }),
        ({ u, t, s }) => {
          const v = add(times(t, u), times(s, [-u[1], u[0]]));
          const n = dot(u, u);
          return allDistinct([t, t * n, dot(v, u) / dot(v, v), -t]);
        },
      );
      const w = [-u[1], u[0]];
      const v = add(times(t, u), times(s, w));
      const n = dot(u, u);
      const vu = dot(v, u);
      return {
        params: { u, v },
        promptText: r`In Gram–Schmidt, $\mathbf{u}_1 = ${vec(u)}$ and $\mathbf{v}_2 = ${vec(v)}$. Which multiple of $\mathbf{u}_1$ is subtracted from $\mathbf{v}_2$, i.e. what is $\dfrac{\mathbf{v}_2\cdot\mathbf{u}_1}{\mathbf{u}_1\cdot\mathbf{u}_1}$?`,
        options: [
          { id: 'a', label: `$${t}$`, value: t },
          { id: 'b', label: `$${vu}$`, value: vu, trapExplanation: r`${vu} is $\mathbf{v}_2\cdot\mathbf{u}_1$ alone. Divide by $\mathbf{u}_1\cdot\mathbf{u}_1 = ${n}$.` },
          { id: 'c', label: `$${frac(vu, dot(v, v))}$`, value: vu / dot(v, v), trapExplanation: r`The denominator is $\mathbf{u}_1\cdot\mathbf{u}_1 = ${n}$, not $\mathbf{v}_2\cdot\mathbf{v}_2 = ${dot(v, v)}$: we project onto $\mathbf{u}_1$.` },
          { id: 'd', label: `$${-t}$`, value: -t, trapExplanation: r`The sign is part of the coefficient: $\frac{${vu}}{${n}} = ${t}$. Gram–Schmidt then subtracts $${t}\,\mathbf{u}_1$.` },
        ],
        stepByStepSolution: [
          r`$\mathbf{v}_2\cdot\mathbf{u}_1 = ${v[0]}\cdot${u[0] < 0 ? `(${u[0]})` : u[0]} + ${v[1] < 0 ? `(${v[1]})` : v[1]}\cdot${u[1] < 0 ? `(${u[1]})` : u[1]} = ${vu}$.`,
          r`$\mathbf{u}_1\cdot\mathbf{u}_1 = ${n}$.`,
          r`Coefficient $\frac{${vu}}{${n}} = ${t}$, and $\mathbf{u}_2 = \mathbf{v}_2 - ${t < 0 ? `(${t})` : t}\,\mathbf{u}_1 = ${vec(times(s, w))}$.`,
        ],
      };
    },
  },
  {
    id: 'la-08-x6',
    difficulty: 2,
    keyConceptTag: 'Coordinates in an orthonormal basis',
    correctOptionId: 'a',
    generate: (g) => {
      const { k1, k2, a, b, c } = g.until(
        () => ({ ...legs(g, PYTHAGOREAN.slice(0, 2)), k1: g.nonzero(-3, 3), k2: g.nonzero(-3, 3) }),
        ({ k1, k2, a, b, c }) => {
          const v = add(times(k1, [a, b]), times(k2, [-b, a]));
          return allDistinct([k1 * c, k1 * c * c, k2 * c, v[0]]);
        },
      );
      const v = add(times(k1, [a, b]), times(k2, [-b, a]));
      return {
        params: { q1: [a, b], c, v },
        promptText: r`$\mathbf{q}_1 = ${fvec([a, b], c)}$ and $\mathbf{q}_2 = ${fvec([-b, a], c)}$ are orthonormal. Write $\mathbf{v} = ${vec(v)}$ as $c_1\mathbf{q}_1 + c_2\mathbf{q}_2$. What is $c_1$?`,
        options: [
          { id: 'a', label: `$${k1 * c}$`, value: k1 * c },
          { id: 'b', label: `$${k1 * c * c}$`, value: k1 * c * c, trapExplanation: r`That dots with $${vec([a, b])}$, which has length ${c}. Use $\mathbf{q}_1$ itself: divide by ${c}.` },
          { id: 'c', label: `$${k2 * c}$`, value: k2 * c, trapExplanation: r`That is $c_2 = \mathbf{v}\cdot\mathbf{q}_2$, the coordinate along $\mathbf{q}_2$.` },
          { id: 'd', label: `$${v[0]}$`, value: v[0], trapExplanation: r`${v[0]} is the first coordinate in the standard basis. In the basis $\mathbf{q}_1, \mathbf{q}_2$ it is $\mathbf{v}\cdot\mathbf{q}_1$.` },
        ],
        stepByStepSolution: [
          r`In an orthonormal basis, $c_1 = \mathbf{v}\cdot\mathbf{q}_1$.`,
          r`$\mathbf{v}\cdot\mathbf{q}_1 = \tfrac{1}{${c}}(${v[0]}\cdot${a < 0 ? `(${a})` : a} + ${v[1] < 0 ? `(${v[1]})` : v[1]}\cdot${b < 0 ? `(${b})` : b}) = \tfrac{${k1 * c * c}}{${c}}$.`,
          r`$c_1 = ${k1 * c}$.`,
        ],
      };
    },
  },
];
