import { useEffect, useState } from 'react';
import AppHeader from '../components/AppHeader.jsx';
import BackButton from '../components/BackButton.jsx';
import LayoutShell from '../components/LayoutShell.jsx';
import MacroSummary from '../components/MacroSummary.jsx';
import ProgressCard from '../components/ProgressCard.jsx';
import { getProgressDaily, getProgressMonthly, getProgressWeekly } from '../api/client.js';
import { todayKey } from '../utils/date.js';

export default function Progress() {
  const [tab, setTab] = useState('today');
  const [daily, setDaily] = useState(null);
  const [weekly, setWeekly] = useState(null);
  const [monthly, setMonthly] = useState(null);
  const [err, setErr] = useState('');

  const date = todayKey();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [d, w, m] = await Promise.all([
          getProgressDaily(date),
          getProgressWeekly(),
          getProgressMonthly(),
        ]);
        if (!cancelled) {
          setDaily(d);
          setWeekly(w);
          setMonthly(m);
        }
      } catch (e) {
        if (!cancelled) setErr(e.message);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [date]);

  const pct =
    daily && daily.targets?.calories
      ? Math.round((daily.totals.calories / daily.targets.calories) * 100)
      : 0;

  const maxBar = weekly?.days?.length
    ? Math.max(...weekly.days.map((x) => x.calories), 1)
    : 1;

  return (
    <LayoutShell>
      <div className="px-4 pb-8 pt-4">
        <div className="mb-3">
          <BackButton to="/dashboard" />
        </div>
        <AppHeader onSettings={() => alert('Settings are not part of this prototype.')} />

        <h1 className="text-2xl font-bold text-zinc-900">Your progress</h1>
        <p className="mt-1 text-sm text-zinc-500">A curated view of your nutritional journey.</p>

        <div className="mt-5 flex rounded-full bg-zinc-200 p-1">
          {[
            ['today', 'Today'],
            ['week', 'Week'],
            ['month', 'Month'],
          ].map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              className={`flex-1 rounded-full py-2 text-sm font-semibold transition ${
                tab === id ? 'bg-emerald-700 text-white shadow' : 'text-zinc-600'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {err ? <p className="mt-3 text-sm text-rose-600">{err}</p> : null}

        {tab === 'today' && daily ? (
          <div className="mt-6 space-y-4">
            <ProgressCard label="Daily intake">
              <p className="mt-1 text-3xl font-bold text-emerald-700">
                {daily.totals.calories.toLocaleString()} kcal
              </p>
              <div className="mt-3 h-3 overflow-hidden rounded-full bg-zinc-100">
                <div
                  className="h-full rounded-full bg-emerald-500"
                  style={{ width: `${Math.min(100, pct)}%` }}
                />
              </div>
              <p className="mt-2 text-sm text-zinc-500">
                {pct}% of your {daily.targets.calories.toLocaleString()} kcal goal
              </p>
            </ProgressCard>

            <MacroSummary
              title="Macros"
              protein={{
                current: daily.totals.proteinG,
                target: daily.targets.proteinG,
              }}
              carbs={{
                current: daily.totals.carbsG,
                target: daily.targets.carbsG,
              }}
              fat={{
                current: daily.totals.fatG,
                target: daily.targets.fatG,
              }}
            />
          </div>
        ) : null}

        {tab === 'week' && weekly ? (
          <div className="mt-6 space-y-4">
            <ProgressCard>
              <div className="flex items-start justify-between gap-2">
                <h2 className="text-lg font-semibold text-zinc-900">Weekly outlook</h2>
                <div className="text-right">
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-zinc-400">
                    Avg. daily
                  </p>
                  <p className="text-lg font-bold text-emerald-700">
                    {weekly.averageDailyCalories.toLocaleString()} kcal
                  </p>
                </div>
              </div>
              <div className="mt-4 flex h-36 items-end justify-between gap-1">
                {weekly.days.map((d) => {
                  const h = Math.round((d.calories / maxBar) * 100);
                  const isToday = d.date === date;
                  return (
                    <div key={d.date} className="flex flex-1 flex-col items-center gap-2">
                      <div className="flex h-28 w-full items-end justify-center">
                        <div
                          className={`w-[70%] rounded-t-lg ${
                            isToday ? 'bg-emerald-600' : 'bg-zinc-300'
                          }`}
                          style={{ height: `${Math.max(8, h)}%` }}
                        />
                      </div>
                      <span
                        className={`text-[10px] font-semibold ${
                          isToday ? 'text-emerald-700' : 'text-zinc-400'
                        }`}
                      >
                        {d.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </ProgressCard>
          </div>
        ) : null}

        {tab === 'month' && monthly ? (
          <div className="mt-6 space-y-4">
            <ProgressCard label={monthly.monthLabel}>
              <p className="mt-1 text-sm text-zinc-500">Average daily calories</p>
              <p className="text-3xl font-bold text-zinc-900">
                {monthly.averageDailyCalories.toLocaleString()} kcal
              </p>
              <p className="mt-2 text-sm text-zinc-500">
                Total logged energy approx. {monthly.totalCalories.toLocaleString()} kcal this month
                · {monthly.daysLogged} active days
              </p>
            </ProgressCard>

            <div className="rounded-3xl bg-emerald-50 p-5 ring-1 ring-emerald-100">
              <div className="flex gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-emerald-600 text-white">
                  ↗
                </div>
                <div>
                  <p className="font-semibold text-emerald-900">Monthly insight</p>
                  <p className="mt-1 text-sm text-emerald-900/80">{monthly.insight}</p>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </LayoutShell>
  );
}
