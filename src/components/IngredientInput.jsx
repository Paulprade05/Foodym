import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Plus, X } from 'lucide-react'

// Input para añadir ingredientes que se muestran como etiquetas (tags) animadas.
export default function IngredientInput({ ingredients, onAdd, onRemove }) {
  const [value, setValue] = useState('')

  const commit = () => {
    const clean = value.trim().toLowerCase()
    if (!clean) return
    if (!ingredients.includes(clean)) onAdd(clean)
    setValue('')
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      commit()
    }
    if (e.key === 'Backspace' && value === '' && ingredients.length > 0) {
      onRemove(ingredients[ingredients.length - 1])
    }
  }

  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-slate-800">
        Ingredientes de tu despensa
      </label>

      <div className="flex gap-2">
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Escribe en español y pulsa Enter (pollo, arroz, tomate…)"
          className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none transition focus:border-brand-400 focus:bg-white focus:ring-4 focus:ring-brand-100"
        />
        <button type="button" onClick={commit} className="btn-primary px-4">
          <Plus className="h-4 w-4" />
          Añadir
        </button>
      </div>

      {ingredients.length > 0 && (
        <ul className="mt-3 flex flex-wrap gap-2">
          <AnimatePresence initial={false}>
            {ingredients.map((item) => (
              <motion.li
                key={item}
                layout
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.15 }}
                className="flex items-center gap-1 rounded-full bg-brand-50 py-1 pl-3 pr-1 text-sm font-medium capitalize text-brand-700"
              >
                {item}
                <button
                  type="button"
                  onClick={() => onRemove(item)}
                  aria-label={`Quitar ${item}`}
                  className="flex h-5 w-5 items-center justify-center rounded-full text-brand-500 transition hover:bg-brand-100 hover:text-brand-700"
                >
                  <X className="h-3.5 w-3.5" strokeWidth={2.5} />
                </button>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      )}
    </div>
  )
}
