// Indicador de carga reutilizable.
export default function Spinner({ label = 'Cargando…' }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-12 text-slate-500">
      <span className="spinner" role="status" aria-label={label} />
      <p className="text-sm font-medium">{label}</p>
    </div>
  )
}
