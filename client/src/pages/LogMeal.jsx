import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppHeader from '../components/AppHeader.jsx';
import BackButton from '../components/BackButton.jsx';
import LayoutShell from '../components/LayoutShell.jsx';
import { estimateMeal, saveMeal } from '../api/client.js';
import { todayKey } from '../utils/date.js';
import analytics from '../analytics.js';

const emptyEstimate = () => ({
  summary: '',
  calories: '',
  proteinG: '',
  carbsG: '',
  fatG: '',
  confidence: 'Medium',
});

export default function LogMeal() {
  const navigate = useNavigate();
  const [description, setDescription] = useState('');
  const [estimate, setEstimate] = useState(null);
  const [form, setForm] = useState(emptyEstimate());
  const [loadingEst, setLoadingEst] = useState(false);
  const [loadingSave, setLoadingSave] = useState(false);
  const [edited, setEdited] = useState(false);
  const [error, setError] = useState('');
  const canEstimate = Boolean(description.trim()) && !loadingEst;
  const canSave =
    !loadingSave &&
    !!estimate &&
    Number(form.calories) >= 0 &&
    Number(form.proteinG) >= 0 &&
    Number(form.carbsG) >= 0 &&
    Number(form.fatG) >= 0;
  const sourceBadgeLabel = estimate?.source === 'openai' ? 'AI estimate' : 'Demo estimate';

  function applyResult(res) {
    setEstimate(res);
    setForm({
      summary: res.summary || '',
      calories: String(res.calories ?? ''),
      proteinG: String(res.proteinG ?? ''),
      carbsG: String(res.carbsG ?? ''),
      fatG: String(res.fatG ?? ''),
      confidence: res.confidence || 'Medium',
    });
    setEdited(false);
  }

  async function onEstimate() {
    setError('');
    setLoadingEst(true);
    const startedAt = performance.now();
    try {
      const res = await estimateMeal(description);
      applyResult(res);
      analytics.capture('meal_estimated', {
        confidence: res.confidence,
        source: res.source,
        calories: res.calories,
        latency_ms: Math.round(performance.now() - startedAt),
      });
    } catch (e) {
      setError('Could not estimate nutrition right now. Please try again.');
    } finally {
      setLoadingEst(false);
    }
  }

  async function onReestimate() {
    await onEstimate();
  }

  function onFieldChange(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
    setEdited(true);
  }

  async function onSave() {
    setError('');
    setLoadingSave(true);
    try {
      await saveMeal({
        description,
        summary: form.summary,
        calories: Number(form.calories),
        proteinG: Number(form.proteinG),
        carbsG: Number(form.carbsG),
        fatG: Number(form.fatG),
        confidence: form.confidence,
        manuallyEdited: edited,
        date: todayKey(),
      });
      analytics.capture('meal_logged', {
        manuallyEdited: edited,
        calories: Number(form.calories),
        confidence: form.confidence,
      });
      navigate('/dashboard', { state: { flash: 'Meal saved successfully' } });
    } catch (e) {
      setError('Could not save your meal. Please check the values and try again.');
    } finally {
      setLoadingSave(false);
    }
  }

  return (
    <LayoutShell>
      <div className="px-4 pb-8 pt-4">
        <div className="mb-3">
          <BackButton to="/dashboard" />
        </div>
        <AppHeader onSettings={() => alert('Settings are not part of this prototype.')} />

        <h1 className="text-2xl font-bold text-zinc-900">Log your meal</h1>
        <p className="mt-1 text-sm text-zinc-500">Describe your meal in your own words.</p>

        <label className="mt-6 block text-xs font-semibold uppercase tracking-wide text-zinc-400">
          Meal description
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={5}
            placeholder="e.g. Two poached eggs on avocado sourdough toast with a sprinkle of chili flakes..."
            className="mt-2 w-full resize-none rounded-2xl border-0 bg-zinc-100 px-4 py-3 text-sm text-zinc-900 placeholder:text-zinc-400 outline-none ring-1 ring-zinc-200 focus:ring-2 focus:ring-emerald-500"
          />
        </label>

        <button
          type="button"
          onClick={onEstimate}
          disabled={!canEstimate}
          className="mt-4 flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-emerald-600 px-4 py-3.5 text-sm font-semibold text-white shadow transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-emerald-300 disabled:shadow-none"
        >
          {loadingEst ? (
            <span
              aria-hidden
              className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white"
            />
          ) : (
            <span aria-hidden>✦</span>
          )}
          {loadingEst ? 'Estimating…' : 'Estimate nutrition'}
        </button>
        {loadingEst ? (
          <p className="mt-2 text-sm text-zinc-500">Analyzing your meal...</p>
        ) : null}

        {estimate ? (
          <div className="mt-6 rounded-3xl bg-zinc-100 p-4 ring-1 ring-zinc-200">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-base font-semibold text-zinc-900">Estimated nutrition</p>
                <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
                  AI analysis
                </p>
              </div>
              <div className="flex flex-col items-end gap-1">
                <span className="inline-flex items-center rounded-full bg-zinc-200 px-2.5 py-1 text-xs font-medium text-zinc-700">
                  {sourceBadgeLabel}
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-medium text-emerald-800">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
                  Confidence: {form.confidence}
                </span>
              </div>
            </div>

            <div className="mt-4 rounded-2xl bg-white p-4 text-center shadow-sm ring-1 ring-zinc-100">
              <p className="text-sm font-medium text-zinc-700">{form.summary}</p>
              <label className="block text-xs text-zinc-500">Calories</label>
              <input
                type="number"
                min={0}
                value={form.calories}
                onChange={(e) => onFieldChange('calories', e.target.value)}
                className="mt-1 w-full border-0 bg-transparent text-center text-4xl font-bold text-emerald-600 outline-none"
              />
            </div>

            <div className="mt-3 grid grid-cols-2 gap-3">
              {[
                ['proteinG', 'Protein', 'g'],
                ['carbsG', 'Carbs', 'g'],
                ['fatG', 'Fat', 'g'],
              ].map(([key, label, unit]) => (
                <label
                  key={key}
                  className="rounded-2xl bg-white p-3 text-center shadow-sm ring-1 ring-zinc-100"
                >
                  <span className="text-xs font-medium uppercase text-zinc-500">{label}</span>
                  <div className="mt-1 flex items-baseline justify-center gap-1">
                    <input
                      type="number"
                      min={0}
                      value={form[key]}
                      onChange={(e) => onFieldChange(key, e.target.value)}
                      className="w-full border-0 bg-transparent text-center text-lg font-semibold text-zinc-900 outline-none"
                    />
                    <span className="text-xs text-zinc-500">{unit}</span>
                  </div>
                </label>
              ))}
            </div>

            <label className="mt-3 block text-xs font-medium text-zinc-500">
              Summary
              <input
                type="text"
                value={form.summary}
                onChange={(e) => onFieldChange('summary', e.target.value)}
                className="mt-1 w-full rounded-xl border-0 bg-white px-3 py-2 text-sm text-zinc-900 outline-none ring-1 ring-zinc-200"
              />
            </label>

            <p className="mt-3 flex items-start gap-2 text-xs text-zinc-500">
              <span className="mt-0.5 text-zinc-400">ⓘ</span>
              AI estimates may vary based on portion sizes and preparation.
            </p>
          </div>
        ) : null}

        {error ? <p className="mt-3 text-sm text-rose-600">{error}</p> : null}

        {estimate ? (
          <div className="mt-4 space-y-3">
            <button
              type="button"
              onClick={onSave}
              disabled={!canSave}
              className="w-full min-h-12 rounded-full bg-emerald-600 px-4 py-3.5 text-sm font-semibold text-white shadow transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-emerald-300 disabled:shadow-none"
            >
              {loadingSave ? 'Saving…' : 'Save meal'}
            </button>
            <button
              type="button"
              onClick={onReestimate}
              disabled={loadingEst}
              className="w-full min-h-12 rounded-full bg-zinc-200 px-4 py-3.5 text-sm font-semibold text-zinc-800 transition hover:bg-zinc-300 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Re-estimate
            </button>
          </div>
        ) : null}
      </div>
    </LayoutShell>
  );
}
