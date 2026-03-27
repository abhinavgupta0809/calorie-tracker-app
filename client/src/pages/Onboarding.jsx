import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { setupProfile } from '../api/client.js';
import {
  bmiCategory,
  categoryColor,
  computeBmi,
  computeBmr,
  computeTdee,
  computeDailyCalorieTarget,
} from '../utils/nutrition.js';

export default function Onboarding() {
  const navigate = useNavigate();
  const [heightCm, setHeightCm] = useState(175);
  const [weightKg, setWeightKg] = useState(80);
  const [age, setAge] = useState(32);
  const [sex, setSex] = useState('male');
  const [targetWeightKg, setTargetWeightKg] = useState(75);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const bmi = useMemo(() => computeBmi(Number(heightCm) || 0, Number(weightKg) || 0), [
    heightCm,
    weightKg,
  ]);
  const cat = bmiCategory(bmi);
  const previewTarget = useMemo(
    () => {
      const h = Number(heightCm) || 0;
      const w = Number(weightKg) || 0;
      const a = Number(age) || 0;
      const tw = Number(targetWeightKg) || 0;
      const bmr = computeBmr(w, h, a, sex);
      const tdee = computeTdee(bmr);
      return computeDailyCalorieTarget(tdee, w, tw);
    },
    [heightCm, weightKg, age, sex, targetWeightKg]
  );

  async function onSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await setupProfile({
        heightCm: Number(heightCm),
        weightKg: Number(weightKg),
        age: Number(age),
        sex,
        targetWeightKg: Number(targetWeightKg),
      });
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err.message || 'Could not save profile');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-dvh bg-zinc-800 bg-[radial-gradient(circle,_#3f3f46_1px,_transparent_1px)] bg-[length:14px_14px] px-3 py-8">
      <div className="mx-auto max-w-md rounded-[28px] bg-white p-6 shadow-xl">
        <h1 className="text-2xl font-bold leading-tight text-zinc-900">
          Refine your physical{' '}
          <span className="italic text-emerald-600">composition</span>
        </h1>
        <p className="mt-2 text-sm text-zinc-500">
          Your Atelier Health profile begins with precise biological markers.
        </p>

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <label className="block text-xs font-medium text-zinc-500">
              Height (cm)
              <input
                type="number"
                min={80}
                max={250}
                value={heightCm}
                onChange={(e) => setHeightCm(e.target.value)}
                className="mt-1 w-full rounded-2xl border-0 bg-zinc-100 px-3 py-3 text-zinc-900 outline-none ring-1 ring-zinc-200 focus:ring-2 focus:ring-emerald-500"
              />
            </label>
            <label className="block text-xs font-medium text-zinc-500">
              Weight (kg)
              <input
                type="number"
                min={30}
                max={300}
                value={weightKg}
                onChange={(e) => setWeightKg(e.target.value)}
                className="mt-1 w-full rounded-2xl border-0 bg-zinc-100 px-3 py-3 text-zinc-900 outline-none ring-1 ring-zinc-200 focus:ring-2 focus:ring-emerald-500"
              />
            </label>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <label className="block text-xs font-medium text-zinc-500">
              Age
              <input
                type="number"
                min={13}
                max={120}
                value={age}
                onChange={(e) => setAge(e.target.value)}
                className="mt-1 w-full rounded-2xl border-0 bg-zinc-100 px-3 py-3 text-zinc-900 outline-none ring-1 ring-zinc-200 focus:ring-2 focus:ring-emerald-500"
              />
            </label>
            <div>
              <p className="text-xs font-medium text-zinc-500">Sex</p>
              <div className="mt-1 flex rounded-2xl bg-zinc-100 p-1 ring-1 ring-zinc-200">
                <button
                  type="button"
                  onClick={() => setSex('male')}
                  className={`flex-1 rounded-xl py-2.5 text-sm font-medium transition ${
                    sex === 'male' ? 'bg-white text-zinc-900 shadow' : 'text-zinc-500'
                  }`}
                >
                  Male
                </button>
                <button
                  type="button"
                  onClick={() => setSex('female')}
                  className={`flex-1 rounded-xl py-2.5 text-sm font-medium transition ${
                    sex === 'female' ? 'bg-white text-zinc-900 shadow' : 'text-zinc-500'
                  }`}
                >
                  Female
                </button>
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-zinc-50 p-4 ring-1 ring-zinc-100">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
                  Body mass index
                </p>
                <p className="mt-1 text-3xl font-bold text-zinc-900">{bmi != null ? bmi : '—'}</p>
                <p className={`text-sm font-medium ${categoryColor(cat)}`}>{cat}</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-700">
                <svg className="h-7 w-7" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                </svg>
              </div>
            </div>
          </div>

          <label className="relative block text-xs font-medium text-zinc-500">
            Target weight (kg)
            <div className="relative mt-1">
              <input
                type="number"
                min={30}
                max={300}
                value={targetWeightKg}
                onChange={(e) => setTargetWeightKg(e.target.value)}
                className="w-full rounded-2xl border-0 bg-zinc-100 px-3 py-3 pr-16 text-zinc-900 outline-none ring-1 ring-zinc-200 focus:ring-2 focus:ring-emerald-500"
              />
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-emerald-700">
                Goal
              </span>
            </div>
          </label>
          <p className="flex items-center gap-2 text-xs text-emerald-700">
            <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100">
              ↓
            </span>
            Recommended ~0.5kg change per week when adjusting intake
          </p>

          <div className="rounded-2xl bg-zinc-50 p-4 ring-1 ring-zinc-100">
            <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">Daily target</p>
            <div className="mt-2 flex items-center justify-between">
              <p className="text-2xl font-bold text-zinc-900">
                {previewTarget.toLocaleString()} kcal
              </p>
              <div className="relative h-14 w-14">
                <svg className="-rotate-90" viewBox="0 0 36 36" aria-hidden>
                  <circle cx="18" cy="18" r="15" fill="none" stroke="#e4e4e7" strokeWidth="3" />
                  <circle
                    cx="18"
                    cy="18"
                    r="15"
                    fill="none"
                    stroke="#16a34a"
                    strokeWidth="3"
                    strokeDasharray="94"
                    strokeDashoffset="24"
                    strokeLinecap="round"
                  />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-[10px]">🍴</span>
              </div>
            </div>
          </div>

          {error ? <p className="text-sm text-rose-600">{error}</p> : null}

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-emerald-600 py-4 text-sm font-semibold text-white shadow-md transition hover:bg-emerald-700 disabled:opacity-60"
          >
            {loading ? 'Saving…' : 'Get Started'}
            <span aria-hidden>→</span>
          </button>
        </form>
      </div>
    </div>
  );
}
