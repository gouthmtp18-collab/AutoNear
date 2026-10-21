// ============================================================
// AutoNear — Firebase Configuration
// All values come from environment variables (.env file).
// Never commit real credentials to source control.
// ============================================================

import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app'
import { getAuth, Auth } from 'firebase/auth'
import { getDatabase, Database } from 'firebase/database'

const requiredVars = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_DATABASE_URL',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_STORAGE_BUCKET',
  'VITE_FIREBASE_MESSAGING_SENDER_ID',
  'VITE_FIREBASE_APP_ID',
]

const missing = requiredVars.filter(
  (key) => !import.meta.env[key] || import.meta.env[key] === 'REPLACE_ME'
)

export const isFirebaseConfigured = missing.length === 0

if (!isFirebaseConfigured) {
  console.warn(
    '[AutoNear] Firebase configuration is incomplete.\n' +
      'Please fill in your .env file with real Firebase project values.\n' +
      'Missing or placeholder variables:\n' +
      missing.map((v) => `  ${v}`).join('\n') +
      '\n\nThe app UI will load but Firebase features will not work until configured.'
  )
}

// Use safe placeholder values so Firebase does not throw a fatal parse error
// when the .env file has not been filled in yet.
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'placeholder-api-key',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'placeholder.firebaseapp.com',
  // databaseURL must be a valid-looking URL or Firebase SDK will crash hard.
  databaseURL:
    import.meta.env.VITE_FIREBASE_DATABASE_URL &&
    import.meta.env.VITE_FIREBASE_DATABASE_URL !== 'REPLACE_ME'
      ? import.meta.env.VITE_FIREBASE_DATABASE_URL
      : 'https://placeholder-default-rtdb.firebaseio.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'placeholder-project',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'placeholder.appspot.com',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '000000000000',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:000000000000:web:placeholder',
}

// Avoid re-initialising if HMR re-runs this module
let app: FirebaseApp
let auth: Auth
let db: Database

try {
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp()
  auth = getAuth(app)
  db = getDatabase(app)
} catch (err) {
  console.error('[AutoNear] Firebase initialisation failed:', err)
  // Re-throw so the ConfigWarning shows, but App still mounts via error boundary
  throw err
}

export { auth, db }
export default app
