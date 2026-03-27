import { formatTime } from '../utils/date.js';

export default function MealList({ meals, onDelete }) {
  if (!meals?.length) {
    return (
      <p className="rounded-2xl bg-white px-4 py-6 text-center text-sm text-zinc-500 ring-1 ring-zinc-100">
        No meals logged yet. Start by adding your first meal.
      </p>
    );
  }

  return (
    <ul className="space-y-3">
      {meals.map((m) => (
        <li
          key={m.id}
          className="flex items-center gap-3 rounded-2xl bg-white p-3 shadow-sm ring-1 ring-zinc-100"
        >
          <div
            aria-hidden
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100"
          >
            <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path
                d="M4 8h16M6 8l1 10h10l1-10M9 8V6a3 3 0 0 1 6 0v2"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate font-medium text-zinc-900">{m.summary || m.description}</p>
            <p className="text-xs text-zinc-500">{formatTime(m.loggedAt)}</p>
          </div>
          <div className="flex shrink-0 flex-col items-end gap-1">
            <span className="text-sm font-semibold text-zinc-900">{m.calories} kcal</span>
            {onDelete ? (
              <button
                type="button"
                onClick={() => onDelete(m.id)}
                className="min-h-9 rounded-lg px-2 text-xs text-rose-600 hover:bg-rose-50 hover:underline"
              >
                Remove
              </button>
            ) : null}
          </div>
        </li>
      ))}
    </ul>
  );
}
