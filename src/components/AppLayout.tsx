import { Users, Calendar, Clock, Layout } from 'lucide-react'

const navItems = [
  { label: 'Pasien', to: '/patients', icon: Users },
  { label: 'Appointments', to: '/appointments', icon: Clock },
  { label: 'Calendar', to: '/calendar', icon: Calendar },
  { label: 'Workflow', to: '/workflow', icon: Layout },
]

import { NavLink, Outlet } from 'react-router-dom'
import { useUIStore } from '../store/uiStore'

export const AppLayout = () => {
  const role = useUIStore((state) => state.role)
  const setRole = useUIStore((state) => state.setRole)

  return (
    <div className="flex min-h-screen bg-slate-100">
      <aside className="hidden w-64 flex-col border-r border-slate-200 bg-white px-6 py-8 lg:flex">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-600 text-white shadow-lg shadow-brand-100">
            <Layout size={24} />
          </div>
          <div className="text-2xl font-bold tracking-tight text-slate-900">Klinik<span className="text-brand-600">Care</span></div>
        </div>
        <nav className="mt-10 space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                [
                  'flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-200',
                  isActive ? 'bg-brand-50 text-brand-700 shadow-sm' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900',
                ].join(' ')
              }
            >
              {({ isActive }) => (
                <>
                  <item.icon size={18} className={isActive ? 'text-brand-600' : 'text-slate-400'} />
                  {item.label}
                </>
              )}
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className="flex flex-1 flex-col min-w-0">
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 bg-white px-6 py-4">
          <div className="min-w-0">
            <p className="text-xs uppercase tracking-wide text-slate-400">Mini Frontend Klinik</p>
            <p className="text-lg font-semibold text-slate-900 truncate">Dashboard Pasien</p>
          </div>
          <div className="flex items-center gap-3 rounded-full border border-slate-200 px-4 py-2 text-sm">
            <span className="font-semibold text-slate-600">Role</span>
            <select
              value={role}
              onChange={(event) => setRole(event.target.value)}
              className="bg-transparent text-sm font-semibold text-brand-700 outline-none cursor-pointer"
            >
              <option value="admin">Admin</option>
              <option value="staff">Staff</option>
            </select>
          </div>
        </header>
        <nav className="flex gap-2 border-b border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-500 lg:hidden overflow-x-auto no-scrollbar">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                [
                  'flex items-center gap-2 whitespace-nowrap rounded-full px-4 py-2 transition-all duration-200',
                  isActive ? 'bg-brand-50 text-brand-700 shadow-sm ring-1 ring-brand-100' : 'text-slate-500 hover:bg-slate-50',
                ].join(' ')
              }
            >
              {({ isActive }) => (
                <>
                  <item.icon size={16} className={isActive ? 'text-brand-600' : 'text-slate-400'} />
                  {item.label}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <main className="flex-1 px-4 py-6 sm:px-8 sm:py-8 overflow-x-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
