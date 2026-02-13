import { useQuery } from '@apollo/client/react'
import { Link } from 'react-router-dom'
import { PATIENTS_QUERY } from '../graphql/documents'
import { useUIStore } from '../store/uiStore'
import { useDebounce } from '../hooks/useDebounce'

const EmptyState = ({ title, description }) => (
  <div className="rounded-xl border border-dashed border-slate-200 bg-white p-8 text-center">
    <p className="text-lg font-semibold text-slate-900">{title}</p>
    <p className="mt-2 text-sm text-slate-500">{description}</p>
  </div>
)

export const PatientList = () => {
  const { patientSearch, setPatientSearch, role } = useUIStore()
  const debouncedSearch = useDebounce(patientSearch)
  const { data, loading, error } = useQuery(PATIENTS_QUERY, {
    variables: { search: debouncedSearch || null },
  })

  const patients = data?.patients ?? []

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Daftar Pasien</h1>
          <p className="text-sm text-slate-500">
            Pantau pasien klinik dengan pencarian real-time bertenaga debounce.
          </p>
        </div>
        {role === 'admin' && (
          <Link
            to="/patients/new"
            className="inline-flex items-center rounded-full bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-500"
          >
            + Tambah Pasien
          </Link>
        )}
      </div>

      <div className="flex flex-col gap-3 rounded-xl bg-white p-4 shadow-sm sm:flex-row sm:items-center">
        <div className="flex flex-1 items-center gap-3 rounded-full border border-slate-200 px-4 py-2">
          <span className="text-slate-400">🔍</span>
          <input
            type="search"
            value={patientSearch}
            onChange={(event) => setPatientSearch(event.target.value)}
            placeholder="Cari pasien berdasarkan nama, telepon, atau tag..."
            className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
          />
        </div>
        {loading && (
          <span className="text-xs font-medium text-brand-600">Mencari pasien...</span>
        )}
      </div>

      {error && (
        <div className="rounded-xl border border-red-100 bg-red-50/60 p-4 text-sm text-red-700">
          Terjadi kesalahan saat memuat data pasien.
        </div>
      )}

      {!loading && patients.length === 0 && (
        <EmptyState
          title="Pasien tidak ditemukan"
          description="Coba ubah kata kunci pencarian atau reset filter."
        />
      )}

      <ul className="grid gap-4 md:grid-cols-2">
        {patients.map((patient) => (
          <li
            key={patient.id}
            className="flex flex-col rounded-2xl border border-slate-100 bg-white p-4 shadow-sm"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <Link
                  to={`/patients/${patient.id}`}
                  className="text-lg font-semibold text-slate-900 hover:text-brand-600"
                >
                  {patient.name}
                </Link>
                <p className="text-sm text-slate-500">
                  {patient.gender} • Lahir {patient.dateOfBirth}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs uppercase text-slate-400">Kontak</p>
                <p className="text-sm font-medium text-slate-900">{patient.phone}</p>
              </div>
            </div>

            {patient.tags.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {patient.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            <p className="mt-3 text-sm text-slate-600">{patient.notes}</p>

            <div className="mt-4 flex items-center justify-end text-sm text-slate-500">
              <Link to={`/patients/${patient.id}`} className="font-semibold text-brand-600">
                Detail →
              </Link>
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}
