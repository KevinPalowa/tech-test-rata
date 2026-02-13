import { useMutation, useQuery } from '@apollo/client/react'
import { useEffect, useState } from 'react'
import { DndContext, PointerSensor, closestCenter, useSensor, useSensors } from '@dnd-kit/core'
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { SAVE_WORKFLOW_MUTATION, WORKFLOW_QUERY } from '../graphql/documents'
import { useUIStore } from '../store/uiStore'

const generateId = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  return `wf-${Math.random().toString(36).slice(2, 8)}`
}

export const WorkflowBuilder = () => {
  const { workflowSteps, setWorkflowSteps } = useUIStore()
  const [newStep, setNewStep] = useState('')
  const [status, setStatus] = useState(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 6 },
    }),
  )

  const { loading } = useQuery(WORKFLOW_QUERY, {
    onCompleted: (result) => setWorkflowSteps(result.workflow),
  })

  const [saveWorkflow, { loading: saving }] = useMutation(SAVE_WORKFLOW_MUTATION, {
    onCompleted: (result) => {
      setWorkflowSteps(result.saveWorkflow)
      setStatus('Workflow tersimpan')
    },
  })

  useEffect(() => {
    if (status) {
      const timer = setTimeout(() => setStatus(null), 2000)
      return () => clearTimeout(timer)
    }
  }, [status])

  const addStep = () => {
    if (!newStep.trim()) return
    setWorkflowSteps([...workflowSteps, { id: generateId(), name: newStep.trim() }])
    setNewStep('')
  }

  const removeStep = (id) => {
    setWorkflowSteps(workflowSteps.filter((step) => step.id !== id))
  }

  const handleSave = async () => {
    await saveWorkflow({
      variables: {
        steps: workflowSteps.map(({ id, name }) => ({ id, name })),
      },
    })
  }

  const handleDragEnd = (event) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = workflowSteps.findIndex((step) => step.id === active.id)
    const newIndex = workflowSteps.findIndex((step) => step.id === over.id)
    if (oldIndex === -1 || newIndex === -1) return
    setWorkflowSteps(arrayMove(workflowSteps, oldIndex, newIndex))
    setStatus('Urutan workflow diperbarui')
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm uppercase text-slate-400">Workflow Builder</p>
          <h1 className="text-2xl font-semibold text-slate-900">Alur Operasional Klinik</h1>
          <p className="text-sm text-slate-500">
            Tambah, hapus, dan ubah urutan langkah workflow sebelum menyimpannya.
          </p>
        </div>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center rounded-full bg-brand-600 px-5 py-2 text-sm font-semibold text-white disabled:opacity-50"
        >
          {saving ? 'Menyimpan...' : 'Simpan Workflow'}
        </button>
      </div>

      {status && (
        <div className="rounded-full bg-green-50 px-4 py-2 text-sm font-medium text-green-700">
          {status}
        </div>
      )}

      <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            type="text"
            placeholder="Contoh: Verifikasi BPJS"
            value={newStep}
            onChange={(event) => setNewStep(event.target.value)}
            className="flex-1 rounded-full border border-slate-200 px-4 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
          />
          <button
            type="button"
            onClick={addStep}
            className="rounded-full border border-brand-200 bg-brand-50 px-4 py-2 text-sm font-semibold text-brand-700"
          >
            + Tambah Langkah
          </button>
        </div>
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={workflowSteps.map((step) => step.id)} strategy={verticalListSortingStrategy}>
          <ol className="space-y-3">
            {workflowSteps.map((step, index) => (
              <WorkflowStepItem
                key={step.id}
                step={step}
                index={index}
                onRemove={() => removeStep(step.id)}
              />
            ))}
            {!loading && workflowSteps.length === 0 && (
              <p className="text-sm text-slate-500">Belum ada workflow yang disusun.</p>
            )}
          </ol>
        </SortableContext>
      </DndContext>
    </section>
  )
}

const WorkflowStepItem = ({ step, index, onRemove }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: step.id,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <li
      ref={setNodeRef}
      style={style}
      className={`flex items-center justify-between rounded-2xl border border-slate-100 bg-white p-4 shadow-sm ${
        isDragging ? 'ring-2 ring-brand-200' : ''
      }`}
    >
      <div className="flex items-center gap-4">
        <button
          type="button"
          className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-50 font-semibold text-brand-700"
          {...listeners}
          {...attributes}
        >
          {index + 1}
        </button>
        <div>
          <p className="text-sm font-semibold text-slate-900">{step.name}</p>
          <p className="text-xs text-slate-400">ID: {step.id}</p>
        </div>
      </div>
      <div className="flex items-center gap-2 text-sm">
        <span className="text-xs text-slate-400">Tarik untuk mengubah urutan</span>
        <button
          type="button"
          onClick={onRemove}
          className="rounded-full border border-red-100 px-3 py-1 text-red-600"
        >
          Hapus
        </button>
      </div>
    </li>
  )
}
