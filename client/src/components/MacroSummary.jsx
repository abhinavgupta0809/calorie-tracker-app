const COLORS = {
  protein: 'bg-emerald-700',
  carbs: 'bg-emerald-500',
  fat: 'bg-rose-400',
};

export default function MacroSummary({ protein, carbs, fat, title = 'Nutritional Focus' }) {
  const rows = [
    { key: 'protein', label: 'Protein', ...protein },
    { key: 'carbs', label: 'Carbs', ...carbs },
    { key: 'fat', label: 'Fat', ...fat },
  ];

  return (
    <section>
      <h2 className="mb-3 text-base font-semibold text-zinc-900">{title}</h2>
      <div className="space-y-3">
        {rows.map((r) => {
          const pct = r.target > 0 ? Math.min(100, Math.round((r.current / r.target) * 100)) : 0;
          return (
            <div key={r.key} className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-zinc-100">
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="font-medium text-zinc-800">{r.label}</span>
                <span className="text-zinc-500">
                  {r.current} / {r.target}g
                </span>
              </div>
              <div className="h-2.5 overflow-hidden rounded-full bg-zinc-100">
                <div
                  className={`h-full rounded-full ${COLORS[r.key]}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
