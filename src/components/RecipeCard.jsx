import { Clock, Users, ShoppingCart, ArrowUpRight } from 'lucide-react'
import FavoriteButton from './FavoriteButton'
import { useSpanish } from '../hooks/useTranslation'

const PLACEHOLDER =
  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="312" height="231"><rect width="100%" height="100%" fill="%23e2e8f0"/><text x="50%" y="50%" font-family="sans-serif" font-size="15" fill="%2394a3b8" text-anchor="middle" dominant-baseline="middle">Sin imagen</text></svg>'

export default function RecipeCard({ recipe, totalIngredients, isFavorite, onToggleFavorite }) {
  const used = recipe.usedIngredientCount ?? 0
  const missed = recipe.missedIngredientCount ?? 0
  const title = useSpanish(recipe.title)

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-card-hover">
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={recipe.image || PLACEHOLDER}
          alt={title}
          loading="lazy"
          onError={(e) => {
            e.currentTarget.src = PLACEHOLDER
          }}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {totalIngredients > 0 && (
          <span className="absolute left-3 top-3 rounded-full bg-emerald-600 px-2.5 py-1 text-xs font-semibold text-white shadow-sm ring-1 ring-emerald-500/30">
            {used}/{totalIngredients} ingredientes
          </span>
        )}
        <div className="absolute right-3 top-3">
          <FavoriteButton active={isFavorite} onClick={onToggleFavorite} />
        </div>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <h3 className="line-clamp-2 font-semibold leading-snug text-slate-800">{title}</h3>

        <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-slate-500">
          {recipe.readyInMinutes != null && (
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" /> {recipe.readyInMinutes} min
            </span>
          )}
          {recipe.servings != null && (
            <span className="inline-flex items-center gap-1">
              <Users className="h-3.5 w-3.5" /> {recipe.servings} raciones
            </span>
          )}
          {missed > 0 && (
            <span className="inline-flex items-center gap-1">
              <ShoppingCart className="h-3.5 w-3.5" /> Faltan {missed}
            </span>
          )}
        </div>

        {recipe.sourceUrl && (
          <a
            href={recipe.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex items-center justify-center gap-1.5 rounded-xl bg-brand-50 px-4 py-2 text-sm font-semibold text-brand-700 transition hover:bg-brand-100"
          >
            Ver receta completa
            <ArrowUpRight className="h-4 w-4" />
          </a>
        )}
      </div>
    </article>
  )
}
