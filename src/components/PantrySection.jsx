import { AnimatePresence } from 'framer-motion'
import { UtensilsCrossed, ShoppingBasket } from 'lucide-react'
import IngredientInput from './IngredientInput'
import PantryCard from './PantryCard'

// Sección Despensa: vista visual de los productos que tienes.
export default function PantrySection({ ingredients, onUpdate, onGoToRecipes }) {
  const addIngredient = (item) => {
    if (!ingredients.includes(item)) onUpdate({ ingredients: [...ingredients, item] })
  }
  const removeIngredient = (item) =>
    onUpdate({ ingredients: ingredients.filter((i) => i !== item) })

  return (
    <section className="space-y-6">
      <div className="panel space-y-4 p-5 sm:p-6">
        <IngredientInput
          ingredients={[]}
          onAdd={addIngredient}
          onRemove={removeIngredient}
        />
        <p className="text-xs text-slate-400">
          Añade lo que has comprado y verás su foto abajo. Tu despensa se usa para buscar recetas.
        </p>
      </div>

      {ingredients.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-16 text-center text-slate-400">
          <ShoppingBasket className="h-10 w-10" strokeWidth={1.5} />
          <p className="max-w-xs text-sm">
            Tu despensa está vacía. Añade arriba los productos que tienes para verlos aquí.
          </p>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">
              {ingredients.length}{' '}
              {ingredients.length === 1 ? 'producto' : 'productos'} en tu despensa
            </p>
            <button onClick={onGoToRecipes} className="btn-ghost py-2">
              <UtensilsCrossed className="h-4 w-4" />
              Ver recetas
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            <AnimatePresence initial={false}>
              {ingredients.map((item) => (
                <PantryCard key={item} name={item} onRemove={() => removeIngredient(item)} />
              ))}
            </AnimatePresence>
          </div>
        </>
      )}
    </section>
  )
}
