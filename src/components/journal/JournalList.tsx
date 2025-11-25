import React, { useState, useMemo } from 'react';
import { 
  Calendar, 
  List, 
  Search, 
  Filter, 
  Edit3, 
  Share2, 
  Lock, 
  Eye,
  ChevronLeft,
  ChevronRight,
  Plus
} from 'lucide-react';
import { 
  JournalEntry, 
  JournalFilter, 
  MoodLevel, 
  EmotionCategory,
  MOOD_EMOJIS,
  MOOD_COLORS 
} from '../../types/Journal';

interface JournalListProps {
  entries: JournalEntry[];
  onEntrySelect: (entry: JournalEntry) => void;
  onEntryEdit: (entry: JournalEntry) => void;
  onEntryShare: (entry: JournalEntry) => void;
  onCreateNew: () => void;
  isLoading?: boolean;
}

type ViewMode = 'list' | 'calendar';

const JournalList: React.FC<JournalListProps> = ({
  entries,
  onEntrySelect,
  onEntryEdit,
  onEntryShare,
  onCreateNew,
  isLoading = false
}) => {
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<JournalFilter>({
    includePrivate: true,
    sortBy: 'date',
    sortOrder: 'desc'
  });

  // Filter and search entries
  const filteredEntries = useMemo(() => {
    let filtered = [...entries];

    // Apply search
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(entry => 
        entry.title?.toLowerCase().includes(term) ||
        entry.content.toLowerCase().includes(term) ||
        entry.emotionTags.some(emotion => emotion.toLowerCase().includes(term))
      );
    }

    // Apply filters
    if (filters.startDate) {
      filtered = filtered.filter(entry => entry.timestamp >= filters.startDate!);
    }
    if (filters.endDate) {
      filtered = filtered.filter(entry => entry.timestamp <= filters.endDate!);
    }
    if (filters.moods && filters.moods.length > 0) {
      filtered = filtered.filter(entry => filters.moods!.includes(entry.mood));
    }
    if (filters.emotions && filters.emotions.length > 0) {
      filtered = filtered.filter(entry => 
        entry.emotionTags.some(emotion => filters.emotions!.includes(emotion))
      );
    }
    if (!filters.includePrivate) {
      filtered = filtered.filter(entry => !entry.isPrivate);
    }

    // Sort entries
    filtered.sort((a, b) => {
      const aValue = filters.sortBy === 'date' ? a.timestamp.getTime() :
                     filters.sortBy === 'mood' ? a.mood :
                     a.title || '';
      const bValue = filters.sortBy === 'date' ? b.timestamp.getTime() :
                     filters.sortBy === 'mood' ? b.mood :
                     b.title || '';

      if (filters.sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    return filtered;
  }, [entries, searchTerm, filters]);

  // Group entries by date for calendar view
  const entriesByDate = useMemo(() => {
    const grouped: { [key: string]: JournalEntry[] } = {};
    filteredEntries.forEach(entry => {
      const dateKey = entry.timestamp.toDateString();
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(entry);
    });
    return grouped;
  }, [filteredEntries]);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const truncateContent = (content: string, maxLength: number = 150) => {
    if (content.length <= maxLength) return content;
    return content.substr(0, maxLength) + '...';
  };

  // Calendar helper functions
  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setSelectedDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(newDate.getMonth() - 1);
      } else {
        newDate.setMonth(newDate.getMonth() + 1);
      }
      return newDate;
    });
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(selectedDate);
    const firstDay = getFirstDayOfMonth(selectedDate);
    const days = [];

    // Empty cells for days before month starts
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-20 bg-gray-50" />);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), day);
      const dateKey = date.toDateString();
      const dayEntries = entriesByDate[dateKey] || [];
      
      days.push(
        <div key={day} className="h-20 bg-white border border-gray-200 p-1 overflow-hidden">
          <div className="font-medium text-sm text-gray-900 mb-1">{day}</div>
          {dayEntries.length > 0 && (
            <div className="space-y-1">
              {dayEntries.slice(0, 2).map(entry => (
                <div
                  key={entry.id}
                  onClick={() => onEntrySelect(entry)}
                  className="text-xs p-1 rounded cursor-pointer hover:opacity-80"
                  style={{ backgroundColor: MOOD_COLORS[entry.mood] + '20' }}
                >
                  <div className="flex items-center space-x-1">
                    <span>{MOOD_EMOJIS[entry.mood]}</span>
                    <span className="truncate">{entry.title || 'Untitled'}</span>
                  </div>
                </div>
              ))}
              {dayEntries.length > 2 && (
                <div className="text-xs text-gray-500">
                  +{dayEntries.length - 2} more
                </div>
              )}
            </div>
          )}
        </div>
      );
    }

    return days;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
        <span className="ml-3 text-gray-600">Loading journal entries...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">My Journal</h2>
          <p className="text-gray-600">{entries.length} entries total</p>
        </div>
        <button
          onClick={onCreateNew}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          <span>New Entry</span>
        </button>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
        {/* Search */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search entries..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* View Toggle */}
        <div className="flex border border-gray-300 rounded-lg overflow-hidden">
          <button
            onClick={() => setViewMode('list')}
            className={`flex items-center space-x-2 px-4 py-2 ${
              viewMode === 'list' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            <List className="h-4 w-4" />
            <span>List</span>
          </button>
          <button
            onClick={() => setViewMode('calendar')}
            className={`flex items-center space-x-2 px-4 py-2 ${
              viewMode === 'calendar' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Calendar className="h-4 w-4" />
            <span>Calendar</span>
          </button>
        </div>

        {/* Filters */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          <Filter className="h-4 w-4" />
          <span>Filters</span>
        </button>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="bg-gray-50 p-4 rounded-lg space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Sort by</label>
              <select
                value={filters.sortBy}
                onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value as 'date' | 'mood' | 'title' }))}
                className="w-full p-2 border border-gray-300 rounded-lg"
              >
                <option value="date">Date</option>
                <option value="mood">Mood</option>
                <option value="title">Title</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Order</label>
              <select
                value={filters.sortOrder}
                onChange={(e) => setFilters(prev => ({ ...prev, sortOrder: e.target.value as 'asc' | 'desc' }))}
                className="w-full p-2 border border-gray-300 rounded-lg"
              >
                <option value="desc">Newest first</option>
                <option value="asc">Oldest first</option>
              </select>
            </div>
            <div className="flex items-end">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={filters.includePrivate}
                  onChange={(e) => setFilters(prev => ({ ...prev, includePrivate: e.target.checked }))}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Include private entries</span>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      {viewMode === 'list' ? (
        <div className="space-y-4">
          {filteredEntries.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">📝</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No journal entries found</h3>
              <p className="text-gray-600 mb-4">
                {searchTerm ? 'Try adjusting your search or filters' : 'Start writing your first journal entry'}
              </p>
              <button
                onClick={onCreateNew}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Create First Entry
              </button>
            </div>
          ) : (
            filteredEntries.map(entry => (
              <div
                key={entry.id}
                className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <span className="text-2xl">{MOOD_EMOJIS[entry.mood]}</span>
                      <div>
                        <h3 className="font-medium text-gray-900">
                          {entry.title || 'Untitled Entry'}
                        </h3>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span>{formatDate(entry.timestamp)} at {formatTime(entry.timestamp)}</span>
                          <span>{entry.wordCount} words</span>
                          <span>~{entry.estimatedReadTime} min read</span>
                        </div>
                      </div>
                    </div>
                    {entry.emotionTags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {entry.emotionTags.slice(0, 3).map(emotion => (
                          <span
                            key={emotion}
                            className="px-2 py-1 text-xs font-medium text-white rounded"
                            style={{ backgroundColor: MOOD_COLORS[entry.mood] }}
                          >
                            {emotion}
                          </span>
                        ))}
                        {entry.emotionTags.length > 3 && (
                          <span className="px-2 py-1 text-xs text-gray-500 bg-gray-100 rounded">
                            +{entry.emotionTags.length - 3} more
                          </span>
                        )}
                      </div>
                    )}
                    <p className="text-gray-700">{truncateContent(entry.content)}</p>
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    {entry.isPrivate && <Lock className="h-4 w-4 text-red-500" />}
                    {entry.sharedWithCounselors && <Share2 className="h-4 w-4 text-green-500" />}
                  </div>
                </div>
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div className="text-sm text-gray-500">
                    Intensity: {entry.intensityLevel}/10
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => onEntrySelect(entry)}
                      className="flex items-center space-x-1 px-3 py-1 text-blue-600 hover:bg-blue-50 rounded"
                    >
                      <Eye className="h-4 w-4" />
                      <span>View</span>
                    </button>
                    <button
                      onClick={() => onEntryEdit(entry)}
                      className="flex items-center space-x-1 px-3 py-1 text-gray-600 hover:bg-gray-50 rounded"
                    >
                      <Edit3 className="h-4 w-4" />
                      <span>Edit</span>
                    </button>
                    {!entry.sharedWithCounselors && (
                      <button
                        onClick={() => onEntryShare(entry)}
                        className="flex items-center space-x-1 px-3 py-1 text-green-600 hover:bg-green-50 rounded"
                      >
                        <Share2 className="h-4 w-4" />
                        <span>Share</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          {/* Calendar Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              {selectedDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </h3>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => navigateMonth('prev')}
                className="p-2 hover:bg-gray-100 rounded"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={() => navigateMonth('next')}
                className="p-2 hover:bg-gray-100 rounded"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-0">
            {/* Day headers */}
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="p-3 bg-gray-50 border border-gray-200 font-medium text-center text-sm text-gray-600">
                {day}
              </div>
            ))}
            {/* Calendar days */}
            {renderCalendar()}
          </div>
        </div>
      )}
    </div>
  );
};

export default JournalList;