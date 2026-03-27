/**
 * Deterministic BMI, BMR, category, daily target, macro targets.
 * BMR: Mifflin–St Jeor. Activity multiplier: 1.375 (lightly active) for TDEE baseline.
 */

export function computeBmi(heightCm, weightKg) {
  const h = heightCm / 100;
  if (h <= 0) return null;
  const bmi = weightKg / (h * h);
  return Math.round(bmi * 10) / 10;
}

export function bmiCategory(bmi) {
  if (bmi == null || Number.isNaN(bmi)) return 'Unknown';
  if (bmi < 18.5) return 'Underweight';
  if (bmi < 25) return 'Normal';
  if (bmi < 30) return 'Overweight';
  return 'Obese';
}

export function computeBmr(weightKg, heightCm, age, sex) {
  const s = sex === 'female' ? -161 : 5;
  const bmr = 10 * weightKg + 6.25 * heightCm - 5 * age + s;
  return Math.round(bmr);
}

const ACTIVITY_FACTOR = 1.375;

export function computeTdee(bmr) {
  return Math.round(bmr * ACTIVITY_FACTOR);
}

/**
 * Adjust TDEE toward target weight: simple deficit/surplus caps for prototype.
 */
export function computeDailyCalorieTarget(tdee, weightKg, targetWeightKg) {
  const diff = weightKg - targetWeightKg;
  if (Math.abs(diff) < 0.5) return tdee;
  if (diff > 0) {
    const deficit = Math.min(750, Math.max(300, Math.round(diff * 25)));
    return Math.max(1200, tdee - deficit);
  }
  const surplus = Math.min(500, Math.max(200, Math.round(-diff * 20)));
  return tdee + surplus;
}

export function macroTargetsFromCalories(dailyCal, weightKg) {
  const proteinFromWeight = Math.round(weightKg * 1.6);
  const proteinFromCal = Math.round((dailyCal * 0.28) / 4);
  const proteinG = Math.max(proteinFromWeight, proteinFromCal);
  const carbsG = Math.round((dailyCal * 0.42) / 4);
  const fatG = Math.round((dailyCal * 0.3) / 9);
  return { proteinG, carbsG, fatG };
}

export function sumMacros(meals) {
  return meals.reduce(
    (acc, m) => {
      acc.calories += m.calories || 0;
      acc.proteinG += m.proteinG || 0;
      acc.carbsG += m.carbsG || 0;
      acc.fatG += m.fatG || 0;
      return acc;
    },
    { calories: 0, proteinG: 0, carbsG: 0, fatG: 0 }
  );
}

export function dateKeyFromIso(iso) {
  const d = new Date(iso);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function todayKey() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function parseDateKey(key) {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d);
}
