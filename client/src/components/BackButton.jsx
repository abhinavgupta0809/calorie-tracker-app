import { useNavigate } from 'react-router-dom';

export default function BackButton({ to = '/dashboard', className = '' }) {
  const navigate = useNavigate();

  function onBack() {
    navigate(to);
  }

  return (
    <button
      type="button"
      onClick={onBack}
      aria-label="Go back"
      className={`inline-flex h-10 w-10 items-center justify-center rounded-full bg-zinc-100 text-zinc-700 ring-1 ring-zinc-200 transition hover:bg-zinc-200 ${className}`}
    >
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <path
          d="M15 18l-6-6 6-6"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}
