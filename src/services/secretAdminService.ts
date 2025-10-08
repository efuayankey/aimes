// Secret admin access service - completely hidden from public
import { ENV } from '../config/env';
import { AuthService } from './authService';
import { User, AdminProfile } from '../types';
import { 
  collection, 
  doc, 
  getDoc, 
  setDoc, 
  serverTimestamp 
} from 'firebase/firestore';
import { db } from './firebase';

export class SecretAdminService {
  // Secret admin configuration from environment ONLY - no defaults for security
  private static readonly SECRET_ADMIN_EMAIL = ENV.SECRET_ADMIN_EMAIL;
  private static readonly SECRET_ADMIN_PASSWORD = ENV.SECRET_ADMIN_PASSWORD;
  private static readonly SECRET_URL_TOKEN = ENV.SECRET_URL_TOKEN;

  /**
   * Check if current URL contains the secret admin token
   */
  static isSecretAdminURL(): boolean {
    if (typeof window === 'undefined') return false;
    if (!this.SECRET_URL_TOKEN) return false; // No access if token not set
    
    const currentPath = window.location.pathname + window.location.search;
    return currentPath.includes(this.SECRET_URL_TOKEN);
  }

  /**
   * Get the secret admin access URL
   */
  static getSecretAdminURL(): string {
    if (!this.SECRET_URL_TOKEN) throw new Error('Admin access not configured');
    return `/admin-${this.SECRET_URL_TOKEN}`;
  }

  /**
   * Create or get the secret admin user
   */
  static async ensureSecretAdminExists(): Promise<void> {
    if (!this.SECRET_ADMIN_EMAIL) {
      throw new Error('SECRET_ADMIN_EMAIL environment variable not set');
    }

    try {
      // Check if admin already exists in Firestore
      const adminQuery = collection(db, 'users');
      const adminDocRef = doc(adminQuery, 'secret-admin-user');
      const adminDoc = await getDoc(adminDocRef);

      if (!adminDoc.exists()) {
        // Create the secret admin user directly in Firestore
        const adminProfile: AdminProfile = {
          role: 'super-admin',
          department: 'System Administration',
          accessLevel: 10,
          permissions: {
            canExportAllData: true,
            canViewAnalytics: true,
            canManageUsers: true,
            canModerateContent: true,
            canAccessSystemLogs: true
          }
        };

        const secretAdmin: Omit<User, 'uid'> = {
          email: this.SECRET_ADMIN_EMAIL,
          userType: 'admin',
          profile: {
            firstName: 'System',
            lastName: 'Administrator',
            createdAt: new Date(),
            lastActive: new Date()
          },
          adminProfile: adminProfile,
          isEmailVerified: true,
          isActive: true
        };

        // Store admin user with fixed ID
        await setDoc(adminDocRef, {
          ...secretAdmin,
          createdAt: serverTimestamp(),
          lastActive: serverTimestamp()
        });

        console.log('✅ Secret admin user created successfully');
      }
    } catch (error) {
      console.error('Failed to ensure secret admin exists:', error);
    }
  }

  /**
   * Authenticate as secret admin
   */
  static async authenticateSecretAdmin(): Promise<User | null> {
    try {
      // Get the secret admin user from Firestore
      const adminDocRef = doc(db, 'users', 'secret-admin-user');
      const adminDoc = await getDoc(adminDocRef);

      if (adminDoc.exists()) {
        const adminData = adminDoc.data();
        return {
          uid: 'secret-admin-user',
          ...adminData,
          createdAt: adminData.createdAt?.toDate() || new Date(),
          lastActive: adminData.lastActive?.toDate() || new Date()
        } as User;
      }

      return null;
    } catch (error) {
      console.error('Failed to authenticate secret admin:', error);
      return null;
    }
  }

  /**
   * Check if user is the secret admin
   */
  static isSecretAdmin(user: User | null): boolean {
    return user?.uid === 'secret-admin-user' || user?.email === this.SECRET_ADMIN_EMAIL;
  }

  /**
   * Validate secret admin access
   */
  static validateSecretAccess(password?: string): boolean {
    // Check if URL is valid
    if (!this.isSecretAdminURL()) return false;
    
    // Check if password matches (if configured)
    if (this.SECRET_ADMIN_PASSWORD && password) {
      return password === this.SECRET_ADMIN_PASSWORD;
    }
    
    // If no password configured, just check URL
    return true;
  }

  /**
   * Get admin dashboard URL with secret token
   */
  static getAdminDashboardURL(): string {
    return `/dashboard?admin=${this.SECRET_URL_TOKEN}`;
  }

  /**
   * Initialize secret admin system
   */
  static async initialize(): Promise<void> {
    // Only initialize if on secret URL
    if (this.isSecretAdminURL()) {
      await this.ensureSecretAdminExists();
      console.log('🔐 Secret admin system initialized');
    }
  }

  /**
   * Log secret admin access for security monitoring
   */
  static logSecretAccess(userAgent?: string): void {
    console.log('🔐 SECRET ADMIN ACCESS', {
      timestamp: new Date().toISOString(),
      userAgent: userAgent || 'Unknown',
      url: typeof window !== 'undefined' ? window.location.href : 'Server',
      message: 'Secret admin panel accessed'
    });
  }

  /**
   * Security: Hide admin traces in production logs
   */
  static sanitizeForProduction(): void {
    // In production, you might want to:
    // 1. Disable console logs
    // 2. Use encrypted admin identifiers  
    // 3. Add additional authentication layers
    // 4. Implement IP whitelisting
    
    if (process.env.NODE_ENV === 'production') {
      // Override console methods for admin operations
      const originalLog = console.log;
      console.log = (...args: any[]) => {
        const message = args.join(' ');
        if (!message.includes('SECRET') && !message.includes('admin')) {
          originalLog(...args);
        }
      };
    }
  }
}