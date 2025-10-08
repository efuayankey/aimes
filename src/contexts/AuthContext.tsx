// Authentication context with user type support
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User as FirebaseUser } from 'firebase/auth';
import { AuthService } from '../services/authService';
import { User, UserType, UserProfile, LoadingState } from '../types';

interface AuthContextType {
  // User state
  user: User | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  error: string | null;

  // Authentication actions
  signUp: (
    email: string, 
    password: string, 
    userType: UserType, 
    profileData: Partial<UserProfile>
  ) => Promise<{ needsEmailVerification: boolean }>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;

  // Profile management
  updateProfile: (updates: Partial<User>) => Promise<void>;
  refreshUserData: () => Promise<void>;
  setUser: (user: User | null) => void;

  // Utility
  clearError: () => void;
  isStudent: () => boolean;
  isCounselor: () => boolean;
  isAdmin: () => boolean;
  hasVerifiedEmail: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize auth state listener
  useEffect(() => {
    const unsubscribe = AuthService.onAuthStateChange(async (firebaseUser) => {
      setLoading(true);
      setError(null);

      try {
        if (firebaseUser) {
          // User is signed in, fetch complete profile
          const userData = await AuthService.getCurrentUserData(firebaseUser.uid);
          
          if (userData) {
            // Update email verification status
            const updatedUserData = {
              ...userData,
              isEmailVerified: firebaseUser.emailVerified
            };
            
            setUser(updatedUserData);
            setFirebaseUser(firebaseUser);
            
            // Update last active timestamp
            if (firebaseUser.emailVerified) {
              await AuthService.updateUserProfile(firebaseUser.uid, {
                'profile.lastActive': new Date(),
                isEmailVerified: true
              } as any);
            }
          } else {
            // User exists in Firebase Auth but not in Firestore
            console.warn('User profile not found in Firestore');
            await AuthService.signOut();
            setUser(null);
            setFirebaseUser(null);
          }
        } else {
          // User is signed out
          setUser(null);
          setFirebaseUser(null);
        }
      } catch (error: any) {
        console.error('Auth state change error:', error);
        setError('Failed to load user profile');
        setUser(null);
        setFirebaseUser(null);
      } finally {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  // Sign up new user
  const signUp = async (
    email: string,
    password: string,
    userType: UserType,
    profileData: Partial<UserProfile>
  ) => {
    try {
      setLoading(true);
      setError(null);

      const result = await AuthService.signUp(email, password, userType, profileData);
      
      // Immediately set the user state after successful signup
      setUser(result.user);
      
      return { needsEmailVerification: result.needsEmailVerification };
    } catch (error: any) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Sign in existing user
  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);

      await AuthService.signIn(email, password);
      
      // The auth state listener will handle setting the user state
    } catch (error: any) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Sign out user
  const signOut = async () => {
    try {
      setLoading(true);
      setError(null);

      await AuthService.signOut();
      
      // The auth state listener will handle clearing the user state
    } catch (error: any) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Reset password
  const resetPassword = async (email: string) => {
    try {
      setError(null);
      await AuthService.resetPassword(email);
    } catch (error: any) {
      setError(error.message);
      throw error;
    }
  };

  // Update user profile
  const updateProfile = async (updates: Partial<User>) => {
    if (!user) throw new Error('No user signed in');

    try {
      setError(null);
      await AuthService.updateUserProfile(user.uid, updates);
      
      // Update local state
      setUser(prevUser => prevUser ? { ...prevUser, ...updates } : null);
    } catch (error: any) {
      setError(error.message);
      throw error;
    }
  };

  // Refresh user data from Firestore
  const refreshUserData = async () => {
    if (!firebaseUser) return;

    try {
      setError(null);
      const userData = await AuthService.getCurrentUserData(firebaseUser.uid);
      
      if (userData) {
        setUser({
          ...userData,
          isEmailVerified: firebaseUser.emailVerified
        });
      }
    } catch (error: any) {
      setError(error.message);
      throw error;
    }
  };

  // Utility functions
  const clearError = () => setError(null);
  
  const isStudent = () => user?.userType === 'student';
  
  const isCounselor = () => user?.userType === 'counselor';
  
  const isAdmin = () => user?.userType === 'admin';
  
  const hasVerifiedEmail = () => user?.isEmailVerified === true;

  // Context value
  const value: AuthContextType = {
    // State
    user,
    firebaseUser,
    loading,
    error,

    // Actions
    signUp,
    signIn,
    signOut,
    resetPassword,
    updateProfile,
    refreshUserData,
    setUser,

    // Utility
    clearError,
    isStudent,
    isCounselor,
    isAdmin,
    hasVerifiedEmail
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};

// HOC for protected routes
export const withAuthRequired = <P extends object>(
  Component: React.ComponentType<P>,
  allowedUserTypes?: UserType[]
) => {
  return (props: P) => {
    const { user, loading } = useAuth();

    if (loading) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-teal-600"></div>
        </div>
      );
    }

    if (!user) {
      // Redirect to login (in a real app, use router)
      window.location.href = '/';
      return null;
    }

    if (!user.isEmailVerified) {
      return (
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Email Verification Required
            </h2>
            <p className="text-gray-600 mb-6">
              Please check your email and click the verification link to access your account.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="bg-teal-600 text-white px-6 py-2 rounded-lg hover:bg-teal-700"
            >
              I've Verified My Email
            </button>
          </div>
        </div>
      );
    }

    if (allowedUserTypes && !allowedUserTypes.includes(user.userType)) {
      return (
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Access Denied
            </h2>
            <p className="text-gray-600 mb-6">
              You don't have permission to access this page.
            </p>
            <button
              onClick={() => window.location.href = '/dashboard'}
              className="bg-teal-600 text-white px-6 py-2 rounded-lg hover:bg-teal-700"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      );
    }

    return <Component {...props} />;
  };
};