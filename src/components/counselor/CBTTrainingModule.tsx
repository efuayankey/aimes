import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { CBTTopicId, CBTTopic } from '../../types/CBTTraining';
import { CBT_TOPICS } from '../../data/cbtTopics';
import { CBTTopicGrid } from './CBTTopicGrid';
import { CBTTopicPage } from './CBTTopicPage';

interface CBTTrainingModuleProps {
  onStartSimulator: (context: { suggestedConcern: string; objective: string; tips: string[] }) => void;
  onBackToModes: () => void;
}

export const CBTTrainingModule: React.FC<CBTTrainingModuleProps> = ({
  onStartSimulator,
  onBackToModes,
}) => {
  const [currentView, setCurrentView] = useState<'overview' | 'topic'>('overview');
  const [selectedTopicId, setSelectedTopicId] = useState<CBTTopicId | null>(null);

  const selectedTopic = selectedTopicId
    ? CBT_TOPICS.find((t) => t.id === selectedTopicId) || null
    : null;

  const handleSelectTopic = (topicId: CBTTopicId) => {
    setSelectedTopicId(topicId);
    setCurrentView('topic');
  };

  const handleBackToOverview = () => {
    setSelectedTopicId(null);
    setCurrentView('overview');
  };

  const handleStartSimulator = (topic: CBTTopic) => {
    onStartSimulator(topic.simulatorContext);
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      {/* Back to Training Modes */}
      {currentView === 'overview' && (
        <button
          onClick={onBackToModes}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors mb-6"
        >
          <ArrowLeft size={18} />
          <span className="text-sm font-medium">Back to Training Modes</span>
        </button>
      )}

      {currentView === 'overview' ? (
        <CBTTopicGrid onSelectTopic={handleSelectTopic} />
      ) : selectedTopic ? (
        <CBTTopicPage
          topic={selectedTopic}
          onBack={handleBackToOverview}
          onStartSimulator={handleStartSimulator}
        />
      ) : null}
    </div>
  );
};
