import BottomNav from './BottomNav.jsx';

export default function LayoutShell({ children, showNav = true, className = '' }) {
  return (
    <div className={`min-h-dvh overflow-x-hidden bg-zinc-100 ${className}`}>
      <div
        className={`mx-auto min-h-dvh w-full max-w-md ${showNav ? 'pb-24' : ''}`}
      >
        {children}
      </div>
      {showNav ? <BottomNav /> : null}
    </div>
  );
}
