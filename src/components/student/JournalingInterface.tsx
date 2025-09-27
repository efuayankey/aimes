// Student journaling interface placeholder
import React from 'react';
import { BookOpen, Heart, Calendar, TrendingUp } from 'lucide-react';

const JournalingInterface: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-xl shadow-lg p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <BookOpen size={32} className="text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Personal Journal
          </h2>
          <p className="text-gray-600 text-lg">
            Private journaling interface coming soon
          </p>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
          <h4 className="font-semibold text-blue-900 mb-2">Journaling Interface Coming Soon!</h4>
          <p className="text-blue-800 text-sm">
            Mood tracking, private entries, and optional context sharing with counselors.
          </p>
        </div>
      </div>
    </div>
  );
};

export default JournalingInterface;