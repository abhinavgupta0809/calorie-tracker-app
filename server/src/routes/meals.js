import { Router } from 'express';
import { readState, writeState } from '../storage/store.js';
import { estimateMealNutrition } from '../services/mealEstimation.js';
import { assertNumber, assertDateKey } from '../validation.js';
import { dateKeyFromIso } from '../services/nutrition.js';

const router = Router();

router.post('/estimate', async (req, res, next) => {
  try {
    const { description } = req.body || {};
    const result = await estimateMealNutrition(description);
    res.json(result);
  } catch (e) {
    next(e);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const state = await readState(req.userId);
    if (!state.profile) {
      return res.status(400).json({ error: 'Profile required' });
    }
    const b = req.body || {};
    const description = typeof b.description === 'string' ? b.description : '';
    const summary = typeof b.summary === 'string' ? b.summary : '';
    const calories = assertNumber('calories', b.calories, { min: 0, max: 10000 });
    const proteinG = assertNumber('proteinG', b.proteinG, { min: 0, max: 500 });
    const carbsG = assertNumber('carbsG', b.carbsG, { min: 0, max: 1000 });
    const fatG = assertNumber('fatG', b.fatG, { min: 0, max: 500 });
    const confidence = typeof b.confidence === 'string' ? b.confidence : 'Medium';
    const manuallyEdited = Boolean(b.manuallyEdited);

    const timestamp = b.timestamp
      ? new Date(b.timestamp).toISOString()
      : new Date().toISOString();
    const date = b.date ? assertDateKey(b.date) : dateKeyFromIso(timestamp);

    const meal = {
      id: `meal-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      description,
      summary: summary || description.slice(0, 80),
      calories: Math.round(calories),
      proteinG: Math.round(proteinG),
      carbsG: Math.round(carbsG),
      fatG: Math.round(fatG),
      confidence,
      manuallyEdited,
      timestamp,
      loggedAt: timestamp,
      date,
    };
    state.meals.push(meal);
    await writeState(req.userId, state);
    res.status(201).json(meal);
  } catch (e) {
    next(e);
  }
});

router.get('/', async (req, res, next) => {
  try {
    const date = req.query.date ? assertDateKey(req.query.date) : null;
    const state = await readState(req.userId);
    let meals = state.meals || [];
    if (date) {
      meals = meals.filter((m) => m.date === date);
    }
    meals.sort((a, b) => new Date(b.loggedAt) - new Date(a.loggedAt));
    res.json({ meals });
  } catch (e) {
    next(e);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const state = await readState(req.userId);
    const idx = state.meals.findIndex((m) => m.id === id);
    if (idx === -1) {
      return res.status(404).json({ error: 'Meal not found' });
    }
    const [removed] = state.meals.splice(idx, 1);
    await writeState(req.userId, state);
    res.json({ ok: true, meal: removed });
  } catch (e) {
    next(e);
  }
});

export default router;
