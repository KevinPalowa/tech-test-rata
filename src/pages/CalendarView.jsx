import { useQuery } from '@apollo/client/react'
import {
  addDays,
  addMonths,
  addWeeks,
  endOfDay,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  parseISO,
  startOfDay,
  startOfMonth,
  startOfWeek,
} from 'date-fns'
import { useMemo, useState } from 'react'
import { APPOINTMENTS_QUERY } from '../graphql/documents'

const calendarModes = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
]

export const CalendarView = () => {
  const [anchorDate, setAnchorDate] = useState(new Date())
  const [mode, setMode] = useState('weekly')

  const { start, end, label } = useMemo(() => {
    const base = new Date(anchorDate)
    if (mode === 'daily') {
      const dayStart = startOfDay(base)
      const dayEnd = endOfDay(base)
      return { start: dayStart, end: dayEnd, label: format(dayStart, 'EEEE, dd MMM yyyy') }
    }
    if (mode === 'monthly') {
      const monthStart = startOfMonth(base)
      const monthEnd = endOfMonth(base)
      return { start: monthStart, end: monthEnd, label: format(monthStart, 'MMMM yyyy') }
    }
    const weekStart = startOfWeek(base, { weekStartsOn: 1 })
    const weekEnd = endOfWeek(base, { weekStartsOn: 1 })
    return {
      start: weekStart,
      end: weekEnd,
      label: `${format(weekStart, 'dd MMM')} - ${format(weekEnd, 'dd MMM yyyy')}`,
    }
  }, [anchorDate, mode])

  const navigateRange = (direction) => {
    setAnchorDate((prev) => {
      if (mode === 'daily') {
        return addDays(prev, direction)
      }
      if (mode === 'monthly') {
        return addMonths(prev, direction)
      }
      return addWeeks(prev, direction)
    })
  }

  const { data, loading } = useQuery(APPOINTMENTS_QUERY, {
    variables: { start: start.toISOString(), end: end.toISOString() },
  })
  console.log(data)

  const appointments = data?.appointments ?? []

  const weeklyDays = useMemo(() => {
    if (mode !== 'weekly') return []
    return Array.from({ length: 7 }, (_, index) => addDays(start, index))
  }, [mode, start])

  const dailyAppointments = useMemo(() => {
    if (mode !== 'daily') return []
    return appointments.filter((appointment) =>
      isSameDay(parseISO(appointment.date), startOfDay(start)),
    )
  }, [appointments, mode, start])

  const monthlyWeeks = useMemo(() => {
    if (mode !== 'monthly') return []
    const weeks = []
    let cursor = startOfWeek(start, { weekStartsOn: 1 })
    const finalDay = endOfWeek(end, { weekStartsOn: 1 })
    while (cursor <= finalDay) {
      weeks.push(Array.from({ length: 7 }, (_, index) => addDays(cursor, index)))
      cursor = addDays(cursor, 7)
    }
    return weeks
  }, [mode, start, end])

  const getAppointmentsForDay = (day) =>
    appointments.filter((appointment) => isSameDay(parseISO(appointment.date), day))

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm uppercase text-slate-400">Calendar View</p>
          <h1 className="text-2xl font-semibold text-slate-900">{label}</h1>
          <p className="text-sm text-slate-500">
            Ganti mode tampilan untuk fokus harian, mingguan, atau rangkuman bulanan.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={mode}
            onChange={(event) => setMode(event.target.value)}
            className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700"
          >
            {calendarModes.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => navigateRange(-1)}
              className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700"
            >
              ← Sebelumnya
            </button>
            <button
              type="button"
              onClick={() => navigateRange(1)}
              className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700"
            >
              Berikutnya →
            </button>
          </div>
        </div>
      </div>

      {mode === 'daily' && (
        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Agenda hari ini</h2>
          <ul className="mt-4 space-y-3">
            {dailyAppointments.map((appointment) => (
              <li key={appointment.id} className="rounded-xl border border-slate-100 p-4">
                <p className="text-sm font-semibold text-slate-900">{appointment.patient.name}</p>
                <p className="text-xs text-slate-500">
                  {format(parseISO(appointment.date), 'HH:mm')} • {appointment.status}
                </p>
                <p className="text-sm text-slate-600">{appointment.reason}</p>
              </li>
            ))}
            {dailyAppointments.length === 0 && (
              <p className="text-sm text-slate-500">Tidak ada janji pada hari ini.</p>
            )}
          </ul>
        </div>
      )}

      {mode === 'weekly' && (
        <div className="overflow-x-auto rounded-2xl border border-slate-100 bg-white shadow-sm">
          <div className="grid min-w-[640px] grid-cols-7 divide-x divide-slate-100">
            {weeklyDays.map((day) => {
              const items = getAppointmentsForDay(day)
              return (
                <div key={day.toISOString()} className="p-4">
                  <p className="text-xs uppercase text-slate-400">{format(day, 'EEE')}</p>
                  <p className="text-lg font-semibold text-slate-900">{format(day, 'dd')}</p>
                  <div className="mt-3 space-y-3">
                    {items.map((appointment) => (
                      <article
                        key={appointment.id}
                        className="rounded-xl border border-brand-100 bg-brand-50 p-3"
                      >
                        <p className="text-sm font-semibold text-brand-900">
                          {appointment.patient.name}
                        </p>
                        <p className="text-xs text-brand-700">{appointment.reason}</p>
                        <p className="text-xs text-slate-500">
                          {format(parseISO(appointment.date), 'HH:mm')} • {appointment.status}
                        </p>
                      </article>
                    ))}
                    {items.length === 0 && (
                      <p className="text-xs text-slate-400">Tidak ada janji</p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {mode === 'monthly' && (
        <div className="overflow-x-auto rounded-2xl border border-slate-100 bg-white shadow-sm">
          <div className="min-w-[720px] divide-y divide-slate-100">
            {monthlyWeeks.map((week, index) => (
              <div key={index} className="grid grid-cols-7 divide-x divide-slate-100">
                {week.map((day) => {
                  const items = getAppointmentsForDay(day)
                  return (
                    <div key={day.toISOString()} className="p-3">
                      <p
                        className={`text-xs font-semibold ${
                          isSameMonth(day, start) ? 'text-slate-500' : 'text-slate-300'
                        }`}
                      >
                        {format(day, 'dd')}
                      </p>
                      <div className="mt-2 space-y-1">
                        {items.slice(0, 2).map((appointment) => (
                          <p key={appointment.id} className="text-xs text-slate-600">
                            {format(parseISO(appointment.date), 'dd/MM')} •{' '}
                            {appointment.patient.name.split(' ')[0]}
                          </p>
                        ))}
                        {items.length > 2 && (
                          <p className="text-[11px] text-brand-600">
                            +{items.length - 2} janji lainnya
                          </p>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            ))}
          </div>
        </div>
      )}

      {loading && (
        <p className="text-sm text-slate-500">Memuat jadwal janji minggu ini...</p>
      )}
    </section>
  )
}
