// Environment configuration
// This file centralizes all environment variable access

export const ENV = {
  // OpenAI Configuration
  OPENAI_API_KEY: process.env.NEXT_PUBLIC_OPENAI_API_KEY || process.env.VITE_OPENAI_API_KEY,
  
  // Firebase Configuration (supports both VITE_ and NEXT_PUBLIC_ prefixes)
  FIREBASE_CONFIG: {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || process.env.VITE_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || process.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || process.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || process.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || process.env.VITE_FIREBASE_APP_ID
  }
};

// Validation to ensure required environment variables are present
const validateEnv = () => {
  if (!ENV.OPENAI_API_KEY) {
    console.error('ERROR: Missing OpenAI API key');
    console.error('INFO: Add NEXT_PUBLIC_OPENAI_API_KEY to your .env.local file');
    throw new Error('OpenAI API key is required');
  }

  if (!ENV.FIREBASE_CONFIG.apiKey || !ENV.FIREBASE_CONFIG.projectId) {
    console.error('ERROR: Missing Firebase configuration');
    console.error('INFO: Make sure your .env.local file has the Firebase config variables');
    throw new Error('Firebase configuration is incomplete');
  }
  
  console.log('SUCCESS: Environment variables loaded successfully');
  console.log('INFO: Firebase project:', ENV.FIREBASE_CONFIG.projectId);
};

// Validate on module load (only in development)
if (process.env.NODE_ENV === 'development') {
  validateEnv();
}