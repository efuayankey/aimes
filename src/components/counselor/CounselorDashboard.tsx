// Counselor dashboard placeholder
import React from 'react';
import { Users, MessageSquare, BarChart, Settings } from 'lucide-react';

const CounselorDashboard: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users size={32} className="text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Counselor Dashboard
            </h1>
            <p className="text-gray-600 text-lg">
              Professional interface for certified mental health counselors
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-6 text-center">
              <MessageSquare className="text-blue-600 mx-auto mb-3" size={32} />
              <h3 className="font-semibold text-blue-900 mb-2">Message Queue</h3>
              <p className="text-blue-800 text-sm mb-4">
                View and respond to student support requests with oldest-first priority
              </p>
              <div className="bg-blue-100 rounded-lg p-3">
                <p className="text-blue-900 font-medium">Coming Soon</p>
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-teal-50 border border-green-200 rounded-xl p-6 text-center">
              <BarChart className="text-green-600 mx-auto mb-3" size={32} />
              <h3 className="font-semibold text-green-900 mb-2">AI Feedback</h3>
              <p className="text-green-800 text-sm mb-4">
                Get AI analysis of your responses for empathy, cultural sensitivity, and effectiveness
              </p>
              <div className="bg-green-100 rounded-lg p-3">
                <p className="text-green-900 font-medium">Coming Soon</p>
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 rounded-xl p-6 text-center">
              <Settings className="text-purple-600 mx-auto mb-3" size={32} />
              <h3 className="font-semibold text-purple-900 mb-2">Profile & Analytics</h3>
              <p className="text-purple-800 text-sm mb-4">
                Manage your counselor profile, specializations, and view response analytics
              </p>
              <div className="bg-purple-100 rounded-lg p-3">
                <p className="text-purple-900 font-medium">Coming Soon</p>
              </div>
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 mt-8">
            <h4 className="font-semibold text-amber-900 mb-2">Counselor Interface In Development</h4>
            <p className="text-amber-800 text-sm">
              The full counselor interface with message queue, claiming system, and AI feedback 
              is currently being developed. This will include all the professional tools needed 
              to provide effective, culturally-sensitive mental health support.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CounselorDashboard;