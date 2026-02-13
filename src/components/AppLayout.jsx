import { NavLink, Outlet } from 'react-router-dom'
import { useUIStore } from '../store/uiStore'

const navItems = [
  { label: 'Pasien', to: '/patients' },
  { label: 'Appointments', to: '/appointments' },
  { label: 'Calendar', to: '/calendar' },
  { label: 'Workflow', to: '/workflow' },
]

export const AppLayout = () => {
  const role = useUIStore((state) => state.role)
  const setRole = useUIStore((state) => state.setRole)

  return (
    <div className="flex min-h-screen bg-slate-100">
      <aside className="hidden w-64 flex-col border-r border-slate-200 bg-white px-6 py-8 lg:flex">
        <div className="text-2xl font-semibold text-brand-700">KlinikCare</div>
        <nav className="mt-10 space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                [
                  'flex items-center rounded-xl px-4 py-3 text-sm font-semibold',
                  isActive ? 'bg-brand-50 text-brand-700' : 'text-slate-500 hover:text-slate-900',
                ].join(' ')
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className="flex flex-1 flex-col">
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 bg-white px-6 py-4">
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-400">Mini Frontend Klinik</p>
            <p className="text-lg font-semibold text-slate-900">Dashboard Pasien</p>
          </div>
          <div className="flex items-center gap-3 rounded-full border border-slate-200 px-4 py-2 text-sm">
            <span className="font-semibold text-slate-600">Role</span>
            <select
              value={role}
              onChange={(event) => setRole(event.target.value)}
              className="bg-transparent text-sm font-semibold text-brand-700 outline-none"
            >
              <option value="admin">Admin</option>
              <option value="staff">Staff</option>
            </select>
          </div>
        </header>
        <nav className="flex gap-2 border-b border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-500 lg:hidden">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                [
                  'rounded-full px-4 py-2',
                  isActive ? 'bg-brand-50 text-brand-700' : 'text-slate-500',
                ].join(' ')
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <main className="flex-1 px-4 py-8 sm:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
