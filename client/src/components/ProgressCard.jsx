export default function ProgressCard({
  label,
  children,
  className = '',
  titleClass = 'text-xs font-semibold uppercase tracking-wide text-zinc-400',
}) {
  return (
    <section className={`rounded-3xl bg-white p-5 shadow-sm ring-1 ring-zinc-100 ${className}`}>
      {label ? <p className={titleClass}>{label}</p> : null}
      {children}
    </section>
  );
}
