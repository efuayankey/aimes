// Authentication service
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  sendEmailVerification,
  updateProfile,
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from './firebase';
import { User, UserType, UserProfile, StudentProfile, CounselorProfile } from '../types';

export class AuthService {
  // Create new user account
  static async signUp(email: string, password: string, userType: UserType, profileData: Partial<UserProfile>) {
    try {
      // Create Firebase Auth user
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;

      // Send email verification
      await sendEmailVerification(firebaseUser);

      // Create simple user profile for testing
      const userData = {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        userType: userType,
        firstName: profileData.firstName || '',
        lastName: profileData.lastName || '',
        createdAt: new Date(),
        isActive: true
      };

      console.log('Attempting to create user document:', userData);
      try {
        await setDoc(doc(db, 'users', firebaseUser.uid), userData);
        console.log('User document created successfully');
      } catch (firestoreError) {
        console.error('Firestore setDoc failed:', firestoreError);
        throw firestoreError;
      }

      return { user: userData as any, needsEmailVerification: true };
    } catch (error: any) {
      console.error('Signup error details:', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      throw new Error(this.getErrorMessage(error.code));
    }
  }

  // Sign in existing user
  static async signIn(email: string, password: string) {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;

      // Get user profile from Firestore
      const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
      
      if (!userDoc.exists()) {
        throw new Error('User profile not found. Please contact support.');
      }

      const userData = userDoc.data() as User;

      // Update last active timestamp
      await updateDoc(doc(db, 'users', firebaseUser.uid), {
        'profile.lastActive': serverTimestamp(),
        isEmailVerified: firebaseUser.emailVerified
      });

      return userData;
    } catch (error: any) {
      console.error('Sign in error details:', error);
      throw new Error(this.getErrorMessage(error.code));
    }
  }

  // Sign out user
  static async signOut() {
    try {
      await firebaseSignOut(auth);
    } catch (error: any) {
      throw new Error('Failed to sign out. Please try again.');
    }
  }

  // Send password reset email
  static async resetPassword(email: string) {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error: any) {
      throw new Error(this.getErrorMessage(error.code));
    }
  }

  // Update user profile
  static async updateUserProfile(userId: string, updates: Partial<User>) {
    try {
      await updateDoc(doc(db, 'users', userId), {
        ...updates,
        'profile.lastActive': serverTimestamp()
      });
    } catch (error: any) {
      throw new Error('Failed to update profile. Please try again.');
    }
  }

  // Update student profile specifically
  static async updateStudentProfile(userId: string, studentProfile: Partial<StudentProfile>) {
    try {
      await updateDoc(doc(db, 'users', userId), {
        studentProfile: studentProfile,
        'profile.lastActive': serverTimestamp()
      });
    } catch (error: any) {
      throw new Error('Failed to update student profile.');
    }
  }

  // Update counselor profile specifically
  static async updateCounselorProfile(userId: string, counselorProfile: Partial<CounselorProfile>) {
    try {
      await updateDoc(doc(db, 'users', userId), {
        counselorProfile: counselorProfile,
        'profile.lastActive': serverTimestamp()
      });
    } catch (error: any) {
      throw new Error('Failed to update counselor profile.');
    }
  }

  // Get current user data from Firestore
  static async getCurrentUserData(uid: string): Promise<User | null> {
    try {
      const userDoc = await getDoc(doc(db, 'users', uid));
      return userDoc.exists() ? (userDoc.data() as User) : null;
    } catch (error) {
      console.error('Error fetching user data:', error);
      return null;
    }
  }

  // Authentication state observer
  static onAuthStateChange(callback: (user: FirebaseUser | null) => void) {
    return onAuthStateChanged(auth, callback);
  }

  // Verify counselor (admin function)
  static async verifyCounselor(counselorId: string, verified: boolean) {
    try {
      await updateDoc(doc(db, 'users', counselorId), {
        'counselorProfile.verified': verified,
        'profile.lastActive': serverTimestamp()
      });
    } catch (error: any) {
      throw new Error('Failed to update counselor verification status.');
    }
  }

  // Helper method to get user-friendly error messages
  private static getErrorMessage(errorCode: string): string {
    switch (errorCode) {
      case 'auth/email-already-in-use':
        return 'An account with this email already exists.';
      case 'auth/invalid-email':
        return 'Please enter a valid email address.';
      case 'auth/operation-not-allowed':
        return 'Email/password accounts are not enabled. Please contact support.';
      case 'auth/weak-password':
        return 'Password should be at least 6 characters long.';
      case 'auth/user-disabled':
        return 'This account has been disabled. Please contact support.';
      case 'auth/user-not-found':
        return 'No account found with this email address.';
      case 'auth/wrong-password':
        return 'Incorrect password. Please try again.';
      case 'auth/too-many-requests':
        return 'Too many failed attempts. Please try again later.';
      case 'auth/network-request-failed':
        return 'Network error. Please check your connection and try again.';
      default:
        return 'An unexpected error occurred. Please try again.';
    }
  }
}