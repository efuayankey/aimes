import React, { useState } from 'react';
import { 
  MoodLevel, 
  EmotionCategory, 
  MOOD_VALUES, 
  MOOD_COLORS, 
  MOOD_EMOJIS 
} from '../../types/Journal';

interface MoodTrackerProps {
  selectedMood: MoodLevel;
  selectedEmotions: EmotionCategory[];
  intensityLevel: number;
  onMoodChange: (mood: MoodLevel) => void;
  onEmotionsChange: (emotions: EmotionCategory[]) => void;
  onIntensityChange: (intensity: number) => void;
  disabled?: boolean;
}

const EMOTION_OPTIONS: { category: EmotionCategory; label: string; color: string }[] = [
  // Negative emotions
  { category: 'anxious', label: 'Anxious', color: '#ef4444' },
  { category: 'sad', label: 'Sad', color: '#3b82f6' },
  { category: 'angry', label: 'Angry', color: '#dc2626' },
  { category: 'frustrated', label: 'Frustrated', color: '#f97316' },
  { category: 'overwhelmed', label: 'Overwhelmed', color: '#7c3aed' },
  { category: 'confused', label: 'Confused', color: '#64748b' },
  { category: 'lonely', label: 'Lonely', color: '#475569' },
  { category: 'stressed', label: 'Stressed', color: '#dc2626' },
  
  // Positive emotions
  { category: 'happy', label: 'Happy', color: '#22c55e' },
  { category: 'excited', label: 'Excited', color: '#f59e0b' },
  { category: 'calm', label: 'Calm', color: '#10b981' },
  { category: 'grateful', label: 'Grateful', color: '#8b5cf6' },
  { category: 'hopeful', label: 'Hopeful', color: '#06b6d4' },
  { category: 'proud', label: 'Proud', color: '#f59e0b' },
  { category: 'content', label: 'Content', color: '#22c55e' }
];

const MoodTracker: React.FC<MoodTrackerProps> = ({
  selectedMood,
  selectedEmotions,
  intensityLevel,
  onMoodChange,
  onEmotionsChange,
  onIntensityChange,
  disabled = false
}) => {
  const [showEmotions, setShowEmotions] = useState(selectedEmotions.length > 0);

  const handleMoodSelect = (mood: MoodLevel) => {
    if (!disabled) {
      onMoodChange(mood);
    }
  };

  const handleEmotionToggle = (emotion: EmotionCategory) => {
    if (disabled) return;

    const newEmotions = selectedEmotions.includes(emotion)
      ? selectedEmotions.filter(e => e !== emotion)
      : [...selectedEmotions, emotion];
    
    onEmotionsChange(newEmotions);
  };

  const moodEntries = Object.entries(MOOD_VALUES) as [MoodLevel, number][];

  return (
    <div className="space-y-6">
      {/* Mood Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          How are you feeling today?
        </label>
        <div className="flex justify-between items-center space-x-2">
          {moodEntries.map(([mood, value]) => (
            <button
              key={mood}
              type="button"
              onClick={() => handleMoodSelect(mood)}
              disabled={disabled}
              className={`flex flex-col items-center p-3 rounded-lg border-2 transition-all duration-200 min-w-0 flex-1 ${
                selectedMood === mood
                  ? 'border-blue-500 bg-blue-50 shadow-md'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              <div 
                className="text-2xl mb-1"
                style={{ color: selectedMood === mood ? MOOD_COLORS[mood] : '#6b7280' }}
              >
                {MOOD_EMOJIS[mood]}
              </div>
              <span className="text-xs font-medium text-gray-600 text-center capitalize">
                {mood.replace('-', ' ')}
              </span>
              <span className="text-xs text-gray-400">
                {value}/10
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Intensity Slider */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Intensity Level: {intensityLevel}/10
        </label>
        <div className="relative">
          <input
            type="range"
            min="1"
            max="10"
            value={intensityLevel}
            onChange={(e) => !disabled && onIntensityChange(parseInt(e.target.value))}
            disabled={disabled}
            className={`w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider ${
              disabled ? 'opacity-50' : ''
            }`}
            style={{
              background: `linear-gradient(to right, ${MOOD_COLORS[selectedMood]} 0%, ${MOOD_COLORS[selectedMood]} ${intensityLevel * 10}%, #e5e7eb ${intensityLevel * 10}%, #e5e7eb 100%)`
            }}
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>Mild</span>
            <span>Moderate</span>
            <span>Intense</span>
          </div>
        </div>
      </div>

      {/* Emotions Toggle */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="text-sm font-medium text-gray-700">
            What emotions are you experiencing?
          </label>
          <button
            type="button"
            onClick={() => !disabled && setShowEmotions(!showEmotions)}
            disabled={disabled}
            className={`text-sm text-blue-600 hover:text-blue-700 ${
              disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
            }`}
          >
            {showEmotions ? 'Hide emotions' : 'Add emotions'}
          </button>
        </div>

        {showEmotions && (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
            {EMOTION_OPTIONS.map(({ category, label, color }) => (
              <button
                key={category}
                type="button"
                onClick={() => handleEmotionToggle(category)}
                disabled={disabled}
                className={`px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 ${
                  selectedEmotions.includes(category)
                    ? 'text-white shadow-md'
                    : 'text-gray-600 bg-gray-100 hover:bg-gray-200'
                } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                style={{
                  backgroundColor: selectedEmotions.includes(category) ? color : undefined
                }}
              >
                {label}
              </button>
            ))}
          </div>
        )}

        {/* Selected Emotions Summary */}
        {selectedEmotions.length > 0 && (
          <div className="mt-3 p-3 bg-gray-50 rounded-lg">
            <div className="text-xs font-medium text-gray-600 mb-2">
              Selected emotions ({selectedEmotions.length}):
            </div>
            <div className="flex flex-wrap gap-1">
              {selectedEmotions.map(emotion => {
                const emotionData = EMOTION_OPTIONS.find(e => e.category === emotion);
                return (
                  <span
                    key={emotion}
                    className="inline-flex items-center px-2 py-1 rounded text-xs font-medium text-white"
                    style={{ backgroundColor: emotionData?.color }}
                  >
                    {emotionData?.label}
                    {!disabled && (
                      <button
                        type="button"
                        onClick={() => handleEmotionToggle(emotion)}
                        className="ml-1 text-white hover:text-gray-200"
                      >
                        ×
                      </button>
                    )}
                  </span>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Mood Summary */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg border border-blue-100">
        <div className="flex items-center space-x-3">
          <div className="text-3xl">{MOOD_EMOJIS[selectedMood]}</div>
          <div>
            <div className="font-medium text-gray-900 capitalize">
              {selectedMood.replace('-', ' ')} mood
            </div>
            <div className="text-sm text-gray-600">
              Intensity: {intensityLevel}/10
              {selectedEmotions.length > 0 && (
                <span className="ml-2">
                  • {selectedEmotions.length} emotion{selectedEmotions.length !== 1 ? 's' : ''} selected
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MoodTracker;