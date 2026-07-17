export default function SearchBar({ value, onChange }) {
  return (
    <div className="grid gap-4 sm:grid-cols-[1fr_auto]">
      <label className="relative block">
        <span className="sr-only">Search files</span>
        <input
          type="search"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="Search files, folders, and tags"
          className="w-full rounded-2xl border border-[#E2E8F0] bg-white px-4 py-3 pr-12 text-sm text-[#0F172A] outline-none transition focus:border-[#4F46E5] focus:ring-2 focus:ring-[#c7d2fe]"
        />
        <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-[#94A3B8]">🔍</span>
      </label>
      <button
        type="button"
        className="rounded-2xl bg-[#4F46E5] px-4 py-3 text-sm font-semibold text-white shadow-sm shadow-[#4F46E515] transition hover:bg-[#4338CA]"
      >
        Upload
      </button>
    </div>
  );
}
