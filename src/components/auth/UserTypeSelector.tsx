// User type selection component for registration
import React from 'react';
import { GraduationCap, Heart, CheckCircle } from 'lucide-react';
import { UserType } from '../../types';

interface UserTypeSelectorProps {
  selectedType: UserType | null;
  onTypeSelect: (type: UserType) => void;
  disabled?: boolean;
}

export const UserTypeSelector: React.FC<UserTypeSelectorProps> = ({
  selectedType,
  onTypeSelect,
  disabled = false
}) => {
  const userTypes = [
    {
      type: 'student' as UserType,
      title: 'Student',
      description: 'Get AI-powered mental health support and connect with certified counselors',
      icon: <GraduationCap size={32} />,
      features: [
        'Chat with culturally-aware AI companion',
        'Connect with human counselors when needed',
        'Private journaling with mood tracking',
        'Access mindfulness resources',
        'Anonymous and confidential support'
      ],
      gradient: 'from-blue-600 to-teal-600'
    },
    {
      type: 'counselor' as UserType,
      title: 'Counselor',
      description: 'Provide professional mental health support to students with AI-powered feedback',
      icon: <Heart size={32} />,
      features: [
        'Respond to student support requests',
        'Receive AI feedback on your responses',
        'View cultural context for each student',
        'Track your response quality metrics',
        'Access professional development tools'
      ],
      gradient: 'from-purple-600 to-pink-600'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Choose Your Role
        </h2>
        <p className="text-gray-600">
          Select how you'd like to use AIMES to get personalized features
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {userTypes.map((userType) => (
          <div
            key={userType.type}
            className={`
              relative overflow-hidden rounded-2xl border-2 cursor-pointer transition-all duration-300
              ${selectedType === userType.type
                ? 'border-teal-500 shadow-lg scale-105 bg-white'
                : 'border-gray-200 hover:border-gray-300 hover:shadow-md bg-white'
              }
              ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
            `}
            onClick={() => !disabled && onTypeSelect(userType.type)}
          >
            {/* Selection indicator */}
            {selectedType === userType.type && (
              <div className="absolute top-4 right-4 z-10">
                <CheckCircle className="text-teal-600" size={24} />
              </div>
            )}

            {/* Gradient header */}
            <div className={`bg-gradient-to-r ${userType.gradient} p-6 text-white relative`}>
              <div className="flex items-center space-x-4">
                <div className="bg-white/20 backdrop-blur-sm rounded-full p-3">
                  {userType.icon}
                </div>
                <div>
                  <h3 className="text-xl font-bold">{userType.title}</h3>
                  <p className="text-white/90 text-sm mt-1">
                    {userType.description}
                  </p>
                </div>
              </div>
            </div>

            {/* Features list */}
            <div className="p-6">
              <h4 className="font-semibold text-gray-900 mb-3">What you can do:</h4>
              <ul className="space-y-2">
                {userType.features.map((feature, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <CheckCircle size={16} className="text-teal-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-600">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Selection overlay */}
            {selectedType === userType.type && (
              <div className="absolute inset-0 bg-teal-600/5 pointer-events-none" />
            )}
          </div>
        ))}
      </div>

      {selectedType && (
        <div className="text-center mt-6 p-4 bg-teal-50 rounded-lg">
          <p className="text-teal-800 font-medium">
            Great choice! You've selected the {selectedType} role.
          </p>
          <p className="text-teal-600 text-sm mt-1">
            {selectedType === 'counselor' 
              ? 'You will need to complete credential verification before accessing counselor features.'
              : 'You can start chatting and journaling right after registration!'
            }
          </p>
        </div>
      )}
    </div>
  );
};