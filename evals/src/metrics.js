// Pure metric helpers. Pairs are [predicted, actual]. No external deps.

export function mean(xs) {
  if (!xs.length) return 0;
  return xs.reduce((a, b) => a + b, 0) / xs.length;
}

export function stdev(xs) {
  if (xs.length < 2) return 0;
  const m = mean(xs);
  const variance = xs.reduce((a, b) => a + (b - m) ** 2, 0) / (xs.length - 1);
  return Math.sqrt(variance);
}

// Coefficient of variation (%): stdev / mean. Scale-free spread, good for comparing
// run-to-run or cross-language stability across meals of different calorie sizes.
export function coefficientOfVariation(xs) {
  const m = mean(xs);
  if (m === 0) return 0;
  return (stdev(xs) / m) * 100;
}

// Mean Absolute Error in raw units (kcal or grams).
export function mae(pairs) {
  if (!pairs.length) return 0;
  return mean(pairs.map(([p, a]) => Math.abs(p - a)));
}

// Mean Absolute Percentage Error (%). Skips pairs whose actual is 0.
export function mape(pairs) {
  const valid = pairs.filter(([, a]) => a !== 0);
  if (!valid.length) return 0;
  return mean(valid.map(([p, a]) => Math.abs(p - a) / Math.abs(a))) * 100;
}

// Signed mean percentage error (%). Positive => model over-estimates on average.
export function signedBias(pairs) {
  const valid = pairs.filter(([, a]) => a !== 0);
  if (!valid.length) return 0;
  return mean(valid.map(([p, a]) => (p - a) / a)) * 100;
}

// Share (%) of predictions within ±band of actual.
export function pctWithinTolerance(pairs, band) {
  const valid = pairs.filter(([, a]) => a !== 0);
  if (!valid.length) return 0;
  const hits = valid.filter(([p, a]) => Math.abs(p - a) / Math.abs(a) <= band).length;
  return (hits / valid.length) * 100;
}

export function percentile(xs, p) {
  if (!xs.length) return 0;
  const sorted = [...xs].sort((a, b) => a - b);
  const idx = Math.min(sorted.length - 1, Math.max(0, Math.ceil((p / 100) * sorted.length) - 1));
  return sorted[idx];
}

export function round(n, dp = 1) {
  const f = 10 ** dp;
  return Math.round(n * f) / f;
}
