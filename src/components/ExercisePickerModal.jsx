import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Search, Plus, Check, Play } from 'lucide-react'
import ChipSelect from './ChipSelect'
import Spinner from './Spinner'
import ErrorMessage from './ErrorMessage'
import { fetchExercises, EQUIPMENT_GROUPS, MUSCLE_GROUPS } from '../services/exercises'
import { translateMuscle } from '../utils/translations'
import { useSpanish } from '../hooks/useTranslation'

const PLACEHOLDER =
  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80"><rect width="100%" height="100%" fill="%23f1f5f9"/></svg>'
const titleCase = (s = '') => s.replace(/\b\w/g, (c) => c.toUpperCase())

function ResultRow({ exercise, added, onAdd }) {
  const name = titleCase(useSpanish(exercise.name))
  return (
    <div className="flex items-center gap-3 rounded-xl border border-slate-200 p-2.5">
      <img
        src={exercise.images?.[0] || PLACEHOLDER}
        alt=""
        loading="lazy"
        onError={(e) => {
          e.currentTarget.src = PLACEHOLDER
        }}
        className="h-12 w-12 flex-shrink-0 rounded-lg bg-slate-50 object-contain"
      />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-slate-800">{name}</p>
        <p className="truncate text-xs text-slate-400">
          {translateMuscle(exercise.primaryMuscles?.[0])}
        </p>
      </div>
      <button
        type="button"
        onClick={onAdd}
        disabled={added}
        className={`flex flex-shrink-0 items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
          added
            ? 'cursor-default bg-emerald-50 text-emerald-600'
            : 'bg-brand-600 text-white hover:bg-brand-700 active:scale-95'
        }`}
      >
        {added ? <Check className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
        {added ? 'Añadido' : 'Añadir'}
      </button>
    </div>
  )
}

export default function ExercisePickerModal({ open, dayLabel, existingIds, onAdd, onClose }) {
  const [muscles, setMuscles] = useState([])
  const [equipment, setEquipment] = useState([])
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [searched, setSearched] = useState(false)

  const toggleMuscle = (id) =>
    setMuscles((p) => (p.includes(id) ? p.filter((m) => m !== id) : [...p, id]))
  const toggleEquipment = (id) =>
    setEquipment((p) => (p.includes(id) ? p.filter((e) => e !== id) : [...p, id]))

  const handleSearch = async () => {
    setLoading(true)
    setError('')
    setSearched(true)
    try {
      setItems(await fetchExercises({ equipment, muscles }))
    } catch (err) {
      setError(err.message)
      setItems([])
    } finally {
      setLoading(false)
    }
  }

  const canSearch = muscles.length > 0 || equipment.length > 0

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 320, damping: 30 }}
            className="relative z-10 flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-t-3xl bg-white shadow-card-hover sm:rounded-3xl"
          >
            <div className="flex items-start justify-between gap-3 border-b border-slate-100 px-5 py-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Añadir ejercicio</h2>
                <p className="text-sm text-slate-500">a {dayLabel}</p>
              </div>
              <button
                onClick={onClose}
                aria-label="Cerrar"
                className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4 overflow-y-auto px-5 py-4">
              {/* Filtros */}
              <div className="space-y-3">
                {MUSCLE_GROUPS.map((g) => (
                  <div key={g.region}>
                    <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400">
                      {g.region}
                    </p>
                    <ChipSelect options={g.options} selected={muscles} onToggle={toggleMuscle} />
                  </div>
                ))}
                {EQUIPMENT_GROUPS.map((g) => (
                  <div key={g.place}>
                    <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400">
                      {g.label}
                    </p>
                    <ChipSelect
                      options={g.options}
                      selected={equipment}
                      onToggle={toggleEquipment}
                    />
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={handleSearch}
                disabled={!canSearch || loading}
                className="btn-primary w-full"
              >
                <Search className="h-4 w-4" />
                {loading ? 'Buscando…' : 'Buscar ejercicios'}
              </button>

              {error && <ErrorMessage message={error} onRetry={handleSearch} />}
              {loading && <Spinner label="Buscando…" />}
              {!loading && !error && searched && items.length === 0 && (
                <p className="py-6 text-center text-sm text-slate-500">
                  Sin resultados. Prueba otros filtros.
                </p>
              )}

              {!loading && items.length > 0 && (
                <div className="space-y-2">
                  {items.map((ex) => (
                    <ResultRow
                      key={ex.id}
                      exercise={ex}
                      added={existingIds.includes(ex.id)}
                      onAdd={() => onAdd(ex)}
                    />
                  ))}
                </div>
              )}

              {!searched && (
                <p className="flex items-center justify-center gap-2 py-6 text-center text-sm text-slate-400">
                  <Play className="h-4 w-4" />
                  Elige músculos o equipamiento y pulsa “Buscar ejercicios”.
                </p>
              )}
            </div>

            <div className="flex justify-end border-t border-slate-100 px-5 py-3">
              <button onClick={onClose} className="btn-primary">
                Hecho
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
