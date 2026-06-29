import { createContext, useContext, useEffect, useState } from 'react'
import { supabase, isSupabaseConfigured } from '../supabase/config'

const AuthContext = createContext(null)

export const useAuth = () => useContext(AuthContext)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(isSupabaseConfigured)
  const [authError, setAuthError] = useState('')
  const [magicLinkSentTo, setMagicLinkSentTo] = useState('')

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setLoading(false)
      return
    }
    // Sesión actual (si volvió del enlace mágico, ya estará disponible).
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null)
      setLoading(false)
    })
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })
    return () => sub.subscription.unsubscribe()
  }, [])

  // Envía un enlace mágico al correo indicado.
  const signInWithEmail = async (email) => {
    if (!isSupabaseConfigured) return
    setAuthError('')
    const clean = (email || '').trim()
    if (!clean) return
    const { error } = await supabase.auth.signInWithOtp({
      email: clean,
      options: { emailRedirectTo: window.location.href.split('#')[0] },
    })
    if (error) {
      setAuthError('No se pudo enviar el enlace. Revisa el correo e inténtalo de nuevo.')
      return
    }
    setMagicLinkSentTo(clean)
  }

  const clearMagicLink = () => setMagicLinkSentTo('')

  const signOutUser = async () => {
    if (!isSupabaseConfigured) return
    try {
      await supabase.auth.signOut()
    } catch {
      /* ignoramos errores de cierre de sesión */
    }
  }

  const value = {
    user,
    loading,
    enabled: isSupabaseConfigured,
    signInWithEmail,
    signOutUser,
    authError,
    magicLinkSentTo,
    clearMagicLink,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
