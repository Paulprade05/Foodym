// Traducción bidireccional con caché y limitador de concurrencia.
// - Ingredientes ES -> EN para Spoonacular (que trabaja en inglés).
// - Nombres e instrucciones de ejercicios EN -> ES para la interfaz.
//
// Motor principal: endpoint público de Google Translate (gtx) — admite texto
// largo (varias frases en una sola petición) y conserva los saltos de línea.
// Respaldo: MyMemory. Si todo falla, se devuelve el texto original (sin romper).

// Diccionario local para los ingredientes más comunes (instantáneo, sin red).
const DICT = {
  arroz: 'rice', pollo: 'chicken', 'pechuga de pollo': 'chicken breast', ternera: 'beef',
  carne: 'beef', cerdo: 'pork', pavo: 'turkey', pescado: 'fish', salmon: 'salmon',
  salmón: 'salmon', atun: 'tuna', atún: 'tuna', gambas: 'shrimp', huevo: 'egg', huevos: 'eggs',
  leche: 'milk', queso: 'cheese', mantequilla: 'butter', yogur: 'yogurt', nata: 'cream',
  pan: 'bread', harina: 'flour', pasta: 'pasta', fideos: 'noodles', patata: 'potato',
  patatas: 'potatoes', papa: 'potato', tomate: 'tomato', tomates: 'tomatoes', cebolla: 'onion',
  ajo: 'garlic', pimiento: 'bell pepper', zanahoria: 'carrot', lechuga: 'lettuce',
  espinaca: 'spinach', espinacas: 'spinach', brocoli: 'broccoli', brócoli: 'broccoli',
  champiñones: 'mushrooms', champinones: 'mushrooms', calabacin: 'zucchini',
  calabacín: 'zucchini', berenjena: 'eggplant', maiz: 'corn', maíz: 'corn', guisantes: 'peas',
  judias: 'beans', judías: 'beans', frijoles: 'beans', lentejas: 'lentils',
  garbanzos: 'chickpeas', aguacate: 'avocado', limon: 'lemon', limón: 'lemon', lima: 'lime',
  naranja: 'orange', manzana: 'apple', platano: 'banana', plátano: 'banana', fresa: 'strawberry',
  fresas: 'strawberries', aceite: 'oil', 'aceite de oliva': 'olive oil', sal: 'salt',
  azucar: 'sugar', azúcar: 'sugar', miel: 'honey', chocolate: 'chocolate', cafe: 'coffee',
  café: 'coffee', vino: 'wine', agua: 'water', caldo: 'broth', tofu: 'tofu', avena: 'oats',
  quinoa: 'quinoa',
}

const CACHE_KEY = 'foodym_tr_cache'
let cache = (() => {
  try {
    return JSON.parse(localStorage.getItem(CACHE_KEY) || '{}')
  } catch {
    return {}
  }
})()
let saveTimer = null
function saveCache() {
  clearTimeout(saveTimer)
  saveTimer = setTimeout(() => {
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify(cache))
    } catch {
      /* almacenamiento lleno o no disponible */
    }
  }, 300)
}

// --- Limitador de concurrencia (evita ráfagas de peticiones) ---
const MAX_CONCURRENT = 6
let running = 0
const waiters = []
async function acquire() {
  if (running >= MAX_CONCURRENT) await new Promise((r) => waiters.push(r))
  running++
}
function release() {
  running--
  const next = waiters.shift()
  if (next) next()
}

async function gtxTranslate(text, from, to) {
  const url =
    'https://translate.googleapis.com/translate_a/single?client=gtx' +
    `&sl=${from}&tl=${to}&dt=t&q=${encodeURIComponent(text)}`
  const res = await fetch(url)
  if (!res.ok) throw new Error('gtx')
  const data = await res.json()
  if (!Array.isArray(data?.[0])) throw new Error('gtx-parse')
  return data[0].map((seg) => seg?.[0] ?? '').join('')
}

async function myMemoryTranslate(text, from, to) {
  if (text.length > 480) throw new Error('mm-too-long')
  const res = await fetch(
    `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${from}|${to}`,
  )
  if (!res.ok) throw new Error('mm')
  const data = await res.json()
  if (data?.responseStatus === 200 && data?.responseData?.translatedText) {
    return data.responseData.translatedText
  }
  throw new Error('mm-empty')
}

// Traducción genérica de un texto con caché y respaldo.
async function translate(text, from, to) {
  const key = (text || '').trim()
  if (!key) return text
  const ck = `${from}>${to}:${key}`
  if (cache[ck]) return cache[ck]

  await acquire()
  try {
    for (const engine of [gtxTranslate, myMemoryTranslate]) {
      try {
        const out = (await engine(key, from, to)).trim()
        if (out) {
          cache[ck] = out
          saveCache()
          return out
        }
      } catch {
        /* probamos el siguiente motor */
      }
    }
  } finally {
    release()
  }
  return text // último recurso: texto original
}

// ---------- API pública ----------

/** Ingrediente ES -> EN (para Spoonacular). */
export async function translateToEnglish(term) {
  const key = (term || '').trim().toLowerCase()
  if (!key) return key
  if (DICT[key]) return DICT[key]
  return (await translate(key, 'es', 'en')).toLowerCase()
}

export async function translateList(terms = []) {
  return Promise.all(terms.map(translateToEnglish))
}

/** Texto EN -> ES (nombres de ejercicio, títulos de receta…). */
export async function translateToSpanish(text) {
  return translate(text, 'en', 'es')
}

/**
 * Traduce una lista de líneas EN -> ES en una sola petición (conserva el orden).
 * Si la división no cuadra, traduce línea por línea como respaldo.
 */
export async function translateLinesToSpanish(lines = []) {
  if (!lines.length) return lines
  const joined = lines.join('\n')
  const ck = `en>es:L:${joined}`
  if (cache[ck]) return cache[ck].split('\n')

  await acquire()
  try {
    const out = await gtxTranslate(joined, 'en', 'es')
    const parts = out.split('\n')
    if (parts.length === lines.length) {
      cache[ck] = out
      saveCache()
      return parts
    }
  } catch {
    /* respaldo abajo */
  } finally {
    release()
  }
  return Promise.all(lines.map((l) => translateToSpanish(l)))
}
