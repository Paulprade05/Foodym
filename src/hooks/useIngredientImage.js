import { useEffect, useState } from 'react'
import { translateToEnglish } from '../services/translate'
import { resolveIngredientImage } from '../services/spoonacular'

const MEALDB_BASE = 'https://www.themealdb.com/images/ingredients/'

// Caché en memoria de la traducción (nombre español -> inglés).
const enCache = {}

/**
 * Para un ingrediente en español devuelve:
 *  - primaryUrl: imagen de TheMealDB (acceso directo por nombre, sin clave).
 *  - getFallback(): respaldo con Spoonacular (coincidencia exacta) si falla la principal.
 *  - loading: mientras se traduce el nombre.
 */
export function useIngredientImage(name) {
  const key = (name || '').trim().toLowerCase()
  const [english, setEnglish] = useState(() => enCache[key] ?? null)

  useEffect(() => {
    let alive = true
    if (enCache[key] != null) {
      setEnglish(enCache[key])
      return undefined
    }
    translateToEnglish(key).then((en) => {
      enCache[key] = en
      if (alive) setEnglish(en)
    })
    return () => {
      alive = false
    }
  }, [key])

  const primaryUrl = english
    ? `${MEALDB_BASE}${encodeURIComponent(english)}.png`
    : null

  return {
    primaryUrl,
    getFallback: () => resolveIngredientImage(key),
    loading: english === null,
  }
}
