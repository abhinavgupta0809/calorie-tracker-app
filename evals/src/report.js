import fs from 'fs';
import path from 'path';
import { config } from '../config.js';

export function writeResults(results) {
  fs.mkdirSync(config.paths.results, { recursive: true });
  const stamp = results.meta.timestamp.replace(/[:.]/g, '-');
  const jsonPath = path.join(config.paths.results, `${stamp}.json`);
  fs.writeFileSync(jsonPath, JSON.stringify(results, null, 2), 'utf8');
  const mdPath = path.join(config.paths.results, `${stamp}.md`);
  fs.writeFileSync(mdPath, buildMarkdown(results), 'utf8');
  return { jsonPath, mdPath };
}

export function buildMarkdown(r) {
  const a = r.accuracy.perField;
  const lines = [];
  lines.push(`# Eval run — ${r.meta.timestamp}`);
  lines.push('');
  lines.push(`- Model: \`${r.meta.model}\``);
  lines.push(`- Tolerance band: ±${r.meta.toleranceBand * 100}%`);
  lines.push(`- Total model calls: ${r.operational.totalCalls}`);
  lines.push('');

  lines.push('## Accuracy (vs reference labels)');
  lines.push(`N = ${r.accuracy.n} labeled meals`);
  lines.push('');
  lines.push('| Field | MAE | MAPE | Signed bias | % within ±20% |');
  lines.push('| --- | --- | --- | --- | --- |');
  for (const [key, label] of [['cal', 'Calories (kcal)'], ['protein', 'Protein (g)'], ['carbs', 'Carbs (g)'], ['fat', 'Fat (g)']]) {
    const f = a[key];
    lines.push(`| ${label} | ${f.mae} | ${f.mape}% | ${f.bias > 0 ? '+' : ''}${f.bias}% | ${f.withinTolerance}% |`);
  }
  lines.push('');

  lines.push('## Consistency (test–retest)');
  lines.push(`Each meal called ${r.consistency.repeats}× at temperature 0.2. Average calorie CoV: **${r.consistency.averageCoV}%**`);
  lines.push('');
  lines.push('| Meal | Mean kcal | CoV |');
  lines.push('| --- | --- | --- |');
  for (const row of r.consistency.rows) {
    lines.push(`| ${truncate(row.description, 40)} | ${row.mean} | ${row.cov}% |`);
  }
  lines.push('');

  lines.push('## Multilingual invariance');
  lines.push(`Same meal across languages (no labels). Average cross-language calorie CoV: **${r.multilingual.averageCoV}%**`);
  lines.push('');
  lines.push('| Group | Mean kcal | CoV | Per-language kcal |');
  lines.push('| --- | --- | --- | --- |');
  for (const row of r.multilingual.rows) {
    const per = row.langs.map((l) => `${l.lang}:${l.calories}`).join(', ');
    lines.push(`| ${row.groupId} | ${row.meanCalories} | ${row.cov}% | ${per} |`);
  }
  lines.push('');

  lines.push('## Confidence calibration');
  lines.push('Does a higher self-reported confidence actually mean lower error?');
  lines.push('');
  lines.push('| Confidence | N | Calorie MAPE | % within ±20% |');
  lines.push('| --- | --- | --- | --- |');
  for (const b of ['High', 'Medium', 'Low']) {
    const c = r.calibration[b];
    lines.push(`| ${b} | ${c.n} | ${c.caloriesMape == null ? 'n/a' : c.caloriesMape + '%'} | ${c.withinTolerance == null ? 'n/a' : c.withinTolerance + '%'} |`);
  }
  lines.push('');

  lines.push('## Robustness / failure modes');
  lines.push(`Passed ${r.robustness.passed}/${r.robustness.total} invariant checks.`);
  lines.push('');
  lines.push('| Case | Expectation | Pass | Output |');
  lines.push('| --- | --- | --- | --- |');
  for (const row of r.robustness.rows) {
    const out = row.error ? `error: ${row.error.message}` : `${row.result.calories} kcal / ${row.result.confidence} / ${row.result.source}`;
    lines.push(`| ${truncate(row.description, 36)} | ${row.expectation} | ${row.pass ? '✅' : '❌'} | ${out} |`);
  }
  lines.push('');

  lines.push('## Operational');
  lines.push(`- Fallback rate: ${r.operational.fallbackRatePct}%`);
  lines.push(`- Latency: p50 ${r.operational.latencyMs.p50} ms, p95 ${r.operational.latencyMs.p95} ms, mean ${r.operational.latencyMs.mean} ms`);
  lines.push(`- Approx cost: ~$${r.operational.approxCostPerEstimateUsd}/estimate (total ~$${r.operational.approxCostUsd} for this run)`);
  lines.push('');
  return lines.join('\n');
}

function truncate(s, n) {
  return s.length > n ? s.slice(0, n - 1) + '…' : s;
}

export function printSummary(r) {
  const a = r.accuracy.perField;
  console.log('\n========== EVAL SUMMARY ==========');
  console.log(`Model: ${r.meta.model}   Calls: ${r.operational.totalCalls}`);
  console.log('--- Accuracy (vs reference labels) ---');
  console.log(`Calories : MAPE ${a.cal.mape}%  bias ${a.cal.bias > 0 ? '+' : ''}${a.cal.bias}%  within±20% ${a.cal.withinTolerance}%`);
  console.log(`Protein  : MAPE ${a.protein.mape}%  within±20% ${a.protein.withinTolerance}%`);
  console.log(`Carbs    : MAPE ${a.carbs.mape}%  within±20% ${a.carbs.withinTolerance}%`);
  console.log(`Fat      : MAPE ${a.fat.mape}%  within±20% ${a.fat.withinTolerance}%`);
  console.log(`Consistency  : avg calorie CoV ${r.consistency.averageCoV}% over ${r.consistency.repeats} repeats`);
  console.log(`Multilingual : avg cross-language CoV ${r.multilingual.averageCoV}%`);
  console.log('Calibration  : ' + ['High', 'Medium', 'Low'].map((b) => `${b} ${r.calibration[b].withinTolerance == null ? 'n/a' : r.calibration[b].withinTolerance + '%'}`).join('  '));
  console.log(`Robustness   : ${r.robustness.passed}/${r.robustness.total} checks passed`);
  console.log(`Operational  : fallback ${r.operational.fallbackRatePct}%  latency p50 ${r.operational.latencyMs.p50}ms p95 ${r.operational.latencyMs.p95}ms`);
  console.log('==================================\n');
}
