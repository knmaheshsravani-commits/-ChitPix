// ChitPix.com - Firebase REAL Config (2026) - FIXED
import { initializeApp, getApps, getApp } from "firebase/app"
import { getAuth } from "firebase/auth"
import { getFirestore } from "firebase/firestore"
import { getStorage } from "firebase/storage"

// ✅ Nee Firebase Project Config - indulo nee keys pettu
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "YOUR_API_KEY",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "YOUR_PROJECT.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "YOUR_PROJECT_ID",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "YOUR_PROJECT.appspot.com",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "123456789",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "YOUR_APP_ID"
}

// ✅ App initialize - already unte same use chesukuntundi
const app = getApps().length ? getApp() : initializeApp(firebaseConfig)

// ✅ REAL EXPORTS - ivi null kadu, real Firebase!
export const auth = getAuth(app)      // Login/Signup kosam
export const db = getFirestore(app)   // Reels, Users, Posts save kosam
export const storage = getStorage(app) // Video/Image upload kosam

export default app

// ✅ Extra helpers - niku kavalsina new features
export const collections = {
  reels: "reels",
  users: "users",
  posts: "posts"
}
