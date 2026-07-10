export default function SecurityStatusCard({ security }) {
  return (
    <section className="rounded-[18px] bg-gradient-to-br from-[#2863FF] to-[#4024E8] p-6 text-white shadow-soft" aria-labelledby="security-heading">
      <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-white/70">
        <svg aria-hidden="true" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path d="M12 3.5 18.5 6v5.25c0 4.04-2.63 7.52-6.5 8.75-3.87-1.23-6.5-4.71-6.5-8.75V6L12 3.5Z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
        </svg>
        Security Status
      </div>
      <h2 id="security-heading" className="mt-4 text-xl font-semibold">
        All Systems Secure
      </h2>
      <p className="mt-2 text-sm text-white/75">Zero policy violations in the last 30 days.</p>
      <ul className="mt-5 space-y-2">
        {security.map((item) => (
          <li key={item.id} className="flex items-center gap-2 text-sm font-medium text-white/90">
            <span className="flex h-4 w-4 items-center justify-center rounded-full border border-white/50">
              <span className="h-1.5 w-1.5 rounded-full bg-white" />
            </span>
            {item.label}
          </li>
        ))}
      </ul>
    </section>
  );
}
