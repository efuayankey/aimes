// Main types export file
export * from './User';
export * from './Message';
export * from './Journal';
export * from './Chat';

// Common utility types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: Date;
}

export interface PaginatedResponse<T = any> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export interface LoadingState {
  isLoading: boolean;
  error: string | null;
  lastUpdated?: Date;
}

// Firebase related types
export interface FirebaseError {
  code: string;
  message: string;
}

// Component prop types
export interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
}

// Route types
export interface RouteConfig {
  path: string;
  component: React.ComponentType<any>;
  requiresAuth: boolean;
  allowedUserTypes?: ('student' | 'counselor')[];
  title: string;
}