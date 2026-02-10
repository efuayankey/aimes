export type UserType = 'student' | 'counselor' | 'admin';

export type CulturalBackground =
  | 'african-american'
  | 'african'
  | 'asian-american'
  | 'east-asian'
  | 'south-asian'
  | 'latino-hispanic'
  | 'white-american'
  | 'middle-eastern'
  | 'native-american'
  | 'multiracial'
  | 'prefer-not-to-say'
  | 'other';

// Language support for bilingual mediation
export type Language = 'en' | 'es'; // MVP: English and Spanish
// Future expansion: 'zh' (Chinese), 'fr' (French), 'ar' (Arabic), 'ko' (Korean)

export interface UserProfile {
  firstName: string;
  lastName: string;
  createdAt: Date;
  lastActive: Date;
}

export interface StudentProfile {
  culturalBackground?: CulturalBackground;
  preferredLanguage?: Language; // Language preference for AI responses and communication
  gender?: 'male' | 'female' | 'non-binary' | 'prefer-not-to-say';
  academicYear?: string;
  major?: string;
  preferences: {
    allowJournalSharing: boolean;
    notificationsEnabled: boolean;
    preferredResponseTime: 'immediate' | 'within-hour' | 'within-day';
  };
}

export interface CounselorProfile {
  credentials: string;
  specializations: string[];
  verified: boolean;
  bio?: string;
  yearsExperience?: number;
  stats: {
    totalResponses: number;
    averageResponseTime: number; // in minutes
    averageRating: number;
    completedFeedbackSessions: number;
  };
  availability: {
    timezone: string;
    hoursPerWeek: number;
    preferredHours: string[];
  };
}

export interface AdminProfile {
  role: 'super-admin' | 'data-admin' | 'platform-admin';
  department?: string;
  accessLevel: number; // 1-10, 10 being highest
  permissions: {
    canExportAllData: boolean;
    canViewAnalytics: boolean;
    canManageUsers: boolean;
    canModerateContent: boolean;
    canAccessSystemLogs: boolean;
  };
  lastDataExport?: Date;
}

export interface User {
  uid: string;
  email: string;
  userType: UserType;
  profile: UserProfile;
  studentProfile?: StudentProfile;
  counselorProfile?: CounselorProfile;
  adminProfile?: AdminProfile;
  isEmailVerified: boolean;
  isActive: boolean;
}

export interface UserPermissions {
  canAccessCounselorQueue: boolean;
  canCreateJournalEntries: boolean;
  canClaimMessages: boolean;
  canViewAnalytics: boolean;
  canAccessMindfulness: boolean;
  canExportData: boolean;
  canAccessAdminDashboard: boolean;
  canExportAllPlatformData: boolean;
  canManageUsers: boolean;
}

export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  emailVerified: boolean;
}