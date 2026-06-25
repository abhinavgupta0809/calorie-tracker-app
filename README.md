# 🥗 Atelier Health

**A live, LLM-powered calorie tracker — designed, built, and deployed solo by a PM.**

🔗 **Live app:** https://calorie-tracker-app-v2.replit.app

Log what you ate in plain language — *in any language* — and an LLM estimates the
calories and macros for you. No dropdowns, no database of 50,000 foods to search.
Just: *"two pieces of toast and a vanilla milkshake."*

<!-- Add screenshots here once captured:
![Onboarding](screenshots/onboarding.png)
![Meal logging](screenshots/logging.png)
![Progress view](screenshots/progress.png)
-->

## Why I built it

I'm a product manager, not an engineer. I wanted to *prove* — to myself first —
that a PM can ship a working AI product end-to-end, and actually learn AI-assisted
development instead of just talking about it. A calorie tracker was the simplest
real-use wedge: I'm working on my own health, so I'd actually use the thing.

It also scratches a thread I keep coming back to: **building AI for non-English-first
users.** The meal input is language-agnostic — the same instinct behind the
multilingual medicine explainers I shipped at Tata 1mg.

## How it works

- **Onboarding** captures height + weight → computes **BMI** and sets a **daily
  calorie target** with protein/carb/fat macro goals.
- **Free-text meal logging** → the text is sent to the **OpenAI API**, which
  estimates calories + a macro breakdown. Input works in English, Hindi, Mandarin,
  Bengali — any language.
- **Progress view** rolls up intake and macros across **Today / Week / Month.**

## How it was built (the AI-native toolchain)

This is the part I think is interesting — the whole thing was built with a modern
AI-assisted workflow, no traditional hand-coding:

1. **ChatGPT** — to write precise, structured prompts for the design and build steps
2. **A prompt-to-UI design tool** — to generate the interface from those prompts
3. **Cursor (Claude agent)** — to build the front end + back end from the mockups
4. **OpenAI API** — the runtime that estimates each meal's calories/macros
5. **GitHub → Replit** — repo hosting and live deployment

## Honest status — this is a prototype, not production

I'd rather be straight about where this ends than overclaim. What it does **not**
have yet, and why each matters:

- **No per-user auth** — it's currently a single shared instance, so everyone sees
  the same data. (Auth + accounts is the first real-product step.)
- **Local-file persistence only** — meals/profile are stored in a JSON file on the
  server, not a real database; long-term, multi-user tracking isn't truly wired up.
- **No security model** — safe storage of user data is exactly the piece I can't yet
  build myself, and IMO the real unsolved problem with "vibe-coded" apps broadly.
- **No accuracy evals** — I'm trusting the LLM's estimates without measuring how
  right they actually are.

## What's next

The roadmap, in priority order:

1. **Evals for calorie-estimate accuracy** — is the AI actually right? (next up)
2. **Per-user auth + a real database**
3. **A real security model** for user data
4. **Photo-based meal logging**

## What I learned

> *"Coding is easy; understanding what's happening underneath is the hard part."*

I can stand up a working prototype in hours now. But I came away with a clear map of
exactly which pieces a real product still needs a real team for — data persistence,
security, and evaluation — and I'd rather name that boundary than pretend it isn't
there. That clarity is the actual takeaway.

---

## Running it locally

**Prerequisites:** Node.js 18+

**Install** (from the project root):

```bash
npm install
npm install --prefix server
npm install --prefix client
```

**Run locally** — API on port 3001, Vite dev server on port 5173:

```bash
# Terminal 1 — API
npm run dev --prefix server

# Terminal 2 — client
npm run dev --prefix client
```

Or run both from the root with `npm run dev`. Open **http://localhost:5173** — the
Vite dev server proxies `/api/*` to the Express server.

**Data:** meals and profile are stored in `server/data/data.json` (created on first
request).

**AI estimation:** meal nutrition is estimated in
`server/src/services/mealEstimation.js`, which calls the **OpenAI API**
(`gpt-4.1-mini` by default). Configure with environment variables:

- `OPENAI_API_KEY` — required for real estimates
- `OPENAI_MODEL` — optional model override

Without an API key the service returns a clearly-marked fallback estimate so the app
still runs.

**Replit deploy notes:** bind the Vite dev server to `0.0.0.0`, and point the client
at your Replit backend URL (via `VITE_API_URL` or by running API + client as two
Replit services).

---

*Built by [Abhinav Gupta](https://linkedin.com/in/abhinavgupta0809) — PM, consumer AI · CMU MSPM '26*
