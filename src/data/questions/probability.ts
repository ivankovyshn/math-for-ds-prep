import type { Question } from '../../types.ts';

const r = String.raw;

export const probability: Question[] = [
  {
    id: 'pro-01',
    moduleId: 'probability',
    difficulty: 1,
    promptText: r`A fair die is rolled twice.

What is the probability that both rolls show a six?`,
    options: [
      { id: 'a', label: r`$\dfrac{1}{3}$`, value: 1 / 3, trapExplanation: r`$\tfrac16+\tfrac16$ adds the probabilities. For "this <i>and</i> that" with independent events you multiply.` },
      { id: 'b', label: r`$\dfrac{1}{6}$`, value: 1 / 6, trapExplanation: r`This is the probability of a six on a single roll. Requiring it twice must be less likely.` },
      { id: 'c', label: r`$\dfrac{1}{12}$`, value: 1 / 12, trapExplanation: r`The outcomes of two rolls form a $6\times 6$ table with 36 cells, not $6+6 = 12$.` },
      { id: 'd', label: r`$\dfrac{11}{36}$`, value: 11 / 36, trapExplanation: r`$\tfrac{11}{36}$ is the probability of <i>at least one</i> six. The question asks for two sixes.` },
      { id: 'e', label: r`$\dfrac{1}{36}$`, value: 1 / 36 },
    ],
    correctOptionId: 'e',
    stepByStepSolution: [
      r`Two rolls have $6\cdot 6 = 36$ equally likely outcomes.`,
      r`Exactly one of them is (6, 6).`,
      r`$P = \tfrac{1}{36}$. Equivalently: independent events multiply, $\tfrac16\cdot\tfrac16$.`,
    ],
    keyConceptTag: 'Independent events multiply',
  },
  {
    id: 'pro-02',
    moduleId: 'probability',
    difficulty: 1,
    promptText: r`A fair coin is flipped three times.

What is the probability of getting at least one head?`,
    options: [
      { id: 'a', label: r`$\dfrac{1}{8}$`, value: 1 / 8, trapExplanation: r`$\tfrac18$ is the probability of <i>no</i> head at all (three tails) — the complement of what is asked.` },
      { id: 'b', label: r`$\dfrac{3}{8}$`, value: 3 / 8, trapExplanation: r`$\tfrac38$ is the probability of <i>exactly</i> one head. "At least one" also includes two and three heads.` },
      { id: 'c', label: r`$\dfrac{1}{2}$`, value: 1 / 2, trapExplanation: r`$\tfrac12$ is the chance for one flip. With three attempts, a head becomes much more likely.` },
      { id: 'd', label: r`$\dfrac{7}{8}$`, value: 7 / 8 },
      { id: 'e', label: r`$\dfrac{3}{2}$`, value: 3 / 2, trapExplanation: r`$3\cdot\tfrac12$ exceeds 1, which no probability can. Adding only works for events that cannot happen together.` },
    ],
    correctOptionId: 'd',
    stepByStepSolution: [
      r`"At least one" is awkward to count directly, so use the complement: the only way to fail is three tails.`,
      r`$P(\text{no head}) = \left(\tfrac12\right)^3 = \tfrac18$.`,
      r`$P(\text{at least one head}) = 1 - \tfrac18 = \tfrac78$.`,
    ],
    keyConceptTag: 'Complement rule · at least once',
  },
  {
    id: 'pro-03',
    moduleId: 'probability',
    difficulty: 1,
    promptText: r`A bag contains 3 red and 5 blue balls. One ball is drawn at random.

What is the probability that it is red?`,
    options: [
      { id: 'a', label: r`$\dfrac{1}{3}$`, value: 1 / 3, trapExplanation: r`"One of three red balls" confuses the count of red balls with the probability. Compare favourable to <i>all</i> outcomes.` },
      { id: 'b', label: r`$\dfrac{3}{8}$`, value: 3 / 8 },
      { id: 'c', label: r`$\dfrac{1}{2}$`, value: 1 / 2, trapExplanation: r`Two colours does not mean two equally likely outcomes. There are more blue balls than red ones.` },
      { id: 'd', label: r`$\dfrac{3}{5}$`, value: 3 / 5, trapExplanation: r`$3:5$ are the <i>odds</i> (red against blue). A probability divides by the total, $3 + 5 = 8$.` },
      { id: 'e', label: r`$\dfrac{5}{8}$`, value: 5 / 8, trapExplanation: r`$\tfrac58$ is the probability of drawing a blue ball.` },
    ],
    correctOptionId: 'b',
    stepByStepSolution: [
      r`All $3 + 5 = 8$ balls are equally likely to be drawn.`,
      r`$3$ of them are red.`,
      r`$P = \dfrac{\text{favourable}}{\text{possible}} = \dfrac{3}{8}$.`,
    ],
    keyConceptTag: 'Favourable over possible',
  },
  {
    id: 'pro-04',
    moduleId: 'probability',
    difficulty: 1,
    promptText: r`$A$ and $B$ are independent events with $P(A) = 0.5$ and $P(B) = 0.4$.

What is the probability that both $A$ and $B$ occur?`,
    options: [
      { id: 'a', label: r`$0.1$`, value: 0.1, trapExplanation: r`$0.5 - 0.4$ is a difference of probabilities and has no meaning here.` },
      { id: 'b', label: r`$0.2$`, value: 0.2 },
      { id: 'c', label: r`$0.45$`, value: 0.45, trapExplanation: r`This is the average of the two probabilities. "Both" must be less likely than either event alone.` },
      { id: 'd', label: r`$0.7$`, value: 0.7, trapExplanation: r`$0.7$ is $P(A \text{ or } B) = 0.5 + 0.4 - 0.2$ — at least one of them.` },
      { id: 'e', label: r`$0.9$`, value: 0.9, trapExplanation: r`Adding probabilities answers an "or" question, and only for events that exclude each other.` },
    ],
    correctOptionId: 'b',
    stepByStepSolution: [
      r`Independent means: knowing that $A$ happened does not change the chance of $B$.`,
      r`$A$ happens in half of all cases; in $40\%$ of those, $B$ happens too.`,
      r`$P(A \cap B) = 0.5\cdot 0.4 = 0.2$.`,
    ],
    keyConceptTag: 'Independence · product rule',
  },
  {
    id: 'pro-05',
    moduleId: 'probability',
    difficulty: 2,
    promptText: r`A fair die is rolled four times.

What is the probability of rolling a six at least once?`,
    options: [
      { id: 'a', label: r`$4\cdot\dfrac{1}{6}$`, value: 4 / 6, trapExplanation: r`Adding $\tfrac16$ four times counts runs with several sixes more than once. With 7 rolls this "probability" would exceed 1.` },
      { id: 'b', label: r`$\left(\dfrac{1}{6}\right)^{4}$`, value: (1 / 6) ** 4, trapExplanation: r`This is the probability of a six on <i>every</i> roll — far rarer than at least one six.` },
      { id: 'c', label: r`$1-\left(\dfrac{1}{6}\right)^{4}$`, value: 1 - (1 / 6) ** 4, trapExplanation: r`The complement of "at least one six" is "no six at all", with probability $\left(\tfrac56\right)^4$ — not "four sixes".` },
      { id: 'd', label: r`$1-\left(\dfrac{5}{6}\right)^{4}$`, value: 1 - (5 / 6) ** 4 },
      { id: 'e', label: r`$4\cdot\dfrac{1}{6}\cdot\left(\dfrac{5}{6}\right)^{3}$`, value: 4 * (1 / 6) * (5 / 6) ** 3, trapExplanation: r`This is the probability of <i>exactly</i> one six. "At least once" also includes two, three and four sixes.` },
    ],
    correctOptionId: 'd',
    stepByStepSolution: [
      r`"At least once" has many cases (1, 2, 3 or 4 sixes). Its opposite has just one: never.`,
      r`One roll shows no six with probability $\tfrac56$.`,
      r`Four independent rolls without a six: $\left(\tfrac56\right)^4$.`,
      r`$P(\text{at least one six}) = 1 - \left(\tfrac56\right)^4 \approx 52\%$.`,
    ],
    keyConceptTag: 'At least once = 1 − P(never)',
  },
  {
    id: 'pro-06',
    moduleId: 'probability',
    difficulty: 2,
    promptText: r`A scratch card wins with probability $\tfrac{1}{50}$. You buy 50 cards; the cards are independent.

Roughly how likely is it that you win at least once?`,
    options: [
      { id: 'a', label: r`about $37\%$`, value: 0.37, trapExplanation: r`$37\%$ is the probability of winning <i>nothing</i>, $\left(\tfrac{49}{50}\right)^{50}\approx\tfrac1e$. Take the complement.` },
      { id: 'b', label: r`about $50\%$`, value: 0.5, trapExplanation: r`A guess based on the number 50. The answer does not depend on it in that way.` },
      { id: 'c', label: r`about $63\%$`, value: 0.63 },
      { id: 'd', label: r`about $98\%$`, value: 0.98, trapExplanation: r`$98\%$ is the chance that a <i>single</i> card loses.` },
      { id: 'e', label: r`$100\%$`, value: 1, trapExplanation: r`$50\cdot\tfrac1{50} = 1$ is the <i>expected number</i> of wins, not a probability. You can still lose every time.` },
    ],
    correctOptionId: 'c',
    stepByStepSolution: [
      r`Complement: $P(\text{at least one win}) = 1 - P(\text{no win})$.`,
      r`$P(\text{no win}) = \left(1 - \tfrac1{50}\right)^{50}$.`,
      r`Key estimate: $\left(1-\tfrac1n\right)^n \approx \tfrac1e \approx 0.37$ for large $n$.`,
      r`So $P \approx 1 - 0.37 = 0.63$. "One-in-$n$ chance, $n$ tries" gives about $63\%$, never certainty.`,
    ],
    keyConceptTag: 'Estimation · (1 − 1/n)ⁿ ≈ 1/e',
  },
  {
    id: 'pro-07',
    moduleId: 'probability',
    difficulty: 2,
    promptText: r`A fair coin is flipped four times.

What is the probability of getting exactly two heads?`,
    options: [
      { id: 'a', label: r`$\dfrac{1}{16}$`, value: 1 / 16, trapExplanation: r`$\tfrac1{16}$ is the probability of one specific sequence such as HHTT. Several sequences contain two heads.` },
      { id: 'b', label: r`$\dfrac{1}{4}$`, value: 1 / 4, trapExplanation: r`You found 4 sequences, but there are 6: HHTT, HTHT, HTTH, THHT, THTH, TTHH.` },
      { id: 'c', label: r`$\dfrac{3}{8}$`, value: 3 / 8 },
      { id: 'd', label: r`$\dfrac{1}{2}$`, value: 1 / 2, trapExplanation: r`Two heads is the most likely result, but "most likely" does not mean "half of the time".` },
      { id: 'e', label: r`$\dfrac{11}{16}$`, value: 11 / 16, trapExplanation: r`$\tfrac{11}{16}$ is the probability of <i>at least</i> two heads.` },
    ],
    correctOptionId: 'c',
    stepByStepSolution: [
      r`Four flips have $2^4 = 16$ equally likely sequences.`,
      r`Count those with exactly two H: choose the 2 positions of the heads, $\binom42 = 6$.`,
      r`$P = \dfrac{6}{16} = \dfrac38$.`,
    ],
    keyConceptTag: 'Binomial counting',
  },
  {
    id: 'pro-08',
    moduleId: 'probability',
    difficulty: 2,
    promptText: r`A box contains 4 red and 6 blue cards. Two cards are drawn one after the other, without putting the first one back.

What is the probability that both cards are red?`,
    options: [
      { id: 'a', label: r`$\dfrac{4}{25}$`, value: 4 / 25, trapExplanation: r`$\tfrac4{10}\cdot\tfrac4{10}$ assumes the first card is put back. After one red card is gone, only 3 red out of 9 remain.` },
      { id: 'b', label: r`$\dfrac{2}{15}$`, value: 2 / 15 },
      { id: 'c', label: r`$\dfrac{1}{3}$`, value: 1 / 3, trapExplanation: r`$\tfrac39$ is only the second step — the chance of red <i>given</i> that the first card was red.` },
      { id: 'd', label: r`$\dfrac{2}{5}$`, value: 2 / 5, trapExplanation: r`$\tfrac4{10}$ is only the first step. Both draws must be red.` },
      { id: 'e', label: r`$\dfrac{11}{15}$`, value: 11 / 15, trapExplanation: r`$\tfrac4{10}+\tfrac39$ adds the two steps. "First red <i>and then</i> red" multiplies them.` },
    ],
    correctOptionId: 'b',
    stepByStepSolution: [
      r`First draw: 4 red out of 10 cards, $P = \tfrac4{10}$.`,
      r`If it was red, 3 red cards remain among 9: $P = \tfrac39$.`,
      r`Multiply along the path: $\tfrac4{10}\cdot\tfrac39 = \tfrac{12}{90} = \tfrac2{15}$.`,
    ],
    keyConceptTag: 'Dependent draws · conditional step',
  },
  {
    id: 'pro-09',
    moduleId: 'probability',
    difficulty: 3,
    promptText: r`A disease affects $1\%$ of a population. A test detects the disease in $90\%$ of sick people, but it is also positive for $9\%$ of healthy people.

A randomly chosen person tests positive. Roughly how likely is it that this person is actually sick?`,
    options: [
      { id: 'a', label: r`about $1\%$`, value: 0.01, trapExplanation: r`$1\%$ is the probability <i>before</i> the test. A positive result is evidence and must raise it.` },
      { id: 'b', label: r`about $9\%$`, value: 0.09 },
      { id: 'c', label: r`about $50\%$`, value: 0.5, trapExplanation: r`"Sick or not" are two cases, but they are far from equally likely.` },
      { id: 'd', label: r`about $90\%$`, value: 0.9, trapExplanation: r`$90\%$ is $P(\text{positive}\mid\text{sick})$. The question asks the reverse, $P(\text{sick}\mid\text{positive})$ — the classic confusion.` },
      { id: 'e', label: r`about $91\%$`, value: 0.91, trapExplanation: r`$100\% - 9\%$ would be right only if healthy and sick people were equally common. Healthy people outnumber sick ones 99 to 1.` },
    ],
    correctOptionId: 'b',
    stepByStepSolution: [
      r`Replace percentages by people: imagine $10\,000$ persons.`,
      r`Sick: $100$. Of these, $90$ test positive.`,
      r`Healthy: $9\,900$. Of these, $9\% = 891$ test positive (false alarms).`,
      r`All positives: $90 + 891 = 981$. Truly sick among them: $\dfrac{90}{981} \approx 9\%$.`,
      r`The rare disease is swamped by false alarms from the huge healthy group.`,
    ],
    keyConceptTag: 'Bayes · base-rate neglect',
  },
  {
    id: 'pro-10',
    moduleId: 'probability',
    difficulty: 3,
    promptText: r`Three people each choose, independently and at random, an integer from $1$ to $10$.

What is the probability that at least two of them choose the same number?`,
    options: [
      { id: 'a', label: r`$0.01$`, value: 0.01, trapExplanation: r`$0.01$ is the probability that <i>all three</i> choose the same number.` },
      { id: 'b', label: r`$0.1$`, value: 0.1, trapExplanation: r`$0.1$ is the chance that one particular pair matches. With three people there are three pairs.` },
      { id: 'c', label: r`$0.28$`, value: 0.28 },
      { id: 'd', label: r`$0.3$`, value: 0.3, trapExplanation: r`$3\cdot 0.1$ adds the three pairs, counting "all three equal" several times. It is close, but too high.` },
      { id: 'e', label: r`$0.72$`, value: 0.72, trapExplanation: r`$0.72$ is the probability that all three numbers are <i>different</i> — the complement.` },
    ],
    correctOptionId: 'c',
    stepByStepSolution: [
      r`Use the complement: "at least two equal" is the opposite of "all different".`,
      r`All different: the second person avoids 1 number ($\tfrac9{10}$), the third avoids 2 ($\tfrac8{10}$).`,
      r`$P(\text{all different}) = \tfrac9{10}\cdot\tfrac8{10} = 0.72$.`,
      r`$P(\text{a match}) = 1 - 0.72 = 0.28$. This is the birthday problem in miniature.`,
    ],
    keyConceptTag: 'Birthday problem · complement',
  },
  {
    id: 'pro-11',
    moduleId: 'probability',
    difficulty: 3,
    promptText: r`A fair coin is flipped $n$ times.

What is the smallest $n$ for which the probability of at least one head exceeds $99\%$?`,
    options: [
      { id: 'a', label: r`$2$`, value: 2, trapExplanation: r`$2$ is the <i>average</i> number of flips until the first head. After 2 flips the chance of a head is only $75\%$.` },
      { id: 'b', label: r`$6$`, value: 6, trapExplanation: r`Close: $2^6 = 64$, so the failure chance is $\tfrac1{64}\approx 1.6\%$ — still above $1\%$.` },
      { id: 'c', label: r`$7$`, value: 7 },
      { id: 'd', label: r`$99$`, value: 99, trapExplanation: r`The failure probability halves with every flip; it shrinks exponentially, not one percent per flip.` },
      { id: 'e', label: r`$198$`, value: 198, trapExplanation: r`$0.99 / 0.5$ treats probability as if it added up linearly. It does not.` },
    ],
    correctOptionId: 'c',
    stepByStepSolution: [
      r`$P(\text{at least one head}) = 1 - \left(\tfrac12\right)^n$.`,
      r`We need $\left(\tfrac12\right)^n < 0.01$, i.e. $2^n > 100$.`,
      r`Powers of two: $2^6 = 64$ (too small), $2^7 = 128$ (enough).`,
      r`So $n = 7$.`,
    ],
    keyConceptTag: 'Exponential decay of failure',
  },
  {
    id: 'pro-12',
    moduleId: 'probability',
    difficulty: 3,
    promptText: r`In each round Mia secretly picks an integer from $1$ to $20$ at random, and Jonas tries to guess it at random. They play $20$ independent rounds.

What is the probability that Jonas guesses correctly in exactly one round?`,
    options: [
      { id: 'a', label: r`$\left(\dfrac{19}{20}\right)^{19}$`, value: (19 / 20) ** 19 },
      { id: 'b', label: r`$1-\left(\dfrac{19}{20}\right)^{20}$`, value: 1 - (19 / 20) ** 20, trapExplanation: r`This is the probability of <i>at least</i> one correct guess. "Exactly one" excludes two or more hits.` },
      { id: 'c', label: r`$1$`, value: 1, trapExplanation: r`$20\cdot\tfrac1{20} = 1$ is the expected number of hits, not a probability. Zero or two hits are entirely possible.` },
      { id: 'd', label: r`$\dfrac{1}{20}\cdot\left(\dfrac{19}{20}\right)^{19}$`, value: (1 / 20) * (19 / 20) ** 19, trapExplanation: r`This is the probability that the single hit happens in one <i>particular</i> round (say, the first). It can be any of the 20 rounds.` },
      { id: 'e', label: r`$\left(\dfrac{19}{20}\right)^{20}$`, value: (19 / 20) ** 20, trapExplanation: r`This is the probability of <i>no</i> correct guess in 20 rounds.` },
    ],
    correctOptionId: 'a',
    stepByStepSolution: [
      r`Fix one round, e.g. the first. Hit there and miss in the other 19: $\tfrac1{20}\cdot\left(\tfrac{19}{20}\right)^{19}$.`,
      r`The single hit can occur in any of the 20 rounds, and these 20 cases exclude each other, so add them.`,
      r`$20\cdot\tfrac1{20}\cdot\left(\tfrac{19}{20}\right)^{19} = \left(\tfrac{19}{20}\right)^{19} \approx 38\%$.`,
      r`Always simplify before comparing with the options: the factor $20$ cancels the $\tfrac1{20}$.`,
    ],
    keyConceptTag: 'Exactly once · binomial formula',
  },
];
