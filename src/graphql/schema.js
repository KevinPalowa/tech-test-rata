import { makeExecutableSchema } from '@graphql-tools/schema'

const STORAGE_KEY = 'mini-clinic-data'

const defaultData = {
  patients: [
    {
      id: 'p1',
      name: 'Dewi Rahmawati',
      dateOfBirth: '1989-07-15',
      gender: 'Female',
      phone: '+62 812-3456-7890',
      address: 'Jl. Sudirman No. 12, Jakarta',
      allergies: ['Penicillin'],
      tags: ['BPJS', 'Hipertensi'],
      notes: 'Perlu cek tekanan darah setiap kunjungan.',
    },
    {
      id: 'p2',
      name: 'Budi Santoso',
      dateOfBirth: '1975-11-03',
      gender: 'Male',
      phone: '+62 811-2389-555',
      address: 'Jl. Diponegoro No. 8, Bandung',
      allergies: [],
      tags: ['Asma'],
      notes: 'Membawa inhaler sendiri.',
    },
    {
      id: 'p3',
      name: 'Siti Nur Aisyah',
      dateOfBirth: '1994-02-21',
      gender: 'Female',
      phone: '+62 822-9911-2200',
      address: 'Jl. Taman Siswa No. 5, Yogyakarta',
      allergies: ['Seafood'],
      tags: ['Kehamilan'],
      notes: 'Trimester kedua, jadwal kontrol 2 minggu sekali.',
    },
  ],
  visits: [
    {
      id: 'v1',
      patientId: 'p1',
      date: '2025-01-05T09:00:00+07:00',
      doctor: 'dr. Aditya',
      reason: 'Kontrol hipertensi',
      notes: 'Tekanan darah 130/85, lanjutkan obat.',
      prescription: 'Amlodipine 5mg',
    },
    {
      id: 'v2',
      patientId: 'p1',
      date: '2024-12-11T09:30:00+07:00',
      doctor: 'dr. Aditya',
      reason: 'Keluhan pusing',
      notes: 'Hasil lab normal, istirahat cukup.',
      prescription: 'Multivitamin',
    },
    {
      id: 'v3',
      patientId: 'p2',
      date: '2024-11-22T13:30:00+07:00',
      doctor: 'dr. Ratna',
      reason: 'Kontrol asma',
      notes: 'Tidak ada serangan baru.',
      prescription: 'Controller inhaler 2x sehari',
    },
    {
      id: 'v4',
      patientId: 'p3',
      date: '2024-12-30T11:00:00+07:00',
      doctor: 'dr. Yani',
      reason: 'Kontrol kehamilan',
      notes: 'Janin sehat, lanjutkan vitamin.',
      prescription: 'Vitamin prenatal',
    },
  ],
  appointments: [
    {
      id: 'a1',
      patientId: 'p1',
      date: '2025-01-20T08:00:00+07:00',
      reason: 'General check',
      status: 'scheduled',
    },
    {
      id: 'a2',
      patientId: 'p2',
      date: '2025-01-18T10:30:00+07:00',
      reason: 'Spirometri',
      status: 'scheduled',
    },
    {
      id: 'a3',
      patientId: 'p3',
      date: '2025-01-19T09:15:00+07:00',
      reason: 'Kontrol kandungan',
      status: 'scheduled',
    },
    {
      id: 'a4',
      patientId: 'p2',
      date: '2025-01-25T14:00:00+07:00',
      reason: 'Edukasi diet',
      status: 'pending',
    },
  ],
  workflowSteps: [
    { id: 'wf-1', name: 'Registrasi' },
    { id: 'wf-2', name: 'Pemeriksaan' },
    { id: 'wf-3', name: 'Obat' },
    { id: 'wf-4', name: 'Pembayaran' },
  ],
}

const cloneDefaultData = () => JSON.parse(JSON.stringify(defaultData))

const hasStorageAccess = () =>
  typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'

const loadInitialData = () => {
  const fallback = cloneDefaultData()
  if (!hasStorageAccess()) {
    return fallback
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(fallback))
      return fallback
    }
    const parsed = JSON.parse(raw)
    return {
      patients: parsed.patients ?? fallback.patients,
      visits: parsed.visits ?? fallback.visits,
      appointments: parsed.appointments ?? fallback.appointments,
      workflowSteps: parsed.workflowSteps ?? fallback.workflowSteps,
    }
  } catch (error) {
    console.warn('Failed to load clinic data from storage', error)
    return fallback
  }
}

const persistData = () => {
  if (!hasStorageAccess()) return
  try {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ patients, visits, appointments, workflowSteps }),
    )
  } catch (error) {
    console.warn('Failed to persist clinic data', error)
  }
}

const initialData = loadInitialData()

let patients = initialData.patients
const visits = initialData.visits
let appointments = initialData.appointments
let workflowSteps = initialData.workflowSteps

const typeDefs = `#graphql
  type Patient {
    id: ID!
    name: String!
    dateOfBirth: String!
    gender: String!
    phone: String!
    address: String!
    allergies: [String!]!
    tags: [String!]!
    notes: String
    appointments: [Appointment!]!
    visits: [Visit!]!
  }

  type Appointment {
    id: ID!
    patientId: ID!
    date: String!
    reason: String!
    status: String!
    patient: Patient!
  }

  type Visit {
    id: ID!
    patientId: ID!
    date: String!
    doctor: String!
    reason: String!
    notes: String!
    prescription: String
  }

  type WorkflowStep {
    id: ID!
    name: String!
  }

  input PatientInput {
    name: String!
    dateOfBirth: String!
    gender: String!
    phone: String!
    address: String!
    allergies: [String!]
    tags: [String!]
    notes: String
  }

  input WorkflowStepInput {
    id: ID
    name: String!
  }

  input AppointmentInput {
    patientId: ID!
    date: String!
    reason: String!
    status: String!
  }

  type Query {
    patients(search: String): [Patient!]!
    patient(id: ID!): Patient
    appointments(start: String, end: String): [Appointment!]!
    appointment(id: ID!): Appointment
    workflow: [WorkflowStep!]!
  }

  type Mutation {
    createPatient(input: PatientInput!): Patient!
    updatePatient(id: ID!, input: PatientInput!): Patient!
    upsertPatient(id: ID, input: PatientInput!): Patient!
    createAppointment(input: AppointmentInput!): Appointment!
    updateAppointment(id: ID!, input: AppointmentInput!): Appointment!
    deleteAppointment(id: ID!): Boolean!
    saveWorkflow(steps: [WorkflowStepInput!]!): [WorkflowStep!]!
  }
`

const normalizePatientInput = (input) => ({
  ...input,
  allergies: (input.allergies ?? []).filter(Boolean),
  tags: (input.tags ?? []).filter(Boolean),
})

const findPatientIndex = (id) => patients.findIndex((patient) => patient.id === id)
const findAppointmentIndex = (id) =>
  appointments.findIndex((appointment) => appointment.id === id)

const resolvers = {
  Query: {
    patients: (_, { search }) => {
      if (!search) {
        return patients
      }
      const normalized = search.toLowerCase()
      return patients.filter(
        (patient) =>
          patient.name.toLowerCase().includes(normalized) ||
          patient.phone.toLowerCase().includes(normalized) ||
          patient.tags.some((tag) => tag.toLowerCase().includes(normalized)),
      )
    },
    patient: (_, { id }) => patients.find((patient) => patient.id === id) ?? null,
    appointments: (_, { start, end }) => {
      const startDate = start ? new Date(start) : null
      const endDate = end ? new Date(end) : null

      return appointments.filter((appt) => {
        const date = new Date(appt.date)
        if (startDate && date < startDate) return false
        if (endDate && date > endDate) return false
        return true
      })
    },
    appointment: (_, { id }) => appointments.find((appt) => appt.id === id) ?? null,
    workflow: () => workflowSteps,
  },
  Mutation: {
    createPatient: (_, { input }) => {
      const newPatient = {
        id: `p${patients.length + 1}`,
        ...normalizePatientInput(input),
      }
      patients.unshift(newPatient)
      persistData()
      return newPatient
    },
    updatePatient: (_, { id, input }) => {
      const index = findPatientIndex(id)
      if (index === -1) {
        throw new Error('Patient not found')
      }
      patients[index] = { ...patients[index], ...normalizePatientInput(input) }
      persistData()
      return patients[index]
    },
    upsertPatient: (_, { id, input }) => {
      if (id) {
        return resolvers.Mutation.updatePatient(_, { id, input })
      }
      return resolvers.Mutation.createPatient(_, { input })
    },
    createAppointment: (_, { input }) => {
      const patient = patients.find((candidate) => candidate.id === input.patientId)
      if (!patient) {
        throw new Error('Patient not found')
      }
      const newAppointment = {
        id: `a${appointments.length + 1}`,
        ...input,
      }
      appointments = [...appointments, newAppointment]
      persistData()
      return newAppointment
    },
    updateAppointment: (_, { id, input }) => {
      const index = findAppointmentIndex(id)
      if (index === -1) {
        throw new Error('Appointment not found')
      }
      const updated = { ...appointments[index], ...input }
      appointments[index] = updated
      persistData()
      return updated
    },
    deleteAppointment: (_, { id }) => {
      const index = findAppointmentIndex(id)
      if (index === -1) {
        return false
      }
      appointments.splice(index, 1)
      persistData()
      return true
    },
    saveWorkflow: (_, { steps }) => {
      workflowSteps = steps.map((step, index) => ({
        id: step.id ?? `wf-${index + 1}`,
        name: step.name,
      }))
      persistData()
      return workflowSteps
    },
  },
  Patient: {
    appointments: (patient) => appointments.filter((appt) => appt.patientId === patient.id),
    visits: (patient) =>
      visits
        .filter((visit) => visit.patientId === patient.id)
        .sort((a, b) => new Date(b.date) - new Date(a.date)),
  },
  Appointment: {
    patient: (appointment) => patients.find((patient) => patient.id === appointment.patientId),
  },
}

export const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
})
