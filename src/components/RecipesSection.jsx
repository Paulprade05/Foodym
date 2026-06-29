import { motion } from 'framer-motion'
import { Search, SlidersHorizontal } from 'lucide-react'
import IngredientInput from './IngredientInput'
import ChipSelect from './ChipSelect'
import RecipeCard from './RecipeCard'
import Spinner from './Spinner'
import ErrorMessage from './ErrorMessage'
import { searchRecipes, KITCHEN_UTENSILS } from '../services/spoonacular'
import { translateList } from '../services/translate'

export default function RecipesSection({
  ingredients,
  utensils,
  preferences,
  onUpdate,
  onOpenPreferences,
  favoriteIds,
  onToggleFavorite,
  results,
  setResults,
}) {
  const { items, loading, error, searched } = results

  const addIngredient = (item) => onUpdate({ ingredients: [...ingredients, item] })
  const removeIngredient = (item) =>
    onUpdate({ ingredients: ingredients.filter((i) => i !== item) })

  const toggleUtensil = (id) =>
    onUpdate({
      kitchenUtensils: utensils.includes(id)
        ? utensils.filter((u) => u !== id)
        : [...utensils, id],
    })

  const handleSearch = async () => {
    setResults({ ...results, loading: true, error: '', searched: true })
    try {
      // Traducimos ingredientes y exclusiones de español a inglés para la API.
      const [enIngredients, enExcluded] = await Promise.all([
        translateList(ingredients),
        translateList(preferences.excluded || []),
      ])
      const found = await searchRecipes({
        ingredients: enIngredients,
        utensils,
        preferences: { ...preferences, excluded: enExcluded },
      })
      setResults({ items: found, loading: false, error: '', searched: true })
    } catch (err) {
      setResults({ items: [], loading: false, error: err.message, searched: true })
    }
  }

  const canSearch = ingredients.length > 0 || utensils.length > 0
  const activePrefs =
    preferences.diets.length +
    preferences.intolerances.length +
    preferences.cuisines.length +
    preferences.excluded.length +
    (preferences.maxReadyTime ? 1 : 0)

  return (
    <section className="space-y-6">
      <div className="panel space-y-6 p-5 sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <IngredientInput
            ingredients={ingredients}
            onAdd={addIngredient}
            onRemove={removeIngredient}
          />
        </div>

        <div>
          <p className="mb-2 text-sm font-semibold text-slate-800">Utensilios de cocina</p>
          <ChipSelect options={KITCHEN_UTENSILS} selected={utensils} onToggle={toggleUtensil} />
          {utensils.length > 1 && (
            <p className="mt-2 text-xs text-slate-400">
              Cuantos más utensilios marques, más específica (y reducida) será la búsqueda.
            </p>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
          <button onClick={onOpenPreferences} className="btn-ghost">
            <SlidersHorizontal className="h-4 w-4" />
            Mis gustos
            {activePrefs > 0 && (
              <span className="ml-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-100 px-1.5 text-xs font-bold text-brand-700">
                {activePrefs}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={handleSearch}
            disabled={!canSearch || loading}
            className="btn-primary"
          >
            <Search className="h-4 w-4" />
            {loading ? 'Buscando…' : 'Buscar recetas'}
          </button>
        </div>

        {!canSearch && (
          <p className="text-xs text-slate-400">
            Añade al menos un ingrediente o marca un utensilio para buscar.
          </p>
        )}
      </div>

      {error && <ErrorMessage message={error} onRetry={handleSearch} />}
      {loading && <Spinner label="Buscando recetas…" />}

      {!loading && !error && searched && items.length === 0 && (
        <p className="py-12 text-center text-slate-500">
          No se encontraron recetas con esos criterios. Prueba con otros ingredientes, utensilios o
          ajusta tus gustos.
        </p>
      )}

      {!loading && items.length > 0 && (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((recipe, i) => (
            <motion.div
              key={recipe.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: Math.min(i * 0.04, 0.4) }}
            >
              <RecipeCard
                recipe={recipe}
                totalIngredients={ingredients.length}
                isFavorite={favoriteIds.includes(recipe.id)}
                onToggleFavorite={() =>
                  onToggleFavorite({
                    id: recipe.id,
                    title: recipe.title,
                    image: recipe.image,
                    sourceUrl: recipe.sourceUrl,
                    readyInMinutes: recipe.readyInMinutes,
                    servings: recipe.servings,
                  })
                }
              />
            </motion.div>
          ))}
        </div>
      )}
    </section>
  )
}
