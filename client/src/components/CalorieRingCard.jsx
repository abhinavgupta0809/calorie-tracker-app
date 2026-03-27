export default function CalorieRingCard({
  consumed,
  target,
  insight,
}) {
  const pct = target > 0 ? Math.min(1, consumed / target) : 0;
  const remaining = Math.max(0, Math.round(target - consumed));
  const circumference = 2 * Math.PI * 52;
  const offset = circumference * (1 - pct);

  return (
    <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-zinc-100">
      <div className="flex flex-col items-center">
        <div className="relative h-40 w-40">
          <svg className="-rotate-90" viewBox="0 0 120 120" aria-hidden>
            <circle
              cx="60"
              cy="60"
              r="52"
              fill="none"
              stroke="#e4e4e7"
              strokeWidth="12"
            />
            <circle
              cx="60"
              cy="60"
              r="52"
              fill="none"
              stroke="#16a34a"
              strokeWidth="12"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              className="transition-[stroke-dashoffset] duration-500"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <p className="text-3xl font-bold leading-none text-zinc-900">{remaining.toLocaleString()}</p>
            <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">kcal left</p>
          </div>
        </div>
        {insight ? (
          <div className="mt-4 flex w-full items-start gap-2 rounded-2xl bg-zinc-50 px-3 py-2 text-sm text-zinc-600">
            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-700">
              i
            </span>
            <span>{insight}</span>
          </div>
        ) : null}
      </div>
    </section>
  );
}
