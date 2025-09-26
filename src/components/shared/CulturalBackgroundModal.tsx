// Cultural background selection modal for personalized AI responses
import React, { useState, useEffect } from 'react';
import { X, Sparkles, Globe } from 'lucide-react';
import { CulturalBackground } from '../../types';
import { useAuth } from '../../contexts/AuthContext';

interface CulturalBackgroundModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (background: CulturalBackground) => void;
  isChanging?: boolean; // true if user is changing their existing selection
}

export const CulturalBackgroundModal: React.FC<CulturalBackgroundModalProps> = ({
  isOpen,
  onClose,
  onComplete,
  isChanging = false
}) => {
  const { user, updateProfile } = useAuth();
  const [selectedBackground, setSelectedBackground] = useState<CulturalBackground | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize with current user's cultural background if changing
  useEffect(() => {
    if (isChanging && user?.studentProfile?.culturalBackground) {
      setSelectedBackground(user.studentProfile.culturalBackground);
    }
  }, [isChanging, user]);

  const culturalOptions = [
    {
      value: 'african-american' as CulturalBackground,
      label: 'African American',
      description: 'Understanding of systemic challenges, community strength, and cultural pride'
    },
    {
      value: 'african' as CulturalBackground,
      label: 'African (International)',
      description: 'Support for adjustment challenges, cultural values, and maintaining identity'
    },
    {
      value: 'asian-american' as CulturalBackground,
      label: 'Asian American',
      description: 'Navigate model minority pressures, family expectations, and cultural balance'
    },
    {
      value: 'east-asian' as CulturalBackground,
      label: 'East Asian (International)',
      description: 'Academic pressures, collectivist values, and cultural communication styles'
    },
    {
      value: 'south-asian' as CulturalBackground,
      label: 'South Asian (International)',
      description: 'Family obligations, career expectations, and cultural identity navigation'
    },
    {
      value: 'latino-hispanic' as CulturalBackground,
      label: 'Latino/Hispanic',
      description: 'Family-centered values, first-gen challenges, and cultural code-switching'
    },
    {
      value: 'white-american' as CulturalBackground,
      label: 'White American',
      description: 'Individual-focused support while recognizing diverse socioeconomic experiences'
    },
    {
      value: 'middle-eastern' as CulturalBackground,
      label: 'Middle Eastern',
      description: 'Cultural misconceptions, religious practices, and identity navigation'
    },
    {
      value: 'native-american' as CulturalBackground,
      label: 'Native American',
      description: 'Historical trauma awareness, tribal connections, and cultural values'
    },
    {
      value: 'multiracial' as CulturalBackground,
      label: 'Multiracial/Mixed',
      description: 'Complex identity navigation and unique multicultural perspectives'
    },
    {
      value: 'prefer-not-to-say' as CulturalBackground,
      label: 'Prefer not to say',
      description: 'General culturally-sensitive support without assumptions'
    },
    {
      value: 'other' as CulturalBackground,
      label: 'Other',
      description: 'Individualized cultural understanding and respectful curiosity'
    }
  ];

  const handleSubmit = async () => {
    if (!selectedBackground) return;

    setIsSubmitting(true);
    try {
      if (user && user.userType === 'student') {
        // Update user profile with cultural background
        await updateProfile({
          studentProfile: {
            ...user.studentProfile,
            culturalBackground: selectedBackground
          }
        });
      }

      onComplete(selectedBackground);
      onClose();
    } catch (error) {
      console.error('Failed to update cultural background:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkip = () => {
    const defaultBackground: CulturalBackground = 'prefer-not-to-say';
    setSelectedBackground(defaultBackground);
    onComplete(defaultBackground);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-600 to-blue-600 px-6 py-4 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white"
            disabled={isSubmitting}
          >
            <X size={24} />
          </button>
          
          <div className="flex items-center space-x-3">
            <div className="bg-white/20 backdrop-blur-sm rounded-full p-2">
              <Globe size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-bold">
                {isChanging ? 'Update Your Cultural Background' : 'Welcome to AIMES! 🌟'}
              </h2>
              <p className="text-white/90 mt-1">
                {isChanging 
                  ? 'Update your cultural background to receive more personalized support.'
                  : 'Help us provide culturally-sensitive mental health support tailored to your background.'
                }
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {!isChanging && (
            <div className="bg-teal-50 border border-teal-200 rounded-lg p-4 mb-6">
              <div className="flex items-start space-x-3">
                <Sparkles size={20} className="text-teal-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-teal-900 mb-1">Why we ask this</h3>
                  <p className="text-teal-800 text-sm">
                    Our AI companion adapts its responses based on cultural context, helping provide more 
                    relevant and sensitive mental health support. This information is private and secure.
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-4">
            {culturalOptions.map((option) => (
              <div
                key={option.value}
                className={`
                  border-2 rounded-lg p-4 cursor-pointer transition-all duration-200 hover:shadow-md
                  ${selectedBackground === option.value
                    ? 'border-teal-500 bg-teal-50 shadow-md'
                    : 'border-gray-200 hover:border-gray-300'
                  }
                  ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}
                `}
                onClick={() => !isSubmitting && setSelectedBackground(option.value)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-2">{option.label}</h3>
                    <p className="text-sm text-gray-600 leading-relaxed">{option.description}</p>
                  </div>
                  {selectedBackground === option.value && (
                    <div className="ml-3 flex-shrink-0">
                      <div className="w-5 h-5 bg-teal-600 rounded-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 flex flex-col sm:flex-row gap-3 sm:justify-between sm:items-center">
          <div className="text-sm text-gray-600">
            <p>🔒 This information is private and helps personalize your experience</p>
          </div>
          
          <div className="flex gap-3">
            {!isChanging && (
              <button
                onClick={handleSkip}
                disabled={isSubmitting}
                className="px-6 py-2 text-gray-600 hover:text-gray-800 font-medium disabled:opacity-50"
              >
                Skip for now
              </button>
            )}
            
            <button
              onClick={handleSubmit}
              disabled={!selectedBackground || isSubmitting}
              className="px-6 py-2 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>{isChanging ? 'Updating...' : 'Saving...'}</span>
                </div>
              ) : (
                <span>{isChanging ? 'Update Background' : 'Continue to AIMES'}</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};