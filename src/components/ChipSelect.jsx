import { Check } from 'lucide-react'

// Selector múltiple en forma de "chips" pulsables. Reutilizable.
export default function ChipSelect({ options, selected, onToggle }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => {
        const checked = selected.includes(opt.id)
        return (
          <button
            key={opt.id}
            type="button"
            aria-pressed={checked}
            onClick={() => onToggle(opt.id)}
            className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-all duration-150 active:scale-95 ${
              checked
                ? 'border-brand-600 bg-brand-600 text-white shadow-sm'
                : 'border-slate-200 bg-white text-slate-600 hover:border-brand-300 hover:text-brand-700'
            }`}
          >
            {checked && <Check className="h-3.5 w-3.5" strokeWidth={3} />}
            {opt.label}
          </button>
        )
      })}
    </div>
  )
}
