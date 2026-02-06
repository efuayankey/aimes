import React, { useState } from 'react';
import { ArrowLeft, ChevronDown, ChevronRight, Play } from 'lucide-react';
import { CBTTopic } from '../../types/CBTTraining';
import { CBTPracticeExercise } from './CBTPracticeExercise';

interface CBTTopicPageProps {
  topic: CBTTopic;
  onBack: () => void;
  onStartSimulator: (topic: CBTTopic) => void;
}

export const CBTTopicPage: React.FC<CBTTopicPageProps> = ({ topic, onBack, onStartSimulator }) => {
  const [expandedExample, setExpandedExample] = useState<number | null>(null);

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Back Button */}
      <button
        onClick={onBack}
        className="flex items-center space-x-2 text-purple-600 hover:text-purple-700 transition-colors"
      >
        <ArrowLeft size={18} />
        <span className="text-sm font-medium">Back to CBT Topics</span>
      </button>

      {/* Title & Overview */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-3">{topic.title}</h2>
        <p className="text-gray-700 leading-relaxed">{topic.overview}</p>
      </div>

      {/* Cognitive Triangle Connection */}
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-5">
        <h3 className="font-semibold text-purple-900 mb-2">Cognitive Triangle Connection</h3>
        <p className="text-purple-800 text-sm leading-relaxed">{topic.cognitiveTriangleConnection}</p>
      </div>

      {/* Key Principles */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Key Principles</h3>
        <ul className="space-y-2">
          {topic.keyPrinciples.map((principle, i) => (
            <li key={i} className="flex items-start space-x-3">
              <span className="flex-shrink-0 w-6 h-6 bg-purple-100 text-purple-700 rounded-full flex items-center justify-center text-xs font-semibold">
                {i + 1}
              </span>
              <span className="text-gray-700 text-sm">{principle}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* How To Do It (Steps) */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-3">How to Do It</h3>
        <ol className="space-y-3">
          {topic.steps.map((step, i) => (
            <li key={i} className="flex items-start space-x-3">
              <span className="flex-shrink-0 w-7 h-7 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                {i + 1}
              </span>
              <span className="text-gray-700 text-sm pt-0.5">{step}</span>
            </li>
          ))}
        </ol>
      </div>

      {/* Examples by Concern */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Examples by Concern</h3>
        <div className="space-y-3">
          {topic.examples.map((example, i) => (
            <div key={i} className="border border-gray-200 rounded-lg overflow-hidden">
              <button
                onClick={() => setExpandedExample(expandedExample === i ? null : i)}
                className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors"
              >
                <span className="font-medium text-gray-900">{example.concern}</span>
                {expandedExample === i ? (
                  <ChevronDown size={18} className="text-gray-500" />
                ) : (
                  <ChevronRight size={18} className="text-gray-500" />
                )}
              </button>
              {expandedExample === i && (
                <div className="px-4 pb-4 space-y-3 border-t border-gray-100">
                  <div className="mt-3">
                    <p className="text-xs font-medium text-gray-500 uppercase mb-1">Scenario</p>
                    <p className="text-sm text-gray-700">{example.scenario}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase mb-1">Counselor Example</p>
                    <p className="text-sm text-gray-700 italic bg-green-50 border border-green-200 rounded p-3">
                      &ldquo;{example.counselorExample}&rdquo;
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase mb-1">Why This Works</p>
                    <p className="text-sm text-gray-600">{example.explanation}</p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Practice Exercises */}
      <div className="border-t border-gray-200 pt-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-1">Practice Exercises</h3>
        <p className="text-sm text-gray-500 mb-4">
          Complete each exercise and get AI feedback, then advance to the next one.
        </p>
        <CBTPracticeExercise exercises={topic.exercises} topicId={topic.id} />
      </div>

      {/* Footer Navigation */}
      <div className="border-t border-gray-200 pt-6 flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center space-x-2 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <ArrowLeft size={16} />
          <span>Back to CBT Topics</span>
        </button>
        <button
          onClick={() => onStartSimulator(topic)}
          className="flex items-center space-x-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
        >
          <Play size={16} />
          <span>Practice with Simulator</span>
        </button>
      </div>
    </div>
  );
};
