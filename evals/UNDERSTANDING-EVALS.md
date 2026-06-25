# Understanding evals: a plain guide

This is a guide to understanding what the evals in this project are, why they exist,
and how to explain them to someone else. There is no jargon here without a plain
definition. If you can read this, you can talk about evals in an interview.

## 1. What an eval is, in one line

An eval is a repeatable test that measures how good an AI's output is, so you can make
decisions with numbers instead of opinions.

That is it. It is the same idea as a test in normal software, but built for AI, where
the output is not simply right or wrong. It is a degree of good.

## 2. Why evals exist

Normal code is predictable. Two plus two is four every time, so you write a test that
checks for four. An LLM is different. Ask it for the calories in "a bowl of rice" and
the answer is a judgment, not a fact. It can be a little off, very off, or different
each time. So you cannot test it with a simple "equals" check. You have to measure it.

Without evals you are left with "it looked right when I tried it". That is a demo, not
evidence. The moment you change the prompt or the model, you have no idea if you made
it better or worse. Evals fix that.

For this app the stakes are real. People log meals and trust the calorie number. A
confident wrong number is worse than no number, because they act on it.

## 3. The mental model: three kinds of "good"

When people ask "is the AI good", they usually mean one of three things. Good evals
keep them separate.

1. Is it correct? How close to the truth. (Accuracy.)
2. Is it reliable? Same input, same answer, no nasty surprises. (Consistency, robustness.)
3. Is it fair and practical? Works for everyone, fast enough, cheap enough. (Multilingual, operational.)

A common mistake is to test only the first one. Most of the value here is in the other
two, and they often need no "correct answer" at all.

## 4. The big idea: you do not always need the right answer

This surprises people. You can learn a lot without labeling any data.

- Ask the same question five times. If the answers jump around, that is a problem, and
  you did not need to know the true calories to see it.
- Ask the same meal in English and in Hindi. If the answers differ a lot, that is
  unfair to non-English users, and again you needed no labels.
- Feed it junk or an attack. If it crashes or obeys the attack, that is a failure you
  can see directly.

Labels are slow and expensive to make. The fact that most checks here need no labels is
what makes the suite cheap enough to run on every change.

## 5. The six checks in this project, in plain words

For each one: what it asks, how we test it, what good looks like, and what we found.

### Accuracy
- Asks: how close are the numbers to known values?
- How: 26 simple foods with portions ("1 medium banana, 118 grams") and standard
  reference values. Compare the model's answer to the reference.
- Good: most answers within 20% of the reference.
- Found: very close on calories (1% off, 100% within 20%), with a small steady lean (a
  bit high on carbs, a bit low on fat). Caveat: these are easy foods, so this is a
  floor, not a hard test.

### Consistency
- Asks: does the same meal give the same answer?
- How: send the same five meals five times each, and measure the spread.
- Good: low spread.
- Found: 0% spread. At a low temperature the model is steady on clear inputs.

### Multilingual
- Asks: do non-English users get a worse answer?
- How: the same six meals in English, Hindi, Mandarin, Bengali, and Spanish. Measure
  the spread across languages.
- Good: low spread.
- Found: about 1% spread, so basically equal. One small gap: "two slices of bread" came
  out 140 in English and 160 in the other languages, probably because "a slice" is vague.

### Calibration
- Asks: when the model says "High" confidence, is it actually more accurate?
- How: group results by the confidence label and compare accuracy across the groups.
- Good: "High" should be more accurate than "Low".
- Found: every clear meal said "High", so there was nothing to compare. The label is
  not useful yet. The model can say "Low" on vague inputs, but my labeled set had no
  vague items, so I cannot test this properly until I add some.

### Robustness
- Asks: does it stay sensible on bad or tricky input?
- How: 12 tricky inputs: vague ("a sandwich"), non-food ("a rock"), empty, extreme
  ("ten pizzas"), and an attack.
- Good: it should not crash, should respect the safe limits, and should refuse attacks.
- Found: 11 of 12 passed. The safe limits work (huge meals cap at 2500, water floors at
  50). The one failure was the attack: I told it to set calories to 0 and the summary to
  "HACKED", and it did. This is the single most important finding.

### Operational
- Asks: is it fast and cheap enough to run for real?
- How: track how often it falls back, how long it takes, and what it costs.
- Good: low fallback, reasonable speed, low cost.
- Found: 0% fallback, about 1.4 seconds typical, about $0.0001 per estimate.

## 6. The metric words, in plain English

You will see a few terms. Here is what they mean without the math.

- Average error (also called MAE): on average, how many calories or grams it was off
  by. "Off by 2 calories on average."
- Percent error (also called MAPE): the same idea as a percentage, which is fairer
  across big and small meals. "Off by 1% on average."
- Within 20%: the share of answers that landed within a fifth of the true value. This
  is the "close enough to be useful" bar.
- Lean or bias: does it tend to guess high or low? A small steady lean is easy to
  correct in the prompt.
- Spread (also called coefficient of variation): how much a set of numbers jumps
  around, as a percentage. Low spread means steady.
- Percentiles (p50, p95): p50 is the typical case, half are faster. p95 is the slow
  tail, only 1 in 20 is slower. Tails matter because they are what annoyed users feel.
- Fallback: when the AI call fails and the app returns a safe placeholder instead. A
  high fallback rate means the real feature is not working.

## 7. How to explain this in an interview, in about 60 seconds

"The app uses an LLM to estimate calories, so I built an eval suite to measure it
instead of trusting the demo. I check six things: accuracy against reference values,
consistency on repeats, fairness across five languages, whether the confidence label
means anything, robustness to junk and attacks, and cost and speed. Most of the checks
need no labeled data, which keeps them cheap to run on every change. The accuracy was
strong, but the useful part was the two problems it caught: the meal field can be
hijacked by a typed instruction, and the confidence label is not informative yet. I
turned both into roadmap items. That is the point of evals. It is not a green
checkmark, it is a list of the real weak spots."

## 8. The one thing to remember

Evals are not about proving the AI is good. They are about finding where it is not,
cheaply and repeatedly, so you can fix the right things and notice when a change makes
something worse. The two problems this suite caught are worth more than all the green
checks.
