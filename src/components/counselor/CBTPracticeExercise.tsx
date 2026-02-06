import React, { useState } from 'react';
import { Send, Loader2, Star, ArrowUp, Lightbulb, MessageSquare, ChevronRight, RotateCcw } from 'lucide-react';
import { CBTPracticeExercise as ExerciseType, CBTExerciseFeedback, CBTTopicId } from '../../types/CBTTraining';

interface CBTPracticeExerciseProps {
  exercises: ExerciseType[];
  topicId: CBTTopicId;
}

export const CBTPracticeExercise: React.FC<CBTPracticeExerciseProps> = ({ exercises, topicId }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [response, setResponse] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<CBTExerciseFeedback | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showHints, setShowHints] = useState(false);

  const exercise = exercises[currentIndex];
  const hasNext = currentIndex < exercises.length - 1;

  const handleSubmit = async () => {
    if (!response.trim()) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch('/api/cbt-feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topicId,
          skillFocus: exercise.skillFocus,
          scenario: exercise.scenario,
          counselorResponse: response.trim(),
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to get feedback');
      }

      const data = await res.json();

      if (data.success && data.feedback) {
        setFeedback(data.feedback);
      } else {
        throw new Error(data.error || 'Failed to get feedback');
      }
    } catch (err) {
      console.error('CBT feedback error:', err);
      setError('Failed to get feedback. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNextExercise = () => {
    setCurrentIndex(currentIndex + 1);
    setResponse('');
    setFeedback(null);
    setError(null);
    setShowHints(false);
  };

  const handleRetry = () => {
    setResponse('');
    setFeedback(null);
    setError(null);
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setResponse('');
    setFeedback(null);
    setError(null);
    setShowHints(false);
  };

  const getScoreColor = (score: number) => {
    if (score >= 8) return 'bg-green-500';
    if (score >= 6) return 'bg-yellow-500';
    if (score >= 4) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 8) return 'Excellent';
    if (score >= 6) return 'Good';
    if (score >= 4) return 'Developing';
    return 'Needs Work';
  };

  return (
    <div className="space-y-6">
      {/* Exercise Progress */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-500">
          Exercise {currentIndex + 1} of {exercises.length}
        </span>
        <div className="flex space-x-1.5">
          {exercises.map((_, i) => (
            <div
              key={i}
              className={`w-2.5 h-2.5 rounded-full transition-colors ${
                i < currentIndex
                  ? 'bg-green-500'
                  : i === currentIndex
                  ? 'bg-purple-600'
                  : 'bg-gray-300'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Scenario */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-5">
        <h4 className="font-semibold text-amber-900 mb-2">Practice Scenario</h4>
        <p className="text-amber-800 text-sm leading-relaxed">{exercise.scenario}</p>
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-5">
        <h4 className="font-semibold text-blue-900 mb-2">Your Task</h4>
        <p className="text-blue-800 text-sm leading-relaxed">{exercise.instructions}</p>
        <p className="text-blue-600 text-xs mt-2 italic">Skill focus: {exercise.skillFocus}</p>
      </div>

      {/* Hints */}
      <div>
        <button
          onClick={() => setShowHints(!showHints)}
          className="flex items-center space-x-2 text-sm text-purple-600 hover:text-purple-700 transition-colors"
        >
          <Lightbulb size={16} />
          <span>{showHints ? 'Hide Hints' : 'Show Hints'}</span>
        </button>
        {showHints && (
          <div className="mt-2 bg-purple-50 border border-purple-200 rounded-lg p-4">
            <ul className="space-y-1 text-sm text-purple-800">
              {exercise.hints.map((hint, i) => (
                <li key={i}>&#8226; {hint}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Response Area */}
      {!feedback && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Your Response
          </label>
          <textarea
            value={response}
            onChange={(e) => setResponse(e.target.value)}
            placeholder="Write your counselor response here..."
            className="w-full min-h-[150px] p-4 border border-gray-300 rounded-lg resize-y focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 text-sm leading-relaxed"
            disabled={isSubmitting}
          />
          <div className="flex items-center justify-between mt-3">
            <span className="text-xs text-gray-500">
              {response.length > 0 ? `${response.split(/\s+/).filter(Boolean).length} words` : 'Start typing...'}
            </span>
            <button
              onClick={handleSubmit}
              disabled={!response.trim() || isSubmitting}
              className="flex items-center space-x-2 px-5 py-2.5 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Analyzing...</span>
                </>
              ) : (
                <>
                  <Send size={16} />
                  <span>Submit for Feedback</span>
                </>
              )}
            </button>
          </div>
          {error && (
            <p className="text-red-600 text-sm mt-2">{error}</p>
          )}
        </div>
      )}

      {/* Feedback Display */}
      {feedback && (
        <div className="space-y-5">
          {/* Score Bars */}
          <div className="bg-white border border-gray-200 rounded-lg p-5">
            <h4 className="font-semibold text-gray-900 mb-4">Your Scores</h4>
            <div className="space-y-4">
              {[
                { label: 'Overall', score: feedback.overallScore },
                { label: 'CBT Technique', score: feedback.techniqueScore },
                { label: 'Empathy & Rapport', score: feedback.empathyScore },
              ].map(({ label, score }) => (
                <div key={label}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700">{label}</span>
                    <span className="text-sm font-semibold text-gray-900">
                      {score}/10 — {getScoreLabel(score)}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className={`h-2.5 rounded-full transition-all ${getScoreColor(score)}`}
                      style={{ width: `${score * 10}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Strengths & Improvements */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="font-semibold text-green-900 mb-3 flex items-center space-x-2">
                <Star size={16} />
                <span>Strengths</span>
              </h4>
              <ul className="space-y-2 text-sm text-green-800">
                {feedback.strengths.map((s, i) => (
                  <li key={i}>&#8226; {s}</li>
                ))}
              </ul>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-900 mb-3 flex items-center space-x-2">
                <ArrowUp size={16} />
                <span>Areas to Improve</span>
              </h4>
              <ul className="space-y-2 text-sm text-blue-800">
                {feedback.improvements.map((imp, i) => (
                  <li key={i}>&#8226; {imp}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Model Response */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-5">
            <h4 className="font-semibold text-gray-900 mb-2 flex items-center space-x-2">
              <MessageSquare size={16} />
              <span>Model Response</span>
            </h4>
            <p className="text-gray-700 text-sm leading-relaxed italic">
              &ldquo;{feedback.modelResponse}&rdquo;
            </p>
          </div>

          {/* Navigation Buttons */}
          <div className="flex items-center justify-center space-x-3">
            <button
              onClick={handleRetry}
              className="flex items-center space-x-2 px-4 py-2 text-sm text-purple-600 border border-purple-300 rounded-lg hover:bg-purple-50 transition-colors"
            >
              <RotateCcw size={14} />
              <span>Try Again</span>
            </button>
            {hasNext ? (
              <button
                onClick={handleNextExercise}
                className="flex items-center space-x-2 px-5 py-2.5 text-sm bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors"
              >
                <span>Next Exercise</span>
                <ChevronRight size={16} />
              </button>
            ) : (
              <button
                onClick={handleRestart}
                className="flex items-center space-x-2 px-5 py-2.5 text-sm bg-gray-600 text-white rounded-lg font-medium hover:bg-gray-700 transition-colors"
              >
                <RotateCcw size={14} />
                <span>Restart from Exercise 1</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
