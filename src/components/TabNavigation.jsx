import { motion } from 'framer-motion'
import { UtensilsCrossed, Dumbbell, Heart, ShoppingBasket } from 'lucide-react'

const TABS = [
  { id: 'despensa', label: 'Despensa', Icon: ShoppingBasket },
  { id: 'recetas', label: 'Recetas', Icon: UtensilsCrossed },
  { id: 'rutinas', label: 'Rutinas', Icon: Dumbbell },
  { id: 'favoritos', label: 'Favoritos', Icon: Heart },
]

export default function TabNavigation({ activeTab, onChange }) {
  return (
    <div className="flex justify-center">
      <div
        role="tablist"
        className="inline-flex gap-1 rounded-2xl border border-slate-200 bg-white p-1.5 shadow-card"
      >
        {TABS.map(({ id, label, Icon }) => {
          const active = activeTab === id
          return (
            <button
              key={id}
              role="tab"
              aria-selected={active}
              onClick={() => onChange(id)}
              className={`relative flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors sm:px-6 ${
                active ? 'text-white' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              {active && (
                <motion.span
                  layoutId="tab-pill"
                  className="absolute inset-0 -z-0 rounded-xl bg-brand-600"
                  transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                />
              )}
              <Icon className="relative z-10 h-4 w-4" />
              <span className="relative z-10">{label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
