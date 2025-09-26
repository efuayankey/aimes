// Main AIMES application component
import React from 'react';
import { AuthProvider, useAuth } from '../contexts/AuthContext';
import { AuthContainer } from '../components/auth';
import { Dashboard } from '../components/shared/Dashboard';

const AppContent: React.FC = () => {
  const { user, loading } = useAuth();

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading AIMES...</p>
        </div>
      </div>
    );
  }

  // Show auth container if not logged in
  if (!user) {
    return <AuthContainer />;
  }

  // Show dashboard if logged in
  return <Dashboard />;
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;