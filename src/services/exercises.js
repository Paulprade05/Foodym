// Servicio de ejercicios basado en "free-exercise-db" (open source, sin clave).
// Fuente: https://github.com/yuhonas/free-exercise-db  (servido vía jsDelivr CDN)
//
// 873 ejercicios con: equipamiento, músculos primarios/secundarios, nivel,
// instrucciones e imágenes reales de la técnica. Filtra en cliente por
// equipamiento y grupo muscular (no requiere ninguna API key).

const DATA_URL = 'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/dist/exercises.json'
const IMG_BASE = 'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/'

// Equipamiento agrupado por lugar de entrenamiento (id = valor del dataset).
export const EQUIPMENT_GROUPS = [
  {
    place: 'casa',
    label: 'En casa',
    options: [
      { id: 'body only', label: 'Peso corporal' },
      { id: 'dumbbell', label: 'Mancuernas' },
      { id: 'bands', label: 'Bandas de resistencia' },
      { id: 'kettlebells', label: 'Kettlebell' },
      { id: 'exercise ball', label: 'Pelota de ejercicio' },
      { id: 'medicine ball', label: 'Balón medicinal' },
    ],
  },
  {
    place: 'gimnasio',
    label: 'En el gimnasio',
    options: [
      { id: 'barbell', label: 'Barra' },
      { id: 'e-z curl bar', label: 'Barra Z' },
      { id: 'cable', label: 'Polea (cable)' },
      { id: 'machine', label: 'Máquina' },
    ],
  },
]

// Grupos musculares (etiqueta en español -> músculos del dataset).
export const MUSCLE_GROUPS = [
  {
    region: 'Tren superior',
    options: [
      { id: 'chest', label: 'Pecho', muscles: ['chest'] },
      { id: 'back', label: 'Espalda', muscles: ['lats', 'middle back', 'lower back', 'traps'] },
      { id: 'shoulders', label: 'Hombros', muscles: ['shoulders'] },
      { id: 'biceps', label: 'Bíceps', muscles: ['biceps'] },
      { id: 'triceps', label: 'Tríceps', muscles: ['triceps'] },
      { id: 'forearms', label: 'Antebrazos', muscles: ['forearms'] },
    ],
  },
  {
    region: 'Core',
    options: [{ id: 'abs', label: 'Abdomen', muscles: ['abdominals'] }],
  },
  {
    region: 'Tren inferior',
    options: [
      { id: 'quads', label: 'Cuádriceps', muscles: ['quadriceps'] },
      { id: 'hamstrings', label: 'Isquiotibiales', muscles: ['hamstrings'] },
      { id: 'glutes', label: 'Glúteos', muscles: ['glutes'] },
      { id: 'calves', label: 'Pantorrillas', muscles: ['calves'] },
    ],
  },
]

const MUSCLE_MAP = MUSCLE_GROUPS.flatMap((g) => g.options).reduce((acc, o) => {
  acc[o.id] = o.muscles
  return acc
}, {})

let cache = null

async function loadAll() {
  if (cache) return cache
  let res
  try {
    res = await fetch(DATA_URL)
  } catch {
    throw new Error('No se pudo cargar la base de datos de ejercicios. Revisa tu conexión.')
  }
  if (!res.ok) {
    throw new Error('No se pudo cargar la base de datos de ejercicios. Inténtalo más tarde.')
  }
  cache = await res.json()
  return cache
}

/**
 * Devuelve ejercicios filtrados por equipamiento y/o grupo muscular.
 *
 * @param {Object} opts
 * @param {string[]} opts.equipment  Ids de equipamiento seleccionados.
 * @param {string[]} opts.muscles    Ids de grupo muscular seleccionados.
 * @param {number}   opts.limit      Máximo de resultados.
 */
export async function fetchExercises({ equipment = [], muscles = [], limit = 30 } = {}) {
  const all = await loadAll()

  const muscleSet = new Set(muscles.flatMap((id) => MUSCLE_MAP[id] || [id]))

  const filtered = all.filter((ex) => {
    const eqOk = equipment.length === 0 || equipment.includes(ex.equipment)
    const muscleOk =
      muscleSet.size === 0 || (ex.primaryMuscles || []).some((m) => muscleSet.has(m))
    return eqOk && muscleOk
  })

  return filtered.slice(0, limit).map((ex) => ({
    id: ex.id,
    name: ex.name,
    level: ex.level,
    category: ex.category,
    equipment: ex.equipment || 'body only',
    primaryMuscles: ex.primaryMuscles || [],
    secondaryMuscles: ex.secondaryMuscles || [],
    instructions: ex.instructions || [],
    images: (ex.images || []).map((p) => IMG_BASE + p),
  }))
}
