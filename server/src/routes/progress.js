import { Router } from 'express';
import { readState } from '../storage/store.js';
import { sumMacros, parseDateKey } from '../services/nutrition.js';
import { assertDateKey } from '../validation.js';

const router = Router();

function mealsForDate(meals, dateKey) {
  return meals.filter((m) => m.date === dateKey);
}

function startOfWeekMonday(d) {
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  const x = new Date(d);
  x.setDate(d.getDate() + diff);
  x.setHours(0, 0, 0, 0);
  return x;
}

function addDays(d, n) {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}

function formatKey(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

router.get('/daily', async (req, res, next) => {
  try {
    const date = req.query.date ? assertDateKey(req.query.date) : null;
    if (!date) {
      const e = new Error('date query required (YYYY-MM-DD)');
      e.status = 400;
      throw e;
    }
    const state = await readState();
    if (!state.profile) {
      return res.status(404).json({ error: 'No profile' });
    }
    const dayMeals = mealsForDate(state.meals, date);
    const totals = sumMacros(dayMeals);
    const targets = {
      calories: state.profile.dailyCalorieTarget,
      proteinG: state.profile.proteinTargetG,
      carbsG: state.profile.carbsTargetG,
      fatG: state.profile.fatTargetG,
    };
    res.json({
      date,
      totals,
      targets,
      mealCount: dayMeals.length,
    });
  } catch (e) {
    next(e);
  }
});

router.get('/weekly', async (_req, res, next) => {
  try {
    const state = await readState();
    if (!state.profile) {
      return res.status(404).json({ error: 'No profile' });
    }
    const today = new Date();
    const start = startOfWeekMonday(today);
    const days = [];
    for (let i = 0; i < 7; i += 1) {
      const d = addDays(start, i);
      const key = formatKey(d);
      const dayMeals = mealsForDate(state.meals, key);
      const totals = sumMacros(dayMeals);
      const label = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'][i];
      days.push({
        date: key,
        label,
        calories: totals.calories,
      });
    }
    const sumCal = days.reduce((a, d) => a + d.calories, 0);
    const avgDaily = Math.round(sumCal / 7);
    res.json({
      weekStart: formatKey(start),
      days,
      averageDailyCalories: avgDaily,
      targetCalories: state.profile.dailyCalorieTarget,
    });
  } catch (e) {
    next(e);
  }
});

router.get('/monthly', async (_req, res, next) => {
  try {
    const state = await readState();
    if (!state.profile) {
      return res.status(404).json({ error: 'No profile' });
    }
    const now = new Date();
    const y = now.getFullYear();
    const m = now.getMonth();
    const start = new Date(y, m, 1);
    const end = new Date(y, m + 1, 0);
    const monthMeals = state.meals.filter((meal) => {
      const dk = meal.date;
      const d = parseDateKey(dk);
      return d >= start && d <= end;
    });
    const totals = sumMacros(monthMeals);
    const daysInMonth = end.getDate();
    const avgDaily =
      daysInMonth > 0 ? Math.round(totals.calories / daysInMonth) : 0;

    const prevMonth = m === 0 ? 11 : m - 1;
    const prevYear = m === 0 ? y - 1 : y;
    const prevStart = new Date(prevYear, prevMonth, 1);
    const prevEnd = new Date(prevYear, prevMonth + 1, 0);
    const prevMeals = state.meals.filter((meal) => {
      const d = parseDateKey(meal.date);
      return d >= prevStart && d <= prevEnd;
    });
    const prevTotals = sumMacros(prevMeals);
    const prevAvg =
      prevEnd.getDate() > 0
        ? Math.round(prevTotals.calories / prevEnd.getDate())
        : 0;

    let trend = 'steady';
    if (avgDaily > prevAvg + 50) trend = 'up';
    else if (avgDaily < prevAvg - 50) trend = 'down';

    const proteinHits = monthMeals.filter(
      (x) => x.proteinG >= (state.profile.proteinTargetG || 0) * 0.9
    ).length;

    const insight = `Average intake this month is ${avgDaily} kcal/day vs ${prevAvg} kcal/day last month. You hit ~90% of your protein target on ${proteinHits} logged days.`;

    res.json({
      year: y,
      month: m + 1,
      monthLabel: now.toLocaleString('en-US', { month: 'long', year: 'numeric' }),
      totalCalories: totals.calories,
      averageDailyCalories: avgDaily,
      previousMonthAverageDailyCalories: prevAvg,
      trend,
      daysLogged: new Set(monthMeals.map((x) => x.date)).size,
      insight,
    });
  } catch (e) {
    next(e);
  }
});

export default router;
