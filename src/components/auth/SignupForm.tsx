// Multi-step signup form with user type selection
import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, User, ArrowRight, ArrowLeft, CheckCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { UserType, UserProfile } from '../../types';
import { UserTypeSelector } from './UserTypeSelector';

interface SignupFormProps {
  onSuccess?: () => void;
  onSwitchToLogin?: () => void;
}

interface FormData {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  userType: UserType | null;
  agreeToTerms: boolean;
}

type Step = 'account' | 'profile' | 'userType' | 'confirmation';

export const SignupForm: React.FC<SignupFormProps> = ({
  onSuccess,
  onSwitchToLogin
}) => {
  const { signUp, loading, error, clearError } = useAuth();
  const [currentStep, setCurrentStep] = useState<Step>('account');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    userType: null,
    agreeToTerms: false
  });

  const [registrationResult, setRegistrationResult] = useState<{
    success: boolean;
    needsEmailVerification: boolean;
  } | null>(null);

  // Update form data
  const updateFormData = (field: keyof FormData, value: string | UserType | boolean | null) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear field-specific errors
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Validate current step
  const validateStep = (step: Step): boolean => {
    const errors: Record<string, string> = {};

    if (step === 'account') {
      if (!formData.email.trim()) {
        errors.email = 'Email is required';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        errors.email = 'Please enter a valid email address';
      }

      if (!formData.password) {
        errors.password = 'Password is required';
      } else if (formData.password.length < 6) {
        errors.password = 'Password must be at least 6 characters';
      }

      if (formData.password !== formData.confirmPassword) {
        errors.confirmPassword = 'Passwords do not match';
      }
    }

    if (step === 'profile') {
      if (!formData.firstName.trim()) {
        errors.firstName = 'First name is required';
      }
      if (!formData.lastName.trim()) {
        errors.lastName = 'Last name is required';
      }
    }

    if (step === 'userType') {
      if (!formData.userType) {
        errors.userType = 'Please select your role';
      }
      if (!formData.agreeToTerms) {
        errors.agreeToTerms = 'You must agree to the terms of service';
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Navigate between steps
  const goToNextStep = () => {
    if (validateStep(currentStep)) {
      const steps: Step[] = ['account', 'profile', 'userType', 'confirmation'];
      const currentIndex = steps.indexOf(currentStep);
      if (currentIndex < steps.length - 1) {
        setCurrentStep(steps[currentIndex + 1]);
      }
    }
  };

  const goToPreviousStep = () => {
    const steps: Step[] = ['account', 'profile', 'userType', 'confirmation'];
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1]);
    }
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!validateStep('userType') || !formData.userType) return;

    try {
      clearError();
      const profileData: Partial<UserProfile> = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim()
      };

      const result = await signUp(
        formData.email.trim(),
        formData.password,
        formData.userType,
        profileData
      );

      setRegistrationResult({
        success: true,
        needsEmailVerification: result.needsEmailVerification
      });
      setCurrentStep('confirmation');

    } catch (error: unknown) {
      console.error('Signup error:', error);
      // Error is handled by the auth context
    }
  };

  // Step progress indicator
  const StepProgress = () => {
    const steps = [
      { id: 'account', label: 'Account', completed: ['profile', 'userType', 'confirmation'].includes(currentStep) },
      { id: 'profile', label: 'Profile', completed: ['userType', 'confirmation'].includes(currentStep) },
      { id: 'userType', label: 'Role', completed: ['confirmation'].includes(currentStep) },
      { id: 'confirmation', label: 'Complete', completed: false }
    ];

    return (
      <div className="flex items-center justify-center space-x-4 mb-8">
        {steps.map((step, index) => (
          <React.Fragment key={step.id}>
            <div className={`
              flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium
              ${step.id === currentStep
                ? 'bg-teal-600 text-white'
                : step.completed
                ? 'bg-teal-600 text-white'
                : 'bg-gray-200 text-gray-600'
              }
            `}>
              {step.completed ? <CheckCircle size={16} /> : index + 1}
            </div>
            {index < steps.length - 1 && (
              <div className={`w-8 h-0.5 ${step.completed ? 'bg-teal-600' : 'bg-gray-200'}`} />
            )}
          </React.Fragment>
        ))}
      </div>
    );
  };

  // Render current step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 'account':
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Create Your Account</h2>
              <p className="text-gray-600">Enter your email and create a secure password</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => updateFormData('email', e.target.value)}
                  placeholder="your.email@university.edu"
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-black ${
                    formErrors.email ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
              </div>
              {formErrors.email && (
                <p className="text-red-500 text-sm mt-1">{formErrors.email}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => updateFormData('password', e.target.value)}
                  placeholder="Create a strong password"
                  className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-black ${
                    formErrors.password ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {formErrors.password && (
                <p className="text-red-500 text-sm mt-1">{formErrors.password}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={formData.confirmPassword}
                  onChange={(e) => updateFormData('confirmPassword', e.target.value)}
                  placeholder="Confirm your password"
                  className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-black ${
                    formErrors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {formErrors.confirmPassword && (
                <p className="text-red-500 text-sm mt-1">{formErrors.confirmPassword}</p>
              )}
            </div>
          </div>
        );

      case 'profile':
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Tell Us About Yourself</h2>
              <p className="text-gray-600">We&apos;ll use this information to personalize your experience</p>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  First Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => updateFormData('firstName', e.target.value)}
                    placeholder="First name"
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-black ${
                      formErrors.firstName ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                </div>
                {formErrors.firstName && (
                  <p className="text-red-500 text-sm mt-1">{formErrors.firstName}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Last Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => updateFormData('lastName', e.target.value)}
                    placeholder="Last name"
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-black ${
                      formErrors.lastName ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                </div>
                {formErrors.lastName && (
                  <p className="text-red-500 text-sm mt-1">{formErrors.lastName}</p>
                )}
              </div>
            </div>
          </div>
        );

      case 'userType':
        return (
          <div className="space-y-6">
            <UserTypeSelector
              selectedType={formData.userType}
              onTypeSelect={(type) => updateFormData('userType', type)}
              disabled={loading}
            />
            
            {formErrors.userType && (
              <p className="text-red-500 text-sm text-center">{formErrors.userType}</p>
            )}

            <div className="flex items-center justify-center">
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.agreeToTerms}
                  onChange={(e) => updateFormData('agreeToTerms', e.target.checked)}
                  className="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
                />
                <span className="text-sm text-gray-600">
                  I agree to the{' '}
                  <a href="/terms" className="text-teal-600 hover:text-teal-700 underline">
                    Terms of Service
                  </a>{' '}
                  and{' '}
                  <a href="/privacy" className="text-teal-600 hover:text-teal-700 underline">
                    Privacy Policy
                  </a>
                </span>
              </label>
            </div>
            
            {formErrors.agreeToTerms && (
              <p className="text-red-500 text-sm text-center">{formErrors.agreeToTerms}</p>
            )}
          </div>
        );

      case 'confirmation':
        return (
          <div className="text-center space-y-6">
            {registrationResult?.success ? (
              <>
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle size={32} className="text-green-600" />
                </div>
                
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Welcome to CALLM-CARE!
                </h2>
                
                {registrationResult.needsEmailVerification ? (
                  <div className="space-y-4">
                    <p className="text-gray-600">
                      We&apos;ve sent a verification email to <strong>{formData.email}</strong>
                    </p>
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <p className="text-yellow-800 text-sm">
                        Please check your email and click the verification link to activate your account.
                        You won&apos;t be able to access CALLM-CARE until you verify your email.
                      </p>
                    </div>
                    <button
                      onClick={() => window.location.reload()}
                      className="bg-teal-600 text-white px-6 py-3 rounded-lg hover:bg-teal-700 transition-colors"
                    >
                      I&apos;ve Verified My Email
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <p className="text-gray-600">
                      Your account has been created successfully!
                    </p>
                    <button
                      onClick={onSuccess}
                      className="bg-teal-600 text-white px-8 py-3 rounded-lg hover:bg-teal-700 transition-colors"
                    >
                      Continue to CALLM-CARE
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="space-y-4">
                <p className="text-red-600">Registration failed. Please try again.</p>
                <button
                  onClick={() => setCurrentStep('account')}
                  className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Try Again
                </button>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <StepProgress />

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-lg p-8">
        {renderStepContent()}

        {currentStep !== 'confirmation' && (
          <div className="flex justify-between mt-8">
            <button
              onClick={goToPreviousStep}
              disabled={currentStep === 'account'}
              className={`
                flex items-center space-x-2 px-6 py-3 rounded-lg transition-colors
                ${currentStep === 'account'
                  ? 'text-gray-400 cursor-not-allowed'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                }
              `}
            >
              <ArrowLeft size={16} />
              <span>Previous</span>
            </button>

            {currentStep === 'userType' ? (
              <button
                onClick={handleSubmit}
                disabled={loading || !formData.userType || !formData.agreeToTerms}
                className="flex items-center space-x-2 bg-teal-600 text-white px-8 py-3 rounded-lg hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Creating Account...</span>
                  </>
                ) : (
                  <>
                    <span>Create Account</span>
                    <CheckCircle size={16} />
                  </>
                )}
              </button>
            ) : (
              <button
                onClick={goToNextStep}
                className="flex items-center space-x-2 bg-teal-600 text-white px-6 py-3 rounded-lg hover:bg-teal-700 transition-colors"
              >
                <span>Next</span>
                <ArrowRight size={16} />
              </button>
            )}
          </div>
        )}

        {currentStep === 'account' && onSwitchToLogin && (
          <div className="text-center mt-6 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <button
                onClick={onSwitchToLogin}
                className="text-teal-600 hover:text-teal-700 font-medium underline"
              >
                Sign in here
              </button>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};