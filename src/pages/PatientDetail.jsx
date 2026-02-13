import { useQuery } from '@apollo/client/react'
import { format, parseISO } from 'date-fns'
import { useMemo } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { PATIENT_DETAIL_QUERY } from '../graphql/documents'
import { useUIStore } from '../store/uiStore'

const formatDate = (value, withTime = false) => {
  try {
    const parsed = parseISO(value)
    return format(parsed, withTime ? 'dd MMM yyyy • HH:mm' : 'dd MMM yyyy')
  } catch {
    return value
  }
}

export const PatientDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const role = useUIStore((state) => state.role)
  const { data, loading, error } = useQuery(PATIENT_DETAIL_QUERY, {
    variables: { id },
  })

  const patient = data?.patient
  const appointments = useMemo(() => patient?.appointments ?? [], [patient])
  const visits = useMemo(() => patient?.visits ?? [], [patient])

  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
        Memuat detail pasien...
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-100 bg-red-50/70 p-6 text-sm text-red-700">
        Data pasien gagal dimuat.
      </div>
    )
  }

  if (!patient) {
    return (
      <div className="space-y-4">
        <p className="text-lg font-semibold text-slate-900">Pasien tidak ditemukan</p>
        <button
          type="button"
          onClick={() => navigate('/patients')}
          className="text-sm font-medium text-brand-600"
        >
          ← Kembali ke daftar pasien
        </button>
      </div>
    )
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Detail Pasien</p>
          <h1 className="text-3xl font-bold text-slate-900 truncate mt-1">{patient.name}</h1>
          <p className="text-sm text-slate-500 mt-1">{patient.notes}</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {role === 'admin' ? (
            <Link
              to={`/patients/${patient.id}/edit`}
              className="inline-flex flex-1 sm:flex-none items-center justify-center rounded-full border border-brand-200 bg-brand-50 px-6 py-2.5 text-sm font-bold text-brand-700 hover:bg-brand-100 transition shadow-sm"
            >
              ✏️ Edit
            </Link>
          ) : (
            <span className="rounded-full bg-slate-100 px-4 py-2 text-xs font-semibold text-slate-500">
              Staff Only
            </span>
          )}
          <Link
            to="/patients"
            className="inline-flex flex-1 sm:flex-none items-center justify-center rounded-full border border-slate-200 bg-white px-6 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50 transition shadow-sm"
          >
            ← Kembali
          </Link>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <article className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm md:col-span-2">
          <h2 className="text-lg font-bold text-slate-900">Informasi Utama</h2>
          <dl className="mt-6 grid gap-6 sm:grid-cols-2">
            <div>
              <dt className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Tanggal Lahir</dt>
              <dd className="mt-1 text-sm font-semibold text-slate-900">{patient.dateOfBirth}</dd>
            </div>
            <div>
              <dt className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Jenis Kelamin</dt>
              <dd className="mt-1 text-sm font-semibold text-slate-900">{patient.gender}</dd>
            </div>
            <div>
              <dt className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Telepon</dt>
              <dd className="mt-1 text-sm font-semibold text-slate-900">{patient.phone}</dd>
            </div>
            <div>
              <dt className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Alamat</dt>
              <dd className="mt-1 text-sm font-semibold text-slate-900">{patient.address}</dd>
            </div>
          </dl>
          <div className="mt-8 border-t border-slate-50 pt-6">
            <dt className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Alergi Terdaftar</dt>
            <dd className="mt-3 flex flex-wrap gap-2">
              {(patient.allergies.length ? patient.allergies : ['Tidak ada']).map((allergy) => (
                <span
                  key={allergy}
                  className="rounded-full bg-red-50 border border-red-100 px-3 py-1 text-[11px] font-bold text-red-700"
                >
                  {allergy}
                </span>
              ))}
            </dd>
          </div>
        </article>

        <article className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm flex flex-col">
          <h2 className="text-lg font-bold text-slate-900">Tagging & Metadata</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {patient.tags.map((tag) => (
              <span key={tag} className="rounded-full bg-slate-50 border border-slate-100 px-3 py-1 text-[11px] font-bold text-slate-600">
                {tag}
              </span>
            ))}
            {patient.tags.length === 0 && <span className="text-xs text-slate-400 italic">Belum ada tag</span>}
          </div>
          <div className="mt-6 border-t border-slate-50 pt-6">
            <dt className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Catatan Internal</dt>
            <dd className="mt-2 text-sm text-slate-600 leading-relaxed">{patient.notes || 'Tidak ada catatan tambahan.'}</dd>
          </div>
        </article>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <article className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          <header className="flex items-center justify-between border-b border-slate-50 pb-4">
            <h2 className="text-lg font-bold text-slate-900">Jadwal Mendatang</h2>
            <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-bold text-slate-600">
              {appointments.length}
            </span>
          </header>
          <ul className="mt-4 space-y-3">
            {appointments.map((appointment) => (
              <li
                key={appointment.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between rounded-xl border border-slate-100 bg-slate-50/50 p-4 gap-2"
              >
                <div className="min-w-0">
                  <p className="text-sm font-bold text-slate-900 truncate">{appointment.reason}</p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {formatDate(appointment.date, true)}
                  </p>
                </div>
                <div className="flex">
                  <span className="rounded-full bg-brand-100 px-2 py-0.5 text-[10px] font-bold text-brand-700 uppercase tracking-wider">
                    {appointment.status}
                  </span>
                </div>
              </li>
            ))}
            {appointments.length === 0 && (
              <p className="py-8 text-center text-sm text-slate-500 italic">Belum ada janji untuk pasien ini.</p>
            )}
          </ul>
        </article>

        <article className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          <header className="flex items-center justify-between border-b border-slate-50 pb-4">
            <h2 className="text-lg font-bold text-slate-900">Riwayat Kunjungan</h2>
            <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-bold text-slate-600">
              {visits.length}
            </span>
          </header>
          <div className="mt-6 overflow-hidden">
            <ul className="space-y-8 relative before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100">
              {visits.map((visit) => (
                <li key={visit.id} className="relative pl-8">
                  <div className="absolute left-0 top-1.5 h-4 w-4 rounded-full border-2 border-brand-500 bg-white shadow-sm" />
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                    {formatDate(visit.date, true)}
                  </p>
                  <p className="text-sm font-bold text-slate-900 mt-1">
                    {visit.reason} • <span className="text-brand-600">{visit.doctor}</span>
                  </p>
                  <p className="mt-2 text-sm text-slate-600 line-clamp-3">{visit.notes}</p>
                  {visit.prescription && (
                    <div className="mt-3 inline-flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700 border border-emerald-100">
                      💊 {visit.prescription}
                    </div>
                  )}
                </li>
              ))}
              {visits.length === 0 && (
                <p className="py-4 text-center text-sm text-slate-500 italic">Riwayat belum tersedia.</p>
              )}
            </ul>
          </div>
        </article>
      </div>
    </section>
  )
}
