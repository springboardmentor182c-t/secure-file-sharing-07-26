const navItems = [
  { label: 'Dashboard', href: '/dashboard' },
  { label: 'My Files', href: '/my-files' },
];

export default function Navbar() {
  return (
    <header className="border-b border-slate-200 bg-white/95 px-4 py-4 shadow-sm shadow-slate-100 backdrop-blur-sm sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#4F46E5] text-sm font-semibold text-white shadow-sm shadow-[#4F46E515]">
            TS
          </div>
          <div>
            <p className="text-sm font-semibold text-[#0F172A]">TrustShare</p>
            <p className="text-xs text-[#64748B]">Secure file-sharing workspace</p>
          </div>
        </div>

        <div className="hidden gap-2 md:flex">
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="rounded-full border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-2 text-sm font-medium text-[#0F172A] transition hover:border-indigo-200 hover:bg-white"
            >
              {item.label}
            </a>
          ))}
        </div>

        <div className="hidden items-center gap-3 md:flex">
          <button
            type="button"
            className="rounded-full border border-[#E2E8F0] bg-white px-4 py-2 text-sm font-medium text-[#0F172A] transition hover:border-indigo-200 hover:bg-[#F8FAFC]"
          >
            Notifications
          </button>
          <div className="flex items-center gap-3 rounded-full border border-[#E2E8F0] bg-white px-4 py-2">
            <span className="h-9 w-9 rounded-full bg-[#C7D2FE] text-sm font-semibold leading-9 text-[#3730A3]">AK</span>
            <span className="text-sm font-medium text-[#0F172A]">Alex Kim</span>
          </div>
        </div>
      </div>
    </header>
  );
}
