import { useCallback, useEffect, useRef, useState } from 'react'
import { supabase, isSupabaseConfigured } from '../supabase/config'
import { EMPTY_PLAN } from '../constants/days'

// Datos del usuario, sincronizados entre dispositivos (Supabase) o en localStorage.
const LOCAL_KEY = 'foodym_user_data'

const EMPTY_PREFERENCES = {
  diets: [],
  intolerances: [],
  cuisines: [],
  excluded: [],
  maxReadyTime: 0,
}

const EMPTY = {
  ingredients: [],
  kitchenUtensils: [],
  equipment: [],
  muscles: [],
  preferences: { ...EMPTY_PREFERENCES },
  weeklyPlan: { ...EMPTY_PLAN },
  favoriteRecipes: [],
  favoriteExercises: [],
  onboarded: false,
}

function normalize(raw = {}) {
  return {
    ...EMPTY,
    ...raw,
    preferences: { ...EMPTY_PREFERENCES, ...(raw.preferences || {}) },
    weeklyPlan: { ...EMPTY_PLAN, ...(raw.weeklyPlan || {}) },
  }
}

function readLocal() {
  try {
    return normalize(JSON.parse(localStorage.getItem(LOCAL_KEY) || '{}'))
  } catch {
    return normalize()
  }
}

function writeLocal(data) {
  try {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(data))
  } catch {
    /* almacenamiento no disponible */
  }
}

export function useUserData(user) {
  const [data, setData] = useState(() => readLocal())
  const dataRef = useRef(data)
  const saveTimer = useRef(null)

  useEffect(() => {
    dataRef.current = data
  }, [data])

  useEffect(() => {
    if (isSupabaseConfigured && user) {
      let alive = true

      // Carga inicial de la fila del usuario.
      supabase
        .from('user_data')
        .select('data')
        .eq('user_id', user.id)
        .maybeSingle()
        .then(({ data: row }) => {
          if (!alive) return
          if (row?.data) {
            setData(normalize(row.data))
          } else {
            // Primera vez: subimos a la nube lo que hubiera en local.
            const local = readLocal()
            setData(local)
            supabase.from('user_data').upsert({ user_id: user.id, data: local }).then(() => {})
          }
        })

      // Sincronización en tiempo real entre dispositivos.
      const channel = supabase
        .channel(`user_data_${user.id}`)
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'user_data', filter: `user_id=eq.${user.id}` },
          (payload) => {
            if (payload.new?.data) setData(normalize(payload.new.data))
          },
        )
        .subscribe()

      return () => {
        alive = false
        supabase.removeChannel(channel)
      }
    }

    setData(readLocal())
    return undefined
  }, [user])

  const persist = useCallback(
    (next) => {
      setData(next)
      dataRef.current = next
      if (isSupabaseConfigured && user) {
        clearTimeout(saveTimer.current)
        saveTimer.current = setTimeout(() => {
          supabase
            .from('user_data')
            .upsert({ user_id: user.id, data: next })
            .then(() => {})
        }, 500)
      } else {
        writeLocal(next)
      }
    },
    [user],
  )

  const update = useCallback(
    (partial) => {
      const patch = typeof partial === 'function' ? partial(dataRef.current) : partial
      persist({ ...dataRef.current, ...patch })
    },
    [persist],
  )

  const updatePreferences = useCallback(
    (partial) => {
      persist({
        ...dataRef.current,
        preferences: { ...dataRef.current.preferences, ...partial },
      })
    },
    [persist],
  )

  const toggleFavoriteRecipe = useCallback(
    (recipe) => {
      const list = dataRef.current.favoriteRecipes
      const exists = list.some((r) => r.id === recipe.id)
      update({
        favoriteRecipes: exists ? list.filter((r) => r.id !== recipe.id) : [...list, recipe],
      })
    },
    [update],
  )

  const toggleFavoriteExercise = useCallback(
    (exercise) => {
      const list = dataRef.current.favoriteExercises
      const exists = list.some((e) => e.id === exercise.id)
      update({
        favoriteExercises: exists
          ? list.filter((e) => e.id !== exercise.id)
          : [...list, exercise],
      })
    },
    [update],
  )

  return {
    data,
    update,
    updatePreferences,
    toggleFavoriteRecipe,
    toggleFavoriteExercise,
  }
}
