import { Search } from 'lucide-react';

export default function SearchBar({ value, onChange }) {
  return (
    <label className="my-files-search-bar relative block">
      <span className="sr-only">Search files</span>
      <input
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Search files, folders, and tags"
        className="my-files-input w-full rounded-lg border border-[#E2E8F0] bg-white px-4 py-3 pr-12 text-sm text-[#0F172A] outline-none transition focus:border-[#4F46E5] focus:ring-2 focus:ring-[#c7d2fe]"
      />
      <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-[#94A3B8]">
        <Search size={17} aria-hidden="true" />
      </span>
    </label>
  );
}
