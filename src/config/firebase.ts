// ============================================================
// AutoNear — Firebase Configuration
// Environment variables override defaults; defaults ensure
// seamless deployment on hosting platforms like Vercel.
// ============================================================

import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app'
import { getAuth, Auth } from 'firebase/auth'
import { getDatabase, Database } from 'firebase/database'

// Primary project configuration
const DEFAULT_CONFIG = {
  apiKey: 'AIzaSyCHuuT36WjYM9Y95K-vVgZwXcHRA96ZKvc',
  authDomain: 'autonear-16ff0.firebaseapp.com',
  databaseURL: 'https://autonear-16ff0-default-rtdb.firebaseio.com',
  projectId: 'autonear-16ff0',
  storageBucket: 'autonear-16ff0.firebasestorage.app',
  messagingSenderId: '861325148025',
  appId: '1:861325148025:web:5d62df55325667a8f979a8',
}

const getEnvOr = (key: string, fallback: string): string => {
  const val = import.meta.env[key]
  return val && val !== 'REPLACE_ME' ? String(val) : fallback
}

export const firebaseConfig = {
  apiKey: getEnvOr('VITE_FIREBASE_API_KEY', DEFAULT_CONFIG.apiKey),
  authDomain: getEnvOr('VITE_FIREBASE_AUTH_DOMAIN', DEFAULT_CONFIG.authDomain),
  databaseURL: getEnvOr('VITE_FIREBASE_DATABASE_URL', DEFAULT_CONFIG.databaseURL),
  projectId: getEnvOr('VITE_FIREBASE_PROJECT_ID', DEFAULT_CONFIG.projectId),
  storageBucket: getEnvOr('VITE_FIREBASE_STORAGE_BUCKET', DEFAULT_CONFIG.storageBucket),
  messagingSenderId: getEnvOr('VITE_FIREBASE_MESSAGING_SENDER_ID', DEFAULT_CONFIG.messagingSenderId),
  appId: getEnvOr('VITE_FIREBASE_APP_ID', DEFAULT_CONFIG.appId),
}

export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey &&
  firebaseConfig.apiKey !== 'REPLACE_ME' &&
  !firebaseConfig.apiKey.includes('placeholder')
)

let app: FirebaseApp
let auth: Auth
let db: Database

try {
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp()
  auth = getAuth(app)
  db = getDatabase(app)
} catch (err) {
  console.error('[AutoNear] Firebase initialisation failed:', err)
  throw err
}

export { auth, db }
export default app
