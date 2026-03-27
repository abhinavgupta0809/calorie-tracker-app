/** Client-side preview math for onboarding (matches server). */

export function computeBmi(heightCm, weightKg) {
  const h = heightCm / 100;
  if (!h) return null;
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

export function categoryColor(cat) {
  if (cat === 'Overweight' || cat === 'Obese') return 'text-rose-500';
  if (cat === 'Underweight') return 'text-amber-600';
  return 'text-emerald-600';
}

export function computeBmr(weightKg, heightCm, age, sex) {
  const s = sex === 'female' ? -161 : 5;
  return Math.round(10 * weightKg + 6.25 * heightCm - 5 * age + s);
}

export function computeTdee(bmr) {
  return Math.round(bmr * 1.375);
}

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
