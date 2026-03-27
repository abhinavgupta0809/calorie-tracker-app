# Atelier Health — Calorie Tracker (prototype)

Mobile-first calorie tracking web app: onboarding, dashboard, meal logging with AI-style estimation (mock), and progress views.

## Prerequisites

- Node.js 18+

## Install

From the project root:

```bash
npm install
npm install --prefix server
npm install --prefix client
```

(Or use `npm run install:all` after `npm install` in the root.)

## Run locally

Terminal 1 — API (port 3001):

```bash
npm run dev --prefix server
```

Terminal 2 — Vite dev server (port 5173):

```bash
npm run dev --prefix client
```

Or run both from the root:

```bash
npm install
npm install --prefix server
npm install --prefix client
npm run dev
```

Open **http://localhost:5173**. The Vite dev server proxies `/api/*` to the Express server.

## Data

Meals and profile are stored in `server/data/data.json` (created on first request).

## Replit

- Set the client `vite` dev server to bind `0.0.0.0` if needed.
- Point the client at your Replit backend URL (replace the Vite proxy with `VITE_API_URL` or similar if you add it), or run API and client as two Replit services.

## Replace mock meal AI

Edit `server/src/services/mealEstimation.js` and call Claude/OpenAI inside `estimateMealNutrition`, returning the same shape: `summary`, `calories`, `proteinG`, `carbsG`, `fatG`, `confidence`.
