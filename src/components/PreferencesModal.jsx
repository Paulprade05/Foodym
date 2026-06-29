import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, SlidersHorizontal } from 'lucide-react'
import ChipSelect from './ChipSelect'
import IngredientInput from './IngredientInput'
import {
  DIET_OPTIONS,
  INTOLERANCE_OPTIONS,
  CUISINE_OPTIONS,
  MAX_TIME_OPTIONS,
} from '../constants/preferences'

function Section({ title, hint, children }) {
  return (
    <div>
      <h3 className="text-sm font-semibold text-slate-800">{title}</h3>
      {hint && <p className="mb-2.5 mt-0.5 text-xs text-slate-400">{hint}</p>}
      <div className={hint ? '' : 'mt-2.5'}>{children}</div>
    </div>
  )
}

export default function PreferencesModal({ open, preferences, isOnboarding, onSave, onClose }) {
  const [draft, setDraft] = useState(preferences)

  // Resincroniza el borrador cuando se abre con preferencias distintas.
  const [lastOpen, setLastOpen] = useState(false)
  if (open && !lastOpen) {
    setDraft(preferences)
    setLastOpen(true)
  }
  if (!open && lastOpen) setLastOpen(false)

  const toggle = (key, id) =>
    setDraft((d) => ({
      ...d,
      [key]: d[key].includes(id) ? d[key].filter((x) => x !== id) : [...d[key], id],
    }))

  const addExcluded = (item) =>
    setDraft((d) => ({ ...d, excluded: [...d.excluded, item] }))
  const removeExcluded = (item) =>
    setDraft((d) => ({ ...d, excluded: d.excluded.filter((x) => x !== item) }))

  const handleSave = () => onSave(draft)

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
            {/* Cabecera */}
            <div className="flex items-start justify-between gap-3 border-b border-slate-100 px-6 py-5">
              <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                  <SlidersHorizontal className="h-5 w-5" />
                </span>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    {isOnboarding ? '¡Bienvenido! Cuéntanos tus gustos' : 'Mis gustos'}
                  </h2>
                  <p className="mt-0.5 text-sm text-slate-500">
                    Adaptaremos las recetas a tus preferencias. Puedes cambiarlo cuando quieras.
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                aria-label="Cerrar"
                className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Contenido */}
            <div className="space-y-6 overflow-y-auto px-6 py-5">
              <Section title="Tipo de dieta">
                <ChipSelect
                  options={DIET_OPTIONS}
                  selected={draft.diets}
                  onToggle={(id) => toggle('diets', id)}
                />
              </Section>

              <Section title="Alergias e intolerancias" hint="Excluiremos recetas con estos componentes.">
                <ChipSelect
                  options={INTOLERANCE_OPTIONS}
                  selected={draft.intolerances}
                  onToggle={(id) => toggle('intolerances', id)}
                />
              </Section>

              <Section title="Cocinas favoritas">
                <ChipSelect
                  options={CUISINE_OPTIONS}
                  selected={draft.cuisines}
                  onToggle={(id) => toggle('cuisines', id)}
                />
              </Section>

              <Section
                title="Ingredientes que no te gustan"
                hint="Se excluirán de las recetas (escribe en español)."
              >
                <IngredientInput
                  ingredients={draft.excluded}
                  onAdd={addExcluded}
                  onRemove={removeExcluded}
                />
              </Section>

              <Section title="Tiempo máximo de preparación">
                <div className="flex flex-wrap gap-2">
                  {MAX_TIME_OPTIONS.map((opt) => {
                    const active = (draft.maxReadyTime || 0) === opt.id
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setDraft((d) => ({ ...d, maxReadyTime: opt.id }))}
                        className={`rounded-full border px-3.5 py-1.5 text-sm font-medium transition active:scale-95 ${
                          active
                            ? 'border-brand-600 bg-brand-600 text-white'
                            : 'border-slate-200 bg-white text-slate-600 hover:border-brand-300'
                        }`}
                      >
                        {opt.label}
                      </button>
                    )
                  })}
                </div>
              </Section>
            </div>

            {/* Pie */}
            <div className="flex items-center justify-end gap-3 border-t border-slate-100 px-6 py-4">
              <button onClick={onClose} className="btn-ghost">
                {isOnboarding ? 'Ahora no' : 'Cancelar'}
              </button>
              <button onClick={handleSave} className="btn-primary">
                Guardar gustos
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
