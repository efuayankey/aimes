// Main types export file
export * from './User';
export * from './Message';
export * from './Journal';
export * from './Chat';

// Common utility types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: Date;
}

export interface PaginatedResponse<T = unknown> {
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
  component: React.ComponentType<unknown>;
  requiresAuth: boolean;
  allowedUserTypes?: ('student' | 'counselor')[];
  title: string;
}