import { NavLink, useLocation } from 'react-router-dom';

function IconHome({ active }) {
  return (
    <svg
      className={active ? 'h-5 w-5' : 'h-5 w-5'}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
      />
    </svg>
  );
}

function IconChart({ active }) {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
      />
    </svg>
  );
}

export default function BottomNav() {
  const { pathname } = useLocation();
  const homeActive = pathname === '/dashboard' || pathname === '/log-meal';

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-zinc-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-md items-stretch justify-around gap-2 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2">
        <NavLink
          to="/dashboard"
          className={() =>
            `flex flex-1 flex-col items-center justify-center gap-1 rounded-2xl py-2 text-xs font-medium transition ${
              homeActive
                ? 'bg-emerald-700 text-white shadow-sm'
                : 'text-zinc-500 hover:text-zinc-800'
            }`
          }
        >
          <>
            <IconHome active={homeActive} />
            Home
          </>
        </NavLink>
        <NavLink
          to="/progress"
          className={({ isActive }) =>
            `flex flex-1 flex-col items-center justify-center gap-1 rounded-2xl py-2 text-xs font-medium transition ${
              isActive
                ? 'bg-emerald-700 text-white shadow-sm'
                : 'text-zinc-500 hover:text-zinc-800'
            }`
          }
        >
          {({ isActive }) => (
            <>
              <IconChart active={isActive} />
              Progress
            </>
          )}
        </NavLink>
      </div>
    </nav>
  );
}
