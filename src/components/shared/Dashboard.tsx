// Main dashboard that routes students and counselors to appropriate interfaces
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { CulturalBackgroundModal } from './CulturalBackgroundModal';
import { CulturalBackground } from '../../types';

// Dashboard components
const StudentDashboard = React.lazy(() => import('../student/StudentDashboard'));
const CounselorDashboard = React.lazy(() => import('../counselor/CounselorDashboard'));
const AdminDashboard = React.lazy(() => import('../admin/AdminDashboard'));

export const Dashboard: React.FC = () => {
  const { user, isStudent, isCounselor, isAdmin } = useAuth();
  const [showCulturalModal, setShowCulturalModal] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    // Check if student needs to set cultural background
    if (user && isStudent()) {
      const hasSetCulturalBackground = user.studentProfile?.culturalBackground;
      
      if (!hasSetCulturalBackground) {
        setShowCulturalModal(true);
      }
    }
    
    setIsInitializing(false);
  }, [user, isStudent]);

  const handleCulturalBackgroundComplete = (background: CulturalBackground) => {
    setShowCulturalModal(false);
    // The modal handles updating the user profile
  };

  // Loading state
  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading your CALLM-CARE dashboard...</p>
        </div>
      </div>
    );
  }

  // Error state - shouldn't happen with proper auth routing
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="text-center bg-white rounded-lg shadow-lg p-8 max-w-md">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Error</h2>
          <p className="text-gray-600 mb-6">
            You need to be signed in to access the dashboard.
          </p>
          <button
            onClick={() => window.location.href = '/'}
            className="bg-teal-600 text-white px-6 py-2 rounded-lg hover:bg-teal-700"
          >
            Go to Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <React.Suspense
        fallback={
          <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-teal-600 mx-auto mb-4"></div>
              <p className="text-gray-600 text-lg">
                Loading your {isStudent() ? 'student' : isCounselor() ? 'counselor' : 'admin'} dashboard...
              </p>
            </div>
          </div>
        }
      >
        {isStudent() && <StudentDashboard />}
        {isCounselor() && <CounselorDashboard />}
        {isAdmin() && <AdminDashboard />}
      </React.Suspense>

      <CulturalBackgroundModal
        isOpen={showCulturalModal}
        onClose={() => setShowCulturalModal(false)}
        onComplete={handleCulturalBackgroundComplete}
        isChanging={false}
      />
    </>
  );
};