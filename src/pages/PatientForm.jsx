import { useMutation, useQuery } from '@apollo/client/react'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { PATIENT_DETAIL_QUERY, UPSERT_PATIENT_MUTATION } from '../graphql/documents'
import { useUIStore } from '../store/uiStore'

const emptyForm = {
  name: '',
  dateOfBirth: '',
  gender: 'Female',
  phone: '',
  address: '',
  allergies: '',
  tags: '',
  notes: '',
}

const parseList = (value) =>
  value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)

export const PatientForm = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const role = useUIStore((state) => state.role)
  const isEditing = Boolean(id)
  const [formState, setFormState] = useState(emptyForm)
  const [errors, setErrors] = useState({})

  const { data, loading } = useQuery(PATIENT_DETAIL_QUERY, {
    variables: { id },
    skip: !isEditing,
  })

  const [savePatient, { loading: saving }] = useMutation(UPSERT_PATIENT_MUTATION)

  useEffect(() => {
    if (data?.patient) {
      const patient = data.patient
      setFormState({
        name: patient.name,
        dateOfBirth: patient.dateOfBirth,
        gender: patient.gender,
        phone: patient.phone,
        address: patient.address,
        allergies: patient.allergies.join(', '),
        tags: patient.tags.join(', '),
        notes: patient.notes ?? '',
      })
    }
  }, [data])

  const actionLabel = useMemo(() => (isEditing ? 'Simpan Perubahan' : 'Tambah Pasien'), [isEditing])

  if (role === 'staff') {
    return (
      <section className="rounded-2xl border border-amber-100 bg-amber-50 p-6 text-sm text-amber-800">
        Role staff tidak diperbolehkan mengakses form pasien.
      </section>
    )
  }

  const handleChange = (event) => {
    const { name, value } = event.target
    setFormState((prev) => ({ ...prev, [name]: value }))
  }

  const validate = () => {
    const nextErrors = {}
    if (!formState.name.trim()) nextErrors.name = 'Nama wajib diisi'
    if (!formState.dateOfBirth) nextErrors.dateOfBirth = 'Tanggal lahir wajib diisi'
    if (!formState.phone.trim()) nextErrors.phone = 'Nomor telepon wajib diisi'
    if (!formState.address.trim()) nextErrors.address = 'Alamat wajib diisi'
    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!validate()) return

    const input = {
      name: formState.name.trim(),
      dateOfBirth: formState.dateOfBirth,
      gender: formState.gender,
      phone: formState.phone.trim(),
      address: formState.address.trim(),
      allergies: parseList(formState.allergies),
      tags: parseList(formState.tags),
      notes: formState.notes.trim(),
    }

    const response = await savePatient({
      variables: { id, input },
    })

    const patientId = response.data?.upsertPatient?.id
    if (patientId) {
      navigate(`/patients/${patientId}`)
    }
  }

  return (
    <section>
      <div className="mb-6">
        <p className="text-sm uppercase text-slate-400">
          {isEditing ? 'Edit Pasien' : 'Tambah Pasien'}
        </p>
        <h1 className="text-2xl font-semibold text-slate-900">
          {isEditing ? formState.name : 'Data Pasien Baru'}
        </h1>
        <p className="text-sm text-slate-500">
          Lengkapi data dasar pasien. Field dengan tanda * wajib diisi.
        </p>
      </div>

      {isEditing && loading && (
        <div className="mb-4 rounded-xl border border-slate-100 bg-white p-4 text-sm text-slate-500">
          Memuat data pasien...
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="space-y-6 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm"
      >
        <div className="grid gap-6 md:grid-cols-2">
          <Field
            label="Nama Lengkap*"
            name="name"
            value={formState.name}
            onChange={handleChange}
            error={errors.name}
          />
          <Field
            label="Tanggal Lahir*"
            name="dateOfBirth"
            type="date"
            value={formState.dateOfBirth}
            onChange={handleChange}
            error={errors.dateOfBirth}
          />
          <Field label="Jenis Kelamin" name="gender">
            <select
              name="gender"
              value={formState.gender}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
            >
              <option value="Female">Perempuan</option>
              <option value="Male">Laki-laki</option>
            </select>
          </Field>
          <Field
            label="Nomor Telepon*"
            name="phone"
            value={formState.phone}
            onChange={handleChange}
            error={errors.phone}
          />
          <Field
            label="Alamat*"
            name="address"
            value={formState.address}
            onChange={handleChange}
            error={errors.address}
          />
          <Field
            label="Catatan"
            name="notes"
            value={formState.notes}
            onChange={handleChange}
            type="textarea"
          />
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Field
            label="Alergi (pisahkan dengan koma)"
            name="allergies"
            value={formState.allergies}
            onChange={handleChange}
          />
          <Field
            label="Tags (pisahkan dengan koma)"
            name="tags"
            value={formState.tags}
            onChange={handleChange}
          />
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center rounded-full bg-brand-600 px-6 py-2 text-sm font-semibold text-white shadow-sm disabled:opacity-50"
          >
            {saving ? 'Menyimpan...' : actionLabel}
          </button>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center rounded-full border border-slate-200 px-6 py-2 text-sm font-semibold text-slate-600"
          >
            Batal
          </button>
        </div>
      </form>
    </section>
  )
}

const Field = ({ label, name, value, onChange, type = 'text', error, children }) => (
  <label className="space-y-1 text-sm text-slate-700">
    <span className="font-medium">{label}</span>
    {children ? (
      children
    ) : type === 'textarea' ? (
      <textarea
        name={name}
        value={value}
        onChange={onChange}
        rows={3}
        className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
      />
    ) : (
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
      />
    )}
    {error && <p className="text-xs text-red-600">{error}</p>}
  </label>
)
