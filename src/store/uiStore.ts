import { create } from 'zustand'

interface UIState {
  patientSearch: string
  setPatientSearch: (value: string) => void
  role: string
  setRole: (role: string) => void
  workflowSteps: any[] // Ideally this should be typed properly if we know the structure
  setWorkflowSteps: (steps: any[]) => void
}

export const useUIStore = create<UIState>((set) => ({
  patientSearch: '',
  setPatientSearch: (value) => set({ patientSearch: value }),
  role: 'admin',
  setRole: (role) => set({ role }),
  workflowSteps: [],
  setWorkflowSteps: (steps) => set({ workflowSteps: steps }),
}))
