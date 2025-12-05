import React, { useState, useCallback, useEffect } from 'react';
import { 
  Save, 
  X, 
  Lock, 
  Unlock, 
  Share2, 
  FileText, 
  Calendar,
  Clock,
  AlertCircle
} from 'lucide-react';
import { 
  JournalDraft, 
  MoodLevel, 
  EmotionCategory 
} from '../../types/Journal';
import MoodTracker from './MoodTracker';

interface JournalEntryEditorProps {
  initialDraft?: JournalDraft;
  onSave: (draft: JournalDraft) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
  mode?: 'create' | 'edit';
}

const JournalEntryEditor: React.FC<JournalEntryEditorProps> = ({
  initialDraft,
  onSave,
  onCancel,
  isLoading = false,
  mode = 'create'
}) => {
  const [draft, setDraft] = useState<JournalDraft>(
    initialDraft || {
      content: '',
      title: '',
      mood: 'neutral',
      emotionTags: [],
      intensityLevel: 5,
      trigger: '',
      isPrivate: true
    }
  );

  const [showAdvanced, setShowAdvanced] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Calculate word count
  useEffect(() => {
    const words = draft.content.split(/\s+/).filter(word => word.length > 0);
    setWordCount(words.length);
  }, [draft.content]);

  // Track unsaved changes
  useEffect(() => {
    if (initialDraft) {
      const hasChanges = JSON.stringify(draft) !== JSON.stringify(initialDraft);
      setHasUnsavedChanges(hasChanges);
    } else {
      setHasUnsavedChanges(draft.content.trim().length > 0 || draft.title?.trim().length > 0);
    }
  }, [draft, initialDraft]);

  const updateDraft = useCallback((updates: Partial<JournalDraft>) => {
    setDraft(prev => ({ ...prev, ...updates }));
  }, []);

  const handleSave = async () => {
    if (!draft.content.trim()) {
      alert('Please write something in your journal entry before saving.');
      return;
    }

    try {
      setIsSaving(true);
      await onSave(draft);
    } catch (error) {
      console.error('Failed to save journal entry:', error);
      alert('Failed to save journal entry. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (hasUnsavedChanges) {
      if (window.confirm('You have unsaved changes. Are you sure you want to cancel?')) {
        onCancel();
      }
    } else {
      onCancel();
    }
  };

  const estimatedReadTime = Math.max(1, Math.ceil(wordCount / 200));

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <FileText className="h-6 w-6 text-white" />
            <h2 className="text-xl font-semibold text-white">
              {mode === 'create' ? 'New Journal Entry' : 'Edit Journal Entry'}
            </h2>
          </div>
          <div className="flex items-center space-x-2 text-white text-sm">
            <Calendar className="h-4 w-4" />
            <span>{new Date().toLocaleDateString()}</span>
            <Clock className="h-4 w-4 ml-3" />
            <span>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Title Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Title (optional)
          </label>
          <input
            type="text"
            value={draft.title || ''}
            onChange={(e) => updateDraft({ title: e.target.value })}
            placeholder="Give your entry a title..."
            disabled={isLoading}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500 text-black"
          />
        </div>

        {/* Mood Tracker */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <MoodTracker
            selectedMood={draft.mood}
            selectedEmotions={draft.emotionTags}
            intensityLevel={draft.intensityLevel}
            onMoodChange={(mood) => updateDraft({ mood })}
            onEmotionsChange={(emotions) => updateDraft({ emotionTags: emotions })}
            onIntensityChange={(intensity) => updateDraft({ intensityLevel: intensity })}
            disabled={isLoading}
          />
        </div>

        {/* Main Content */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            What&apos;s on your mind?
          </label>
          <textarea
            value={draft.content}
            onChange={(e) => updateDraft({ content: e.target.value })}
            placeholder="Write about your thoughts, feelings, experiences, or anything else you'd like to express..."
            disabled={isLoading}
            rows={12}
            className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none disabled:bg-gray-50 disabled:text-gray-500 text-black"
          />
          <div className="flex justify-between items-center mt-2 text-sm text-gray-500">
            <span>{wordCount} words • ~{estimatedReadTime} min read</span>
            {hasUnsavedChanges && (
              <span className="flex items-center text-orange-600">
                <AlertCircle className="h-4 w-4 mr-1" />
                Unsaved changes
              </span>
            )}
          </div>
        </div>

        {/* Advanced Options Toggle */}
        <div>
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            disabled={isLoading}
            className="text-sm text-blue-600 hover:text-blue-700 disabled:text-gray-400"
          >
            {showAdvanced ? 'Hide' : 'Show'} advanced options
          </button>
        </div>

        {/* Advanced Options */}
        {showAdvanced && (
          <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
            {/* Trigger Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                What prompted this entry? (optional)
              </label>
              <input
                type="text"
                value={draft.trigger || ''}
                onChange={(e) => updateDraft({ trigger: e.target.value })}
                placeholder="e.g., therapy session, stressful day, good news..."
                disabled={isLoading}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500 text-black"
              />
            </div>

            {/* Privacy Settings */}
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900">Privacy Settings</h4>
              
              <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                <div className="flex items-center space-x-3">
                  {draft.isPrivate ? (
                    <Lock className="h-5 w-5 text-red-500" />
                  ) : (
                    <Unlock className="h-5 w-5 text-green-500" />
                  )}
                  <div>
                    <div className="font-medium text-gray-900">
                      {draft.isPrivate ? 'Private Entry' : 'Shareable Entry'}
                    </div>
                    <div className="text-sm text-gray-600">
                      {draft.isPrivate 
                        ? 'Only visible to you' 
                        : 'Can be shared with counselors if needed'
                      }
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => updateDraft({ isPrivate: !draft.isPrivate })}
                  disabled={isLoading}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 ${
                    draft.isPrivate ? 'bg-red-500' : 'bg-green-500'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      draft.isPrivate ? 'translate-x-1' : 'translate-x-6'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={handleCancel}
            disabled={isLoading || isSaving}
            className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <X className="h-4 w-4" />
            <span>Cancel</span>
          </button>

          <div className="flex items-center space-x-3">
            {draft.isPrivate ? (
              <div className="flex items-center text-sm text-gray-500">
                <Lock className="h-4 w-4 mr-1" />
                <span>Private</span>
              </div>
            ) : (
              <div className="flex items-center text-sm text-green-600">
                <Share2 className="h-4 w-4 mr-1" />
                <span>Shareable</span>
              </div>
            )}

            <button
              type="button"
              onClick={handleSave}
              disabled={isLoading || isSaving || !draft.content.trim()}
              className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  <span>{mode === 'create' ? 'Save Entry' : 'Update Entry'}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JournalEntryEditor;