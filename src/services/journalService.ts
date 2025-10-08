import { 
  collection, 
  addDoc, 
  updateDoc,
  deleteDoc,
  doc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit,
  startAfter,
  Timestamp 
} from 'firebase/firestore';
import { db } from './firebase';
import { 
  JournalEntry, 
  JournalDraft, 
  JournalStats, 
  MoodTrend, 
  JournalFilter,
  MoodLevel,
  EmotionCategory,
  MOOD_VALUES 
} from '../types/Journal';

export class JournalService {
  private static readonly COLLECTION_NAME = 'journal_entries';

  // Create a new journal entry
  static async createEntry(studentId: string, draft: JournalDraft): Promise<string> {
    console.log('JournalService.createEntry called with:', { studentId, draft });
    
    try {
      const timeOfDay = this.getTimeOfDay();
      const wordCount = draft.content.split(/\s+/).filter(word => word.length > 0).length;
      const estimatedReadTime = Math.max(1, Math.ceil(wordCount / 200)); // ~200 words per minute

      const entry: Omit<JournalEntry, 'id'> = {
        studentId,
        content: draft.content,
        title: draft.title || `Journal Entry - ${new Date().toLocaleDateString()}`,
        mood: draft.mood,
        emotionTags: draft.emotionTags,
        intensityLevel: draft.intensityLevel,
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

      // Add optional fields only if they have values
      if (draft.trigger) {
        (entry as any).trigger = draft.trigger;
      }

      console.log('Attempting to save journal entry:', entry);

      // Create the data object for Firestore, filtering out undefined values
      const firestoreData: any = {
        studentId: entry.studentId,
        content: entry.content,
        title: entry.title,
        mood: entry.mood,
        emotionTags: entry.emotionTags,
        intensityLevel: entry.intensityLevel,
        timeOfDay: entry.timeOfDay,
        isPrivate: entry.isPrivate,
        sharedWithCounselors: entry.sharedWithCounselors,
        anonymousSharing: entry.anonymousSharing,
        timestamp: Timestamp.fromDate(entry.timestamp),
        lastModified: Timestamp.fromDate(entry.lastModified),
        wordCount: entry.wordCount,
        estimatedReadTime: entry.estimatedReadTime,
        followUpEntries: entry.followUpEntries,
        counselorNotes: entry.counselorNotes
      };

      // Add optional fields only if they exist
      if (draft.trigger) {
        firestoreData.trigger = draft.trigger;
      }

      const docRef = await addDoc(collection(db, this.COLLECTION_NAME), firestoreData);

      console.log('Journal entry saved successfully with ID:', docRef.id);
      return docRef.id;
    } catch (error: any) {
      console.error('Failed to create journal entry:', error);
      console.error('Error details:', {
        code: error.code,
        message: error.message,
        stack: error.stack
      });
      throw new Error('Failed to create journal entry: ' + error.message);
    }
  }

  // Update an existing journal entry
  static async updateEntry(entryId: string, updates: Partial<JournalDraft>): Promise<void> {
    try {
      const updateData: any = { ...updates };
      
      if (updates.content) {
        const wordCount = updates.content.split(/\s+/).filter(word => word.length > 0).length;
        updateData.wordCount = wordCount;
        updateData.estimatedReadTime = Math.max(1, Math.ceil(wordCount / 200));
      }
      
      updateData.lastModified = Timestamp.fromDate(new Date());

      await updateDoc(doc(db, this.COLLECTION_NAME, entryId), updateData);
    } catch (error: any) {
      console.error('Failed to update journal entry:', error);
      throw new Error('Failed to update journal entry: ' + error.message);
    }
  }

  // Delete a journal entry
  static async deleteEntry(entryId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, this.COLLECTION_NAME, entryId));
    } catch (error: any) {
      console.error('Failed to delete journal entry:', error);
      throw new Error('Failed to delete journal entry: ' + error.message);
    }
  }

  // Get journal entries for a student with filters
  static async getEntries(
    studentId: string, 
    filters: JournalFilter = { includePrivate: true, sortBy: 'date', sortOrder: 'desc' }
  ): Promise<JournalEntry[]> {
    try {
      // Simplified query to avoid index requirements
      let q = query(
        collection(db, this.COLLECTION_NAME),
        where('studentId', '==', studentId)
      );

      const snapshot = await getDocs(q);
      let entries = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate(),
        lastModified: doc.data().lastModified?.toDate()
      } as JournalEntry));

      // Apply all filters client-side to avoid Firestore index requirements
      
      // Apply date filters
      if (filters.startDate) {
        entries = entries.filter(entry => entry.timestamp >= filters.startDate!);
      }
      if (filters.endDate) {
        entries = entries.filter(entry => entry.timestamp <= filters.endDate!);
      }

      // Apply mood filters
      if (filters.moods && filters.moods.length > 0) {
        entries = entries.filter(entry => filters.moods!.includes(entry.mood));
      }

      // Apply emotion filters
      if (filters.emotions && filters.emotions.length > 0) {
        entries = entries.filter(entry => 
          entry.emotionTags.some(emotion => filters.emotions!.includes(emotion))
        );
      }

      // Apply privacy filter
      if (!filters.includePrivate) {
        entries = entries.filter(entry => !entry.isPrivate);
      }

      // Apply sorting
      entries.sort((a, b) => {
        let aValue: any, bValue: any;
        
        if (filters.sortBy === 'date') {
          aValue = a.timestamp.getTime();
          bValue = b.timestamp.getTime();
        } else if (filters.sortBy === 'mood') {
          aValue = MOOD_VALUES[a.mood];
          bValue = MOOD_VALUES[b.mood];
        } else {
          aValue = a.title || '';
          bValue = b.title || '';
        }

        if (filters.sortOrder === 'asc') {
          return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
        } else {
          return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
        }
      });

      return entries;
    } catch (error: any) {
      console.error('Failed to get journal entries:', error);
      throw new Error('Failed to get journal entries: ' + error.message);
    }
  }

  // Get a single journal entry
  static async getEntry(entryId: string): Promise<JournalEntry | null> {
    try {
      const snapshot = await getDocs(
        query(collection(db, this.COLLECTION_NAME), where('__name__', '==', entryId))
      );
      
      if (snapshot.empty) return null;

      const doc = snapshot.docs[0];
      return {
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate(),
        lastModified: doc.data().lastModified?.toDate()
      } as JournalEntry;
    } catch (error: any) {
      console.error('Failed to get journal entry:', error);
      throw new Error('Failed to get journal entry: ' + error.message);
    }
  }

  // Get journal statistics for a student
  static async getJournalStats(studentId: string): Promise<JournalStats> {
    try {
      const entries = await this.getEntries(studentId);
      
      const now = new Date();
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      
      const entriesThisWeek = entries.filter(entry => entry.timestamp >= weekAgo);
      
      // Calculate average mood
      const moodValues = entries.map(entry => MOOD_VALUES[entry.mood]);
      const averageMood = moodValues.length > 0 
        ? moodValues.reduce((sum, val) => sum + val, 0) / moodValues.length 
        : 5;

      // Find most common emotions
      const emotionCounts: Record<string, number> = {};
      entries.forEach(entry => {
        entry.emotionTags.forEach(emotion => {
          emotionCounts[emotion] = (emotionCounts[emotion] || 0) + 1;
        });
      });

      const mostCommonEmotions = Object.entries(emotionCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 3)
        .map(([emotion]) => emotion as EmotionCategory);

      // Calculate streaks
      const { streakDays, longestStreak } = this.calculateStreaks(entries);

      return {
        totalEntries: entries.length,
        entriesThisWeek: entriesThisWeek.length,
        averageMood: Math.round(averageMood * 10) / 10,
        mostCommonEmotions,
        streakDays,
        longestStreak
      };
    } catch (error: any) {
      console.error('Failed to get journal stats:', error);
      throw new Error('Failed to get journal stats: ' + error.message);
    }
  }

  // Get mood trends over time
  static async getMoodTrends(studentId: string, days: number = 30): Promise<MoodTrend[]> {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const entries = await this.getEntries(studentId, {
        startDate,
        includePrivate: true,
        sortBy: 'date',
        sortOrder: 'asc'
      });

      const trends: MoodTrend[] = [];
      
      for (let i = 0; i < days; i++) {
        const date = new Date(startDate);
        date.setDate(date.getDate() + i);
        
        const dayEntries = entries.filter(entry => 
          entry.timestamp.toDateString() === date.toDateString()
        );

        if (dayEntries.length > 0) {
          // Use the last entry of the day or average if multiple
          const lastEntry = dayEntries[dayEntries.length - 1];
          trends.push({
            date,
            mood: lastEntry.mood,
            moodValue: MOOD_VALUES[lastEntry.mood],
            emotions: lastEntry.emotionTags,
            hasEntry: true
          });
        } else {
          trends.push({
            date,
            mood: 'neutral',
            moodValue: 5,
            emotions: [],
            hasEntry: false
          });
        }
      }

      return trends;
    } catch (error: any) {
      console.error('Failed to get mood trends:', error);
      throw new Error('Failed to get mood trends: ' + error.message);
    }
  }

  // Share entry with counselors
  static async shareWithCounselors(entryId: string, share: boolean): Promise<void> {
    try {
      await updateDoc(doc(db, this.COLLECTION_NAME, entryId), {
        sharedWithCounselors: share,
        lastModified: Timestamp.fromDate(new Date())
      });
    } catch (error: any) {
      console.error('Failed to update sharing status:', error);
      throw new Error('Failed to update sharing status: ' + error.message);
    }
  }

  // Get shared entries for counselors
  static async getSharedEntries(studentId?: string): Promise<JournalEntry[]> {
    try {
      let q = query(
        collection(db, this.COLLECTION_NAME),
        where('sharedWithCounselors', '==', true),
        orderBy('timestamp', 'desc')
      );

      if (studentId) {
        q = query(q, where('studentId', '==', studentId));
      }

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate(),
        lastModified: doc.data().lastModified?.toDate()
      } as JournalEntry));
    } catch (error: any) {
      console.error('Failed to get shared entries:', error);
      throw new Error('Failed to get shared entries: ' + error.message);
    }
  }

  // Helper methods
  private static getTimeOfDay(): 'morning' | 'afternoon' | 'evening' | 'night' {
    const hour = new Date().getHours();
    if (hour < 6) return 'night';
    if (hour < 12) return 'morning';
    if (hour < 18) return 'afternoon';
    if (hour < 22) return 'evening';
    return 'night';
  }

  private static calculateStreaks(entries: JournalEntry[]): { streakDays: number; longestStreak: number } {
    if (entries.length === 0) return { streakDays: 0, longestStreak: 0 };

    // Sort entries by date
    const sortedEntries = entries.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    
    // Get unique dates
    const entryDates = new Set(
      sortedEntries.map(entry => entry.timestamp.toDateString())
    );

    let currentStreak = 0;
    let longestStreak = 0;
    let checkDate = new Date();

    // Check current streak (going backwards from today)
    while (entryDates.has(checkDate.toDateString())) {
      currentStreak++;
      checkDate.setDate(checkDate.getDate() - 1);
    }

    // Calculate longest streak
    const dateArray = Array.from(entryDates).sort();
    let tempStreak = 1;
    
    for (let i = 1; i < dateArray.length; i++) {
      const prevDate = new Date(dateArray[i - 1]);
      const currDate = new Date(dateArray[i]);
      const diffDays = (currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24);
      
      if (diffDays === 1) {
        tempStreak++;
        longestStreak = Math.max(longestStreak, tempStreak);
      } else {
        tempStreak = 1;
      }
    }

    return { streakDays: currentStreak, longestStreak: Math.max(longestStreak, 1) };
  }
}