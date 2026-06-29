import { useCallback, useEffect, useRef, useState } from 'react'
import { doc, onSnapshot, serverTimestamp, setDoc } from 'firebase/firestore'
import { db, isFirebaseConfigured } from '../firebase/config'

// Datos del usuario que se sincronizan entre dispositivos (o en localStorage).
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
  favoriteRecipes: [],
  favoriteExercises: [],
  onboarded: false,
}

// Normaliza para garantizar que existen todos los campos (datos antiguos, etc.).
function normalize(raw = {}) {
  return {
    ...EMPTY,
    ...raw,
    preferences: { ...EMPTY_PREFERENCES, ...(raw.preferences || {}) },
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
    if (isFirebaseConfigured && user) {
      const ref = doc(db, 'users', user.uid)
      let firstSnapshot = true
      const unsubscribe = onSnapshot(
        ref,
        (snap) => {
          if (snap.exists()) {
            setData(normalize(snap.data()))
          } else if (firstSnapshot) {
            const local = readLocal()
            setData(local)
            setDoc(ref, { ...local, updatedAt: serverTimestamp() }).catch(() => {})
          }
          firstSnapshot = false
        },
        () => setData(readLocal()),
      )
      return unsubscribe
    }
    setData(readLocal())
    return undefined
  }, [user])

  const persist = useCallback(
    (next) => {
      setData(next)
      dataRef.current = next
      if (isFirebaseConfigured && user) {
        clearTimeout(saveTimer.current)
        saveTimer.current = setTimeout(() => {
          setDoc(
            doc(db, 'users', user.uid),
            { ...next, updatedAt: serverTimestamp() },
            { merge: true },
          ).catch(() => {})
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
