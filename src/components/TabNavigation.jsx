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
    <>
      {/* Escritorio: control segmentado centrado */}
      <div className="hidden justify-center sm:flex">
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
                className={`relative flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition-colors sm:px-6 sm:text-base ${
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

      {/* Móvil: barra de navegación inferior fija (estilo app) */}
      <nav
        className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 backdrop-blur-md sm:hidden"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        <div className="mx-auto flex max-w-md">
          {TABS.map(({ id, label, Icon }) => {
            const active = activeTab === id
            return (
              <button
                key={id}
                role="tab"
                aria-selected={active}
                onClick={() => onChange(id)}
                className={`flex flex-1 flex-col items-center gap-0.5 py-2 text-[11px] font-semibold transition-colors ${
                  active ? 'text-brand-600' : 'text-slate-400'
                }`}
              >
                <Icon className="h-[22px] w-[22px]" strokeWidth={active ? 2.5 : 2} />
                {label}
              </button>
            )
          })}
        </div>
      </nav>
    </>
  )
}
