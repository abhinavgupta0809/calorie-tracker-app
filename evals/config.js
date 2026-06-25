import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = __dirname; // evals/
const SERVER_ENV = path.resolve(ROOT, '../server/.env');

// The estimator reads process.env.OPENAI_API_KEY at call time. We don't depend on
// dotenv being resolvable from here, so parse server/.env (gitignored) ourselves.
function loadApiKey() {
  if (process.env.OPENAI_API_KEY) return process.env.OPENAI_API_KEY;
  try {
    const raw = fs.readFileSync(SERVER_ENV, 'utf8');
    for (const line of raw.split('\n')) {
      const m = line.match(/^\s*OPENAI_API_KEY\s*=\s*(.*)\s*$/);
      if (m) {
        let v = m[1].trim();
        if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
          v = v.slice(1, -1);
        }
        process.env.OPENAI_API_KEY = v;
        return v;
      }
    }
  } catch {
    // no server/.env — caller handles the missing-key case
  }
  return null;
}

export const apiKey = loadApiKey();

export const config = {
  model: process.env.OPENAI_MODEL || 'gpt-4.1-mini',
  toleranceBand: 0.2, // ±20% of ground truth counts as "within tolerance"
  consistencyRepeats: 5, // same meal called N times to measure run-to-run spread
  consistencySampleSize: 5, // how many accuracy meals to repeat
  concurrency: 4, // bounded parallelism for model calls
  // gpt-4.1-mini list pricing (USD per 1M tokens) — for an approximate cost line only.
  pricing: { inputPerM: 0.4, outputPerM: 1.6 },
  paths: {
    datasets: path.resolve(ROOT, 'datasets'),
    results: path.resolve(ROOT, 'results'),
  },
};
