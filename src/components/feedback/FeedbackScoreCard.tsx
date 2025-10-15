import React from 'react';
import { 
  Star, 
  TrendingUp, 
  TrendingDown, 
  Minus,
  AlertTriangle,
  CheckCircle2,
  Circle
} from 'lucide-react';
import { FeedbackScores, SCORE_THRESHOLDS } from '../../types/Feedback';

interface FeedbackScoreCardProps {
  scores: FeedbackScores;
  showDetails?: boolean;
  compact?: boolean;
}

const FeedbackScoreCard: React.FC<FeedbackScoreCardProps> = ({
  scores,
  showDetails = false,
  compact = false
}) => {
  const getScoreColor = (score: number): string => {
    if (score >= SCORE_THRESHOLDS.EXCELLENT) return 'text-green-600 bg-green-50 border-green-200';
    if (score >= SCORE_THRESHOLDS.GOOD) return 'text-blue-600 bg-blue-50 border-blue-200';
    if (score >= SCORE_THRESHOLDS.NEEDS_IMPROVEMENT) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const getScoreIcon = (score: number) => {
    if (score >= SCORE_THRESHOLDS.EXCELLENT) return <CheckCircle2 className="h-4 w-4" />;
    if (score >= SCORE_THRESHOLDS.GOOD) return <TrendingUp className="h-4 w-4" />;
    if (score >= SCORE_THRESHOLDS.NEEDS_IMPROVEMENT) return <Minus className="h-4 w-4" />;
    return <AlertTriangle className="h-4 w-4" />;
  };

  const getScoreLabel = (score: number): string => {
    if (score >= SCORE_THRESHOLDS.EXCELLENT) return 'Excellent';
    if (score >= SCORE_THRESHOLDS.GOOD) return 'Good';
    if (score >= SCORE_THRESHOLDS.NEEDS_IMPROVEMENT) return 'Needs Improvement';
    return 'Poor';
  };

  const scoreItems = [
    { key: 'culturalSensitivity', label: 'Cultural Sensitivity', score: scores.culturalSensitivity },
    { key: 'culturalAwareness', label: 'Cultural Awareness', score: scores.culturalAwareness },
    { key: 'empathy', label: 'Empathy', score: scores.empathy },
    { key: 'professionalism', label: 'Professionalism', score: scores.professionalism },
    { key: 'actionability', label: 'Actionability', score: scores.actionability },
    { key: 'questionQuality', label: 'Question Quality', score: scores.questionQuality },
    { key: 'languageAppropriate', label: 'Language Appropriateness', score: scores.languageAppropriate },
    { key: 'responseLength', label: 'Response Length', score: scores.responseLength }
  ];

  if (compact) {
    return (
      <div className="flex items-center space-x-4 p-4 bg-white border border-gray-200 rounded-lg">
        <div className="flex items-center space-x-2">
          <Star className="h-5 w-5 text-yellow-500" />
          <span className="text-lg font-semibold text-gray-900">
            {scores.overall.toFixed(1)}/10
          </span>
          <span className={`text-sm px-2 py-1 rounded-full border ${getScoreColor(scores.overall)}`}>
            {getScoreLabel(scores.overall)}
          </span>
        </div>
        
        <div className="flex items-center space-x-3">
          <div className="text-sm text-gray-600">
            Cultural: <span className="font-medium">{scores.culturalSensitivity.toFixed(1)}</span>
          </div>
          <div className="text-sm text-gray-600">
            Empathy: <span className="font-medium">{scores.empathy.toFixed(1)}</span>
          </div>
          <div className="text-sm text-gray-600">
            Quality: <span className="font-medium">{scores.questionQuality.toFixed(1)}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 bg-gradient-to-r from-blue-50 to-purple-50 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Response Analysis Scores</h3>
          <div className="flex items-center space-x-2">
            <Star className="h-5 w-5 text-yellow-500" />
            <span className="text-xl font-bold text-gray-900">
              {scores.overall.toFixed(1)}/10
            </span>
            <span className={`text-sm px-3 py-1 rounded-full border font-medium ${getScoreColor(scores.overall)}`}>
              {getScoreLabel(scores.overall)}
            </span>
          </div>
        </div>
      </div>

      {/* Score Grid */}
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {scoreItems.map(({ key, label, score }) => (
            <div key={key} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-2">
                {getScoreIcon(score)}
                <span className="text-sm font-medium text-gray-700">{label}</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-lg font-semibold text-gray-900">
                  {score.toFixed(1)}
                </span>
                <div className="w-16 bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${
                      score >= SCORE_THRESHOLDS.EXCELLENT ? 'bg-green-500' :
                      score >= SCORE_THRESHOLDS.GOOD ? 'bg-blue-500' :
                      score >= SCORE_THRESHOLDS.NEEDS_IMPROVEMENT ? 'bg-yellow-500' :
                      'bg-red-500'
                    }`}
                    style={{ width: `${(score / 10) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Score Breakdown */}
        {showDetails && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h4 className="text-md font-semibold text-gray-900 mb-4">Score Breakdown</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Cultural Competency */}
              <div className="p-4 bg-blue-50 rounded-lg">
                <h5 className="font-medium text-blue-900 mb-2">Cultural Competency</h5>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-blue-700">Sensitivity:</span>
                    <span className="font-medium">{scores.culturalSensitivity.toFixed(1)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-700">Awareness:</span>
                    <span className="font-medium">{scores.culturalAwareness.toFixed(1)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-700">Language:</span>
                    <span className="font-medium">{scores.languageAppropriate.toFixed(1)}</span>
                  </div>
                </div>
              </div>

              {/* Therapeutic Skills */}
              <div className="p-4 bg-green-50 rounded-lg">
                <h5 className="font-medium text-green-900 mb-2">Therapeutic Skills</h5>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-green-700">Empathy:</span>
                    <span className="font-medium">{scores.empathy.toFixed(1)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-green-700">Professionalism:</span>
                    <span className="font-medium">{scores.professionalism.toFixed(1)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-green-700">Actionability:</span>
                    <span className="font-medium">{scores.actionability.toFixed(1)}</span>
                  </div>
                </div>
              </div>

              {/* Communication */}
              <div className="p-4 bg-purple-50 rounded-lg">
                <h5 className="font-medium text-purple-900 mb-2">Communication</h5>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-purple-700">Questions:</span>
                    <span className="font-medium">{scores.questionQuality.toFixed(1)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-purple-700">Length:</span>
                    <span className="font-medium">{scores.responseLength.toFixed(1)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-purple-700">Overall:</span>
                    <span className="font-medium">{scores.overall.toFixed(1)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FeedbackScoreCard;