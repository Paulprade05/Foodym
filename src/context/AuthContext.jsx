import { createContext, useContext, useEffect, useState } from 'react'
import { onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth'
import { auth, googleProvider, isFirebaseConfigured } from '../firebase/config'

const AuthContext = createContext(null)

export const useAuth = () => useContext(AuthContext)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  // Si Firebase no está configurado, no hay nada que cargar.
  const [loading, setLoading] = useState(isFirebaseConfigured)
  const [authError, setAuthError] = useState('')

  useEffect(() => {
    if (!isFirebaseConfigured) {
      setLoading(false)
      return
    }
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser)
      setLoading(false)
    })
    return unsubscribe
  }, [])

  const signInWithGoogle = async () => {
    if (!isFirebaseConfigured) return
    setAuthError('')
    try {
      await signInWithPopup(auth, googleProvider)
    } catch (err) {
      if (err?.code === 'auth/popup-closed-by-user') return // el usuario cerró la ventana
      setAuthError('No se pudo iniciar sesión con Google. Inténtalo de nuevo.')
    }
  }

  const signOutUser = async () => {
    if (!isFirebaseConfigured) return
    try {
      await signOut(auth)
    } catch {
      /* ignoramos errores de cierre de sesión */
    }
  }

  const value = {
    user,
    loading,
    firebaseEnabled: isFirebaseConfigured,
    signInWithGoogle,
    signOutUser,
    authError,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
