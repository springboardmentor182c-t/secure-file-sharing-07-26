export default function FilterChips({ chips, activeId, onChange }) {
  return (
    <div className="flex flex-wrap gap-2">
      {chips.map((chip) => (
        <button
          key={chip.id}
          type="button"
          onClick={() => onChange(chip.id)}
          className={`rounded-full px-4 py-2 text-sm font-medium transition ${
            chip.id === activeId
              ? 'bg-[#4338CA] text-white shadow-sm shadow-[#4338CA33]'
              : 'border border-[#E2E8F0] bg-white text-[#475569] hover:border-indigo-200 hover:bg-[#F8FAFC]'
          }`}
        >
          {chip.label}
        </button>
      ))}
    </div>
  );
}
