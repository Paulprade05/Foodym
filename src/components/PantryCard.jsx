import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { X, Package } from 'lucide-react'
import { useIngredientImage } from '../hooks/useIngredientImage'

// Tarjeta visual de un producto de la despensa.
export default function PantryCard({ name, onRemove }) {
  const { primaryUrl, getFallback, loading } = useIngredientImage(name)
  const [src, setSrc] = useState(null)
  const [failed, setFailed] = useState(false)
  const stage = useRef('primary')

  useEffect(() => {
    if (primaryUrl) {
      setSrc(primaryUrl)
      setFailed(false)
      stage.current = 'primary'
    }
  }, [primaryUrl])

  const handleError = async () => {
    if (stage.current === 'primary') {
      stage.current = 'fallback'
      const url = await getFallback()
      if (url) setSrc(url)
      else setFailed(true)
    } else {
      setFailed(true)
    }
  }

  const showImage = src && !failed

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.2 }}
      className="group relative flex flex-col items-center rounded-2xl border border-slate-200 bg-white p-3 text-center shadow-card transition hover:shadow-card-hover"
    >
      <button
        type="button"
        onClick={onRemove}
        aria-label={`Quitar ${name}`}
        className="absolute right-2 top-2 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-slate-400 opacity-0 shadow-sm backdrop-blur transition hover:text-rose-500 group-hover:opacity-100"
      >
        <X className="h-4 w-4" strokeWidth={2.5} />
      </button>

      <div className="flex h-24 w-24 items-center justify-center">
        {showImage ? (
          <img
            src={src}
            alt={name}
            loading="lazy"
            onError={handleError}
            className="h-24 w-24 object-contain"
          />
        ) : (
          <div
            className={`flex h-20 w-20 items-center justify-center rounded-full ${
              loading || !failed ? 'animate-pulse bg-slate-100' : 'bg-brand-50 text-brand-300'
            }`}
          >
            {failed && <Package className="h-9 w-9 text-brand-300" strokeWidth={1.5} />}
          </div>
        )}
      </div>

      <p className="mt-2 w-full truncate text-sm font-medium capitalize text-slate-700" title={name}>
        {name}
      </p>
    </motion.div>
  )
}
