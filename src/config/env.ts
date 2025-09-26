// Environment configuration
// This file centralizes all environment variable access

export const ENV = {
  // OpenAI Configuration
  OPENAI_API_KEY: import.meta.env.VITE_OPENAI_API_KEY,
  
  // Firebase Configuration (supports both VITE_ and NEXT_PUBLIC_ prefixes)
  FIREBASE_CONFIG: {
    apiKey: import.meta.env.NEXT_PUBLIC_FIREBASE_API_KEY || import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.NEXT_PUBLIC_FIREBASE_APP_ID || import.meta.env.VITE_FIREBASE_APP_ID
  }
};

// Validation to ensure required environment variables are present
const validateEnv = () => {
  if (!ENV.OPENAI_API_KEY) {
    console.error('❌ Missing VITE_OPENAI_API_KEY');
    throw new Error('OpenAI API key is required');
  }

  if (!ENV.FIREBASE_CONFIG.apiKey || !ENV.FIREBASE_CONFIG.projectId) {
    console.error('❌ Missing Firebase configuration');
    console.error('💡 Make sure your .env.local file has the Firebase config variables');
    throw new Error('Firebase configuration is incomplete');
  }
  
  console.log('✅ Environment variables loaded successfully');
  console.log('🔥 Firebase project:', ENV.FIREBASE_CONFIG.projectId);
};

// Validate on module load (only in development)
if (import.meta.env.DEV) {
  validateEnv();
}