# Evals: how to run

This is the offline test suite for the meal nutrition estimator
(`server/src/services/mealEstimation.js`, the function `estimateMealNutrition`).

It imports the real product function, so it tests the actual path: the prompt, the
strict output format, the safety clamps, and the fallback.

New to evals? Start with the plain-English guide in
[UNDERSTANDING-EVALS.md](./UNDERSTANDING-EVALS.md), then read the findings in
[EVALS.md](./EVALS.md).

## Before you run

- Node 18 or newer.
- An `OPENAI_API_KEY` the estimator can read. Either:
  - put it in `server/.env` as `OPENAI_API_KEY=sk-...` (this file is gitignored), or
  - export it in your shell with `export OPENAI_API_KEY=sk-...`.
- Install the server dependencies, since the estimator imports `openai`:
  `npm install --prefix server`, or `npm run install:all` from the repo root.

## Run

```bash
cd evals
npm start
```

From the repo root you can also run `node evals/src/runEval.js`.

## What you get

- A summary table in the console.
- `results/<timestamp>.json`, the full machine-readable results.
- `results/<timestamp>.md`, a readable report.

The meaning of the numbers, the bars I set, and the findings are in
[EVALS.md](./EVALS.md).

## The checks

| Check | Needs correct answers? | What it measures |
| --- | --- | --- |
| Accuracy | yes, about 25 labeled meals | error vs reference values, and percent within 20% |
| Consistency | no | how much the answer moves on repeated identical inputs |
| Multilingual | no | how much the answer moves for the same meal across languages |
| Calibration | yes | whether "High" confidence is actually more accurate |
| Robustness | no | handling of vague, non-food, extreme, and injection inputs, plus clamp behavior |
| Operational | no | fallback rate, speed, and cost per estimate |

## Settings

The tolerance, repeat count, parallelism, and model are in `config.js`.

## Datasets

- `datasets/accuracy.jsonl`: hand-labeled, clearly sized meals with reference macros.
  The values are USDA-style references, approximate, not lab measured.
- `datasets/multilingual.jsonl`: the same common meals in English, Hindi, Mandarin,
  Bengali, and Spanish.
- `datasets/robustness.jsonl`: vague, non-food, extreme, and prompt-injection cases.
