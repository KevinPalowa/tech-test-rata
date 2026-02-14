import { useMutation, useQuery } from '@apollo/client/react'
import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { PATIENTS_QUERY, PATIENT_DETAIL_QUERY, UPSERT_PATIENT_MUTATION } from '../graphql/documents'
import { useUIStore } from '../store/uiStore'

interface PatientInput {
  name: string
  dateOfBirth: string
  gender: string
  phone: string
  address: string
  allergies: string[]
  notes: string
}

interface FormState extends PatientInput {}

interface PatientDetailData {
  patient: FormState & { id: string }
}

interface UpsertPatientData {
  upsertPatient: {
    id: string
  }
}

interface UpsertPatientVars {
  id?: string
  input: PatientInput
}

const emptyForm: FormState = {
  name: '',
  dateOfBirth: '',
  gender: 'Female',
  phone: '',
  address: '',
  allergies: [],
  notes: '',
}

export const PatientForm = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const role = useUIStore((state) => state.role)
  const isEditing = Boolean(id)
  const [formState, setFormState] = useState<FormState>(emptyForm)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const { loading, data } = useQuery<PatientDetailData>(PATIENT_DETAIL_QUERY, {
    variables: { id },
    skip: !isEditing,
  })

  const [prevPatient, setPrevPatient] = useState<PatientDetailData['patient'] | null>(null)
  if (isEditing && data?.patient && data.patient !== prevPatient) {
    setPrevPatient(data.patient)
    const patient = data.patient
    setFormState({
      name: patient.name,
      dateOfBirth: patient.dateOfBirth,
      gender: patient.gender,
      phone: patient.phone,
      address: patient.address,
      allergies: patient.allergies || [],
      notes: patient.notes ?? '',
    })
  }

  const [savePatient, { loading: saving }] = useMutation<UpsertPatientData, UpsertPatientVars>(UPSERT_PATIENT_MUTATION, {
    refetchQueries: [
      { query: PATIENTS_QUERY },
      ...(id ? [{ query: PATIENT_DETAIL_QUERY, variables: { id } }] : []),
    ],
  })

  const actionLabel = useMemo(() => (isEditing ? 'Simpan Perubahan' : 'Tambah Pasien'), [isEditing])

  if (role === 'staff') {
    return (
      <section className="rounded-2xl border border-amber-100 bg-amber-50 p-6 text-sm text-amber-800">
        Role staff tidak diperbolehkan mengakses form pasien.
      </section>
    )
  }

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = event.target
    setFormState((prev) => ({ ...prev, [name]: value }))
  }

  const handleTagsChange = (name: string, newTags: string[]) => {
    setFormState((prev) => ({ ...prev, [name]: newTags }))
  }

  const validate = () => {
    const nextErrors: Record<string, string> = {}
    if (!formState.name.trim()) nextErrors.name = 'Nama wajib diisi'
    if (!formState.dateOfBirth) nextErrors.dateOfBirth = 'Tanggal lahir wajib diisi'

    const phone = formState.phone.trim()
    if (!phone) {
      nextErrors.phone = 'Nomor telepon wajib diisi'
    } else if (!/^(\+62|0)8[1-9][0-9]{7,10}$/.test(phone)) {
      nextErrors.phone = 'Format nomor telepon tidak valid (contoh: 08123456789)'
    }

    if (!formState.address.trim()) nextErrors.address = 'Alamat wajib diisi'
    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!validate()) return

    const input: PatientInput = {
      name: formState.name.trim(),
      dateOfBirth: formState.dateOfBirth,
      gender: formState.gender,
      phone: formState.phone.trim(),
      address: formState.address.trim(),
      allergies: formState.allergies,
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
    <section className="w-full">
      <div className="mb-8">
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
          {isEditing ? 'Manajemen Pasien' : 'Registrasi Baru'}
        </p>
        <h1 className="text-3xl font-bold text-slate-900 mt-1">
          {isEditing ? `Edit: ${formState.name}` : 'Tambah Pasien'}
        </h1>
        <p className="text-sm text-slate-500 mt-2">
          Lengkapi data dasar pasien. Field bertanda <span className="text-red-500 font-bold">*</span> wajib diisi.
        </p>
      </div>

      {isEditing && loading && (
        <div className="mb-6 rounded-xl border border-slate-100 bg-white p-4 text-sm text-slate-500 flex items-center gap-3">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-brand-600 border-t-transparent" />
          Memuat data pasien...
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="space-y-8 rounded-2xl border border-slate-100 bg-white p-6 sm:p-8 shadow-sm"
      >
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
          <Field
            label="Nama Lengkap"
            name="name"
            required
            value={formState.name}
            onChange={handleChange}
            error={errors.name}
          />
          <Field
            label="Tanggal Lahir"
            name="dateOfBirth"
            type="date"
            required
            value={formState.dateOfBirth}
            onChange={handleChange}
            error={errors.dateOfBirth}
          />
          <Field label="Jenis Kelamin" name="gender">
            <select
              name="gender"
              value={formState.gender}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-sm font-semibold text-slate-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100 transition"
            >
              <option value="Female">Perempuan</option>
              <option value="Male">Laki-laki</option>
            </select>
          </Field>
          <Field
            label="Nomor Telepon"
            name="phone"
            required
            value={formState.phone}
            onChange={handleChange}
            error={errors.phone}
            placeholder="0812..."
          />
          <div className="md:col-span-2">
            <Field
              label="Alamat Lengkap"
              name="address"
              required
              value={formState.address}
              onChange={handleChange}
              error={errors.address}
              type="textarea"
            />
          </div>
          <div className="md:col-span-2">
            <Field
              label="Catatan Khusus"
              name="notes"
              value={formState.notes}
              onChange={handleChange}
              type="textarea"
              placeholder="Tambahkan catatan jika ada..."
            />
          </div>
          <div className="md:col-span-2 border-t border-slate-50">
            <TagInput
              label="Daftar Alergi"
              tags={formState.allergies}
              onChange={(newTags) => handleTagsChange('allergies', newTags)}
              placeholder="Ketik lalu tekan enter/koma..."
              color="red"
            />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-slate-50">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center justify-center rounded-full bg-brand-600 px-8 py-3 text-sm font-bold text-white shadow-lg shadow-brand-100 transition hover:bg-brand-500 disabled:opacity-50"
          >
            {saving ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Menyimpan...
              </>
            ) : actionLabel}
          </button>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-8 py-3 text-sm font-bold text-slate-600 hover:bg-slate-50 transition"
          >
            Batal
          </button>
        </div>
      </form>
    </section>
  )
}

interface TagInputProps {
  label: string
  tags: string[]
  onChange: (tags: string[]) => void
  placeholder: string
  color?: 'brand' | 'red'
}

const TagInput = ({ label, tags, onChange, placeholder, color = 'brand' }: TagInputProps) => {
  const [inputValue, setInputValue] = useState('')

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === ',') {
      event.preventDefault()
      addTag()
    } else if (event.key === 'Enter') {
      event.preventDefault()
      addTag()
    } else if (event.key === 'Backspace' && !inputValue && tags.length > 0) {
      removeTag(tags.length - 1)
    }
  }

  const addTag = () => {
    const trimmedValue = inputValue.trim()
    if (trimmedValue && !tags.includes(trimmedValue)) {
      onChange([...tags, trimmedValue])
    }
    setInputValue('')
  }

  const removeTag = (indexToRemove: number) => {
    onChange(tags.filter((_, index) => index !== indexToRemove))
  }

  const colorClasses = {
    brand: 'bg-brand-50 text-brand-700 border-brand-100',
    red: 'bg-red-50 text-red-700 border-red-100',
  }

  const chipColor = colorClasses[color] || colorClasses.brand

  return (
    <div className="space-y-1">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      <div className="flex min-h-[42px] flex-wrap gap-2 rounded-xl border border-slate-200 p-2 focus-within:border-brand-500 focus-within:ring-2 focus-within:ring-brand-100">
        {tags.map((tag, index) => (
          <span
            key={index}
            className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium ${chipColor}`}
          >
            {tag}
            <button
              type="button"
              onClick={() => removeTag(index)}
              className="hover:text-slate-900"
            >
              ×
            </button>
          </span>
        ))}
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={addTag}
          placeholder={tags.length === 0 ? placeholder : ''}
          className="flex-1 min-w-[120px] border-none bg-transparent p-0 text-sm outline-none placeholder:text-slate-400"
        />
      </div>
      <p className="text-[10px] text-slate-400">Type comma (,) or Enter to add</p>
    </div>
  )
}

interface FieldProps {
  label: string
  name: string
  value?: string | number
  onChange?: React.ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  type?: string
  error?: string
  children?: React.ReactNode
  required?: boolean
  placeholder?: string
}

const Field = ({ label, name, value, onChange, type = 'text', error, children, required, placeholder }: FieldProps) => (
  <label className="space-y-1 text-sm text-slate-700">
    <span className="font-medium">
      {label}
      {required && <span className="ml-1 text-red-500">*</span>}
    </span>
    {children ? (
      children
    ) : type === 'textarea' ? (
      <textarea
        name={name}
        value={value}
        onChange={onChange}
        rows={3}
        placeholder={placeholder}
        className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
      />
    ) : (
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
      />
    )}
    {error && <p className="text-xs text-red-600">{error}</p>}
  </label>
)
