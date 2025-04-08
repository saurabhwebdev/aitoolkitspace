// Import Firebase services
import { initializeApp, getApps } from 'firebase/app';
import { getAuth, GoogleAuthProvider, GithubAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAnalytics, isSupported } from 'firebase/analytics';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD8Vjs8U63Xg6tgGInajrsWwHfLzW0SyUk",
  authDomain: "jargon-a0120.firebaseapp.com",
  projectId: "jargon-a0120",
  storageBucket: "jargon-a0120.firebasestorage.app",
  messagingSenderId: "653247798745",
  appId: "1:653247798745:web:afbc0b30ab2c3a479fcdc8",
  measurementId: "G-L3WJBPWX80"
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// Initialize Firebase services
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Initialize Analytics conditionally (for client-side only)
const initializeAnalytics = async () => {
  if (typeof window !== 'undefined') {
    const analyticsSupported = await isSupported();
    if (analyticsSupported) {
      return getAnalytics(app);
    }
  }
  return null;
};

// Auth providers
const googleProvider = new GoogleAuthProvider();
const githubProvider = new GithubAuthProvider();

export { 
  app, 
  auth, 
  db, 
  storage, 
  initializeAnalytics,
  googleProvider,
  githubProvider
}; 