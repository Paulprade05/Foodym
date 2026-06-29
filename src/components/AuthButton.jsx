import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CloudOff, LogOut, ChevronDown, Mail, MailCheck } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function AuthButton() {
  const {
    user,
    loading,
    enabled,
    signInWithEmail,
    signOutUser,
    authError,
    magicLinkSentTo,
    clearMagicLink,
  } = useAuth()

  const [open, setOpen] = useState(false)
  const [email, setEmail] = useState('')
  const [sending, setSending] = useState(false)

  // Supabase aún no configurado.
  if (!enabled) {
    return (
      <span
        title="Configura Supabase (ver README) para iniciar sesión y sincronizar entre dispositivos."
        className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-500"
      >
        <CloudOff className="h-3.5 w-3.5" />
        Modo local
      </span>
    )
  }

  if (loading) {
    return <span className="h-9 w-28 animate-pulse rounded-full bg-slate-200" />
  }

  const closeMenu = () => setOpen(false)

  // Usuario autenticado.
  if (user) {
    const initial = (user.email || '?').charAt(0).toUpperCase()
    return (
      <div className="relative">
        <button
          onClick={() => setOpen((v) => !v)}
          className="flex items-center gap-2 rounded-full border border-slate-200 bg-white py-1 pl-1 pr-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
        >
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-600 text-white">
            {initial}
          </span>
          <span className="hidden max-w-[9rem] truncate sm:inline">{user.email}</span>
          <ChevronDown className="h-4 w-4 text-slate-400" />
        </button>
        <AnimatePresence>
          {open && (
            <>
              <div className="fixed inset-0 z-10" onClick={closeMenu} />
              <motion.div
                initial={{ opacity: 0, y: -6, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -6, scale: 0.97 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 z-20 mt-2 w-64 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-card-hover"
              >
                <div className="border-b border-slate-100 px-4 py-3">
                  <p className="text-xs text-slate-400">Sesión iniciada como</p>
                  <p className="truncate text-sm font-semibold text-slate-800">{user.email}</p>
                </div>
                <button
                  onClick={() => {
                    closeMenu()
                    signOutUser()
                  }}
                  className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm font-medium text-rose-600 transition hover:bg-rose-50"
                >
                  <LogOut className="h-4 w-4" />
                  Cerrar sesión
                </button>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    )
  }

  // No autenticado: botón + popover con el formulario de enlace mágico.
  const handleSend = async (e) => {
    e.preventDefault()
    setSending(true)
    await signInWithEmail(email)
    setSending(false)
  }

  const handleOpen = () => {
    clearMagicLink()
    setOpen((v) => !v)
  }

  return (
    <div className="relative">
      <button
        onClick={handleOpen}
        className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 active:scale-95"
      >
        <Mail className="h-4 w-4" />
        <span className="hidden sm:inline">Iniciar sesión</span>
      </button>

      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-10" onClick={closeMenu} />
            <motion.div
              initial={{ opacity: 0, y: -6, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.97 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 z-20 mt-2 w-72 overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-card-hover"
            >
              {magicLinkSentTo ? (
                <div className="text-center">
                  <span className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                    <MailCheck className="h-5 w-5" />
                  </span>
                  <p className="text-sm font-semibold text-slate-800">Revisa tu correo</p>
                  <p className="mt-1 text-xs text-slate-500">
                    Te enviamos un enlace de acceso a <strong>{magicLinkSentTo}</strong>. Ábrelo en
                    este dispositivo para entrar.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSend}>
                  <p className="mb-2 text-sm font-semibold text-slate-800">
                    Entra con tu correo
                  </p>
                  <p className="mb-3 text-xs text-slate-500">
                    Sin contraseña: te enviamos un enlace mágico para acceder y sincronizar tus
                    datos.
                  </p>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tu@correo.com"
                    className="mb-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-base outline-none transition focus:border-brand-400 focus:bg-white focus:ring-4 focus:ring-brand-100 sm:text-sm"
                  />
                  {authError && <p className="mb-2 text-xs text-rose-600">{authError}</p>}
                  <button type="submit" disabled={sending} className="btn-primary w-full">
                    {sending ? 'Enviando…' : 'Enviar enlace'}
                  </button>
                </form>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
