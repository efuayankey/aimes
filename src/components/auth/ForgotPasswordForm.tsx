// Forgot password form component
import React, { useState } from 'react';
import { Mail, ArrowLeft, CheckCircle, KeyRound } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface ForgotPasswordFormProps {
  onBack?: () => void;
}

export const ForgotPasswordForm: React.FC<ForgotPasswordFormProps> = ({
  onBack
}) => {
  const { resetPassword, loading, error, clearError } = useAuth();
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [emailSent, setEmailSent] = useState(false);

  // Validate email
  const validateEmail = (): boolean => {
    if (!email.trim()) {
      setEmailError('Email is required');
      return false;
    }
    
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailError('Please enter a valid email address');
      return false;
    }

    setEmailError('');
    return true;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateEmail()) return;

    try {
      clearError();
      await resetPassword(email.trim());
      setEmailSent(true);
    } catch (error) {
      // Error is handled by the auth context
      console.error('Password reset error:', error);
    }
  };

  // Handle email input change
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (emailError) {
      setEmailError('');
    }
    clearError();
  };

  if (emailSent) {
    return (
      <div className="max-w-md mx-auto">
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={32} className="text-green-600" />
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Check Your Email
          </h2>

          <p className="text-gray-600 mb-6">
            We&apos;ve sent a password reset link to:
          </p>

          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <p className="font-medium text-gray-900">{email}</p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-blue-800 text-sm">
              📧 Click the link in your email to reset your password. 
              The link will expire in 1 hour for security.
            </p>
          </div>

          <div className="space-y-3">
            <button
              onClick={onBack}
              className="w-full flex items-center justify-center space-x-2 text-gray-600 hover:text-gray-800 py-3 px-4 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <ArrowLeft size={16} />
              <span>Back to Sign In</span>
            </button>

            <button
              onClick={() => {
                setEmailSent(false);
                setEmail('');
              }}
              className="w-full text-teal-600 hover:text-teal-700 text-sm underline"
            >
              Send to a different email
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto">
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <KeyRound size={32} className="text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Reset Password</h2>
          <p className="text-gray-600">
            Enter your email address and we&apos;ll send you a link to reset your password
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="email"
                value={email}
                onChange={handleEmailChange}
                placeholder="your.email@university.edu"
                className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent ${
                  emailError ? 'border-red-500' : 'border-gray-300'
                }`}
                disabled={loading}
              />
            </div>
            {emailError && (
              <p className="text-red-500 text-sm mt-1">{emailError}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading || !email.trim()}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105 shadow-lg"
          >
            {loading ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Sending Email...</span>
              </div>
            ) : (
              <div className="flex items-center justify-center space-x-2">
                <Mail size={20} />
                <span>Send Reset Link</span>
              </div>
            )}
          </button>
        </form>

        {onBack && (
          <div className="text-center mt-6 pt-6 border-t border-gray-200">
            <button
              onClick={onBack}
              className="flex items-center justify-center space-x-2 text-gray-600 hover:text-gray-800 mx-auto transition-colors"
              disabled={loading}
            >
              <ArrowLeft size={16} />
              <span>Back to Sign In</span>
            </button>
          </div>
        )}

        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            Remember your password? The sign in page is just one click back.
          </p>
        </div>
      </div>
    </div>
  );
};