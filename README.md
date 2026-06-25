# 🥗 Atelier Health

A live, LLM-powered calorie tracker. I designed, built, and deployed it solo as a PM.

🔗 Live app: https://calorie-tracker-app-v2.replit.app

Log what you ate in plain language, in any language, and an LLM works out the
calories and macros for you. No dropdowns, no database of 50,000 foods to search.
You just type "two pieces of toast and a vanilla milkshake".

<!-- Add screenshots here once captured:
![Onboarding](screenshots/onboarding.png)
![Meal logging](screenshots/logging.png)
![Progress view](screenshots/progress.png)
-->

## Why I built it

I'm a product manager, not an engineer. I wanted to prove to myself that a PM can
ship a working AI product end to end, and actually learn AI-assisted development
instead of just talking about it. A calorie tracker was the simplest real use case
to start with. I'm working on my own health, so I knew I would actually use it.

It also fits a topic I keep coming back to: building AI for people whose first
language is not English. The meal input works in any language, the same idea behind
the multilingual medicine explainers I shipped at Tata 1mg.

## How it works

- Onboarding takes your height and weight, works out your BMI, and sets a daily
  calorie target with protein, carb, and fat goals.
- You log a meal in your own words. The text goes to the OpenAI API, which estimates
  calories and a macro breakdown. It works in English, Hindi, Mandarin, Bengali, or
  any language.
- The progress view rolls up your intake and macros across Today, Week, and Month.

## How it was built

The whole thing was built with an AI-assisted workflow, with very little hand-written
code:

1. ChatGPT to write clear, structured prompts for the design and build steps
2. A prompt-to-UI design tool to generate the interface from those prompts
3. Cursor (Claude agent) to build the front end and back end from the mockups
4. OpenAI API as the engine that estimates each meal's calories and macros
5. GitHub and Replit for the repo and the live deployment

## Honest status: a prototype that is getting more real

I would rather be clear about where this stands than oversell it. Since the first
version, I have closed three of the four gaps I first called out:

- ✅ Accuracy evals. There is now a real evaluation suite that measures how right the
  LLM actually is: accuracy, consistency, fairness across languages, robustness, and
  cost. See [evals/EVALS.md](evals/EVALS.md). From the latest run, calorie estimates
  landed within 20% of the reference value on common meals 100% of the time, and the
  answer stayed within about 1% across English, Hindi, Mandarin, Bengali, and Spanish.
  The suite also found two real problems: the meal box can be hijacked with a typed
  instruction, and the confidence label is not useful yet. Finding those is the whole
  point of evals.
- ✅ Per-user instances. Every visitor now gets their own profile and meal log through
  an anonymous browser id, with no login. Opening the link no longer shows you someone
  else's data.
- ✅ Usage analytics. Optional PostHog tracking on the real flow: onboarding, estimate,
  log, progress.

Still open, and I want to be honest about it:

- Durability and real accounts. Per-user data is tied to an anonymous id in the
  browser and stored in a JSON file on the server. There is no cross-device sync, and
  the data resets if the browser storage is cleared or the host restarts. A real
  database and login is the next step.
- Security. Storing user data safely, and hardening the prompt against the injection
  the evals just found, is the part a real product still needs a real team for. In my
  view that is the real unsolved problem with vibe-coded apps in general.

## What's next

In priority order:

1. A real database and per-user login (email or Google) for durability and cross-device sync
2. A fix for the prompt injection the evals found, plus a real security model for user data
3. A way to test confidence calibration, by adding vague but labeled meals so the confidence label can earn trust
4. Photo-based meal logging

## What I learned

> "Coding is easy. Understanding what is happening underneath is the hard part."

I can stand up a working prototype in hours now. But I came away with a clear map of
which pieces a real product still needs a real team for: data persistence, security,
and evaluation. I would rather name that line than pretend it is not there. That
clarity is the real takeaway.

---

## Running it locally

Prerequisites: Node.js 18 or newer

Install from the project root:

```bash
npm install
npm install --prefix server
npm install --prefix client
```

Run locally. The API runs on port 3001 and the Vite dev server on port 5173:

```bash
# Terminal 1, API
npm run dev --prefix server

# Terminal 2, client
npm run dev --prefix client
```

Or run both from the root with `npm run dev`. Open http://localhost:5173. The Vite
dev server sends `/api/*` calls to the Express server.

Data and per-user state: each visitor's browser creates an anonymous id (stored in
localStorage) and sends it as the `x-user-id` header on every request. The server
keeps each user's meals and profile separately in `server/data/data.json` (created on
the first request). Open the app in two browsers to see two independent instances.

AI estimation: meal nutrition is estimated in
`server/src/services/mealEstimation.js`, which calls the OpenAI API (`gpt-4.1-mini` by
default). Set these in `server/.env`:

- `OPENAI_API_KEY`, required for real estimates
- `OPENAI_MODEL`, optional model override

Without an API key the service returns a clearly marked fallback estimate so the app
still runs.

Product analytics (optional): set `VITE_POSTHOG_KEY` (and optionally
`VITE_POSTHOG_HOST`, which defaults to US) in `client/.env` to turn on PostHog. With
no key, analytics does nothing and the app runs normally. See `client/.env.example`.

Evals: the LLM estimator has a runnable evaluation suite in [`evals/`](evals/). Run
`cd evals && npm start` (needs `OPENAI_API_KEY`). The findings and method are in
[evals/EVALS.md](evals/EVALS.md), and a plain-English guide to the whole idea is in
[evals/UNDERSTANDING-EVALS.md](evals/UNDERSTANDING-EVALS.md).

Replit deploy notes: bind the Vite dev server to `0.0.0.0`, and point the client at
your Replit backend URL (through `VITE_API_URL`, or by running the API and client as
two Replit services).

---

*Built by [Abhinav Gupta](https://linkedin.com/in/abhinavgupta0809). PM, consumer AI. CMU MSPM '26*
