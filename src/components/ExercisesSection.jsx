import { motion } from 'framer-motion'
import { Dumbbell } from 'lucide-react'
import ChipSelect from './ChipSelect'
import ExerciseCard from './ExerciseCard'
import Spinner from './Spinner'
import ErrorMessage from './ErrorMessage'
import { fetchExercises, EQUIPMENT_GROUPS, MUSCLE_GROUPS } from '../services/exercises'

export default function ExercisesSection({
  equipment,
  muscles,
  onUpdate,
  favoriteIds,
  onToggleFavorite,
  results,
  setResults,
}) {
  const { items, loading, error, searched } = results

  const toggleEquipment = (id) =>
    onUpdate({
      equipment: equipment.includes(id)
        ? equipment.filter((e) => e !== id)
        : [...equipment, id],
    })

  const toggleMuscle = (id) =>
    onUpdate({
      muscles: muscles.includes(id) ? muscles.filter((m) => m !== id) : [...muscles, id],
    })

  const handleSearch = async () => {
    setResults({ ...results, loading: true, error: '', searched: true })
    try {
      const found = await fetchExercises({ equipment, muscles })
      setResults({ items: found, loading: false, error: '', searched: true })
    } catch (err) {
      setResults({ items: [], loading: false, error: err.message, searched: true })
    }
  }

  const canSearch = equipment.length > 0 || muscles.length > 0

  return (
    <section className="space-y-6">
      <div className="panel space-y-6 p-5 sm:p-6">
        {/* Qué músculos */}
        <div>
          <p className="text-sm font-semibold text-slate-800">¿Qué quieres entrenar?</p>
          <p className="mb-3 mt-0.5 text-xs text-slate-400">
            Elige uno o varios grupos musculares (opcional).
          </p>
          <div className="space-y-3">
            {MUSCLE_GROUPS.map((group) => (
              <div key={group.region}>
                <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400">
                  {group.region}
                </p>
                <ChipSelect options={group.options} selected={muscles} onToggle={toggleMuscle} />
              </div>
            ))}
          </div>
        </div>

        {/* Dónde / equipamiento */}
        <div className="border-t border-slate-100 pt-5">
          <p className="text-sm font-semibold text-slate-800">¿Con qué equipamiento?</p>
          <p className="mb-3 mt-0.5 text-xs text-slate-400">
            Marca lo que tengas disponible (opcional).
          </p>
          <div className="space-y-3">
            {EQUIPMENT_GROUPS.map((group) => (
              <div key={group.place}>
                <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400">
                  {group.label}
                </p>
                <ChipSelect
                  options={group.options}
                  selected={equipment}
                  onToggle={toggleEquipment}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-end border-t border-slate-100 pt-4">
          <button type="button" onClick={handleSearch} disabled={!canSearch || loading} className="btn-primary">
            <Dumbbell className="h-4 w-4" />
            {loading ? 'Generando…' : 'Generar rutina'}
          </button>
        </div>

        {!canSearch && (
          <p className="text-xs text-slate-400">
            Selecciona al menos un grupo muscular o un tipo de equipamiento.
          </p>
        )}
      </div>

      {error && <ErrorMessage message={error} onRetry={handleSearch} />}
      {loading && <Spinner label="Buscando ejercicios…" />}

      {!loading && !error && searched && items.length === 0 && (
        <p className="py-12 text-center text-slate-500">
          No se encontraron ejercicios con esos filtros. Prueba con otras opciones.
        </p>
      )}

      {!loading && items.length > 0 && (
        <>
          <p className="text-sm text-slate-500">
            {items.length} {items.length === 1 ? 'ejercicio encontrado' : 'ejercicios encontrados'}
          </p>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((exercise, i) => (
              <motion.div
                key={exercise.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: Math.min(i * 0.04, 0.4) }}
              >
                <ExerciseCard
                  exercise={exercise}
                  isFavorite={favoriteIds.includes(exercise.id)}
                  onToggleFavorite={() => onToggleFavorite(exercise)}
                />
              </motion.div>
            ))}
          </div>
        </>
      )}
    </section>
  )
}
