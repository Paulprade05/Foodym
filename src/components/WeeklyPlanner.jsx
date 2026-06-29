import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Plus, Dumbbell, Trash2, Copy } from 'lucide-react'
import PlanExerciseRow from './PlanExerciseRow'
import ExercisePickerModal from './ExercisePickerModal'
import { DAYS } from '../constants/days'

export default function WeeklyPlanner({ weeklyPlan, onUpdate }) {
  const [day, setDay] = useState('mon')
  const [pickerOpen, setPickerOpen] = useState(false)

  const dayList = weeklyPlan[day] || []
  const dayLabel = DAYS.find((d) => d.id === day)?.label || ''

  // Mutaciones siempre sobre el estado más reciente (evita pisar cambios en clics rápidos).
  const mutateDay = (fn) =>
    onUpdate((prev) => {
      const plan = prev.weeklyPlan || {}
      return { weeklyPlan: { ...plan, [day]: fn(plan[day] || []) } }
    })

  const addExercise = (ex) =>
    mutateDay((list) =>
      list.some((e) => e.id === ex.id)
        ? list // ya está en este día
        : [
            ...list,
            {
              id: ex.id,
              name: ex.name,
              image: ex.images?.[0] || '',
              target: ex.primaryMuscles?.[0] || '',
              equipment: ex.equipment || '',
              sets: 3,
              reps: 10,
              weight: 0,
              done: false,
            },
          ],
    )

  const updateEntry = (id, patch) =>
    mutateDay((list) => list.map((e) => (e.id === id ? { ...e, ...patch } : e)))
  const removeEntry = (id) => mutateDay((list) => list.filter((e) => e.id !== id))
  const clearDay = () => mutateDay(() => [])
  const copyDayTo = (targetId) => {
    if (!targetId || targetId === day) return
    onUpdate((prev) => ({
      weeklyPlan: {
        ...prev.weeklyPlan,
        [targetId]: (prev.weeklyPlan[day] || []).map((e) => ({ ...e, done: false })),
      },
    }))
  }

  // Estadísticas del día.
  const totalSets = dayList.reduce((s, e) => s + e.sets, 0)
  const volume = dayList.reduce((s, e) => s + e.sets * e.reps * e.weight, 0)
  const doneCount = dayList.filter((e) => e.done).length

  return (
    <section className="space-y-6">
      {/* Selector de día */}
      <div className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
        {DAYS.map((d) => {
          const count = (weeklyPlan[d.id] || []).length
          const active = d.id === day
          return (
            <button
              key={d.id}
              onClick={() => setDay(d.id)}
              className={`relative flex min-w-[64px] flex-1 flex-col items-center rounded-2xl border px-2 py-2.5 transition ${
                active
                  ? 'border-brand-600 bg-brand-600 text-white shadow-sm'
                  : 'border-slate-200 bg-white text-slate-600 hover:border-brand-300'
              }`}
            >
              <span className="text-sm font-bold">{d.short}</span>
              <span
                className={`mt-0.5 text-[11px] ${active ? 'text-white/80' : 'text-slate-400'}`}
              >
                {count > 0 ? `${count} ej.` : '—'}
              </span>
            </button>
          )
        })}
      </div>

      {/* Panel del día */}
      <div className="panel p-5 sm:p-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900">{dayLabel}</h2>
            <p className="mt-0.5 text-sm text-slate-500">
              {dayList.length === 0
                ? 'Día de descanso (sin ejercicios)'
                : `${dayList.length} ejercicios · ${totalSets} series${
                    volume > 0 ? ` · ${volume.toLocaleString('es-ES')} kg de volumen` : ''
                  } · ${doneCount}/${dayList.length} hechos`}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {dayList.length > 0 && (
              <>
                <div className="relative">
                  <select
                    aria-label="Copiar a otro día"
                    onChange={(e) => {
                      copyDayTo(e.target.value)
                      e.target.value = ''
                    }}
                    defaultValue=""
                    className="cursor-pointer appearance-none rounded-xl border border-slate-200 bg-white py-2 pl-8 pr-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                  >
                    <option value="" disabled>
                      Copiar a…
                    </option>
                    {DAYS.filter((d) => d.id !== day).map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.label}
                      </option>
                    ))}
                  </select>
                  <Copy className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                </div>
                <button
                  onClick={clearDay}
                  className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-600 transition hover:border-rose-300 hover:text-rose-600"
                >
                  <Trash2 className="h-4 w-4" />
                  Vaciar
                </button>
              </>
            )}
          </div>
        </div>

        {/* Progreso */}
        {dayList.length > 0 && (
          <div className="mb-4 h-2 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-emerald-500 transition-all"
              style={{ width: `${(doneCount / dayList.length) * 100}%` }}
            />
          </div>
        )}

        {/* Lista de ejercicios */}
        {dayList.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-10 text-center text-slate-400">
            <Dumbbell className="h-9 w-9" strokeWidth={1.5} />
            <p className="text-sm">Añade ejercicios para montar la rutina de este día.</p>
          </div>
        ) : (
          <div className="space-y-2.5">
            <AnimatePresence initial={false}>
              {dayList.map((entry) => (
                <motion.div
                  key={entry.id}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.18 }}
                >
                  <PlanExerciseRow
                    entry={entry}
                    onChange={(patch) => updateEntry(entry.id, patch)}
                    onRemove={() => removeEntry(entry.id)}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        <button
          onClick={() => setPickerOpen(true)}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-200 py-3 text-sm font-semibold text-slate-500 transition hover:border-brand-400 hover:text-brand-600"
        >
          <Plus className="h-4 w-4" />
          Añadir ejercicio
        </button>
      </div>

      <ExercisePickerModal
        open={pickerOpen}
        dayLabel={dayLabel}
        existingIds={dayList.map((e) => e.id)}
        onAdd={addExercise}
        onClose={() => setPickerOpen(false)}
      />
    </section>
  )
}
