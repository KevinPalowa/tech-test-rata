import { create } from 'zustand'

export const useUIStore = create((set) => ({
  patientSearch: '',
  setPatientSearch: (value) => set({ patientSearch: value }),
  role: 'admin',
  setRole: (role) => set({ role }),
  workflowSteps: [],
  setWorkflowSteps: (steps) => set({ workflowSteps: steps }),
}))
