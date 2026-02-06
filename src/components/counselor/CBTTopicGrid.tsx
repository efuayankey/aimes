import React from 'react';
import { Search, Target, FileText, RefreshCw, Activity, CheckSquare } from 'lucide-react';
import { CBTTopicId } from '../../types/CBTTraining';
import { CBT_OVERVIEW, CBT_TOPICS } from '../../data/cbtTopics';

interface CBTTopicGridProps {
  onSelectTopic: (topicId: CBTTopicId) => void;
}

const TOPIC_ICONS: Record<CBTTopicId, React.ReactNode> = {
  'identifying-problems': <Search size={24} />,
  'setting-goals': <Target size={24} />,
  'thought-records': <FileText size={24} />,
  'challenging-thoughts': <RefreshCw size={24} />,
  'behavioral-activation': <Activity size={24} />,
  'wrapping-up': <CheckSquare size={24} />,
};

const TOPIC_COLORS: Record<CBTTopicId, { bg: string; border: string; icon: string; hover: string }> = {
  'identifying-problems': { bg: 'bg-teal-50', border: 'border-teal-200', icon: 'bg-teal-600', hover: 'hover:border-teal-400' },
  'setting-goals': { bg: 'bg-blue-50', border: 'border-blue-200', icon: 'bg-blue-600', hover: 'hover:border-blue-400' },
  'thought-records': { bg: 'bg-indigo-50', border: 'border-indigo-200', icon: 'bg-indigo-600', hover: 'hover:border-indigo-400' },
  'challenging-thoughts': { bg: 'bg-purple-50', border: 'border-purple-200', icon: 'bg-purple-600', hover: 'hover:border-purple-400' },
  'behavioral-activation': { bg: 'bg-orange-50', border: 'border-orange-200', icon: 'bg-orange-600', hover: 'hover:border-orange-400' },
  'wrapping-up': { bg: 'bg-green-50', border: 'border-green-200', icon: 'bg-green-600', hover: 'hover:border-green-400' },
};

export const CBTTopicGrid: React.FC<CBTTopicGridProps> = ({ onSelectTopic }) => {
  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Overview */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-3">{CBT_OVERVIEW.title}</h2>
        <p className="text-gray-600 max-w-3xl mx-auto leading-relaxed">
          {CBT_OVERVIEW.description}
        </p>
      </div>

      {/* Cognitive Triangle */}
      <div className="bg-purple-50 border border-purple-200 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-purple-900 mb-3 text-center">The Cognitive Triangle</h3>

        {/* Visual Triangle */}
        <div className="flex justify-center mb-4">
          <div className="relative w-72 h-56">
            {/* Thoughts (top) */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-semibold shadow-md">
              Thoughts
            </div>
            {/* Feelings (bottom-left) */}
            <div className="absolute bottom-0 left-0 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold shadow-md">
              Feelings
            </div>
            {/* Behaviors (bottom-right) */}
            <div className="absolute bottom-0 right-0 bg-teal-600 text-white px-4 py-2 rounded-lg text-sm font-semibold shadow-md">
              Behaviors
            </div>
            {/* Connecting lines (SVG) */}
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 288 224" fill="none">
              {/* Thoughts to Feelings */}
              <line x1="120" y1="40" x2="50" y2="185" stroke="#7c3aed" strokeWidth="2" strokeDasharray="6 4" />
              {/* Thoughts to Behaviors */}
              <line x1="168" y1="40" x2="238" y2="185" stroke="#7c3aed" strokeWidth="2" strokeDasharray="6 4" />
              {/* Feelings to Behaviors */}
              <line x1="80" y1="200" x2="208" y2="200" stroke="#7c3aed" strokeWidth="2" strokeDasharray="6 4" />
              {/* Arrows */}
              <polygon points="50,185 56,175 44,175" fill="#7c3aed" />
              <polygon points="238,185 232,175 244,175" fill="#7c3aed" />
              <polygon points="208,200 200,194 200,206" fill="#7c3aed" />
            </svg>
          </div>
        </div>

        <p className="text-purple-800 text-sm text-center max-w-2xl mx-auto leading-relaxed">
          {CBT_OVERVIEW.cognitiveTriangle}
        </p>
      </div>

      {/* Why Learn CBT */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-5">
        <h3 className="font-semibold text-gray-900 mb-3">Why Learn CBT?</h3>
        <ul className="space-y-2">
          {CBT_OVERVIEW.whyLearnCBT.map((reason, i) => (
            <li key={i} className="flex items-start space-x-2 text-sm text-gray-700">
              <span className="text-purple-600 mt-0.5">&#10003;</span>
              <span>{reason}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Topic Grid */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">CBT Topics</h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {CBT_TOPICS.map((topic, index) => {
            const colors = TOPIC_COLORS[topic.id];
            return (
              <button
                key={topic.id}
                onClick={() => onSelectTopic(topic.id)}
                className={`text-left p-5 border-2 rounded-lg transition-all ${colors.bg} ${colors.border} ${colors.hover} hover:shadow-md`}
              >
                <div className={`w-10 h-10 ${colors.icon} rounded-lg flex items-center justify-center text-white mb-3`}>
                  {TOPIC_ICONS[topic.id]}
                </div>
                <div className="text-xs text-gray-500 font-medium mb-1">Topic {index + 1}</div>
                <h4 className="font-semibold text-gray-900 mb-2">{topic.title}</h4>
                <p className="text-gray-600 text-sm leading-relaxed line-clamp-3">
                  {topic.shortDescription}
                </p>
                <div className="mt-3 text-sm font-medium text-purple-600">
                  Start Learning &rarr;
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
