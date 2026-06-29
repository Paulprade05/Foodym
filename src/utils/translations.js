// Diccionarios para traducir al español los valores del dataset de ejercicios.

// Músculos (primaryMuscles / secondaryMuscles).
export const MUSCLE_ES = {
  abdominals: 'Abdominales',
  abductors: 'Abductores',
  adductors: 'Aductores',
  biceps: 'Bíceps',
  calves: 'Pantorrillas',
  chest: 'Pecho',
  forearms: 'Antebrazos',
  glutes: 'Glúteos',
  hamstrings: 'Isquiotibiales',
  lats: 'Dorsales',
  'lower back': 'Espalda baja',
  'middle back': 'Espalda media',
  neck: 'Cuello',
  quadriceps: 'Cuádriceps',
  shoulders: 'Hombros',
  traps: 'Trapecios',
  triceps: 'Tríceps',
}

// Equipamiento.
export const EQUIPMENT_ES = {
  'body only': 'Peso corporal',
  dumbbell: 'Mancuernas',
  barbell: 'Barra',
  'e-z curl bar': 'Barra Z',
  cable: 'Polea (cable)',
  machine: 'Máquina',
  bands: 'Bandas de resistencia',
  kettlebells: 'Kettlebell',
  'exercise ball': 'Pelota de ejercicio',
  'medicine ball': 'Balón medicinal',
  'foam roll': 'Rodillo de espuma',
  other: 'Otro',
}

// Nivel de dificultad (campo "level").
export const LEVEL_ES = {
  beginner: 'Principiante',
  intermediate: 'Intermedio',
  expert: 'Avanzado',
}

const fallback = (value = '') =>
  value ? value.charAt(0).toUpperCase() + value.slice(1) : '—'

export const translateMuscle = (v) => MUSCLE_ES[v] ?? fallback(v)
export const translateEquipment = (v) => EQUIPMENT_ES[v] ?? fallback(v)
export const translateLevel = (v) => LEVEL_ES[v] ?? fallback(v)

// Clase de color para la insignia de nivel.
export const levelBadgeClass = (level) => {
  switch (level) {
    case 'beginner':
      return 'bg-emerald-50 text-emerald-700 ring-emerald-600/20'
    case 'intermediate':
      return 'bg-amber-50 text-amber-700 ring-amber-600/20'
    case 'expert':
      return 'bg-rose-50 text-rose-700 ring-rose-600/20'
    default:
      return 'bg-slate-100 text-slate-600 ring-slate-500/20'
  }
}
