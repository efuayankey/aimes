// Mindfulness library placeholder
import React from 'react';
import { Brain, Play, Globe, Heart } from 'lucide-react';

const MindfulnessLibrary: React.FC = () => {
  return (
    <div className="max-w-6xl mx-auto">
      <div className="bg-white rounded-xl shadow-lg p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-green-600 to-teal-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Brain size={32} className="text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Mindfulness Library
          </h2>
          <p className="text-gray-600 text-lg">
            Cultural mindfulness practices and meditation resources
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-br from-green-50 to-teal-50 border border-green-200 rounded-xl p-6 text-center">
            <Play className="text-green-600 mx-auto mb-3" size={32} />
            <h3 className="font-semibold text-green-900 mb-2">Guided Meditations</h3>
            <p className="text-green-800 text-sm">
              Culturally-adapted meditation practices and breathing exercises
            </p>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-6 text-center">
            <Globe className="text-blue-600 mx-auto mb-3" size={32} />
            <h3 className="font-semibold text-blue-900 mb-2">Cultural Practices</h3>
            <p className="text-blue-800 text-sm">
              Traditional wellness practices from diverse cultural backgrounds
            </p>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 rounded-xl p-6 text-center">
            <Heart className="text-purple-600 mx-auto mb-3" size={32} />
            <h3 className="font-semibold text-purple-900 mb-2">Wellness Videos</h3>
            <p className="text-purple-800 text-sm">
              Video content organized by language and cultural context
            </p>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
          <h4 className="font-semibold text-blue-900 mb-2">Mindfulness Library Coming Soon!</h4>
          <p className="text-blue-800 text-sm">
            The complete mindfulness library with cultural adaptation will be integrated 
            from your existing system.
          </p>
        </div>
      </div>
    </div>
  );
};

export default MindfulnessLibrary;