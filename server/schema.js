const { gql } = require('apollo-server');

const typeDefs = gql`
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
`;

module.exports = typeDefs;
