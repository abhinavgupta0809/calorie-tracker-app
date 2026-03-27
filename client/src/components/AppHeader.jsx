export default function AppHeader({ title = 'Atelier Health', onSettings }) {
  return (
    <header className="flex items-center justify-between gap-3 pb-4">
      <div className="flex items-center gap-2 min-w-0">
        <div
          className="h-9 w-9 shrink-0 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-700 ring-2 ring-white shadow"
          aria-hidden
        />
        <span className="truncate font-semibold text-emerald-700">{title}</span>
      </div>
      <button
        type="button"
        onClick={onSettings}
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-zinc-500 hover:bg-zinc-100"
        aria-label="Settings"
      >
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.8}
            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.8}
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
      </button>
    </header>
  );
}
