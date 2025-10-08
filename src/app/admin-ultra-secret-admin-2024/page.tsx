'use client';

import React, { useState, useEffect } from 'react';
import { AuthProvider } from '../../contexts/AuthContext';
import { SecretAdminService } from '../../services/secretAdminService';
import SecretAdminLogin from '../../components/admin/SecretAdminLogin';
import AdminDashboard from '../../components/admin/AdminDashboard';

const AdminPage: React.FC = () => {
  const [adminAuthenticated, setAdminAuthenticated] = useState(false);
  const [isValidAccess, setIsValidAccess] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // This route should only be accessible if the environment variables are set
    const secretToken = process.env.NEXT_PUBLIC_SECRET_URL_TOKEN;
    
    console.log('Admin access check:', { secretToken, currentPath: window.location.pathname });
    
    if (secretToken === 'ultra-secret-admin-2024') {
      setIsValidAccess(true);
      // Initialize admin system
      SecretAdminService.initialize().catch(console.error);
      SecretAdminService.logSecretAccess(navigator.userAgent);
    } else {
      console.warn('Admin access denied - invalid configuration');
      // Redirect to home after a short delay
      setTimeout(() => {
        window.location.href = '/';
      }, 2000);
    }
    
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500 mx-auto mb-4"></div>
          <p>Verifying access...</p>
        </div>
      </div>
    );
  }

  if (!isValidAccess) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-red-500 text-center">
          <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
          <p className="text-sm">Invalid access configuration. Redirecting...</p>
        </div>
      </div>
    );
  }

  return (
    <AuthProvider>
      <React.Suspense fallback={
        <div className="min-h-screen bg-black flex items-center justify-center">
          <div className="text-white text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500 mx-auto mb-4"></div>
            <p>Loading secure admin portal...</p>
          </div>
        </div>
      }>
        {!adminAuthenticated ? (
          <SecretAdminLogin onAdminAuthenticated={() => setAdminAuthenticated(true)} />
        ) : (
          <AdminDashboard />
        )}
      </React.Suspense>
    </AuthProvider>
  );
};

export default AdminPage;