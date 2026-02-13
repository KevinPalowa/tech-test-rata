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
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-wide text-slate-400">Pasien #{patient.id}</p>
          <h1 className="text-3xl font-semibold text-slate-900">{patient.name}</h1>
          <p className="text-sm text-slate-500">{patient.notes}</p>
        </div>
        <div className="flex flex-wrap gap-3">
          {role === 'admin' ? (
            <Link
              to={`/patients/${patient.id}/edit`}
              className="inline-flex items-center rounded-full border border-brand-200 bg-brand-50 px-4 py-2 text-sm font-semibold text-brand-700 hover:bg-brand-100"
            >
              ✏️ Edit Pasien
            </Link>
          ) : (
            <span className="rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-500">
              Role staff tidak dapat mengedit
            </span>
          )}
          <Link
            to="/patients"
            className="inline-flex items-center rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            ← Kembali
          </Link>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <article className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm md:col-span-2">
          <h2 className="text-lg font-semibold text-slate-900">Informasi Utama</h2>
          <dl className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-xs uppercase text-slate-400">Tanggal Lahir</dt>
              <dd className="text-sm font-medium text-slate-900">{patient.dateOfBirth}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase text-slate-400">Jenis Kelamin</dt>
              <dd className="text-sm font-medium text-slate-900">{patient.gender}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase text-slate-400">Telepon</dt>
              <dd className="text-sm font-medium text-slate-900">{patient.phone}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase text-slate-400">Alamat</dt>
              <dd className="text-sm font-medium text-slate-900">{patient.address}</dd>
            </div>
          </dl>
          <div className="mt-6">
            <dt className="text-xs uppercase text-slate-400">Alergi</dt>
            <dd className="mt-2 flex flex-wrap gap-2">
              {(patient.allergies.length ? patient.allergies : ['Tidak ada']).map((allergy) => (
                <span
                  key={allergy}
                  className="rounded-full bg-red-50 px-3 py-1 text-xs font-medium text-red-700"
                >
                  {allergy}
                </span>
              ))}
            </dd>
          </div>
        </article>

        <article className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Tag & Catatan</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {patient.tags.map((tag) => (
              <span key={tag} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium">
                {tag}
              </span>
            ))}
          </div>
          <p className="mt-4 text-sm text-slate-600">{patient.notes}</p>
        </article>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <article className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
          <header className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">Jadwal Janji</h2>
            <span className="text-xs text-slate-400">{appointments.length} jadwal</span>
          </header>
          <ul className="mt-4 space-y-3">
            {appointments.map((appointment) => (
              <li
                key={appointment.id}
                className="flex items-center justify-between rounded-xl border border-slate-100 px-4 py-3"
              >
                <div>
                  <p className="text-sm font-semibold text-slate-900">{appointment.reason}</p>
                  <p className="text-xs text-slate-500">
                    {formatDate(appointment.date, true)} • {appointment.status}
                  </p>
                </div>
                <span className="text-xs font-semibold text-brand-600">#{appointment.id}</span>
              </li>
            ))}
            {appointments.length === 0 && (
              <p className="text-sm text-slate-500">Belum ada janji untuk pasien ini.</p>
            )}
          </ul>
        </article>

        <article className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
          <header className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">Riwayat Kunjungan</h2>
            <span className="text-xs text-slate-400">{visits.length} catatan</span>
          </header>
          <ul className="mt-4 space-y-4">
            {visits.map((visit) => (
              <li key={visit.id} className="border-l-2 border-brand-200 pl-4">
                <p className="text-xs uppercase text-slate-400">{formatDate(visit.date, true)}</p>
                <p className="text-sm font-semibold text-slate-900">
                  {visit.reason} • {visit.doctor}
                </p>
                <p className="text-sm text-slate-600">{visit.notes}</p>
                {visit.prescription && (
                  <p className="text-xs font-medium text-brand-600">Resep: {visit.prescription}</p>
                )}
              </li>
            ))}
            {visits.length === 0 && (
              <p className="text-sm text-slate-500">Riwayat kunjungan belum tersedia.</p>
            )}
          </ul>
        </article>
      </div>
    </section>
  )
}
