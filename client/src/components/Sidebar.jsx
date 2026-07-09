import { NavLink } from 'react-router-dom';

const navLinks = [
  { label: 'Dashboard', to: '/dashboard' },
  { label: 'My Files', to: '/my-files' },
  { label: 'Shared with Me', to: '/shared-with-me' },
  { label: 'Activity', to: '/activity' },
  { label: 'Analytics', to: '/analytics' },
  { label: 'Settings', to: '/settings' },
];

export default function Sidebar() {
  return (
    <aside className="w-full border-b border-slate-200 bg-white px-4 py-5 lg:w-72 lg:min-w-[18rem] lg:border-r lg:border-b-0">
      <div className="space-y-4">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-[#64748B]">Navigation</p>
        </div>
        <nav className="space-y-1">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `block rounded-2xl px-4 py-3 text-sm font-medium transition ${
                  isActive
                    ? 'bg-[#EEF2FF] text-[#3730A3] shadow-sm'
                    : 'text-[#475569] hover:bg-slate-50 hover:text-[#0F172A]'
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </aside>
  );
}
