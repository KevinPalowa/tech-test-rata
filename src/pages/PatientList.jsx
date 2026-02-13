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

import { Plus, Search, ChevronRight } from 'lucide-react'

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
        <div className="min-w-0">
          <h1 className="text-2xl font-bold text-slate-900 truncate">Daftar Pasien</h1>
          <p className="text-sm text-slate-500">
            Pantau pasien klinik dengan pencarian real-time bertenaga debounce.
          </p>
        </div>
        {role === 'admin' && (
          <Link
            to="/patients/new"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-brand-600 px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-brand-100 transition hover:bg-brand-500"
          >
            <Plus size={18} />
            Tambah Pasien
          </Link>
        )}
      </div>

      <div className="flex flex-col gap-3 rounded-xl bg-white p-4 shadow-sm sm:flex-row sm:items-center">
        <div className="flex flex-1 items-center gap-3 rounded-full border border-slate-200 px-4 py-2 focus-within:border-brand-500 focus-within:ring-2 focus-within:ring-brand-100 transition">
          <Search size={18} className="text-slate-400" />
          <input
            type="search"
            value={patientSearch}
            onChange={(event) => setPatientSearch(event.target.value)}
            placeholder="Cari pasien berdasarkan nama, telepon..."
            className="w-full bg-transparent text-sm font-medium outline-none placeholder:text-slate-400"
          />
        </div>
        {loading && (
          <div className="flex items-center gap-2 px-2">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-brand-600 border-t-transparent" />
            <span className="text-xs font-bold text-brand-600">Mencari pasien...</span>
          </div>
        )}
      </div>

      {error && (
        <div className="rounded-xl border border-red-100 bg-red-50/60 p-4 text-sm font-semibold text-red-700">
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
            className="flex flex-col rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition hover:border-slate-200 hover:shadow-md"
          >
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
              <div className="min-w-0">
                <Link
                  to={`/patients/${patient.id}`}
                  className="text-lg font-bold text-slate-900 hover:text-brand-600 block truncate"
                >
                  {patient.name}
                </Link>
                <p className="text-sm font-medium text-slate-500">
                  {patient.gender} • Lahir {patient.dateOfBirth}
                </p>
              </div>
              <div className="sm:text-right border-t border-slate-50 pt-3 sm:border-0 sm:pt-0">
                <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400 opacity-70">Kontak</p>
                <p className="text-sm font-bold text-slate-900">{patient.phone}</p>
              </div>
            </div>

            {patient.tags.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {patient.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-brand-50 px-3 py-1 text-[11px] font-bold text-brand-700 border border-brand-100"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            <p className="mt-4 text-sm font-medium text-slate-600 line-clamp-2 leading-relaxed">{patient.notes}</p>

            <div className="mt-6 flex items-center justify-end border-t border-slate-50 pt-4">
              <Link to={`/patients/${patient.id}`} className="inline-flex items-center gap-1 text-sm font-bold text-brand-600 hover:text-brand-700">
                Detail <ChevronRight size={16} />
              </Link>
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}
