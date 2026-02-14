import { Navigate, Route, Routes } from 'react-router-dom'
import { AppLayout } from './components/AppLayout'
import { PatientList } from './pages/PatientList'
import { PatientDetail } from './pages/PatientDetail'
import { PatientForm } from './pages/PatientForm'
import { CalendarView } from './pages/CalendarView'
import { WorkflowBuilder } from './pages/WorkflowBuilder'
import { AppointmentManager } from './pages/AppointmentManager'

const App = () => {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<Navigate to="/patients" replace />} />
        <Route path="/patients" element={<PatientList />} />
        <Route path="/patients/new" element={<PatientForm />} />
        <Route path="/patients/:id" element={<PatientDetail />} />
        <Route path="/patients/:id/edit" element={<PatientForm />} />
        <Route path="/appointments" element={<AppointmentManager />} />
        <Route path="/calendar" element={<CalendarView />} />
        <Route path="/workflow" element={<WorkflowBuilder />} />
        <Route path="*" element={<Navigate to="/patients" replace />} />
      </Route>
    </Routes>
  )
}

export default App
