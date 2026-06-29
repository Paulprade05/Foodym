// Servicio para la API de Spoonacular.
// Documentación: https://spoonacular.com/food-api/docs#Search-Recipes-Complex

const BASE_URL = 'https://api.spoonacular.com'
const API_KEY = import.meta.env.VITE_SPOONACULAR_API_KEY

// Utensilios de cocina seleccionables (id = valor del parámetro "equipment").
export const KITCHEN_UTENSILS = [
  { id: 'air fryer', label: 'Freidora de aire' },
  { id: 'oven', label: 'Horno' },
  { id: 'frying pan', label: 'Sartén' },
  { id: 'pot', label: 'Olla' },
  { id: 'microwave', label: 'Microondas' },
  { id: 'blender', label: 'Batidora / Licuadora' },
  { id: 'grill', label: 'Parrilla' },
  { id: 'slow cooker', label: 'Olla de cocción lenta' },
  { id: 'wok', label: 'Wok' },
]

/**
 * Busca recetas con el endpoint /recipes/complexSearch.
 * Los ingredientes y exclusiones deben llegar ya traducidos a inglés.
 *
 * @param {Object} options
 * @param {string[]} options.ingredients  Ingredientes (en inglés).
 * @param {string[]} options.utensils     Utensilios de cocina.
 * @param {Object}   options.preferences  Preferencias culinarias del usuario.
 * @param {number}   options.number       Número máximo de resultados.
 */
export async function searchRecipes({
  ingredients = [],
  utensils = [],
  preferences = {},
  number = 12,
}) {
  if (!API_KEY) {
    throw new Error(
      'Falta la clave VITE_SPOONACULAR_API_KEY. Revisa tu archivo .env y reinicia el servidor.',
    )
  }

  const params = new URLSearchParams({
    apiKey: API_KEY,
    number: String(number),
    addRecipeInformation: 'true',
    fillIngredients: 'true',
    sort: 'max-used-ingredients',
    ignorePantry: 'true',
  })

  if (ingredients.length > 0) params.set('includeIngredients', ingredients.join(','))
  if (utensils.length > 0) params.set('equipment', utensils.join(','))

  // Preferencias culinarias.
  const { diets = [], intolerances = [], cuisines = [], excluded = [], maxReadyTime } =
    preferences || {}
  if (diets.length > 0) params.set('diet', diets.join(','))
  if (intolerances.length > 0) params.set('intolerances', intolerances.join(','))
  if (cuisines.length > 0) params.set('cuisine', cuisines.join(','))
  if (excluded.length > 0) params.set('excludeIngredients', excluded.join(','))
  if (maxReadyTime) params.set('maxReadyTime', String(maxReadyTime))

  let res
  try {
    res = await fetch(`${BASE_URL}/recipes/complexSearch?${params.toString()}`)
  } catch {
    throw new Error('No se pudo conectar con Spoonacular. Comprueba tu conexión a internet.')
  }

  if (!res.ok) {
    if (res.status === 401) {
      throw new Error('Clave de Spoonacular no válida (401). Verifica VITE_SPOONACULAR_API_KEY.')
    }
    if (res.status === 402) {
      throw new Error(
        'Has superado la cuota diaria gratuita de Spoonacular (402). Inténtalo de nuevo mañana.',
      )
    }
    if (res.status === 429) {
      throw new Error('Demasiadas peticiones a Spoonacular (429). Espera unos segundos.')
    }
    throw new Error(`Error de Spoonacular (HTTP ${res.status}). Inténtalo de nuevo más tarde.`)
  }

  const data = await res.json()
  return Array.isArray(data.results) ? data.results : []
}
