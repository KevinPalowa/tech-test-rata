import { gql } from '@apollo/client'

export const PATIENTS_QUERY = gql`
  query Patients($search: String, $limit: Int, $offset: Int) {
    patients(search: $search, limit: $limit, offset: $offset) {
      patients {
        id
        name
        dateOfBirth
        gender
        phone
        tags
        notes
      }
      totalCount
    }
  }
`

export const PATIENT_DETAIL_QUERY = gql`
  query Patient($id: ID!) {
    patient(id: $id) {
      id
      name
      dateOfBirth
      gender
      phone
      address
      allergies
      tags
      notes
      appointments {
        id
        date
        reason
      }
    }
  }
`

export const UPSERT_PATIENT_MUTATION = gql`
  mutation UpsertPatient($id: ID, $input: PatientInput!) {
    upsertPatient(id: $id, input: $input) {
      id
      name
      dateOfBirth
      gender
      phone
      address
      allergies
      tags
      notes
    }
  }
`

export const APPOINTMENTS_QUERY = gql`
  query Appointments($start: String, $end: String) {
    appointments(start: $start, end: $end) {
      id
      date
      reason
      patient {
        id
        name
        phone
      }
    }
  }
`

export const WORKFLOW_QUERY = gql`
  query Workflow {
    workflow {
      id
      name
    }
  }
`

export const SAVE_WORKFLOW_MUTATION = gql`
  mutation SaveWorkflow($steps: [WorkflowStepInput!]!) {
    saveWorkflow(steps: $steps) {
      id
      name
    }
  }
`

export const CREATE_APPOINTMENT_MUTATION = gql`
  mutation CreateAppointment($input: AppointmentInput!) {
    createAppointment(input: $input) {
      id
      date
      reason
      patient {
        id
        name
        phone
      }
    }
  }
`

export const UPDATE_APPOINTMENT_MUTATION = gql`
  mutation UpdateAppointment($id: ID!, $input: AppointmentInput!) {
    updateAppointment(id: $id, input: $input) {
      id
      date
      reason
      patient {
        id
        name
        phone
      }
    }
  }
`

export const DELETE_APPOINTMENT_MUTATION = gql`
  mutation DeleteAppointment($id: ID!) {
    deleteAppointment(id: $id)
  }
`
