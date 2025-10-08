import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  TrendingUp, 
  Calendar,
  Share2,
  Eye,
  X
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { JournalService } from '../../services/journalService';
import { 
  JournalEntry, 
  JournalDraft, 
  JournalStats, 
  MoodTrend,
  MOOD_EMOJIS,
  MOOD_COLORS 
} from '../../types/Journal';
import JournalEntryEditor from './JournalEntryEditor';
import JournalList from './JournalList';

type ViewState = 'list' | 'editor' | 'view' | 'stats';

const JournalingInterface: React.FC = () => {
  const { user } = useAuth();
  const [viewState, setViewState] = useState<ViewState>('list');
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);
  const [stats, setStats] = useState<JournalStats | null>(null);
  const [moodTrends, setMoodTrends] = useState<MoodTrend[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (user?.uid) {
      loadJournalData();
    }
  }, [user]);

  const loadJournalData = async () => {
    if (!user?.uid) return;

    try {
      setIsLoading(true);
      const [journalEntries, journalStats, trends] = await Promise.all([
        JournalService.getEntries(user.uid),
        JournalService.getJournalStats(user.uid),
        JournalService.getMoodTrends(user.uid, 30)
      ]);

      setEntries(journalEntries);
      setStats(journalStats);
      setMoodTrends(trends);
    } catch (error) {
      console.error('Failed to load journal data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateEntry = async (draft: JournalDraft) => {
    console.log('handleCreateEntry called with draft:', draft);
    console.log('Current user:', user);
    
    if (!user?.uid) {
      console.error('No user UID available');
      alert('Please log in to save journal entries.');
      return;
    }

    try {
      setIsSaving(true);
      console.log('Calling JournalService.createEntry...');
      const entryId = await JournalService.createEntry(user.uid, draft);
      console.log('Journal entry created with ID:', entryId);
      
      console.log('Refreshing journal data...');
      await loadJournalData(); // Refresh data
      setViewState('list');
      console.log('Journal creation completed successfully');
    } catch (error) {
      console.error('Failed to create journal entry:', error);
      alert(`Failed to save journal entry: ${error.message}`);
      throw error;
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateEntry = async (draft: JournalDraft) => {
    if (!selectedEntry) return;

    try {
      setIsSaving(true);
      await JournalService.updateEntry(selectedEntry.id, draft);
      await loadJournalData(); // Refresh data
      setViewState('list');
      setSelectedEntry(null);
    } catch (error) {
      console.error('Failed to update journal entry:', error);
      throw error;
    } finally {
      setIsSaving(false);
    }
  };

  const handleShareEntry = async (entry: JournalEntry) => {
    try {
      await JournalService.shareWithCounselors(entry.id, !entry.sharedWithCounselors);
      await loadJournalData(); // Refresh data
    } catch (error) {
      console.error('Failed to update sharing status:', error);
    }
  };

  const handleEntrySelect = (entry: JournalEntry) => {
    setSelectedEntry(entry);
    setViewState('view');
  };

  const handleEntryEdit = (entry: JournalEntry) => {
    setSelectedEntry(entry);
    setViewState('editor');
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const renderStats = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Journal Statistics</h2>
        <button
          onClick={() => setViewState('list')}
          className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-800"
        >
          <X className="h-4 w-4" />
          <span>Close</span>
        </button>
      </div>

      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Entries</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalEntries}</p>
              </div>
              <BookOpen className="h-8 w-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">This Week</p>
                <p className="text-2xl font-bold text-gray-900">{stats.entriesThisWeek}</p>
              </div>
              <Calendar className="h-8 w-8 text-green-600" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Average Mood</p>
                <p className="text-2xl font-bold text-gray-900">{stats.averageMood}/10</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-600" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Writing Streak</p>
                <p className="text-2xl font-bold text-gray-900">{stats.streakDays} days</p>
                <p className="text-xs text-gray-500">Best: {stats.longestStreak} days</p>
              </div>
              <div className="text-2xl">🔥</div>
            </div>
          </div>
        </div>
      )}

      {/* Mood Trends Chart */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Mood Trends (Last 30 Days)</h3>
        <div className="grid grid-cols-7 gap-1">
          {moodTrends.slice(-21).map((trend, index) => (
            <div key={index} className="text-center">
              <div className="text-xs text-gray-500 mb-1">
                {trend.date.getDate()}
              </div>
              <div
                className={`h-8 w-8 mx-auto rounded-full flex items-center justify-center text-sm ${
                  trend.hasEntry ? 'shadow-sm' : 'bg-gray-100'
                }`}
                style={{
                  backgroundColor: trend.hasEntry ? MOOD_COLORS[trend.mood] + '30' : undefined,
                  border: trend.hasEntry ? `2px solid ${MOOD_COLORS[trend.mood]}` : '2px solid #e5e7eb'
                }}
                title={`${trend.date.toDateString()}: ${trend.hasEntry ? trend.mood : 'No entry'}`}
              >
                {trend.hasEntry ? MOOD_EMOJIS[trend.mood] : ''}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 text-sm text-gray-600">
          <p>Each circle represents a day. Colors indicate your mood on days you wrote journal entries.</p>
        </div>
      </div>

      {/* Most Common Emotions */}
      {stats && stats.mostCommonEmotions.length > 0 && (
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Most Common Emotions</h3>
          <div className="flex flex-wrap gap-2">
            {stats.mostCommonEmotions.map((emotion, index) => (
              <span
                key={emotion}
                className="px-3 py-1 rounded-full text-sm font-medium text-white"
                style={{ 
                  backgroundColor: index === 0 ? '#3b82f6' : index === 1 ? '#10b981' : '#8b5cf6'
                }}
              >
                {emotion}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderEntryView = () => {
    if (!selectedEntry) return null;

    return (
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Eye className="h-6 w-6 text-white" />
              <h2 className="text-xl font-semibold text-white">
                {selectedEntry.title || 'Journal Entry'}
              </h2>
            </div>
            <button
              onClick={() => setViewState('list')}
              className="text-white hover:text-gray-200"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Entry Metadata */}
          <div className="flex items-center justify-between pb-4 border-b border-gray-200">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <span className="text-2xl">{MOOD_EMOJIS[selectedEntry.mood]}</span>
                <div>
                  <div className="font-medium text-gray-900 capitalize">
                    {selectedEntry.mood.replace('-', ' ')} mood
                  </div>
                  <div className="text-sm text-gray-600">
                    Intensity: {selectedEntry.intensityLevel}/10
                  </div>
                </div>
              </div>
              <div className="text-sm text-gray-600">
                <div>{formatDate(selectedEntry.timestamp)}</div>
                <div>{formatTime(selectedEntry.timestamp)}</div>
              </div>
              <div className="text-sm text-gray-600">
                <div>{selectedEntry.wordCount} words</div>
                <div>~{selectedEntry.estimatedReadTime} min read</div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {selectedEntry.isPrivate && (
                <span className="flex items-center text-sm text-red-600">
                  <Eye className="h-4 w-4 mr-1" />
                  Private
                </span>
              )}
              {selectedEntry.sharedWithCounselors && (
                <span className="flex items-center text-sm text-green-600">
                  <Share2 className="h-4 w-4 mr-1" />
                  Shared
                </span>
              )}
            </div>
          </div>

          {/* Emotions */}
          {selectedEntry.emotionTags.length > 0 && (
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Emotions</h4>
              <div className="flex flex-wrap gap-2">
                {selectedEntry.emotionTags.map(emotion => (
                  <span
                    key={emotion}
                    className="px-3 py-1 rounded-full text-sm font-medium text-white"
                    style={{ backgroundColor: MOOD_COLORS[selectedEntry.mood] }}
                  >
                    {emotion}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Trigger */}
          {selectedEntry.trigger && (
            <div>
              <h4 className="font-medium text-gray-900 mb-2">What prompted this entry</h4>
              <p className="text-gray-700">{selectedEntry.trigger}</p>
            </div>
          )}

          {/* Content */}
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Entry</h4>
            <div className="prose max-w-none">
              <p className="text-gray-700 whitespace-pre-wrap">{selectedEntry.content}</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-6 border-t border-gray-200">
            <button
              onClick={() => setViewState('list')}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Back to List
            </button>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => handleEntryEdit(selectedEntry)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Edit Entry
              </button>
              <button
                onClick={() => handleShareEntry(selectedEntry)}
                className={`px-4 py-2 rounded-lg ${
                  selectedEntry.sharedWithCounselors
                    ? 'bg-red-600 text-white hover:bg-red-700'
                    : 'bg-green-600 text-white hover:bg-green-700'
                }`}
              >
                {selectedEntry.sharedWithCounselors ? 'Unshare' : 'Share with Counselors'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (!user) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Please log in to access your journal.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {viewState === 'list' && (
          <>
            {/* Quick Stats Bar */}
            {stats && (
              <div className="mb-6 bg-white rounded-lg border border-gray-200 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900">{stats.totalEntries}</div>
                      <div className="text-sm text-gray-600">Total Entries</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{stats.streakDays}</div>
                      <div className="text-sm text-gray-600">Day Streak</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{stats.averageMood}</div>
                      <div className="text-sm text-gray-600">Avg Mood</div>
                    </div>
                  </div>
                  <button
                    onClick={() => setViewState('stats')}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    <TrendingUp className="h-4 w-4" />
                    <span>View Stats</span>
                  </button>
                </div>
              </div>
            )}

            <JournalList
              entries={entries}
              onEntrySelect={handleEntrySelect}
              onEntryEdit={handleEntryEdit}
              onEntryShare={handleShareEntry}
              onCreateNew={() => setViewState('editor')}
              isLoading={isLoading}
            />
          </>
        )}

        {viewState === 'editor' && (
          <JournalEntryEditor
            initialDraft={selectedEntry ? {
              content: selectedEntry.content,
              title: selectedEntry.title,
              mood: selectedEntry.mood,
              emotionTags: selectedEntry.emotionTags,
              intensityLevel: selectedEntry.intensityLevel,
              trigger: selectedEntry.trigger,
              isPrivate: selectedEntry.isPrivate
            } : undefined}
            onSave={selectedEntry ? handleUpdateEntry : handleCreateEntry}
            onCancel={() => {
              setViewState('list');
              setSelectedEntry(null);
            }}
            isLoading={isSaving}
            mode={selectedEntry ? 'edit' : 'create'}
          />
        )}

        {viewState === 'view' && renderEntryView()}

        {viewState === 'stats' && renderStats()}
      </div>
    </div>
  );
};

export default JournalingInterface;