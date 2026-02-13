import { useMutation, useQuery } from '@apollo/client/react'
import { format, parseISO } from 'date-fns'
import { useState } from 'react'
import {
  APPOINTMENTS_QUERY,
  PATIENTS_QUERY,
  CREATE_APPOINTMENT_MUTATION,
  UPDATE_APPOINTMENT_MUTATION,
  DELETE_APPOINTMENT_MUTATION,
} from '../graphql/documents'

const defaultForm = {
  id: null,
  patientId: '',
  date: '',
  reason: '',
  status: 'scheduled',
}

const statusOptions = [
  { value: 'scheduled', label: 'Scheduled' },
  { value: 'pending', label: 'Pending' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
]

const formatHumanDate = (value) => {
  try {
    return format(parseISO(value), 'dd MMM yyyy • HH:mm')
  } catch {
    return value
  }
}

const toInputDatetime = (value) => {
  if (!value) return ''
  const date = new Date(value)
  const offset = date.getTimezoneOffset()
  const local = new Date(date.getTime() - offset * 60000)
  return local.toISOString().slice(0, 16)
}

const toISOStringValue = (value) => {
  if (!value) return ''
  return new Date(value).toISOString()
}

export const AppointmentManager = () => {
  const [form, setForm] = useState(defaultForm)
  const [errors, setErrors] = useState({})
  const [message, setMessage] = useState(null)

  const {
    data: appointmentData,
    loading: appointmentsLoading,
    refetch: refetchAppointments,
  } = useQuery(APPOINTMENTS_QUERY)

  const { data: patientData, loading: patientsLoading } = useQuery(PATIENTS_QUERY, {
    variables: { search: null },
  })

  const [createAppointment, { loading: creating }] = useMutation(CREATE_APPOINTMENT_MUTATION)
  const [updateAppointment, { loading: updating }] = useMutation(UPDATE_APPOINTMENT_MUTATION)
  const [deleteAppointment, { loading: deleting }] = useMutation(DELETE_APPOINTMENT_MUTATION)

  const appointments = appointmentData?.appointments ?? []
  const patients = patientData?.patients ?? []

  const isEditing = Boolean(form.id)
  const isSubmitting = creating || updating

  const resetForm = () => {
    setForm(defaultForm)
    setErrors({})
  }

  const validate = () => {
    const nextErrors = {}
    if (!form.patientId) nextErrors.patientId = 'Pilih pasien'
    if (!form.date) nextErrors.date = 'Pilih tanggal dan waktu'
    if (!form.reason.trim()) nextErrors.reason = 'Isi alasan janji'
    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!validate()) return

    const variables = {
      input: {
        patientId: form.patientId,
        date: toISOStringValue(form.date),
        reason: form.reason.trim(),
        status: form.status,
      },
    }

    if (isEditing) {
      await updateAppointment({ variables: { id: form.id, ...variables } })
      setMessage('Janji berhasil diperbarui')
    } else {
      await createAppointment({ variables })
      setMessage('Janji berhasil dibuat')
    }

    resetForm()
    refetchAppointments()
  }

  const handleEdit = (appointment) => {
    setForm({
      id: appointment.id,
      patientId: appointment.patient.id,
      date: toInputDatetime(appointment.date),
      reason: appointment.reason,
      status: appointment.status,
    })
    setErrors({})
  }

  const handleDelete = async (appointment) => {
    const confirmed = window.confirm(
      `Hapus janji ${appointment.patient.name} pada ${formatHumanDate(appointment.date)}?`,
    )
    if (!confirmed) return
    await deleteAppointment({ variables: { id: appointment.id } })
    setMessage('Janji dihapus')
    if (form.id === appointment.id) {
      resetForm()
    }
    refetchAppointments()
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm uppercase text-slate-400">Appointment Manager</p>
          <h1 className="text-2xl font-semibold text-slate-900">Kelola Janji Pasien</h1>
          <p className="text-sm text-slate-500">
            Tambah, ubah, atau hapus janji dan kalender akan otomatis mengikuti data terbaru.
          </p>
        </div>
      </div>

      {message && (
        <div className="rounded-full bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-700">
          {message}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <form
          onSubmit={handleSubmit}
          className="space-y-4 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm lg:col-span-1"
        >
          <div>
            <label className="text-sm font-medium text-slate-700">Pasien</label>
            <select
              name="patientId"
              value={form.patientId}
              onChange={(event) => setForm((prev) => ({ ...prev, patientId: event.target.value }))}
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
            >
              <option value="">Pilih pasien...</option>
              {patients.map((patient) => (
                <option key={patient.id} value={patient.id}>
                  {patient.name}
                </option>
              ))}
            </select>
            {errors.patientId && <p className="text-xs text-red-600">{errors.patientId}</p>}
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700">Tanggal & Waktu</label>
            <input
              type="datetime-local"
              value={form.date}
              onChange={(event) => setForm((prev) => ({ ...prev, date: event.target.value }))}
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
            />
            {errors.date && <p className="text-xs text-red-600">{errors.date}</p>}
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700">Alasan</label>
            <input
              type="text"
              value={form.reason}
              onChange={(event) => setForm((prev) => ({ ...prev, reason: event.target.value }))}
              placeholder="Contoh: Kontrol kehamilan"
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
            />
            {errors.reason && <p className="text-xs text-red-600">{errors.reason}</p>}
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700">Status</label>
            <select
              value={form.status}
              onChange={(event) => setForm((prev) => ({ ...prev, status: event.target.value }))}
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
            >
              {statusOptions.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              className="inline-flex items-center rounded-full bg-brand-600 px-5 py-2 text-sm font-semibold text-white disabled:opacity-50"
              disabled={isSubmitting || patientsLoading || appointmentsLoading}
            >
              {isSubmitting ? 'Menyimpan...' : isEditing ? 'Simpan Perubahan' : 'Buat Janji'}
            </button>
            {isEditing && (
              <button
                type="button"
                onClick={resetForm}
                className="inline-flex items-center rounded-full border border-slate-200 px-5 py-2 text-sm font-semibold text-slate-600"
              >
                Batal
              </button>
            )}
          </div>
        </form>

        <div className="space-y-3 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">
              Daftar Janji ({appointments.length})
            </h2>
            {(appointmentsLoading || deleting) && (
              <span className="text-xs text-slate-500">Memuat data...</span>
            )}
          </div>

          <ul className="space-y-3">
            {appointments.map((appointment) => (
              <li
                key={appointment.id}
                className="flex flex-col gap-3 rounded-2xl border border-slate-100 bg-slate-50/80 p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    {appointment.patient.name} • {appointment.patient.phone}
                  </p>
                  <p className="text-xs uppercase text-slate-400">
                    {formatHumanDate(appointment.date)}
                  </p>
                  <p className="text-sm text-slate-600">{appointment.reason}</p>
                </div>
                <div className="flex flex-wrap items-center gap-2 text-sm">
                  <span className="rounded-full bg-brand-50 px-3 py-1 font-semibold text-brand-700">
                    {appointment.status}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleEdit(appointment)}
                    className="rounded-full border border-slate-200 px-3 py-1 font-semibold text-slate-600"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(appointment)}
                    className="rounded-full border border-red-100 px-3 py-1 font-semibold text-red-600"
                  >
                    Hapus
                  </button>
                </div>
              </li>
            ))}
            {!appointmentsLoading && appointments.length === 0 && (
              <p className="text-sm text-slate-500">Belum ada janji terjadwal.</p>
            )}
          </ul>
        </div>
      </div>
    </section>
  )
}
