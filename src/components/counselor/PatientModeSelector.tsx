import React, { useState } from 'react';
import { Users, Bot, Info, Play, BookOpen, X } from 'lucide-react';

export type PatientMode = 'real' | 'simulated';

interface PatientModeSelectorProps {
  currentMode: PatientMode;
  onModeChange: (mode: PatientMode) => void;
  onViewPatientQueue?: () => void;
  className?: string;
}

export const PatientModeSelector: React.FC<PatientModeSelectorProps> = ({
  currentMode,
  onModeChange,
  onViewPatientQueue,
  className = ''
}) => {
  const [showInfo, setShowInfo] = useState(false);
  const [showGuidelines, setShowGuidelines] = useState(false);

  return (
    <div className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-900">Counseling Mode</h2>
        <button
          onClick={() => setShowInfo(!showInfo)}
          className="text-gray-500 hover:text-gray-700 transition-colors"
          title="Learn more about patient modes"
        >
          <Info size={20} />
        </button>
      </div>

      {/* Info Panel */}
      {showInfo && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h3 className="font-medium text-blue-900 mb-2">Training Modes</h3>
          <div className="space-y-2 text-sm text-blue-800">
            <div className="flex items-start space-x-2">
              <Users className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <div>
                <strong>Real Patients:</strong> Respond to actual students seeking mental health support
              </div>
            </div>
            <div className="flex items-start space-x-2">
              <Bot className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <div>
                <strong>Simulated Patients:</strong> Practice with AI-powered training scenarios that provide instant feedback on your cultural competency
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mode Selection Cards */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Real Patients Mode */}
        <div
          className={`
            relative p-6 border-2 rounded-lg cursor-pointer transition-all duration-200
            ${currentMode === 'real'
              ? 'border-teal-500 bg-teal-50 shadow-md'
              : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
            }
          `}
          onClick={() => onModeChange('real')}
        >
          <div className="flex items-center justify-center w-12 h-12 bg-teal-600 rounded-lg mb-4">
            <Users className="w-6 h-6 text-white" />
          </div>
          
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Real Patients</h3>
          <p className="text-gray-600 text-sm mb-4">
            Respond to actual students who need mental health support. Help real people while gaining authentic experience.
          </p>

          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-sm">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-gray-700">Real impact on student wellbeing</span>
            </div>
            <div className="flex items-center space-x-2 text-sm">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-gray-700">Authentic cultural interactions</span>
            </div>
            <div className="flex items-center space-x-2 text-sm">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <span className="text-gray-700">Professional experience</span>
            </div>
          </div>

          {currentMode === 'real' && (
            <div className="absolute top-4 right-4">
              <div className="w-5 h-5 bg-teal-600 rounded-full flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full"></div>
              </div>
            </div>
          )}
        </div>

        {/* Simulated Patients Mode */}
        <div
          className={`
            relative p-6 border-2 rounded-lg cursor-pointer transition-all duration-200
            ${currentMode === 'simulated'
              ? 'border-blue-500 bg-blue-50 shadow-md'
              : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
            }
          `}
          onClick={() => onModeChange('simulated')}
        >
          <div className="flex items-center justify-center w-12 h-12 bg-blue-600 rounded-lg mb-4">
            <Bot className="w-6 h-6 text-white" />
          </div>
          
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Simulated Patients</h3>
          <p className="text-gray-600 text-sm mb-4">
            Practice with AI-powered training scenarios. Safe environment to develop cultural competency skills.
          </p>

          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-sm">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-gray-700">Instant cultural competency feedback</span>
            </div>
            <div className="flex items-center space-x-2 text-sm">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-gray-700">Safe practice environment</span>
            </div>
            <div className="flex items-center space-x-2 text-sm">
              <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
              <span className="text-gray-700">Diverse cultural scenarios</span>
            </div>
          </div>

          {/* NEW indicator for simulated mode */}
          <div className="absolute top-4 left-4">
            <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-orange-100 text-orange-800 rounded-full">
              Training
            </span>
          </div>

          {currentMode === 'simulated' && (
            <div className="absolute top-4 right-4">
              <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full"></div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-6 flex flex-col sm:flex-row gap-3">
        {currentMode === 'real' ? (
          <button 
            onClick={() => onViewPatientQueue?.()}
            className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700 transition-colors"
          >
            <Play className="w-4 h-4" />
            <span>View Patient Queue</span>
          </button>
        ) : (
          <button className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors">
            <Play className="w-4 h-4" />
            <span>Start Training Session</span>
          </button>
        )}

        <button 
          onClick={() => setShowGuidelines(true)}
          className="flex items-center justify-center space-x-2 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
        >
          <BookOpen className="w-4 h-4" />
          <span>View Guidelines</span>
        </button>
      </div>

      {/* Mode-specific Information */}
      {currentMode === 'simulated' && (
        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">Training Session Features</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Culturally diverse patient scenarios</li>
            <li>• Real-time cultural competency analysis</li>
            <li>• Detailed feedback on empathy and communication</li>
            <li>• Progress tracking and improvement suggestions</li>
          </ul>
        </div>
      )}

      {currentMode === 'real' && (
        <div className="mt-4 p-4 bg-teal-50 border border-teal-200 rounded-lg">
          <h4 className="font-medium text-teal-900 mb-2">Real Patient Guidelines</h4>
          <ul className="text-sm text-teal-800 space-y-1">
            <li>• Respond within 24 hours when possible</li>
            <li>• Maintain professional boundaries</li>
            <li>• Be culturally sensitive and inclusive</li>
            <li>• Escalate crisis situations immediately</li>
          </ul>
        </div>
      )}

      {/* Guidelines Modal */}
      {showGuidelines && (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 px-6 py-4 text-white relative">
              <button
                onClick={() => setShowGuidelines(false)}
                className="absolute top-4 right-4 text-white/80 hover:text-white"
              >
                <X size={24} />
              </button>
              
              <div className="flex items-center space-x-3">
                <div className="bg-white/20 backdrop-blur-sm rounded-full p-2">
                  <BookOpen size={24} />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Counseling Guidelines</h2>
                  <p className="text-white/90 mt-1">Best practices for culturally competent counseling</p>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 max-h-[70vh] overflow-y-auto">
              <div className="space-y-6">
                {/* Real Patients Guidelines */}
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                    <Users className="w-5 h-5 text-teal-600 mr-2" />
                    Real Patient Guidelines
                  </h3>
                  <div className="bg-teal-50 border border-teal-200 rounded-lg p-4">
                    <ul className="space-y-2 text-sm text-teal-800">
                      <li><strong>Response Time:</strong> Respond within 24 hours when possible</li>
                      <li><strong>Professional Boundaries:</strong> Maintain appropriate therapeutic relationships</li>
                      <li><strong>Cultural Sensitivity:</strong> Be aware of and respect cultural differences</li>
                      <li><strong>Crisis Situations:</strong> Escalate immediately if student expresses suicidal thoughts</li>
                      <li><strong>Confidentiality:</strong> Protect student privacy and personal information</li>
                      <li><strong>Documentation:</strong> Keep appropriate records for continuity of care</li>
                    </ul>
                  </div>
                </div>

                {/* Training Mode Guidelines */}
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                    <Bot className="w-5 h-5 text-blue-600 mr-2" />
                    Training Mode Guidelines
                  </h3>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <ul className="space-y-2 text-sm text-blue-800">
                      <li><strong>Practice Focus:</strong> Use training to improve cultural competency skills</li>
                      <li><strong>Patient Selection:</strong> Try diverse cultural backgrounds to broaden experience</li>
                      <li><strong>Session Ending:</strong> Practice natural session closures with &quot;time is up&quot; phrases</li>
                      <li><strong>Feedback Review:</strong> Study AI analysis to identify improvement areas</li>
                      <li><strong>Cultural Learning:</strong> Pay attention to cultural context provided</li>
                      <li><strong>Realistic Practice:</strong> Treat simulated patients as real for authentic practice</li>
                    </ul>
                  </div>
                </div>

                {/* Cultural Competency Guidelines */}
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Cultural Competency Best Practices</h3>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <h4 className="font-semibold text-yellow-900 mb-2">Do&apos;s</h4>
                      <ul className="space-y-1 text-sm text-yellow-800">
                        <li>• Ask about cultural background and its relevance</li>
                        <li>• Acknowledge different communication styles</li>
                        <li>• Respect family and community dynamics</li>
                        <li>• Be curious about cultural practices</li>
                        <li>• Validate experiences of discrimination</li>
                        <li>• Consider cultural strengths and resources</li>
                      </ul>
                    </div>

                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <h4 className="font-semibold text-red-900 mb-2">Don&apos;ts</h4>
                      <ul className="space-y-1 text-sm text-red-800">
                        <li>• Make assumptions based on appearance</li>
                        <li>• Use stereotypes or generalizations</li>
                        <li>• Ignore cultural factors in mental health</li>
                        <li>• Push individual-focused solutions only</li>
                        <li>• Dismiss family/community influence</li>
                        <li>• Use clinical jargon without explanation</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Cultural Backgrounds Quick Reference */}
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Cultural Backgrounds Quick Reference</h3>
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <div className="grid md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <h5 className="font-medium text-gray-900 mb-2">Collectivist Cultures</h5>
                        <p className="text-gray-700 mb-2">East Asian, South Asian, Latino/Hispanic, African, Middle Eastern</p>
                        <p className="text-gray-600">Consider family honor, group harmony, respect for elders, community support</p>
                      </div>
                      <div>
                        <h5 className="font-medium text-gray-900 mb-2">Individualist Cultures</h5>
                        <p className="text-gray-700 mb-2">White American, some Mixed backgrounds</p>
                        <p className="text-gray-600">Focus on personal autonomy, self-reliance, individual goals and achievements</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Resources */}
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Additional Resources</h3>
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <ul className="space-y-2 text-sm text-purple-800">
                      <li>• <strong>Crisis Hotline:</strong> National Suicide Prevention Lifeline - 988</li>
                      <li>• <strong>Emergency:</strong> If immediate danger, call 911</li>
                      <li>• <strong>Campus Resources:</strong> Refer to campus counseling center when appropriate</li>
                      <li>• <strong>Cultural Centers:</strong> Connect students with cultural support groups</li>
                      <li>• <strong>Professional Development:</strong> Continue cultural competency training</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-gray-50 px-6 py-4">
              <div className="flex justify-between items-center">
                <p className="text-sm text-gray-600">💡 These guidelines help ensure effective, culturally-sensitive support</p>
                <button
                  onClick={() => setShowGuidelines(false)}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Got it
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};