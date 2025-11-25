// Secret admin login - only accessible via secret URL
import React, { useState, useEffect } from 'react';
import { Shield, Eye, EyeOff, Lock, AlertTriangle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { SecretAdminService } from '../../services/secretAdminService';

interface SecretAdminLoginProps {
  onAdminAuthenticated: () => void;
}

const SecretAdminLogin: React.FC<SecretAdminLoginProps> = ({ onAdminAuthenticated }) => {
  const { setUser } = useAuth();
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [error, setError] = useState('');
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    // Check if on secret URL
    const isSecretURL = SecretAdminService.isSecretAdminURL();
    
    if (!isSecretURL) {
      // Redirect to home if not on secret URL
      window.location.href = '/';
      return;
    }

    setIsAuthorized(true);
    
    // Initialize secret admin system
    SecretAdminService.initialize();
    
    // Log access for security monitoring
    SecretAdminService.logSecretAccess(navigator.userAgent);
  }, []);

  const handleAdminLogin = async () => {
    try {
      setIsAuthenticating(true);
      setError('');

      // Validate secret access
      const isValid = SecretAdminService.validateSecretAccess(password);
      
      if (!isValid) {
        setError('Invalid admin access credentials');
        return;
      }

      // Authenticate as secret admin
      const adminUser = await SecretAdminService.authenticateSecretAdmin();
      
      if (!adminUser) {
        setError('Failed to authenticate admin user');
        return;
      }

      // Set user in auth context (bypassing normal auth flow)
      if (setUser) {
        setUser(adminUser);
      }

      // Notify parent component
      onAdminAuthenticated();

    } catch (error: unknown) {
      console.error('Admin authentication failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setError('Authentication failed: ' + errorMessage);
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAdminLogin();
    }
  };

  // Security: Don't render if not authorized
  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-red-500 text-center">
          <AlertTriangle size={48} className="mx-auto mb-4" />
          <h1 className="text-xl font-bold">Access Denied</h1>
          <p className="text-sm">Unauthorized access attempt logged.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center p-6">
      <div className="bg-gray-800 rounded-xl shadow-2xl border border-gray-700 p-8 max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="bg-gradient-to-r from-red-600 to-orange-600 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <Shield size={32} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">
            System Administrator
          </h1>
          <p className="text-gray-400 text-sm">
            Restricted Access Portal
          </p>
        </div>

        {/* Security Notice */}
        <div className="bg-red-900/20 border border-red-700 rounded-lg p-4 mb-6">
          <div className="flex items-center space-x-2 text-red-400 text-sm">
            <Lock size={16} />
            <span className="font-medium">SECURE ACCESS REQUIRED</span>
          </div>
          <p className="text-red-300 text-xs mt-1">
            This portal is monitored. Unauthorized access attempts are logged.
          </p>
        </div>

        {/* Login Form */}
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Admin Access Key
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Enter admin access key..."
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                disabled={isAuthenticating}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-red-900/20 border border-red-700 rounded-lg p-3 text-red-300 text-sm">
              {error}
            </div>
          )}

          <button
            onClick={handleAdminLogin}
            disabled={!password.trim() || isAuthenticating}
            className="w-full bg-gradient-to-r from-red-600 to-orange-600 text-white py-3 px-4 rounded-lg font-medium hover:from-red-700 hover:to-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isAuthenticating ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
                <span>Authenticating...</span>
              </div>
            ) : (
              'Access Admin Panel'
            )}
          </button>
        </div>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-gray-700 text-center">
          <p className="text-gray-500 text-xs">
            AIMES Admin Portal v1.0 • Secure Access Only
          </p>
        </div>
      </div>
    </div>
  );
};

export default SecretAdminLogin;