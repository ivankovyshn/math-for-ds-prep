import type { Question } from '../../types.ts';

const r = String.raw;

// Formula options carry `value` evaluated at a test input (noted per question)
// so that scripts/verify.mjs can compare them with a real run of the program.

export const algorithms: Question[] = [
  {
    id: 'alg-01',
    moduleId: 'algorithms',
    difficulty: 1,
    promptText: r`What does the pseudocode output for the input $N = 5$?`,
    codeSnippet: `INPUT: N
  S = 0
  n = 1
  WHILE n <= N
    S = S + n
    n = n + 1
  END WHILE
OUTPUT: S`,
    options: [
      { id: 'a', label: r`$5$`, value: 5, trapExplanation: r`$5$ is the last value added, not the running total $S$.` },
      { id: 'b', label: r`$10$`, value: 10, trapExplanation: r`You stopped one round early. The condition is $n \le N$, so $n = 5$ is still processed.` },
      { id: 'c', label: r`$15$`, value: 15 },
      { id: 'd', label: r`$21$`, value: 21, trapExplanation: r`One round too many: when $n$ becomes $6$ the condition $6 \le 5$ fails and the loop ends.` },
      { id: 'e', label: r`$120$`, value: 120, trapExplanation: r`$120 = 5!$ would need $S = S \cdot n$. The code adds.` },
    ],
    correctOptionId: 'c',
    stepByStepSolution: [
      r`Keep a small table of the variables and update it line by line.`,
      r`The loop runs for $n = 1, 2, 3, 4, 5$ and adds $n$ to $S$ each time.`,
      r`$S$: $0 \to 1 \to 3 \to 6 \to 10 \to 15$.`,
      r`Then $n = 6$, the condition fails, and the output is $15$.`,
    ],
    keyConceptTag: 'Dry run · accumulator loop',
  },
  {
    id: 'alg-02',
    moduleId: 'algorithms',
    difficulty: 1,
    promptText: r`What does the pseudocode output for the input $N = 40$?`,
    codeSnippet: `INPUT: N
  c = 0
  WHILE N > 1
    N = floor(N / 2)
    c = c + 1
  END WHILE
OUTPUT: c`,
    options: [
      { id: 'a', label: r`$3$`, value: 3, trapExplanation: r`$40$ can be halved exactly 3 times ($40\to20\to10\to5$), but the loop continues: $\lfloor 5/2\rfloor = 2$.` },
      { id: 'b', label: r`$4$`, value: 4, trapExplanation: r`You stopped at $N = 2$. Since $2 > 1$ the loop runs once more.` },
      { id: 'c', label: r`$5$`, value: 5 },
      { id: 'd', label: r`$6$`, value: 6, trapExplanation: r`When $N$ reaches $1$ the condition $N > 1$ is false; there is no sixth round.` },
      { id: 'e', label: r`$20$`, value: 20, trapExplanation: r`$20$ is the value of $N$ after the first round. The output is the counter $c$.` },
    ],
    correctOptionId: 'c',
    stepByStepSolution: [
      r`Trace $N$: $40 \to 20 \to 10 \to 5 \to 2 \to 1$.`,
      r`$\lfloor 5/2 \rfloor = 2$: floor rounds down.`,
      r`That is 5 halvings, so $c = 5$.`,
      r`The program counts how often $N$ can be halved before reaching 1 — the integer part of $\log_2 N$.`,
    ],
    keyConceptTag: 'Dry run · halving loop',
  },
  {
    id: 'alg-03',
    moduleId: 'algorithms',
    difficulty: 1,
    promptText: r`What does the pseudocode output for the inputs $a = 7$ and $b = 12$?`,
    codeSnippet: `INPUT: a, b
  IF a > b
    m = a
  ELSE
    m = b
  END IF
  IF m is even
    m = m / 2
  END IF
OUTPUT: m`,
    options: [
      { id: 'a', label: r`$3$`, value: 3, trapExplanation: r`An IF block runs at most once. Only a WHILE would keep halving.` },
      { id: 'b', label: r`$6$`, value: 6 },
      { id: 'c', label: r`$7$`, value: 7, trapExplanation: r`The first IF selects the <i>larger</i> number: $7 > 12$ is false, so the ELSE branch sets $m = 12$.` },
      { id: 'd', label: r`$12$`, value: 12, trapExplanation: r`You skipped the second IF. $12$ is even, so it is halved.` },
      { id: 'e', label: r`$19$`, value: 19, trapExplanation: r`Nothing in the code adds $a$ and $b$.` },
    ],
    correctOptionId: 'b',
    stepByStepSolution: [
      r`First IF: is $7 > 12$? No, so the ELSE branch runs: $m = 12$. (This block computes the maximum.)`,
      r`Second IF: is $12$ even? Yes, so $m = 12 / 2 = 6$.`,
      r`The output is $6$.`,
    ],
    keyConceptTag: 'Conditionals · IF / ELSE',
  },
  {
    id: 'alg-04',
    moduleId: 'algorithms',
    difficulty: 1,
    promptText: r`What does the pseudocode return for a positive integer $N$?`,
    codeSnippet: `INPUT: N
  p = 1
  k = 0
  WHILE k < N
    p = 2 * p
    k = k + 1
  END WHILE
OUTPUT: p`,
    // values at N = 5
    options: [
      { id: 'a', label: r`$2N$`, value: 10, trapExplanation: r`$2N$ would come from adding $2$ in every round. Here $p$ is <i>doubled</i>, which grows much faster.` },
      { id: 'b', label: r`$N^2$`, value: 25, trapExplanation: r`Test it: for $N = 3$ the code gives $8$, but $3^2 = 9$.` },
      { id: 'c', label: r`$2^N$`, value: 32 },
      { id: 'd', label: r`$2^{N+1}$`, value: 64, trapExplanation: r`The loop runs for $k = 0, 1, \dots, N-1$: exactly $N$ rounds, not $N+1$.` },
      { id: 'e', label: r`$N!$`, value: 120, trapExplanation: r`A factorial would multiply by the changing counter $k$. Here the factor is always $2$.` },
    ],
    correctOptionId: 'c',
    stepByStepSolution: [
      r`Try a small input, e.g. $N = 3$: $p$ goes $1 \to 2 \to 4 \to 8$.`,
      r`The loop runs exactly $N$ times ($k = 0$ to $N-1$), doubling $p$ each time.`,
      r`Starting from $1$ and doubling $N$ times gives $2^N$.`,
    ],
    keyConceptTag: 'Loop invariant · repeated doubling',
  },
  {
    id: 'alg-05',
    moduleId: 'algorithms',
    difficulty: 2,
    promptText: r`What does the pseudocode return when $N$ is a positive even integer?`,
    codeSnippet: `INPUT: N
  S = 0
  n = 1
  WHILE n <= N
    IF n is odd
      S = S + n
    END IF
    n = n + 1
  END WHILE
OUTPUT: S`,
    // values at N = 6
    options: [
      { id: 'a', label: r`$N^2$`, value: 36, trapExplanation: r`$N^2$ is the sum of the first $N$ odd numbers. But only $N/2$ odd numbers lie between 1 and $N$.` },
      { id: 'b', label: r`$\left(\dfrac{N}{2}\right)^{2}$`, value: 9 },
      { id: 'c', label: r`$\dfrac{N(N+1)}{2}$`, value: 21, trapExplanation: r`This is the sum of <i>all</i> integers from 1 to $N$. The IF lets only the odd ones through.` },
      { id: 'd', label: r`$\dfrac{N}{2}$`, value: 3, trapExplanation: r`$N/2$ is <i>how many</i> odd numbers there are. The code adds the numbers themselves ($S + n$), not $1$.` },
      { id: 'e', label: r`$\left(\dfrac{N}{2}\right)^{2} + \dfrac{N}{2}$`, value: 12, trapExplanation: r`This is $2+4+\dots+N$, the sum of the even numbers up to $N$. The condition says "odd".` },
    ],
    correctOptionId: 'b',
    stepByStepSolution: [
      r`The loop visits $n = 1, 2, \dots, N$ and adds $n$ only when it is odd.`,
      r`For even $N$ the odd numbers up to $N$ are $1, 3, \dots, N-1$: exactly $N/2$ of them.`,
      r`The sum of the first $m$ odd numbers is $m^2$ (e.g. $1+3+5 = 9 = 3^2$).`,
      r`With $m = N/2$: $S = \left(\tfrac{N}{2}\right)^2$. Check with $N = 6$: $1+3+5 = 9$. ✓`,
    ],
    keyConceptTag: 'Identify the sequence · odd sums',
  },
  {
    id: 'alg-06',
    moduleId: 'algorithms',
    difficulty: 2,
    promptText: r`What does the pseudocode output for the input $N = 6$?`,
    codeSnippet: `INPUT: N
  a = 0
  b = 1
  k = 0
  WHILE k < N
    t = a + b
    a = b
    b = t
    k = k + 1
  END WHILE
OUTPUT: a`,
    options: [
      { id: 'a', label: r`$5$`, value: 5, trapExplanation: r`You stopped after 5 rounds. $k$ runs from $0$ to $5$, which is six rounds.` },
      { id: 'b', label: r`$6$`, value: 6, trapExplanation: r`$6$ is the final value of the counter $k$, not of $a$.` },
      { id: 'c', label: r`$8$`, value: 8 },
      { id: 'd', label: r`$13$`, value: 13, trapExplanation: r`$13$ is the final value of $b$. The program outputs $a$.` },
      { id: 'e', label: r`$21$`, value: 21, trapExplanation: r`$21 = 8 + 13$ would be the next $t$ — one round too many.` },
    ],
    correctOptionId: 'c',
    stepByStepSolution: [
      r`Each round replaces the pair $(a, b)$ by $(b,\ a + b)$.`,
      r`Trace: $(0,1) \to (1,1) \to (1,2) \to (2,3) \to (3,5) \to (5,8) \to (8,13)$ — six steps.`,
      r`After six rounds $a = 8$. The program computes Fibonacci numbers.`,
    ],
    keyConceptTag: 'State update · Fibonacci',
  },
  {
    id: 'alg-07',
    moduleId: 'algorithms',
    difficulty: 2,
    promptText: r`What does the pseudocode output for the inputs $a = 84$ and $b = 36$? Here $a \bmod b$ is the remainder when $a$ is divided by $b$.`,
    codeSnippet: `INPUT: a, b
  WHILE b ≠ 0
    r = a mod b
    a = b
    b = r
  END WHILE
OUTPUT: a`,
    options: [
      { id: 'a', label: r`$0$`, value: 0, trapExplanation: r`$0$ is the final value of $b$ — that is why the loop stops. The output is $a$.` },
      { id: 'b', label: r`$6$`, value: 6, trapExplanation: r`$6$ divides both numbers, but it is not what the trace produces: the loop ends with $a = 12$.` },
      { id: 'c', label: r`$12$`, value: 12 },
      { id: 'd', label: r`$36$`, value: 36, trapExplanation: r`You stopped after the first round. $b = 12 \ne 0$, so the loop continues.` },
      { id: 'e', label: r`$252$`, value: 252, trapExplanation: r`$252$ is the least common multiple of 84 and 36. This algorithm finds the greatest common divisor.` },
    ],
    correctOptionId: 'c',
    stepByStepSolution: [
      r`Round 1: $r = 84 \bmod 36 = 12$, then $a = 36$, $b = 12$.`,
      r`Round 2: $r = 36 \bmod 12 = 0$, then $a = 12$, $b = 0$.`,
      r`Now $b = 0$, the loop ends, and the output is $12$.`,
      r`This is Euclid's algorithm: it returns the greatest common divisor of the two inputs.`,
    ],
    keyConceptTag: 'Dry run · Euclid’s algorithm',
  },
  {
    id: 'alg-08',
    moduleId: 'algorithms',
    difficulty: 2,
    promptText: r`What does the pseudocode output for the input $N = 2026$?`,
    codeSnippet: `INPUT: N
  S = 0
  WHILE N > 0
    S = S + (N mod 10)
    N = floor(N / 10)
  END WHILE
OUTPUT: S`,
    options: [
      { id: 'a', label: r`$1$`, value: 1, trapExplanation: r`$1$ would be the result of repeating the process on $10$ (digital root). The code runs through the digits only once.` },
      { id: 'b', label: r`$4$`, value: 4, trapExplanation: r`$4$ is the number of rounds (digits). The code adds the digit itself, $N \bmod 10$, not $1$.` },
      { id: 'c', label: r`$6$`, value: 6, trapExplanation: r`$6$ is only the first digit that is split off. The loop continues until $N = 0$.` },
      { id: 'd', label: r`$10$`, value: 10 },
      { id: 'e', label: r`$6202$`, value: 6202, trapExplanation: r`Reversing the digits would need $S = 10\cdot S + (N \bmod 10)$. Here the digits are simply added.` },
    ],
    correctOptionId: 'd',
    stepByStepSolution: [
      r`$N \bmod 10$ is the last digit; $\lfloor N/10 \rfloor$ removes it.`,
      r`Trace: add $6$ ($N \to 202$), add $2$ ($N \to 20$), add $0$ ($N \to 2$), add $2$ ($N \to 0$).`,
      r`$S = 6 + 2 + 0 + 2 = 10$. The program computes the digit sum.`,
    ],
    keyConceptTag: 'mod and floor · digit extraction',
  },
  {
    id: 'alg-09',
    moduleId: 'algorithms',
    difficulty: 3,
    promptText: r`What does the pseudocode return for a positive integer $N$?`,
    codeSnippet: `INPUT: N
  c = 0
  i = 1
  WHILE i <= N
    j = i
    WHILE j <= N
      c = c + 1
      j = j + 1
    END WHILE
    i = i + 1
  END WHILE
OUTPUT: c`,
    // values at N = 5
    options: [
      { id: 'a', label: r`$N^2$`, value: 25, trapExplanation: r`$N^2$ would be right if the inner loop always started at $j = 1$. It starts at $j = i$, so it gets shorter each time.` },
      { id: 'b', label: r`$\dfrac{N(N-1)}{2}$`, value: 10, trapExplanation: r`This counts pairs with $j > i$ only. The inner loop starts at $j = i$, so the pairs with $j = i$ are included.` },
      { id: 'c', label: r`$\dfrac{N(N+1)}{2}$`, value: 15 },
      { id: 'd', label: r`$2N$`, value: 10, trapExplanation: r`For $N = 3$ both give $6$ by coincidence, but for $N = 4$ the code gives $10$, not $8$. Always test a formula on more than one input.` },
      { id: 'e', label: r`$\dfrac{N^2}{2}$`, value: 12.5, trapExplanation: r`Roughly right for large $N$, but not exact — for odd $N$ it is not even an integer.` },
    ],
    correctOptionId: 'c',
    stepByStepSolution: [
      r`For a fixed $i$ the inner loop runs for $j = i, i+1, \dots, N$: that is $N - i + 1$ rounds.`,
      r`$i = 1$ gives $N$ rounds, $i = 2$ gives $N-1$, …, $i = N$ gives $1$.`,
      r`$c = N + (N-1) + \dots + 1 = \dfrac{N(N+1)}{2}$.`,
      r`Check with $N = 3$: $3 + 2 + 1 = 6$. ✓`,
    ],
    keyConceptTag: 'Nested loops · triangular numbers',
  },
  {
    id: 'alg-10',
    moduleId: 'algorithms',
    difficulty: 3,
    promptText: r`What does the pseudocode output for the input $N = 6$?`,
    codeSnippet: `INPUT: N
  c = 0
  WHILE N ≠ 1
    IF N is even
      N = N / 2
    ELSE
      N = 3 * N + 1
    END IF
    c = c + 1
  END WHILE
OUTPUT: c`,
    options: [
      { id: 'a', label: r`$2$`, value: 2, trapExplanation: r`$2$ counts only the "odd" steps ($3 \to 10$ and $5 \to 16$). The counter increases in <i>every</i> round.` },
      { id: 'b', label: r`$6$`, value: 6, trapExplanation: r`$6$ counts only the halving steps. The line $c = c + 1$ is outside the IF, so both branches are counted.` },
      { id: 'c', label: r`$7$`, value: 7, trapExplanation: r`One step is missing — usually the last one, $2 \to 1$. The loop stops only after $N$ has become $1$.` },
      { id: 'd', label: r`$8$`, value: 8 },
      { id: 'e', label: r`$9$`, value: 9, trapExplanation: r`$9$ is how many numbers appear in the sequence, including the start. Steps are the arrows between them: one fewer.` },
    ],
    correctOptionId: 'd',
    stepByStepSolution: [
      r`Even numbers are halved, odd numbers are replaced by $3N + 1$; each round adds 1 to $c$.`,
      r`Trace: $6 \to 3 \to 10 \to 5 \to 16 \to 8 \to 4 \to 2 \to 1$.`,
      r`Count the arrows: 8 steps, so $c = 8$.`,
    ],
    keyConceptTag: 'Dry run · branching inside a loop',
  },
  {
    id: 'alg-11',
    moduleId: 'algorithms',
    difficulty: 3,
    promptText: r`What does the pseudocode output for the input $N = 36$?`,
    codeSnippet: `INPUT: N
  c = 0
  d = 1
  WHILE d * d <= N
    IF N mod d = 0
      IF d * d = N
        c = c + 1
      ELSE
        c = c + 2
      END IF
    END IF
    d = d + 1
  END WHILE
OUTPUT: c`,
    options: [
      { id: 'a', label: r`$5$`, value: 5, trapExplanation: r`$5$ is the number of values of $d$ that pass the first IF ($1,2,3,4,6$). Most of them add $2$, not $1$.` },
      { id: 'b', label: r`$6$`, value: 6, trapExplanation: r`$6$ is the last value of $d$ that is tested, not the counter $c$.` },
      { id: 'c', label: r`$8$`, value: 8, trapExplanation: r`You stopped at $d = 5$. Since $6\cdot 6 = 36 \le 36$, the round $d = 6$ still runs and adds $1$.` },
      { id: 'd', label: r`$9$`, value: 9 },
      { id: 'e', label: r`$10$`, value: 10, trapExplanation: r`For $d = 6$ the inner condition $d\cdot d = N$ is true, so only $1$ is added: the partner of $6$ is $6$ itself.` },
    ],
    correctOptionId: 'd',
    stepByStepSolution: [
      r`The loop tests $d = 1, 2, \dots, 6$ (as long as $d^2 \le 36$).`,
      r`$d = 1, 2, 3, 4$ divide $36$ and $d^2 \ne 36$: each adds $2$ (for $d$ and its partner $36/d$). That is $8$.`,
      r`$d = 5$ does not divide $36$. $d = 6$ divides it and $6^2 = 36$: add $1$.`,
      r`$c = 9$. The program counts the divisors of $N$ — compare $36 = 2^2\cdot 3^2$, which has $3\cdot 3 = 9$ divisors.`,
    ],
    keyConceptTag: 'Nested conditionals · divisor pairs',
  },
  {
    id: 'alg-12',
    moduleId: 'algorithms',
    difficulty: 3,
    promptText: r`What does the pseudocode return for a positive integer $N$?`,
    codeSnippet: `INPUT: N
  S = 0
  n = 1
  WHILE n <= N
    S = S + (2 * n - 1)
    n = n + 1
  END WHILE
OUTPUT: S`,
    // values at N = 4
    options: [
      { id: 'a', label: r`$N^2$`, value: 16 },
      { id: 'b', label: r`$N(N+1)$`, value: 20, trapExplanation: r`$N(N+1)$ is the sum of the first $N$ <i>even</i> numbers, $2 + 4 + \dots + 2N$. The code adds $2n - 1$, the odd numbers.` },
      { id: 'c', label: r`$2N - 1$`, value: 7, trapExplanation: r`$2N - 1$ is only the last term that is added. $S$ accumulates all terms.` },
      { id: 'd', label: r`$\dfrac{N(N+1)}{2}$`, value: 10, trapExplanation: r`This is $1 + 2 + \dots + N$. The code adds $2n - 1$, not $n$.` },
      { id: 'e', label: r`$(2N-1)^2$`, value: 49, trapExplanation: r`Squaring the last term is not the same as summing all terms. Test $N = 2$: the code gives $1 + 3 = 4$, not $9$.` },
    ],
    correctOptionId: 'a',
    stepByStepSolution: [
      r`For $n = 1, 2, 3, \dots$ the expression $2n - 1$ gives $1, 3, 5, \dots$ — the odd numbers.`,
      r`So $S$ is the sum of the first $N$ odd numbers.`,
      r`Small cases: $1 = 1^2$, $1 + 3 = 2^2$, $1 + 3 + 5 = 3^2$. Each odd number is the L-shaped border that grows a square by one.`,
      r`$S = N^2$.`,
    ],
    keyConceptTag: 'Identify the sequence · sum of odd numbers',
  },
];
