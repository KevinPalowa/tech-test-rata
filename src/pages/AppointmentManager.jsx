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
import { Modal } from '../components/Modal'

const defaultForm = {
  id: null,
  patientId: '',
  date: '',
  reason: '',
}

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

import { CheckCircle2, Pencil, Trash2 } from 'lucide-react'

export const AppointmentManager = () => {
  const [form, setForm] = useState(defaultForm)
  const [errors, setErrors] = useState({})
  const [message, setMessage] = useState(null)
  const [deletingAppointment, setDeletingAppointment] = useState(null)

  const {
    data: appointmentData,
    loading: appointmentsLoading,
  } = useQuery(APPOINTMENTS_QUERY)

  const { data: patientData, loading: patientsLoading } = useQuery(PATIENTS_QUERY, {
    variables: { search: null, limit: 100 },
  })

  const [createAppointment, { loading: creating }] = useMutation(CREATE_APPOINTMENT_MUTATION, {
    refetchQueries: [APPOINTMENTS_QUERY],
  })
  const [updateAppointment, { loading: updating }] = useMutation(UPDATE_APPOINTMENT_MUTATION, {
    refetchQueries: [APPOINTMENTS_QUERY],
  })
  const [deleteAppointment, { loading: deleting }] = useMutation(DELETE_APPOINTMENT_MUTATION, {
    refetchQueries: [APPOINTMENTS_QUERY],
  })

  const appointments = appointmentData?.appointments ?? []
  const patients = patientData?.patients?.patients ?? []

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
  }

  const handleEdit = (appointment) => {
    setForm({
      id: appointment.id,
      patientId: appointment.patient.id,
      date: toInputDatetime(appointment.date),
      reason: appointment.reason,
    })
    setErrors({})
  }

  const handleDelete = (appointment) => {
    setDeletingAppointment(appointment)
  }

  const confirmDelete = async () => {
    if (!deletingAppointment) return
    await deleteAppointment({ variables: { id: deletingAppointment.id } })
    setMessage('Janji dihapus')
    if (form.id === deletingAppointment.id) {
      resetForm()
    }
    setDeletingAppointment(null)
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Appointment Manager</p>
          <h1 className="text-2xl font-bold text-slate-900 mt-1">Kelola Janji Pasien</h1>
          <p className="text-sm text-slate-500 mt-1">
            Tambah, ubah, atau hapus janji temu klinis secara real-time.
          </p>
        </div>
      </div>

      {message && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700 shadow-sm animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 size={18} />
          {message}
        </div>
      )}

      <div className="grid gap-8 grid-cols-1 lg:grid-cols-3">
        <form
          onSubmit={handleSubmit}
          className="space-y-5 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm lg:col-span-1 h-fit"
        >
          <h2 className="text-lg font-bold text-slate-900 border-b border-slate-50 pb-3">{isEditing ? 'Edit Janji' : 'Janji Baru'}</h2>
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Pasien Terdaftar</label>
            <select
              name="patientId"
              value={form.patientId}
              onChange={(event) => setForm((prev) => ({ ...prev, patientId: event.target.value }))}
              className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2.5 text-sm font-semibold text-slate-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100 transition"
            >
              <option value="">Pilih pasien...</option>
              {patients.map((patient) => (
                <option key={patient.id} value={patient.id}>
                  {patient.name}
                </option>
              ))}
            </select>
            {errors.patientId && <p className="mt-1 text-[10px] font-bold text-red-600 uppercase tracking-tighter">{errors.patientId}</p>}
          </div>

          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Tanggal & Waktu</label>
            <input
              type="datetime-local"
              value={form.date}
              onChange={(event) => setForm((prev) => ({ ...prev, date: event.target.value }))}
              className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2.5 text-sm font-semibold text-slate-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100 transition"
            />
            {errors.date && <p className="mt-1 text-[10px] font-bold text-red-600 uppercase tracking-tighter">{errors.date}</p>}
          </div>

          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Alasan Kunjungan</label>
            <input
              type="text"
              value={form.reason}
              onChange={(event) => setForm((prev) => ({ ...prev, reason: event.target.value }))}
              placeholder="Contoh: Kontrol Rutin"
              className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2.5 text-sm font-semibold text-slate-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100 transition"
            />
            {errors.reason && <p className="mt-1 text-[10px] font-bold text-red-600 uppercase tracking-tighter">{errors.reason}</p>}
          </div>

          <div className="flex flex-col gap-3 pt-3">
            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-full bg-brand-600 px-6 py-2.5 text-sm font-bold text-white shadow-md shadow-brand-100 transition hover:bg-brand-500 disabled:opacity-50"
              disabled={isSubmitting || patientsLoading || appointmentsLoading}
            >
              {isSubmitting ? 'Processing...' : isEditing ? 'Simpan Perubahan' : 'Buat Janji'}
            </button>
            {isEditing && (
              <button
                type="button"
                onClick={resetForm}
                className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-6 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-50 transition"
              >
                Batal Edit
              </button>
            )}
          </div>
        </form>

        <div className="space-y-4 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm lg:col-span-2">
          <header className="flex items-center justify-between border-b border-slate-50 pb-4">
            <h2 className="text-lg font-bold text-slate-900">
              Daftar Janji Terjadwal
            </h2>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-bold text-slate-600">
                {appointments.length} TOTAL
              </span>
              {(appointmentsLoading || deleting) && (
                <div className="h-3 w-3 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
              )}
            </div>
          </header>

          <ul className="space-y-4">
            {appointments.map((appointment) => (
              <li
                key={appointment.id}
                className="group flex flex-col gap-4 rounded-2xl border border-slate-50 bg-slate-50/30 p-5 transition hover:border-brand-100 hover:bg-brand-50/20 md:flex-row md:items-center md:justify-between"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold text-slate-900 truncate">
                      {appointment.patient.name}
                    </p>
                    <span className="text-[10px] font-bold text-slate-400">•</span>
                    <p className="text-[10px] font-bold text-slate-500 uppercase">{appointment.patient.phone}</p>
                  </div>
                  <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-brand-600">
                    {formatHumanDate(appointment.date)}
                  </p>
                  <p className="mt-1.5 text-sm text-slate-600 leading-relaxed italic">"{appointment.reason}"</p>
                </div>
                <div className="flex flex-wrap items-center gap-2 border-t border-slate-100 pt-4 md:border-0 md:pt-0">
                  <div className="flex gap-2 ml-auto md:ml-0">
                    <button
                      type="button"
                      onClick={() => handleEdit(appointment)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-600 hover:border-brand-200 hover:text-brand-600 transition shadow-sm"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(appointment)}
                      className="inline-flex items-center justify-center rounded-lg border border-red-100 bg-white p-1.5 text-red-600 hover:bg-red-50 hover:border-red-200 transition shadow-sm"
                      title="Hapus"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </li>
            ))}
            {!appointmentsLoading && appointments.length === 0 && (
              <div className="py-12 text-center">
                <p className="text-sm text-slate-400 italic">Belum ada janji terjadwal.</p>
              </div>
            )}
          </ul>
        </div>
      </div>

      <Modal
        isOpen={Boolean(deletingAppointment)}
        onClose={() => setDeletingAppointment(null)}
        onConfirm={confirmDelete}
        title="Hapus Janji Terjadwal?"
        message={
          deletingAppointment
            ? `Apakah Anda yakin ingin menghapus janji temu untuk ${deletingAppointment.patient.name} pada ${formatHumanDate(deletingAppointment.date)}? Tindakan ini tidak dapat dibatalkan.`
            : ''
        }
        confirmLabel="Hapus Janji"
        cancelLabel="Kembali"
      />
    </section>
  )
}
