export type UserType = 'student' | 'counselor';

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

export interface UserProfile {
  firstName: string;
  lastName: string;
  createdAt: Date;
  lastActive: Date;
}

export interface StudentProfile {
  culturalBackground?: CulturalBackground;
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

export interface User {
  uid: string;
  email: string;
  userType: UserType;
  profile: UserProfile;
  studentProfile?: StudentProfile;
  counselorProfile?: CounselorProfile;
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
}

export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  emailVerified: boolean;
}