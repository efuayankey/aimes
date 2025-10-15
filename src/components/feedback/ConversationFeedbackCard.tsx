import React, { useState } from 'react';
import {
  MessageSquare,
  TrendingUp,
  TrendingDown,
  CheckCircle2,
  AlertTriangle,
  Users,
  Heart,
  Target,
  ChevronDown,
  ChevronUp,
  Clock,
  Star,
  Award,
  BookOpen,
  Globe,
  ArrowRight
} from 'lucide-react';
import { ConversationFeedback } from '../../types/Feedback';

interface ConversationFeedbackCardProps {
  feedback: ConversationFeedback;
  compact?: boolean;
}

const ConversationFeedbackCard: React.FC<ConversationFeedbackCardProps> = ({
  feedback,
  compact = false
}) => {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(['overview', 'strengths'])
  );

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  const getScoreColor = (score: number): string => {
    if (score >= 8.5) return 'text-green-600 bg-green-50 border-green-200';
    if (score >= 7.0) return 'text-blue-600 bg-blue-50 border-blue-200';
    if (score >= 5.5) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const getScoreIcon = (score: number) => {
    if (score >= 8.5) return <CheckCircle2 className="h-4 w-4" />;
    if (score >= 7.0) return <TrendingUp className="h-4 w-4" />;
    if (score >= 5.5) return <AlertTriangle className="h-4 w-4" />;
    return <TrendingDown className="h-4 w-4" />;
  };

  const formatCulturalBackground = (bg: string): string => {
    return bg.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const SectionHeader: React.FC<{
    icon: React.ReactNode;
    title: string;
    count?: number;
    sectionKey: string;
    color: string;
  }> = ({ icon, title, count, sectionKey, color }) => (
    <button
      onClick={() => toggleSection(sectionKey)}
      className={`w-full flex items-center justify-between p-3 rounded-lg border-2 transition-all duration-200 ${
        expandedSections.has(sectionKey)
          ? `${color} border-opacity-50`
          : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
      }`}
    >
      <div className="flex items-center space-x-3">
        {icon}
        <span className="font-medium text-gray-900">{title}</span>
        {count !== undefined && count > 0 && (
          <span className="px-2 py-1 text-xs bg-white bg-opacity-70 rounded-full">
            {count}
          </span>
        )}
      </div>
      {expandedSections.has(sectionKey) ? (
        <ChevronUp className="h-4 w-4 text-gray-600" />
      ) : (
        <ChevronDown className="h-4 w-4 text-gray-600" />
      )}
    </button>
  );

  if (compact) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-900">Conversation Analysis</h3>
          <div className="flex items-center space-x-2">
            <Star className="h-4 w-4 text-yellow-500" />
            <span className="text-sm font-semibold">
              {feedback.overallPerformance.overallScore.toFixed(1)}/10
            </span>
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Cultural Sensitivity:</span>
            <span className="font-medium">{feedback.overallPerformance.culturalSensitivity.toFixed(1)}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Conversation Flow:</span>
            <span className="font-medium">{feedback.overallPerformance.conversationFlow.toFixed(1)}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Therapeutic Progress:</span>
            <span className="font-medium">{feedback.overallPerformance.therapeuticProgress.toFixed(1)}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 bg-gradient-to-r from-purple-50 to-blue-50 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <MessageSquare className="h-6 w-6 text-purple-600" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Full Conversation Analysis</h3>
              <p className="text-sm text-gray-600">
                {feedback.analysisContext.conversationSummary.totalMessages} messages • 
                {' '}{feedback.analysisContext.conversationSummary.conversationDuration} • 
                {' '}{formatCulturalBackground(feedback.analysisContext.culturalBackground)} context
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="text-right">
              <div className="flex items-center space-x-2">
                <Star className="h-5 w-5 text-yellow-500" />
                <span className="text-xl font-bold text-gray-900">
                  {feedback.overallPerformance.overallScore.toFixed(1)}/10
                </span>
              </div>
              <span className={`text-xs px-2 py-1 rounded-full border ${getScoreColor(feedback.overallPerformance.overallScore)}`}>
                {feedback.overallPerformance.overallScore >= 8.5 ? 'Excellent' :
                 feedback.overallPerformance.overallScore >= 7.0 ? 'Good' :
                 feedback.overallPerformance.overallScore >= 5.5 ? 'Needs Improvement' : 'Poor'}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Overall Performance Scores */}
        <div>
          <SectionHeader
            icon={<Award className="h-5 w-5 text-purple-600" />}
            title="Performance Overview"
            sectionKey="overview"
            color="bg-purple-50 border-purple-200"
          />
          {expandedSections.has('overview') && (
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(feedback.overallPerformance).map(([key, score]) => {
                if (key === 'overallScore') return null;
                const displayName = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
                const icons = {
                  conversationFlow: <ArrowRight className="h-4 w-4" />,
                  culturalSensitivity: <Globe className="h-4 w-4" />,
                  therapeuticProgress: <Target className="h-4 w-4" />,
                  professionalBoundaries: <Users className="h-4 w-4" />,
                  empathy: <Heart className="h-4 w-4" />
                };
                
                return (
                  <div key={key} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-2">
                      {icons[key as keyof typeof icons] || getScoreIcon(score)}
                      <span className="text-sm font-medium text-gray-700">{displayName}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-lg font-semibold text-gray-900">
                        {score.toFixed(1)}
                      </span>
                      <div className="w-16 bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all duration-300 ${
                            score >= 8.5 ? 'bg-green-500' :
                            score >= 7.0 ? 'bg-blue-500' :
                            score >= 5.5 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${(score / 10) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Conversation Strengths */}
        <div>
          <SectionHeader
            icon={<CheckCircle2 className="h-5 w-5 text-green-600" />}
            title="What You Did Excellently"
            count={feedback.conversationAnalysis.strengths.length}
            sectionKey="strengths"
            color="bg-green-50 border-green-200"
          />
          {expandedSections.has('strengths') && (
            <div className="mt-4 space-y-2">
              {feedback.conversationAnalysis.strengths.map((strength, index) => (
                <div key={index} className="flex items-start space-x-2 p-3 bg-green-50 rounded-lg">
                  <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-700">{strength}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Cultural Excellence */}
        {feedback.conversationAnalysis.goodCulturalMoments.length > 0 && (
          <div>
            <SectionHeader
              icon={<Globe className="h-5 w-5 text-blue-600" />}
              title="Excellent Cultural Awareness Moments"
              count={feedback.conversationAnalysis.goodCulturalMoments.length}
              sectionKey="cultural-good"
              color="bg-blue-50 border-blue-200"
            />
            {expandedSections.has('cultural-good') && (
              <div className="mt-4 space-y-2">
                {feedback.conversationAnalysis.goodCulturalMoments.map((moment, index) => (
                  <div key={index} className="flex items-start space-x-2 p-3 bg-blue-50 rounded-lg">
                    <Globe className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-700">{moment}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Positive Reinforcement - Specific Examples */}
        {feedback.suggestions.positiveReinforcement.length > 0 && (
          <div>
            <SectionHeader
              icon={<Award className="h-5 w-5 text-purple-600" />}
              title="Specific Excellent Moments"
              count={feedback.suggestions.positiveReinforcement.length}
              sectionKey="positive"
              color="bg-purple-50 border-purple-200"
            />
            {expandedSections.has('positive') && (
              <div className="mt-4 space-y-3">
                {feedback.suggestions.positiveReinforcement.map((positive, index) => (
                  <div key={index} className="p-4 bg-purple-50 rounded-lg border-l-4 border-purple-400">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="text-sm font-semibold text-purple-800">
                        Message #{positive.messageNumber}
                      </span>
                      <Award className="h-4 w-4 text-purple-600" />
                    </div>
                    <p className="text-sm text-gray-700 mb-2">
                      <strong>What went well:</strong> {positive.whatWentWell}
                    </p>
                    <p className="text-sm text-gray-600">
                      <strong>Why it worked:</strong> {positive.whyItWorked}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Areas for Improvement */}
        <div>
          <SectionHeader
            icon={<Target className="h-5 w-5 text-orange-600" />}
            title="Areas for Growth"
            count={feedback.conversationAnalysis.weaknesses.length}
            sectionKey="weaknesses"
            color="bg-orange-50 border-orange-200"
          />
          {expandedSections.has('weaknesses') && (
            <div className="mt-4 space-y-2">
              {feedback.conversationAnalysis.weaknesses.map((weakness, index) => (
                <div key={index} className="flex items-start space-x-2 p-3 bg-orange-50 rounded-lg">
                  <Target className="h-4 w-4 text-orange-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-700">{weakness}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Specific Improvement Moments */}
        {feedback.suggestions.specificMoments.length > 0 && (
          <div>
            <SectionHeader
              icon={<BookOpen className="h-5 w-5 text-red-600" />}
              title="Specific Moments to Improve"
              count={feedback.suggestions.specificMoments.length}
              sectionKey="specific"
              color="bg-red-50 border-red-200"
            />
            {expandedSections.has('specific') && (
              <div className="mt-4 space-y-3">
                {feedback.suggestions.specificMoments.map((moment, index) => (
                  <div key={index} className="p-4 bg-red-50 rounded-lg border-l-4 border-red-400">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="text-sm font-semibold text-red-800">
                        Message #{moment.messageNumber}
                      </span>
                      <AlertTriangle className="h-4 w-4 text-red-600" />
                    </div>
                    <p className="text-sm text-gray-700 mb-2">
                      <strong>Issue:</strong> {moment.issue}
                    </p>
                    <p className="text-sm text-gray-600">
                      <strong>Better approach:</strong> {moment.betterApproach}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Conversation Metadata */}
        <div className="pt-4 border-t border-gray-200">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-gray-400" />
              <span className="text-gray-600">Duration: {feedback.analysisContext.conversationSummary.conversationDuration}</span>
            </div>
            <div className="flex items-center space-x-2">
              <MessageSquare className="h-4 w-4 text-gray-400" />
              <span className="text-gray-600">
                {feedback.analysisContext.conversationSummary.counselorMessages} responses
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-gray-400" />
              <span className="text-gray-600">
                Pacing: {feedback.conversationAnalysis.conversationPacing}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <Globe className="h-4 w-4 text-gray-400" />
              <span className="text-gray-600">
                {formatCulturalBackground(feedback.analysisContext.culturalBackground)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConversationFeedbackCard;