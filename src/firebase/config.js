// Inicialización de Firebase con degradación elegante.
// Si faltan las variables de entorno, la app sigue funcionando en "modo local"
// (sin login ni sincronización) en lugar de romperse.

import { initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

// Consideramos Firebase configurado si están los campos mínimos imprescindibles.
export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey && firebaseConfig.projectId && firebaseConfig.appId,
)

let auth = null
let db = null
let googleProvider = null

if (isFirebaseConfigured) {
  const app = initializeApp(firebaseConfig)
  auth = getAuth(app)
  db = getFirestore(app)
  googleProvider = new GoogleAuthProvider()
} else if (import.meta.env.DEV) {
  // Aviso solo en desarrollo para recordar la configuración pendiente.
  console.info(
    '[Firebase] Sin configurar: la app funciona en modo local. Rellena VITE_FIREBASE_* en .env para activar login y sincronización.',
  )
}

export { auth, db, googleProvider }
