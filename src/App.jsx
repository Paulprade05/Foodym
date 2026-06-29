import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Salad, SlidersHorizontal } from 'lucide-react'
import { AuthProvider, useAuth } from './context/AuthContext'
import { useUserData } from './hooks/useUserData'
import TabNavigation from './components/TabNavigation'
import AuthButton from './components/AuthButton'
import PantrySection from './components/PantrySection'
import RecipesSection from './components/RecipesSection'
import ExercisesSection from './components/ExercisesSection'
import FavoritesSection from './components/FavoritesSection'
import PreferencesModal from './components/PreferencesModal'

const EMPTY_RESULTS = { items: [], loading: false, error: '', searched: false }

const HERO = {
  despensa: {
    title: 'Tu despensa',
    subtitle: 'Mira de un vistazo lo que tienes en casa, con la foto de cada producto.',
  },
  recetas: {
    title: 'Cocina con lo que tienes',
    subtitle: 'Recetas a partir de tu despensa, tus utensilios y tus gustos.',
  },
  rutinas: {
    title: 'Entrena donde quieras',
    subtitle: 'Rutinas según los músculos que elijas y tu equipamiento de casa o gimnasio.',
  },
  favoritos: {
    title: 'Tu colección',
    subtitle: 'Recetas y ejercicios guardados, sincronizados en todos tus dispositivos.',
  },
}

function AppShell() {
  const { user, enabled: cloudEnabled, authError } = useAuth()
  const { data, update, updatePreferences, toggleFavoriteRecipe, toggleFavoriteExercise } =
    useUserData(user)

  const [activeTab, setActiveTab] = useState('despensa')
  const [prefsOpen, setPrefsOpen] = useState(false)

  const [recipeResults, setRecipeResults] = useState(EMPTY_RESULTS)
  const [exerciseResults, setExerciseResults] = useState(EMPTY_RESULTS)

  // Onboarding: abrimos el panel de gustos la primera vez (una sola vez).
  const promptedRef = useRef(false)
  useEffect(() => {
    if (!promptedRef.current && data.onboarded === false) {
      promptedRef.current = true
      setPrefsOpen(true)
    }
  }, [data.onboarded])

  const isOnboarding = !data.onboarded

  const handleSavePrefs = (draft) => {
    update({ preferences: draft, onboarded: true })
    setPrefsOpen(false)
  }
  const handleClosePrefs = () => {
    if (!data.onboarded) update({ onboarded: true })
    setPrefsOpen(false)
  }

  const favoriteRecipeIds = data.favoriteRecipes.map((r) => r.id)
  const favoriteExerciseIds = data.favoriteExercises.map((e) => e.id)
  const hero = HERO[activeTab]

  return (
    <div className="min-h-screen">
      {/* Barra superior */}
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 text-white shadow-sm">
              <Salad className="h-5 w-5" />
            </span>
            <span className="text-lg font-extrabold tracking-tight text-slate-900">Foodym</span>
          </div>

          <div className="flex items-center gap-2">
            <button onClick={() => setPrefsOpen(true)} className="btn-ghost px-3 py-2">
              <SlidersHorizontal className="h-4 w-4" />
              <span className="hidden sm:inline">Mis gustos</span>
            </button>
            <AuthButton />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 pb-16 pt-8">
        {authError && (
          <p className="mb-4 rounded-xl bg-rose-50 px-4 py-2 text-center text-sm text-rose-600">
            {authError}
          </p>
        )}

        {/* Hero dinámico según pestaña */}
        <div className="mb-7 text-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
                {hero.title}
              </h1>
              <p className="mx-auto mt-1.5 max-w-md text-sm text-slate-500">{hero.subtitle}</p>
            </motion.div>
          </AnimatePresence>
        </div>

        <TabNavigation activeTab={activeTab} onChange={setActiveTab} />

        <div className="mt-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
            >
              {activeTab === 'despensa' && (
                <PantrySection
                  ingredients={data.ingredients}
                  onUpdate={update}
                  onGoToRecipes={() => setActiveTab('recetas')}
                />
              )}

              {activeTab === 'recetas' && (
                <RecipesSection
                  ingredients={data.ingredients}
                  utensils={data.kitchenUtensils}
                  preferences={data.preferences}
                  onUpdate={update}
                  onOpenPreferences={() => setPrefsOpen(true)}
                  favoriteIds={favoriteRecipeIds}
                  onToggleFavorite={toggleFavoriteRecipe}
                  results={recipeResults}
                  setResults={setRecipeResults}
                />
              )}

              {activeTab === 'rutinas' && (
                <ExercisesSection
                  equipment={data.equipment}
                  muscles={data.muscles}
                  onUpdate={update}
                  favoriteIds={favoriteExerciseIds}
                  onToggleFavorite={toggleFavoriteExercise}
                  results={exerciseResults}
                  setResults={setExerciseResults}
                />
              )}

              {activeTab === 'favoritos' && (
                <FavoritesSection
                  favoriteRecipes={data.favoriteRecipes}
                  favoriteExercises={data.favoriteExercises}
                  onToggleFavoriteRecipe={toggleFavoriteRecipe}
                  onToggleFavoriteExercise={toggleFavoriteExercise}
                  cloudEnabled={cloudEnabled}
                  isLoggedIn={Boolean(user)}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      <footer className="border-t border-slate-200 py-8 text-center text-xs text-slate-400">
        Recetas por Spoonacular · Ejercicios por free-exercise-db · Vídeos vía YouTube
      </footer>

      <PreferencesModal
        open={prefsOpen}
        preferences={data.preferences}
        isOnboarding={isOnboarding}
        onSave={handleSavePrefs}
        onClose={handleClosePrefs}
      />
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppShell />
    </AuthProvider>
  )
}
