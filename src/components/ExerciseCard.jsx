import { useEffect, useState } from 'react'
import { Play, ChevronDown, Target } from 'lucide-react'
import FavoriteButton from './FavoriteButton'
import { translateMuscle, translateEquipment, translateLevel, levelBadgeClass } from '../utils/translations'
import { useSpanish, useSpanishLines } from '../hooks/useTranslation'

const PLACEHOLDER =
  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300"><rect width="100%" height="100%" fill="%23f1f5f9"/><text x="50%" y="50%" font-family="sans-serif" font-size="18" fill="%2394a3b8" text-anchor="middle" dominant-baseline="middle">Imagen no disponible</text></svg>'

const titleCase = (s = '') => s.replace(/\b\w/g, (c) => c.toUpperCase())

export default function ExerciseCard({ exercise, isFavorite, onToggleFavorite }) {
  const [frame, setFrame] = useState(0)
  const [expanded, setExpanded] = useState(false)

  const images = exercise.images && exercise.images.length > 0 ? exercise.images : [PLACEHOLDER]

  // Alterna entre las dos imágenes (inicio/fin del movimiento) para simular la animación.
  useEffect(() => {
    if (images.length < 2) return
    const t = setInterval(() => setFrame((f) => (f + 1) % images.length), 1100)
    return () => clearInterval(t)
  }, [images.length])

  // Traducción al español (con caché). El nombre original sirve para el vídeo.
  const name = titleCase(useSpanish(exercise.name))
  const instructions = useSpanishLines(exercise.instructions || [])
  const youtubeUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(
    `como hacer ${exercise.name} ejercicio tecnica`,
  )}`

  return (
    <article className="flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-card-hover">
      <div className="relative aspect-[4/3] overflow-hidden bg-white">
        <img
          src={images[frame]}
          alt={`Técnica: ${name}`}
          loading="lazy"
          onError={(e) => {
            e.currentTarget.src = PLACEHOLDER
          }}
          className="h-full w-full object-contain transition-opacity duration-300"
        />
        <div className="absolute right-3 top-3">
          <FavoriteButton active={isFavorite} onClick={onToggleFavorite} />
        </div>
        {exercise.level && (
          <span
            className={`absolute left-3 top-3 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${levelBadgeClass(
              exercise.level,
            )}`}
          >
            {translateLevel(exercise.level)}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4">
        <h3 className="font-semibold leading-snug text-slate-800">{name}</h3>

        <div className="mt-2 flex flex-wrap gap-1.5 text-xs">
          {exercise.primaryMuscles.slice(0, 2).map((m) => (
            <span
              key={m}
              className="inline-flex items-center gap-1 rounded-full bg-brand-50 px-2.5 py-1 font-medium text-brand-700"
            >
              <Target className="h-3 w-3" />
              {translateMuscle(m)}
            </span>
          ))}
          <span className="rounded-full bg-slate-100 px-2.5 py-1 font-medium text-slate-600">
            {translateEquipment(exercise.equipment)}
          </span>
        </div>

        {instructions.length > 0 && (
          <div className="mt-3">
            <button
              type="button"
              onClick={() => setExpanded((v) => !v)}
              className="flex w-full items-center justify-between text-left text-xs font-semibold uppercase tracking-wide text-slate-400 transition hover:text-slate-600"
            >
              Instrucciones
              <ChevronDown
                className={`h-4 w-4 transition-transform ${expanded ? 'rotate-180' : ''}`}
              />
            </button>
            <ol
              className={`mt-2 list-decimal space-y-1.5 pl-5 text-sm leading-relaxed text-slate-600 ${
                expanded ? '' : 'line-clamp-3'
              }`}
            >
              {instructions.map((step, i) => (
                <li key={i}>{step}</li>
              ))}
            </ol>
          </div>
        )}

        <a
          href={youtubeUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-flex items-center justify-center gap-2 rounded-xl bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-600 transition hover:bg-rose-100"
        >
          <Play className="h-4 w-4" fill="currentColor" />
          Ver vídeo explicativo
        </a>
      </div>
    </article>
  )
}
