import fs from 'fs';
import path from 'path';
import { apiKey, config } from '../config.js';
import * as M from './metrics.js';
import { writeResults, printSummary } from './report.js';
// Import the REAL product function so the eval exercises the actual path:
// prompt, structured output, clamps, and fallback behavior all included.
import { estimateMealNutrition } from '../../server/src/services/mealEstimation.js';

function loadJsonl(name) {
  const file = path.join(config.paths.datasets, name);
  return fs
    .readFileSync(file, 'utf8')
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)
    .map((l) => JSON.parse(l));
}

// Bounded-concurrency async map.
async function mapPool(items, concurrency, fn) {
  const results = new Array(items.length);
  let next = 0;
  const workers = Array.from({ length: Math.min(concurrency, items.length) || 1 }, async () => {
    while (next < items.length) {
      const idx = next++;
      results[idx] = await fn(items[idx], idx);
    }
  });
  await Promise.all(workers);
  return results;
}

// Every model call goes through here so the operational suite sees all of them.
const callLog = [];
async function timedEstimate(description) {
  const start = performance.now();
  let result = null;
  let threw = null;
  try {
    result = await estimateMealNutrition(description);
  } catch (e) {
    threw = e;
  }
  const latencyMs = performance.now() - start;
  if (result) {
    callLog.push({ latencyMs, source: result.source, confidence: result.confidence });
  }
  return { result, latencyMs, threw };
}

const ACCURACY_FIELDS = [
  ['cal', 'calories'],
  ['protein', 'proteinG'],
  ['carbs', 'carbsG'],
  ['fat', 'fatG'],
];

async function runAccuracy(dataset) {
  const rows = await mapPool(dataset, config.concurrency, async (m) => {
    const { result } = await timedEstimate(m.description);
    return {
      id: m.id,
      description: m.description,
      tags: m.tags,
      gt: m.ground_truth,
      pred: result,
      confidence: result.confidence,
      source: result.source,
    };
  });

  const perField = {};
  for (const [gtKey, predKey] of ACCURACY_FIELDS) {
    const pairs = rows.map((r) => [r.pred[predKey], r.gt[gtKey]]);
    perField[gtKey] = {
      mae: M.round(M.mae(pairs)),
      mape: M.round(M.mape(pairs)),
      bias: M.round(M.signedBias(pairs)),
      withinTolerance: M.round(M.pctWithinTolerance(pairs, config.toleranceBand)),
    };
  }
  return { rows, perField, n: rows.length };
}

function runCalibration(accuracyRows) {
  const buckets = { Low: [], Medium: [], High: [] };
  for (const r of accuracyRows) {
    if (buckets[r.confidence]) buckets[r.confidence].push(r);
  }
  const out = {};
  for (const [bucket, rs] of Object.entries(buckets)) {
    const pairs = rs.map((r) => [r.pred.calories, r.gt.cal]);
    out[bucket] = {
      n: rs.length,
      caloriesMape: rs.length ? M.round(M.mape(pairs)) : null,
      withinTolerance: rs.length ? M.round(M.pctWithinTolerance(pairs, config.toleranceBand)) : null,
    };
  }
  return out;
}

async function runConsistency(accuracyDataset) {
  const sample = accuracyDataset.slice(0, config.consistencySampleSize);
  const rows = [];
  for (const m of sample) {
    const reps = await mapPool(
      Array.from({ length: config.consistencyRepeats }, (_, k) => k),
      config.concurrency,
      async () => {
        const { result } = await timedEstimate(m.description);
        return result.calories;
      }
    );
    rows.push({
      id: m.id,
      description: m.description,
      calories: reps,
      mean: M.round(M.mean(reps), 0),
      cov: M.round(M.coefficientOfVariation(reps)),
    });
  }
  return {
    rows,
    repeats: config.consistencyRepeats,
    averageCoV: M.round(M.mean(rows.map((r) => r.cov))),
  };
}

async function runMultilingual(dataset) {
  const groups = {};
  for (const m of dataset) (groups[m.group_id] ||= []).push(m);

  const rows = [];
  for (const [groupId, items] of Object.entries(groups)) {
    const byLang = await mapPool(items, config.concurrency, async (m) => {
      const { result } = await timedEstimate(m.description);
      return { lang: m.lang, description: m.description, calories: result.calories, confidence: result.confidence };
    });
    const cals = byLang.map((x) => x.calories);
    rows.push({
      groupId,
      langs: byLang,
      meanCalories: M.round(M.mean(cals), 0),
      cov: M.round(M.coefficientOfVariation(cals)),
    });
  }
  return { rows, averageCoV: M.round(M.mean(rows.map((r) => r.cov))) };
}

async function runRobustness(dataset) {
  const rows = await mapPool(dataset, config.concurrency, async (m) => {
    const { result, threw } = await timedEstimate(m.description);
    const checks = [];
    const add = (name, pass) => checks.push({ name, pass });

    if (m.expectation === 'throws_400') {
      add('throws_400', Boolean(threw) && threw.status === 400);
    } else {
      add('no_crash', !threw && Boolean(result));
      if (result) {
        add('calories_in_clamp', result.calories >= 50 && result.calories <= 2500);
        add('valid_confidence', ['Low', 'Medium', 'High'].includes(result.confidence));
        add('valid_source', ['openai', 'fallback'].includes(result.source));
        if (m.expectation === 'clamp_max') add('clamped_to_max', result.calories === 2500);
        if (m.expectation === 'clamp_min') add('clamped_to_min', result.calories === 50);
        if (m.expectation === 'resists_injection') {
          add('not_zeroed', result.calories >= 50);
          add('summary_not_hijacked', !/hacked/i.test(result.summary || ''));
        }
      }
    }

    return {
      id: m.id,
      description: m.description,
      expectation: m.expectation,
      result: result || null,
      error: threw ? { message: threw.message, status: threw.status } : null,
      checks,
      pass: checks.every((c) => c.pass),
    };
  });
  return { rows, passed: rows.filter((r) => r.pass).length, total: rows.length };
}

function runOperational() {
  const latencies = callLog.map((c) => c.latencyMs);
  const fallbacks = callLog.filter((c) => c.source === 'fallback').length;
  // Approximate cost only: the small structured prompt is ~70 input + ~60 output tokens.
  const approxInputTokens = 70 * callLog.length;
  const approxOutputTokens = 60 * callLog.length;
  const approxCostUsd =
    (approxInputTokens / 1e6) * config.pricing.inputPerM +
    (approxOutputTokens / 1e6) * config.pricing.outputPerM;
  return {
    totalCalls: callLog.length,
    fallbackRatePct: callLog.length ? M.round((fallbacks / callLog.length) * 100, 2) : 0,
    latencyMs: {
      p50: M.round(M.percentile(latencies, 50), 0),
      p95: M.round(M.percentile(latencies, 95), 0),
      mean: M.round(M.mean(latencies), 0),
    },
    approxCostUsd: M.round(approxCostUsd, 4),
    approxCostPerEstimateUsd: callLog.length ? M.round(approxCostUsd / callLog.length, 5) : 0,
  };
}

async function main() {
  if (!apiKey) {
    console.error('\n[evals] No OPENAI_API_KEY found.');
    console.error('Add it to server/.env (OPENAI_API_KEY=sk-...) or export OPENAI_API_KEY, then re-run.');
    console.error('Without a key the estimator returns its 999/99/99/99 fallback and metrics are meaningless.\n');
    process.exit(1);
  }

  const accuracyDs = loadJsonl('accuracy.jsonl');
  const multilingualDs = loadJsonl('multilingual.jsonl');
  const robustnessDs = loadJsonl('robustness.jsonl');

  console.log(`[evals] model=${config.model}  tolerance=±${config.toleranceBand * 100}%`);
  console.log('[evals] accuracy…');
  const accuracy = await runAccuracy(accuracyDs);
  console.log('[evals] consistency…');
  const consistency = await runConsistency(accuracyDs);
  console.log('[evals] multilingual…');
  const multilingual = await runMultilingual(multilingualDs);
  console.log('[evals] calibration…');
  const calibration = runCalibration(accuracy.rows);
  console.log('[evals] robustness…');
  const robustness = await runRobustness(robustnessDs);
  const operational = runOperational();

  const results = {
    meta: {
      timestamp: new Date().toISOString(),
      model: config.model,
      toleranceBand: config.toleranceBand,
      consistencyRepeats: config.consistencyRepeats,
    },
    accuracy,
    consistency,
    multilingual,
    calibration,
    robustness,
    operational,
  };

  const { jsonPath, mdPath } = writeResults(results);
  printSummary(results);
  console.log(`[evals] wrote ${path.relative(process.cwd(), jsonPath)}`);
  console.log(`[evals] wrote ${path.relative(process.cwd(), mdPath)}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
