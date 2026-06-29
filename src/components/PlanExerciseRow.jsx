import { Trash2, Check } from 'lucide-react'
import Stepper from './Stepper'
import { translateMuscle } from '../utils/translations'
import { useSpanish } from '../hooks/useTranslation'

const PLACEHOLDER =
  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80"><rect width="100%" height="100%" fill="%23f1f5f9"/></svg>'

const titleCase = (s = '') => s.replace(/\b\w/g, (c) => c.toUpperCase())

// Fila editable de un ejercicio dentro del plan de un día.
export default function PlanExerciseRow({ entry, onChange, onRemove }) {
  const name = titleCase(useSpanish(entry.name))

  const doneBtn = (
    <button
      type="button"
      onClick={() => onChange({ done: !entry.done })}
      aria-label={entry.done ? 'Marcar como pendiente' : 'Marcar como hecho'}
      title={entry.done ? 'Hecho' : 'Marcar hecho'}
      className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg border transition active:scale-90 ${
        entry.done
          ? 'border-emerald-500 bg-emerald-500 text-white'
          : 'border-slate-200 text-slate-300 hover:border-emerald-400 hover:text-emerald-500'
      }`}
    >
      <Check className="h-5 w-5" strokeWidth={3} />
    </button>
  )

  const removeBtn = (
    <button
      type="button"
      onClick={onRemove}
      aria-label="Quitar ejercicio"
      className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg text-slate-300 transition hover:bg-rose-50 hover:text-rose-500"
    >
      <Trash2 className="h-[18px] w-[18px]" />
    </button>
  )

  return (
    <div
      className={`flex flex-col gap-3 rounded-xl border p-3 transition sm:flex-row sm:items-center ${
        entry.done ? 'border-emerald-200 bg-emerald-50/50' : 'border-slate-200 bg-white'
      }`}
    >
      {/* Cabecera del ejercicio (en móvil, con los botones a la derecha) */}
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <img
          src={entry.image || PLACEHOLDER}
          alt=""
          loading="lazy"
          onError={(e) => {
            e.currentTarget.src = PLACEHOLDER
          }}
          className="h-12 w-12 flex-shrink-0 rounded-lg bg-slate-50 object-contain"
        />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-slate-800">{name}</p>
          {entry.target && (
            <p className="truncate text-xs text-slate-400">{translateMuscle(entry.target)}</p>
          )}
        </div>
        {/* Móvil: hecho + borrar junto al nombre */}
        <div className="flex items-center gap-1.5 sm:hidden">
          {doneBtn}
          {removeBtn}
        </div>
      </div>

      {/* Contadores (fila propia en móvil, en línea en escritorio) */}
      <div className="flex items-center justify-around gap-2 sm:justify-end sm:gap-3">
        <Stepper label="Series" value={entry.sets} min={1} onChange={(v) => onChange({ sets: v })} />
        <Stepper label="Reps" value={entry.reps} min={1} onChange={(v) => onChange({ reps: v })} />
        <Stepper
          label="Peso"
          value={entry.weight}
          min={0}
          step={2.5}
          suffix=" kg"
          onChange={(v) => onChange({ weight: v })}
        />
        {/* Escritorio: hecho + borrar al final */}
        <div className="hidden items-center gap-2 sm:flex">
          {doneBtn}
          {removeBtn}
        </div>
      </div>
    </div>
  )
}
