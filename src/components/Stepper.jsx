import { Minus, Plus } from 'lucide-react'

// Contador numérico con botones - / +.
export default function Stepper({ label, value, onChange, min = 0, step = 1, suffix = '' }) {
  const dec = () => onChange(Math.max(min, Math.round((value - step) * 100) / 100))
  const inc = () => onChange(Math.round((value + step) * 100) / 100)

  return (
    <div className="flex flex-col items-center">
      <span className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
        {label}
      </span>
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={dec}
          aria-label={`Bajar ${label}`}
          className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:bg-slate-100 active:scale-90"
        >
          <Minus className="h-3.5 w-3.5" />
        </button>
        <span className="w-12 text-center text-sm font-bold tabular-nums text-slate-800">
          {value}
          {suffix}
        </span>
        <button
          type="button"
          onClick={inc}
          aria-label={`Subir ${label}`}
          className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:bg-slate-100 active:scale-90"
        >
          <Plus className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  )
}
