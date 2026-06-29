import { motion } from 'framer-motion'
import { Heart } from 'lucide-react'

// Botón de corazón para marcar/desmarcar favoritos.
export default function FavoriteButton({ active, onClick }) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileTap={{ scale: 0.8 }}
      aria-label={active ? 'Quitar de favoritos' : 'Añadir a favoritos'}
      aria-pressed={active}
      className={`flex h-9 w-9 items-center justify-center rounded-full shadow-sm backdrop-blur transition ${
        active ? 'bg-white text-rose-500' : 'bg-white/85 text-slate-400 hover:text-rose-500'
      }`}
    >
      <Heart className="h-[18px] w-[18px]" fill={active ? 'currentColor' : 'none'} strokeWidth={2} />
    </motion.button>
  )
}
