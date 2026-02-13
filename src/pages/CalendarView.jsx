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

import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react'

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

  const appointments = useMemo(() => data?.appointments ?? [], [data])

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
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-sm border border-slate-100 text-brand-600">
            <Calendar size={24} />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Calendar Agenda</p>
            <h1 className="text-2xl font-bold text-slate-900 leading-tight truncate">{label}</h1>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <select
            value={mode}
            onChange={(event) => setMode(event.target.value)}
            className="rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-bold text-slate-700 shadow-sm focus:border-brand-500 focus:outline-none transition appearance-none cursor-pointer"
          >
            {calendarModes.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => navigateRange(-1)}
              className="flex-1 sm:flex-none inline-flex items-center justify-center rounded-full border border-slate-200 bg-white p-2.5 text-slate-700 hover:bg-slate-50 transition shadow-sm"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              type="button"
              onClick={() => navigateRange(1)}
              className="flex-1 sm:flex-none inline-flex items-center justify-center rounded-full border border-slate-200 bg-white p-2.5 text-slate-700 hover:bg-slate-50 transition shadow-sm"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>

      {mode === 'daily' && (
        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900 border-b border-slate-50 pb-4">Agenda Hari Ini</h2>
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
        <div className="overflow-x-auto rounded-2xl border border-slate-100 bg-white shadow-sm no-scrollbar">
          <div className="grid min-w-[840px] grid-cols-7 divide-x divide-slate-100">
            {weeklyDays.map((day) => {
              const items = getAppointmentsForDay(day)
              return (
                <div key={day.toISOString()} className="p-4 min-h-[400px]">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{format(day, 'EEE')}</p>
                  <p className="text-lg font-bold text-slate-900 mt-1">{format(day, 'dd')}</p>
                  <div className="mt-4 space-y-3">
                    {items.map((appointment) => (
                      <article
                        key={appointment.id}
                        className="rounded-xl border border-brand-100 bg-brand-50/50 p-2.5 shadow-sm transition hover:shadow-md"
                      >
                        <p className="text-xs font-bold text-brand-900 break-words leading-tight">
                          {appointment.patient.name}
                        </p>
                        <p className="text-[10px] text-brand-700 mt-1 leading-normal italic opacity-80 break-words">
                          {appointment.reason}
                        </p>
                        <div className="mt-2 pt-2 border-t border-brand-100/50 flex flex-wrap items-center gap-1.5">
                          <span className="text-[9px] font-bold text-slate-500 bg-white px-1.5 py-0.5 rounded border border-slate-100">
                            {format(parseISO(appointment.date), 'HH:mm')}
                          </span>
                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded capitalize ${appointment.status === 'scheduled' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                            }`}>
                            {appointment.status}
                          </span>
                        </div>
                      </article>
                    ))}
                    {items.length === 0 && (
                      <div className="rounded-xl border border-dashed border-slate-100 p-4 text-center">
                        <p className="text-[10px] text-slate-400">No events</p>
                      </div>
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
                  const inCurrentMonth = isSameMonth(day, start)
                  const hasAppointments = items.length > 0

                  return (
                    <div
                      key={day.toISOString()}
                      className={`p-3 transition ${hasAppointments ? 'bg-brand-50/80 ring-1 ring-brand-200' : ''
                        }`}
                    >
                      <div className="flex items-center justify-between text-xs font-semibold">
                        <span className={inCurrentMonth ? 'text-slate-600' : 'text-slate-300'}>
                          {format(day, 'dd')}
                        </span>
                        {hasAppointments && (
                          <span className="rounded-full bg-brand-600 px-2 py-0.5 text-[10px] font-bold text-white">
                            {items.length}
                          </span>
                        )}
                      </div>
                      <div className="mt-2 space-y-1">
                        {items.slice(0, 2).map((appointment) => (
                          <p key={appointment.id} className="text-xs text-slate-600">
                            {format(parseISO(appointment.date), 'HH:mm')} •{' '}
                            {appointment.patient.name.split(' ')[0]}
                          </p>
                        ))}
                        {items.length > 2 && (
                          <p className="text-[11px] text-brand-600">
                            +{items.length - 2} janji lainnya
                          </p>
                        )}
                        {!hasAppointments && (
                          <p className="text-[11px] text-slate-300">Tidak ada janji</p>
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
