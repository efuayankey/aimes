// Counselor feedback interface with AI analysis
import React, { useState, useEffect } from 'react';
import { 
  Star, 
  Brain, 
  Target, 
  Heart, 
  Globe, 
  MessageSquare,
  CheckCircle,
  Lightbulb,
  BarChart3,
  Clock,
  Award,
  RefreshCw
} from 'lucide-react';
import { FeedbackService, AIFeedbackAnalysis, CounselorFeedbackSubmission } from '../../services/feedbackService';
import { ConversationMessage, ResponseFeedback } from '../../types';

interface FeedbackInterfaceProps {
  responseContent: string;
  studentMessage: string;
  conversationHistory?: ConversationMessage[];
  counselorId: string;
  culturalContext: string;
  onFeedbackComplete?: (feedback: ResponseFeedback) => void;
}

const FeedbackInterface: React.FC<FeedbackInterfaceProps> = ({
  responseContent,
  studentMessage,
  conversationHistory,
  counselorId,
  culturalContext,
  onFeedbackComplete
}) => {
  const [aiAnalysis, setAiAnalysis] = useState<AIFeedbackAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showSelfAssessment, setShowSelfAssessment] = useState(false);
  const [selfRating, setSelfRating] = useState(8);
  const [selfReflection, setSelfReflection] = useState('');
  const [areas, setAreas] = useState({
    empathy: 8,
    culturalSensitivity: 8,
    questioning: 7,
    goalOrientation: 7,
    professionalism: 9
  });
  const [improvementGoals, setImprovementGoals] = useState<string[]>([]);
  const [timeSpent, setTimeSpent] = useState(15);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    generateAIFeedback();
  }, [responseContent, studentMessage]);

  const generateAIFeedback = async () => {
    try {
      setIsAnalyzing(true);
      const analysis = await FeedbackService.generateAIFeedback({
        responseContent,
        studentMessage,
        conversationHistory,
        counselorId,
        culturalContext
      });
      setAiAnalysis(analysis);
    } catch (error) {
      console.error('Failed to generate AI feedback:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSubmitFeedback = async () => {
    if (!aiAnalysis) return;

    try {
      setIsSubmitting(true);
      
      const submission: CounselorFeedbackSubmission = {
        responseId: Date.now().toString(), // Use actual response ID in production
        selfRating,
        selfReflection,
        areas,
        improvementGoals,
        timeSpent
      };

      const feedback = await FeedbackService.submitCounselorFeedback(submission, aiAnalysis);
      
      if (onFeedbackComplete) {
        onFeedbackComplete(feedback);
      }
      
      // Show success message or close modal
      alert('Feedback submitted successfully! This will help improve your counseling skills.');
      
    } catch (error) {
      console.error('Failed to submit feedback:', error);
      alert('Failed to submit feedback. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const ScoreBar: React.FC<{ label: string; score: number; icon: React.ReactNode }> = ({ label, score, icon }) => (
    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
      <div className="text-blue-600">{icon}</div>
      <div className="flex-1">
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm font-medium text-gray-700">{label}</span>
          <span className="text-sm font-bold text-gray-900">{score}/10</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-500"
            style={{ width: `${score * 10}%` }}
          />
        </div>
      </div>
    </div>
  );

  const SelfRatingSlider: React.FC<{ label: string; value: number; onChange: (value: number) => void }> = ({ label, value, onChange }) => (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <label className="text-sm font-medium text-gray-700">{label}</label>
        <span className="text-sm font-bold text-blue-600">{value}/10</span>
      </div>
      <input
        type="range"
        min="1"
        max="10"
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value))}
        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
      />
    </div>
  );

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-t-xl">
        <div className="flex items-center space-x-3">
          <Brain size={24} />
          <div>
            <h2 className="text-xl font-bold">AI-Powered Response Analysis</h2>
            <p className="text-blue-100 text-sm">Get insights to improve your counseling effectiveness</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* AI Analysis Section */}
        {isAnalyzing ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Analyzing your response with AI...</p>
          </div>
        ) : aiAnalysis ? (
          <div className="space-y-6">
            {/* Overall Score */}
            <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-6 text-center">
              <div className="flex items-center justify-center space-x-2 mb-2">
                <Award className="text-yellow-500" size={24} />
                <span className="text-2xl font-bold text-gray-900">{aiAnalysis.overallRating}/10</span>
              </div>
              <p className="text-gray-600">Overall Response Quality</p>
            </div>

            {/* Detailed Scores */}
            <div className="grid md:grid-cols-2 gap-4">
              <ScoreBar 
                label="Empathy & Listening" 
                score={aiAnalysis.empathyScore} 
                icon={<Heart size={20} />} 
              />
              <ScoreBar 
                label="Cultural Sensitivity" 
                score={aiAnalysis.culturalSensitivityScore} 
                icon={<Globe size={20} />} 
              />
              <ScoreBar 
                label="Questioning Skills" 
                score={aiAnalysis.questioningScore} 
                icon={<MessageSquare size={20} />} 
              />
              <ScoreBar 
                label="Goal Orientation" 
                score={aiAnalysis.goalOrientationScore} 
                icon={<Target size={20} />} 
              />
              <div className="md:col-span-2">
                <ScoreBar 
                  label="Professionalism" 
                  score={aiAnalysis.professionalismScore} 
                  icon={<CheckCircle size={20} />} 
                />
              </div>
            </div>

            {/* AI Analysis Text */}
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-3">
                <Brain size={20} className="text-blue-600" />
                <h3 className="font-semibold text-gray-900">AI Analysis</h3>
              </div>
              <p className="text-gray-700 leading-relaxed">{aiAnalysis.aiAnalysis}</p>
            </div>

            {/* Strengths */}
            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-3">
                <CheckCircle size={20} className="text-green-600" />
                <h3 className="font-semibold text-gray-900">Key Strengths</h3>
              </div>
              <ul className="space-y-2">
                {aiAnalysis.strengths.map((strength, index) => (
                  <li key={index} className="flex items-start space-x-2 text-gray-700">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                    <span>{strength}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Improvement Suggestions */}
            <div className="bg-yellow-50 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-3">
                <Lightbulb size={20} className="text-yellow-600" />
                <h3 className="font-semibold text-gray-900">Improvement Suggestions</h3>
              </div>
              <ul className="space-y-2">
                {aiAnalysis.improvementSuggestions.map((suggestion, index) => (
                  <li key={index} className="flex items-start space-x-2 text-gray-700">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0" />
                    <span>{suggestion}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Cultural Considerations */}
            {aiAnalysis.culturalConsiderations.length > 0 && (
              <div className="bg-purple-50 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-3">
                  <Globe size={20} className="text-purple-600" />
                  <h3 className="font-semibold text-gray-900">Cultural Considerations</h3>
                </div>
                <ul className="space-y-2">
                  {aiAnalysis.culturalConsiderations.map((consideration, index) => (
                    <li key={index} className="flex items-start space-x-2 text-gray-700">
                      <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0" />
                      <span>{consideration}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Self-Assessment Toggle */}
            <div className="border-t pt-6">
              <button
                onClick={() => setShowSelfAssessment(!showSelfAssessment)}
                className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 font-medium"
              >
                <BarChart3 size={20} />
                <span>{showSelfAssessment ? 'Hide' : 'Add'} Self-Assessment</span>
              </button>
            </div>
          </div>
        ) : null}

        {/* Self-Assessment Section */}
        {showSelfAssessment && aiAnalysis && (
          <div className="border-t pt-6 space-y-6">
            <div className="flex items-center space-x-2 mb-4">
              <Star size={20} className="text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900">Self-Assessment</h3>
            </div>

            {/* Overall Self-Rating */}
            <div className="bg-gray-50 rounded-lg p-4">
              <SelfRatingSlider 
                label="Overall Self-Rating" 
                value={selfRating} 
                onChange={setSelfRating} 
              />
            </div>

            {/* Detailed Self-Ratings */}
            <div className="grid md:grid-cols-2 gap-4">
              <SelfRatingSlider 
                label="Empathy & Listening" 
                value={areas.empathy} 
                onChange={(value) => setAreas({...areas, empathy: value})} 
              />
              <SelfRatingSlider 
                label="Cultural Sensitivity" 
                value={areas.culturalSensitivity} 
                onChange={(value) => setAreas({...areas, culturalSensitivity: value})} 
              />
              <SelfRatingSlider 
                label="Questioning Skills" 
                value={areas.questioning} 
                onChange={(value) => setAreas({...areas, questioning: value})} 
              />
              <SelfRatingSlider 
                label="Goal Orientation" 
                value={areas.goalOrientation} 
                onChange={(value) => setAreas({...areas, goalOrientation: value})} 
              />
              <div className="md:col-span-2">
                <SelfRatingSlider 
                  label="Professionalism" 
                  value={areas.professionalism} 
                  onChange={(value) => setAreas({...areas, professionalism: value})} 
                />
              </div>
            </div>

            {/* Self-Reflection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Self-Reflection
              </label>
              <textarea
                value={selfReflection}
                onChange={(e) => setSelfReflection(e.target.value)}
                placeholder="Reflect on your response. What went well? What would you do differently?"
                className="w-full h-24 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Time Spent */}
            <div className="flex items-center space-x-4">
              <Clock size={20} className="text-gray-600" />
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Time Spent on Response (minutes)
                </label>
                <input
                  type="number"
                  value={timeSpent}
                  onChange={(e) => setTimeSpent(parseInt(e.target.value) || 0)}
                  className="w-24 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min="1"
                  max="120"
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end pt-4">
              <button
                onClick={handleSubmitFeedback}
                disabled={isSubmitting || !selfReflection.trim()}
                className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw size={16} className="animate-spin" />
                    <span>Submitting...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle size={16} />
                    <span>Submit Feedback</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FeedbackInterface;