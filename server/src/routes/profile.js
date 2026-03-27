import { Router } from 'express';
import { readState, writeState } from '../storage/store.js';
import {
  computeBmi,
  bmiCategory,
  computeBmr,
  computeTdee,
  computeDailyCalorieTarget,
  macroTargetsFromCalories,
} from '../services/nutrition.js';
import { assertNumber, assertSex } from '../validation.js';

const router = Router();

function buildProfile(body) {
  const heightCm = assertNumber('heightCm', body.heightCm, { min: 80, max: 250 });
  const weightKg = assertNumber('weightKg', body.weightKg, { min: 30, max: 300 });
  const age = assertNumber('age', body.age, { min: 13, max: 120, integer: true });
  const sex = assertSex(body.sex);
  const targetWeightKg = assertNumber('targetWeightKg', body.targetWeightKg, { min: 30, max: 300 });

  const bmi = computeBmi(heightCm, weightKg);
  const bmiCat = bmiCategory(bmi);
  const bmr = computeBmr(weightKg, heightCm, age, sex);
  const tdee = computeTdee(bmr);
  const dailyCalorieTarget = computeDailyCalorieTarget(tdee, weightKg, targetWeightKg);
  const macros = macroTargetsFromCalories(dailyCalorieTarget, weightKg);

  return {
    id: 'profile-1',
    heightCm,
    weightKg,
    age,
    sex,
    targetWeightKg,
    bmi,
    bmiCategory: bmiCat,
    bmr,
    dailyCalorieTarget,
    proteinTargetG: macros.proteinG,
    carbsTargetG: macros.carbsG,
    fatTargetG: macros.fatG,
  };
}

router.post('/setup', async (req, res, next) => {
  try {
    const state = await readState();
    const profile = buildProfile(req.body);
    state.profile = profile;
    await writeState(state);
    res.status(201).json(profile);
  } catch (e) {
    next(e);
  }
});

router.get('/', async (_req, res, next) => {
  try {
    const state = await readState();
    if (!state.profile) {
      return res.status(404).json({ error: 'No profile' });
    }
    res.json(state.profile);
  } catch (e) {
    next(e);
  }
});

router.patch('/', async (req, res, next) => {
  try {
    const state = await readState();
    if (!state.profile) {
      return res.status(404).json({ error: 'No profile' });
    }
    const prev = state.profile;
    const merged = {
      ...prev,
      ...req.body,
      heightCm: req.body.heightCm != null ? req.body.heightCm : prev.heightCm,
      weightKg: req.body.weightKg != null ? req.body.weightKg : prev.weightKg,
      age: req.body.age != null ? req.body.age : prev.age,
      sex: req.body.sex != null ? req.body.sex : prev.sex,
      targetWeightKg:
        req.body.targetWeightKg != null ? req.body.targetWeightKg : prev.targetWeightKg,
    };
    assertNumber('heightCm', merged.heightCm, { min: 80, max: 250 });
    assertNumber('weightKg', merged.weightKg, { min: 30, max: 300 });
    assertNumber('age', merged.age, { min: 13, max: 120, integer: true });
    assertSex(merged.sex);
    assertNumber('targetWeightKg', merged.targetWeightKg, { min: 30, max: 300 });

    const bmi = computeBmi(merged.heightCm, merged.weightKg);
    const bmr = computeBmr(merged.weightKg, merged.heightCm, merged.age, merged.sex);
    const tdee = computeTdee(bmr);
    const dailyCalorieTarget = computeDailyCalorieTarget(tdee, merged.weightKg, merged.targetWeightKg);
    const macros = macroTargetsFromCalories(dailyCalorieTarget, merged.weightKg);

    state.profile = {
      ...merged,
      id: prev.id,
      bmi,
      bmiCategory: bmiCategory(bmi),
      bmr,
      dailyCalorieTarget,
      proteinTargetG: macros.proteinG,
      carbsTargetG: macros.carbsG,
      fatTargetG: macros.fatG,
    };
    await writeState(state);
    res.json(state.profile);
  } catch (e) {
    next(e);
  }
});

export default router;
