import { motion } from 'framer-motion'
import { Cloud, Lock, HardDrive, Heart, UtensilsCrossed, Dumbbell } from 'lucide-react'
import RecipeCard from './RecipeCard'
import ExerciseCard from './ExerciseCard'

export default function FavoritesSection({
  favoriteRecipes,
  favoriteExercises,
  onToggleFavoriteRecipe,
  onToggleFavoriteExercise,
  cloudEnabled,
  isLoggedIn,
}) {
  const empty = favoriteRecipes.length === 0 && favoriteExercises.length === 0

  let banner
  if (cloudEnabled && isLoggedIn) {
    banner = {
      Icon: Cloud,
      text: 'Tus favoritos se sincronizan automáticamente en todos tus dispositivos.',
    }
  } else if (cloudEnabled) {
    banner = {
      Icon: Lock,
      text: 'Inicia sesión con tu correo para guardar tus favoritos y sincronizarlos entre dispositivos. De momento se guardan solo en este navegador.',
    }
  } else {
    banner = {
      Icon: HardDrive,
      text: 'Modo local: tus favoritos se guardan en este navegador. Configura Supabase (ver README) para sincronizarlos.',
    }
  }

  return (
    <section className="space-y-8">
      <div className="panel flex items-center gap-3 p-4 text-sm text-slate-600">
        <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
          <banner.Icon className="h-5 w-5" />
        </span>
        <span>{banner.text}</span>
      </div>

      {empty && (
        <div className="flex flex-col items-center gap-3 py-16 text-center text-slate-400">
          <Heart className="h-10 w-10" strokeWidth={1.5} />
          <p className="max-w-xs text-sm">
            Aún no tienes favoritos. Pulsa el corazón en cualquier receta o ejercicio para guardarlo
            aquí.
          </p>
        </div>
      )}

      {favoriteRecipes.length > 0 && (
        <div>
          <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-slate-800">
            <UtensilsCrossed className="h-5 w-5 text-brand-600" /> Recetas guardadas
          </h2>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {favoriteRecipes.map((recipe, i) => (
              <motion.div
                key={recipe.id}
                layout
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: Math.min(i * 0.04, 0.4) }}
              >
                <RecipeCard
                  recipe={recipe}
                  totalIngredients={0}
                  isFavorite
                  onToggleFavorite={() => onToggleFavoriteRecipe(recipe)}
                />
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {favoriteExercises.length > 0 && (
        <div>
          <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-slate-800">
            <Dumbbell className="h-5 w-5 text-brand-600" /> Ejercicios guardados
          </h2>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {favoriteExercises.map((exercise, i) => (
              <motion.div
                key={exercise.id}
                layout
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: Math.min(i * 0.04, 0.4) }}
              >
                <ExerciseCard
                  exercise={exercise}
                  isFavorite
                  onToggleFavorite={() => onToggleFavoriteExercise(exercise)}
                />
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </section>
  )
}
