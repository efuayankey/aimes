// Main authentication container that manages login/signup/forgot password flows
import React, { useState } from 'react';
import { Sparkles } from 'lucide-react';
import { LoginForm } from './LoginForm';
import { SignupForm } from './SignupForm';
import { ForgotPasswordForm } from './ForgotPasswordForm';

interface AuthContainerProps {
  onAuthSuccess?: () => void;
}

type AuthView = 'login' | 'signup' | 'forgot-password';

export const AuthContainer: React.FC<AuthContainerProps> = ({ onAuthSuccess }) => {
  const [currentView, setCurrentView] = useState<AuthView>('login');

  const handleAuthSuccess = () => {
    onAuthSuccess?.();
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'login':
        return (
          <LoginForm
            onSuccess={handleAuthSuccess}
            onSwitchToSignup={() => setCurrentView('signup')}
            onForgotPassword={() => setCurrentView('forgot-password')}
          />
        );
      
      case 'signup':
        return (
          <SignupForm
            onSuccess={handleAuthSuccess}
            onSwitchToLogin={() => setCurrentView('login')}
          />
        );
      
      case 'forgot-password':
        return (
          <ForgotPasswordForm
            onBack={() => setCurrentView('login')}
            onSuccess={handleAuthSuccess}
          />
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1920&q=80')`,
          filter: 'brightness(0.8)'
        }}
      />
      
      {/* Gradient Overlay for better text readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-teal-900/50 via-blue-900/50 to-indigo-900/60" />
      
      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        <div className="text-center py-8 px-4">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white/25 backdrop-blur-md rounded-full mb-4 shadow-lg border border-white/40">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-2 drop-shadow-xl">
            AIMES
          </h1>
          <p className="text-lg md:text-xl text-white/90 drop-shadow-lg max-w-2xl mx-auto">
            A culturally adaptive companion for your mental wellness journey
          </p>
        </div>

        {/* Auth Forms */}
        <div className="flex-1 flex items-center justify-center px-4 py-8">
          {renderCurrentView()}
        </div>

        {/* Footer */}
        <div className="text-center py-6 px-4">
          <div className="flex items-center justify-center space-x-4 text-white/80 text-sm font-medium">
            <span>🔒 Secure</span>
            <span>•</span>
            <span>🤐 Anonymous</span>
            <span>•</span>
            <span>🛡️ Confidential</span>
          </div>
          <p className="text-white/60 text-xs mt-2">
            Your mental health journey, supported by AI and human counselors
          </p>
        </div>
      </div>

      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-teal-500/10 to-transparent rounded-full animate-pulse"></div>
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-blue-500/10 to-transparent rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>
    </div>
  );
};