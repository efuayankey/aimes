// Temporary debug version that stores to localStorage
import { JournalEntry, JournalDraft } from '../types/Journal';

export class JournalServiceDebug {
  private static readonly STORAGE_KEY = 'aimes_journal_entries';

  // Create a new journal entry (localStorage version for debugging)
  static async createEntry(studentId: string, draft: JournalDraft): Promise<string> {
    console.log('DEBUG: Creating journal entry with localStorage');
    
    try {
      const timeOfDay = this.getTimeOfDay();
      const wordCount = draft.content.split(/\s+/).filter(word => word.length > 0).length;
      const estimatedReadTime = Math.max(1, Math.ceil(wordCount / 200));

      const entry: JournalEntry = {
        id: Date.now().toString(), // Simple ID for localStorage
        studentId,
        content: draft.content,
        title: draft.title || `Journal Entry - ${new Date().toLocaleDateString()}`,
        mood: draft.mood,
        emotionTags: draft.emotionTags,
        intensityLevel: draft.intensityLevel,
        trigger: draft.trigger,
        location: undefined,
        timeOfDay,
        isPrivate: draft.isPrivate,
        sharedWithCounselors: false,
        anonymousSharing: false,
        timestamp: new Date(),
        lastModified: new Date(),
        wordCount,
        estimatedReadTime,
        followUpEntries: [],
        counselorNotes: []
      };

      // Get existing entries
      const existingEntries = this.getStoredEntries();
      existingEntries.push(entry);
      
      // Save to localStorage
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(existingEntries));
      
      console.log('DEBUG: Entry saved to localStorage:', entry);
      return entry.id;
    } catch (error: any) {
      console.error('DEBUG: Failed to save to localStorage:', error);
      throw error;
    }
  }

  // Get entries from localStorage
  static async getEntries(studentId: string): Promise<JournalEntry[]> {
    console.log('DEBUG: Loading entries from localStorage');
    
    const entries = this.getStoredEntries().filter(entry => entry.studentId === studentId);
    console.log('DEBUG: Found entries:', entries);
    return entries;
  }

  // Get journal stats
  static async getJournalStats(studentId: string) {
    const entries = await this.getEntries(studentId);
    return {
      totalEntries: entries.length,
      entriesThisWeek: entries.filter(e => 
        (new Date().getTime() - e.timestamp.getTime()) < 7 * 24 * 60 * 60 * 1000
      ).length,
      averageMood: 5,
      mostCommonEmotions: [],
      streakDays: 0,
      longestStreak: 0
    };
  }

  // Get mood trends
  static async getMoodTrends(studentId: string, days: number = 30) {
    return [];
  }

  private static getStoredEntries(): JournalEntry[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (!stored) return [];
      
      const parsed = JSON.parse(stored);
      return parsed.map((entry: any) => ({
        ...entry,
        timestamp: new Date(entry.timestamp),
        lastModified: new Date(entry.lastModified)
      }));
    } catch (error) {
      console.error('Failed to parse stored entries:', error);
      return [];
    }
  }

  private static getTimeOfDay(): 'morning' | 'afternoon' | 'evening' | 'night' {
    const hour = new Date().getHours();
    if (hour < 6) return 'night';
    if (hour < 12) return 'morning';
    if (hour < 18) return 'afternoon';
    if (hour < 22) return 'evening';
    return 'night';
  }
}