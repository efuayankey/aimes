// Firebase initialization and configuration
import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator, enableNetwork, disableNetwork } from 'firebase/firestore';
import { getStorage, connectStorageEmulator } from 'firebase/storage';
import { ENV } from '../config/env';

// Initialize Firebase
const app = initializeApp(ENV.FIREBASE_CONFIG);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Development emulators (if running locally)
if (process.env.NODE_ENV === 'development' && process.env.VITE_USE_FIREBASE_EMULATOR === 'true') {
  try {
    connectAuthEmulator(auth, 'http://127.0.0.1:9099');
    connectFirestoreEmulator(db, '127.0.0.1', 8080);
    connectStorageEmulator(storage, '127.0.0.1', 9199);
    console.log('INFO: Connected to Firebase emulators');
  } catch (error) {
    console.warn('Firebase emulators not available:', error);
  }
}

// Network state management for offline support
export const enableFirebaseNetwork = () => enableNetwork(db);
export const disableFirebaseNetwork = () => disableNetwork(db);

// Firebase app instance (if needed elsewhere)
export default app;