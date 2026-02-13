import { useMutation, useQuery } from '@apollo/client/react'
import { useEffect, useState, useRef } from 'react'
import { DndContext, PointerSensor, closestCenter, useSensor, useSensors, DragOverlay } from '@dnd-kit/core'
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

import { Save } from 'lucide-react'

export const WorkflowBuilder = () => {
  const { workflowSteps, setWorkflowSteps } = useUIStore()
  const [newStep, setNewStep] = useState('')
  const [status, setStatus] = useState(null)
  const [hasChanges, setHasChanges] = useState(false)
  const [activeId, setActiveId] = useState(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 6 },
    }),
  )

  const { loading, refetch } = useQuery(WORKFLOW_QUERY, {
    fetchPolicy: 'cache-and-network',
    onCompleted: (data) => {
      if (data?.workflow) {
        setWorkflowSteps(data.workflow)
        setHasChanges(false)
      }
    },
  })

  const [saveWorkflow, { loading: saving }] = useMutation(SAVE_WORKFLOW_MUTATION, {
    onCompleted: (result) => {
      setWorkflowSteps(result.saveWorkflow)
      setStatus({ type: 'success', message: 'Workflow berhasil disimpan' })
      setHasChanges(false)
      refetch()
    },
    onError: () => {
      setStatus({ type: 'error', message: 'Gagal menyimpan workflow' })
    },
  })

  useEffect(() => {
    if (status) {
      const timer = setTimeout(() => setStatus(null), 3000)
      return () => clearTimeout(timer)
    }
  }, [status])

  const addStep = (e) => {
    e?.preventDefault()
    if (!newStep.trim()) return
    setWorkflowSteps([...workflowSteps, { id: generateId(), name: newStep.trim() }])
    setNewStep('')
    setHasChanges(true)
  }

  const removeStep = (id) => {
    setWorkflowSteps(workflowSteps.filter((step) => step.id !== id))
    setHasChanges(true)
  }

  const updateStepName = (id, newName) => {
    setWorkflowSteps(
      workflowSteps.map((step) => (step.id === id ? { ...step, name: newName } : step))
    )
    setHasChanges(true)
  }

  const handleSave = async () => {
    await saveWorkflow({
      variables: {
        steps: workflowSteps.map(({ id, name }) => ({ id, name })),
      },
    })
  }

  const handleDragStart = (event) => {
    setActiveId(event.active.id)
  }

  const handleDragEnd = (event) => {
    const { active, over } = event
    setActiveId(null)
    if (!over || active.id === over.id) return
    const oldIndex = workflowSteps.findIndex((step) => step.id === active.id)
    const newIndex = workflowSteps.findIndex((step) => step.id === over.id)
    if (oldIndex === -1 || newIndex === -1) return
    setWorkflowSteps(arrayMove(workflowSteps, oldIndex, newIndex))
    setHasChanges(true)
  }

  const moveStep = (index, direction) => {
    const newIndex = index + direction
    if (newIndex < 0 || newIndex >= workflowSteps.length) return
    setWorkflowSteps(arrayMove(workflowSteps, index, newIndex))
    setHasChanges(true)
  }

  return (
    <section className="space-y-6 pb-12">
      <header className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-brand-50 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-brand-700 border border-brand-100">
              Konfigurasi
            </span>
            {hasChanges && (
              <span className="rounded-full bg-amber-50 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-amber-700 border border-amber-100 animate-pulse">
                Ada Perubahan
              </span>
            )}
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Alur Operasional</h1>
          <p className="text-sm text-slate-500">
            Atur tahapan perjalanan pasien mulai dari pendaftaran hingga selesai.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {status && (
            <div
              className={`rounded-full px-5 py-2.5 text-xs font-bold shadow-sm border text-center ${status.type === 'success'
                ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                : 'bg-red-50 text-red-700 border-red-100'
                }`}
            >
              {status.message}
            </div>
          )}
          <button
            type="button"
            onClick={handleSave}
            disabled={saving || !hasChanges}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-brand-600 px-8 py-3 text-sm font-bold text-white shadow-lg shadow-brand-100 transition hover:bg-brand-500 disabled:opacity-50"
          >
            {saving ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Processing...
              </>
            ) : (
              <>
                <Save size={18} />
                Simpan Perubahan
              </>
            )}
          </button>
        </div>
      </header>

      <div className="overflow-hidden rounded-2xl bg-white shadow-sm border border-slate-100">
        <div className="border-b border-slate-50 bg-slate-50/30 p-4 sm:p-6">
          <form onSubmit={addStep} className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Masukkan langkah baru (ex: Pemeriksaan TTV)"
                value={newStep}
                onChange={(e) => setNewStep(e.target.value)}
                className="w-full rounded-full border border-slate-200 bg-white px-5 py-3 text-sm transition focus:border-brand-500 focus:outline-none shadow-sm"
              />
            </div>
            <button
              type="submit"
              disabled={!newStep.trim()}
              className="rounded-full bg-slate-900 px-8 py-3 text-sm font-bold text-white transition hover:bg-slate-800 disabled:opacity-30 shadow-md"
            >
              Tambah
            </button>
          </form>
        </div>

        <div className="p-4">
          {loading && workflowSteps.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent" />
              <p className="mt-4 text-sm text-slate-500">Memuat workflow...</p>
            </div>
          )}

          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={workflowSteps.map((s) => s.id)} strategy={verticalListSortingStrategy}>
              <div className="space-y-3">
                {workflowSteps.map((step, index) => (
                  <WorkflowStepItem
                    key={step.id}
                    step={step}
                    index={index}
                    onRemove={() => removeStep(step.id)}
                    onUpdateName={(newName) => updateStepName(step.id, newName)}
                    onMove={(dir) => moveStep(index, dir)}
                    isFirst={index === 0}
                    isLast={index === workflowSteps.length - 1}
                  />
                ))}
              </div>
            </SortableContext>
            <DragOverlay dropAnimation={null}>
              {activeId ? (
                <div className="z-50 border-brand-200 bg-white shadow-xl ring-2 ring-brand-100 rounded-xl border p-3 flex items-center gap-3 opacity-90 scale-[1.02]">
                  <div className="flex h-8 w-6 items-center justify-center text-slate-400">
                    <svg width="10" height="16" viewBox="0 0 12 18" fill="currentColor">
                      <circle cx="2" cy="2" r="1.5" />
                      <circle cx="2" cy="9" r="1.5" />
                      <circle cx="2" cy="16" r="1.5" />
                      <circle cx="10" cy="2" r="1.5" />
                      <circle cx="10" cy="9" r="1.5" />
                      <circle cx="10" cy="16" r="1.5" />
                    </svg>
                  </div>
                  <div className="flex flex-col min-w-0 flex-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Memindahkan...
                    </span>
                    <span className="truncate text-sm font-semibold text-slate-900">
                      {workflowSteps.find((s) => s.id === activeId)?.name}
                    </span>
                  </div>
                </div>
              ) : null}
            </DragOverlay>
          </DndContext>

          {!loading && workflowSteps.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-50 text-slate-400">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2v20M2 12h20" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-slate-900">Mulai Susun Workflow</h3>
              <p className="mt-2 max-w-xs text-sm text-slate-500">
                Langkah operasional membantu tim Anda bekerja lebih terstruktur dan efisien.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

const WorkflowStepItem = ({ step, index, onRemove, onUpdateName, onMove, isFirst, isLast }) => {
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState(step.name)
  const inputRef = useRef(null)

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: step.id,
  })

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus()
      inputRef.current?.select()
    }
  }, [isEditing])

  const handleBlur = () => {
    setIsEditing(false)
    if (editValue.trim() && editValue !== step.name) {
      onUpdateName(editValue.trim())
    } else {
      setEditValue(step.name)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleBlur()
    if (e.key === 'Escape') {
      setIsEditing(false)
      setEditValue(step.name)
    }
  }

  const style = {
    transform: CSS.Translate.toString(transform),
    transition: transition || 'transform 200ms cubic-bezier(0.2, 0, 0, 1)',
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group relative flex items-center gap-3 rounded-xl border p-3 ${isDragging
        ? 'opacity-30 border-slate-100 bg-slate-50 shadow-none ring-0'
        : 'border-slate-100 bg-white hover:border-slate-200 hover:shadow-sm'
        }`}
    >
      <div
        {...listeners}
        {...attributes}
        className="flex h-8 w-6 cursor-grab items-center justify-center rounded-md text-slate-300 transition-colors hover:bg-slate-50 hover:text-slate-400 active:cursor-grabbing"
      >
        <svg width="10" height="16" viewBox="0 0 12 18" fill="currentColor">
          <circle cx="2" cy="2" r="1.5" />
          <circle cx="2" cy="9" r="1.5" />
          <circle cx="2" cy="16" r="1.5" />
          <circle cx="10" cy="2" r="1.5" />
          <circle cx="10" cy="9" r="1.5" />
          <circle cx="10" cy="16" r="1.5" />
        </svg>
      </div>

      <div className="flex flex-col min-w-0 flex-1">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
          Langkah {index + 1}
        </span>
        <div className="relative flex items-center">
          {isEditing ? (
            <input
              ref={inputRef}
              type="text"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onBlur={handleBlur}
              onKeyDown={handleKeyDown}
              className="w-full border-none bg-transparent p-0 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-0"
            />
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="truncate text-left text-sm font-semibold text-slate-900 transition-colors hover:text-brand-600 focus:outline-none"
            >
              {step.name}
            </button>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1">
        <div className="flex overflow-hidden rounded-lg bg-slate-50 opacity-0 transition-opacity group-hover:opacity-100">
          <button
            onClick={() => onMove(-1)}
            disabled={isFirst}
            className="flex h-7 w-7 items-center justify-center text-slate-400 hover:bg-white hover:text-brand-600 disabled:opacity-0"
            title="Pindah keatas"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="m18 15-6-6-6 6" />
            </svg>
          </button>
          <button
            onClick={() => onMove(1)}
            disabled={isLast}
            className="flex h-7 w-7 items-center justify-center text-slate-400 hover:bg-white hover:text-brand-600 disabled:opacity-0"
            title="Pindah kebawah"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="m6 9 6 6 6-6" />
            </svg>
          </button>
        </div>

        <button
          onClick={onRemove}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-300 transition-colors hover:bg-red-50 hover:text-red-500"
          title="Hapus langkah"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
          </svg>
        </button>
      </div>
    </div>
  )
}
