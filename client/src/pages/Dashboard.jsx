import { useCallback, useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import AppHeader from '../components/AppHeader.jsx';
import LayoutShell from '../components/LayoutShell.jsx';
import CalorieRingCard from '../components/CalorieRingCard.jsx';
import MacroSummary from '../components/MacroSummary.jsx';
import MealList from '../components/MealList.jsx';
import {
  deleteMeal,
  getMeals,
  patchProfile,
  getProfile,
  getProgressDaily,
} from '../api/client.js';
import { formatHeaderDate, todayKey } from '../utils/date.js';

export default function Dashboard() {
  const location = useLocation();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [daily, setDaily] = useState(null);
  const [meals, setMeals] = useState([]);
  const [err, setErr] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [weightInput, setWeightInput] = useState('');
  const [updatingWeight, setUpdatingWeight] = useState(false);

  const date = todayKey();

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const [p, prog, m] = await Promise.all([
        getProfile(),
        getProgressDaily(date),
        getMeals(date),
      ]);
      setProfile(p);
      setDaily(prog);
      setMeals(m.meals || []);
      setWeightInput(String(p?.weightKg ?? ''));
      setErr('');
    } finally {
      setLoading(false);
    }
  }, [date]);

  useEffect(() => {
    refresh().catch((e) => setErr(e.message));
  }, [refresh]);

  useEffect(() => {
    const flash = location.state?.flash;
    if (!flash) return;
    setSuccessMessage(flash);
    navigate(location.pathname, { replace: true, state: {} });
    const id = setTimeout(() => setSuccessMessage(''), 1800);
    return () => clearTimeout(id);
  }, [location.pathname, location.state, navigate]);

  async function onDelete(id) {
    try {
      await deleteMeal(id);
      await refresh();
    } catch (e) {
      setErr(e.message);
    }
  }

  async function onUpdateWeight(e) {
    e.preventDefault();
    await submitWeightUpdate();
  }

  function parseWeightInput(value) {
    const raw = String(value ?? '').trim();
    if (!raw) {
      return { error: 'Weight is required.' };
    }
    const nextWeight = Number(raw);
    if (Number.isNaN(nextWeight) || nextWeight < 30 || nextWeight > 300) {
      return { error: 'Please enter a valid weight between 30kg and 300kg.' };
    }
    return { value: nextWeight };
  }

  async function submitWeightUpdate() {
    if (updatingWeight) return;
    const parsed = parseWeightInput(weightInput);
    if (parsed.error) {
      setErr(parsed.error);
      return;
    }
    const nextWeight = parsed.value;
    if (Number(profile?.weightKg) === nextWeight) return;

    setErr('');
    setUpdatingWeight(true);
    try {
      await patchProfile({ weightKg: nextWeight });
      await refresh();
      setSuccessMessage('Weight updated successfully');
      setTimeout(() => setSuccessMessage(''), 1500);
    } catch (e2) {
      setErr(e2.message || 'Could not update weight.');
    } finally {
      setUpdatingWeight(false);
    }
  }

  function onWeightBlur() {
    submitWeightUpdate();
  }

  const parsedWeight = parseWeightInput(weightInput);
  const weightInvalid = Boolean(parsedWeight.error);

  const consumed = daily?.totals?.calories ?? 0;
  const target = daily?.targets?.calories ?? profile?.dailyCalorieTarget ?? 2000;
  const remainingCalories = target - consumed;
  let insight = '';
  if (remainingCalories > 0) {
    insight = `You're off to a great start — you still have ${Math.round(remainingCalories)} kcal left today`;
  } else if (remainingCalories < 0) {
    insight = `You've gone over by ${Math.round(Math.abs(remainingCalories))} kcal today — consider lighter meals next`;
  } else {
    insight = "Perfect — you've hit your goal today";
  }

  const headline =
    consumed <= target * 0.95 ? "You're on track today" : "Keep an eye on intake today";

  return (
    <LayoutShell>
      <div className="px-4 pt-4">
        <AppHeader onSettings={() => alert('Settings are not part of this prototype.')} />

        <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
          {formatHeaderDate()}
        </p>
        <h1 className="mt-1 text-2xl font-bold text-zinc-900">{headline}</h1>

        {err ? <p className="mt-2 text-sm text-rose-600">{err}</p> : null}
        {successMessage ? (
          <p className="mt-2 text-sm font-medium text-emerald-700">{successMessage}</p>
        ) : null}

        <div className="mt-4 rounded-2xl bg-white p-4 ring-1 ring-zinc-100">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">Profile</p>
              <p className="mt-1 text-sm font-medium text-zinc-800">
                BMI: {profile?.bmi ?? '—'}{' '}
                <span className="text-zinc-500">({profile?.bmiCategory || 'Unknown'})</span>
              </p>
              <p className="text-sm text-zinc-600">
                Daily target: {(profile?.dailyCalorieTarget ?? target).toLocaleString()} kcal
              </p>
            </div>
            <form onSubmit={onUpdateWeight} className="flex items-center gap-2">
              <input
                type="number"
                min={30}
                max={300}
                step="0.1"
                value={weightInput}
                onChange={(e) => setWeightInput(e.target.value)}
                onBlur={onWeightBlur}
                className="w-24 rounded-xl border-0 bg-zinc-100 px-3 py-2 text-sm text-zinc-900 outline-none ring-1 ring-zinc-200 focus:ring-2 focus:ring-emerald-500"
                aria-label="Update weight in kilograms"
              />
              <button
                type="submit"
                disabled={updatingWeight || weightInvalid}
                className="min-h-10 rounded-xl bg-emerald-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-emerald-300"
              >
                {updatingWeight ? 'Saving…' : 'Update'}
              </button>
            </form>
          </div>
        </div>

        {loading ? (
          <div className="mt-4 space-y-4">
            <p className="text-sm text-zinc-500">Loading your dashboard...</p>
            <div className="h-52 animate-pulse rounded-3xl bg-white ring-1 ring-zinc-100" />
            <div className="h-44 animate-pulse rounded-3xl bg-white ring-1 ring-zinc-100" />
            <div className="h-24 animate-pulse rounded-3xl bg-white ring-1 ring-zinc-100" />
          </div>
        ) : (
          <div className="mt-4 space-y-6">
            <CalorieRingCard consumed={consumed} target={target} insight={insight} />

            <MacroSummary
              title="Nutritional Focus"
              protein={{
                current: daily?.totals?.proteinG ?? 0,
                target: daily?.targets?.proteinG ?? profile?.proteinTargetG ?? 140,
              }}
              carbs={{
                current: daily?.totals?.carbsG ?? 0,
                target: daily?.targets?.carbsG ?? profile?.carbsTargetG ?? 210,
              }}
              fat={{
                current: daily?.totals?.fatG ?? 0,
                target: daily?.targets?.fatG ?? profile?.fatTargetG ?? 60,
              }}
            />

            <div>
              <h2 className="mb-3 text-base font-semibold text-zinc-900">Today&apos;s log</h2>
              <MealList meals={meals} onDelete={onDelete} />
            </div>
          </div>
        )}

        <div className="pointer-events-none fixed bottom-20 inset-x-0 z-30">
          <div className="pointer-events-auto mx-auto flex w-full max-w-md justify-end px-4">
            <Link
              to="/log-meal"
              className="inline-flex min-h-12 items-center gap-2 rounded-full bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-lg ring-1 ring-emerald-700/20 transition hover:bg-emerald-700"
            >
              + Log meal
            </Link>
          </div>
        </div>
      </div>
    </LayoutShell>
  );
}
