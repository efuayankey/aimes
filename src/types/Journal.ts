export type MoodLevel = 'very-low' | 'low' | 'neutral' | 'good' | 'very-good';
export type EmotionCategory = 
  | 'anxious' | 'sad' | 'angry' | 'frustrated' | 'overwhelmed'
  | 'happy' | 'excited' | 'calm' | 'grateful' | 'hopeful'
  | 'confused' | 'lonely' | 'stressed' | 'proud' | 'content';

export interface JournalEntry {
  id: string;
  studentId: string;
  content: string;
  title?: string;
  
  // Emotional tracking
  mood: MoodLevel;
  emotionTags: EmotionCategory[];
  intensityLevel: number; // 1-10 scale
  
  // Contextual information
  trigger?: string; // What prompted this entry
  location?: string; // Where they were when writing
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
  
  // Privacy and sharing
  isPrivate: boolean;
  sharedWithCounselors: boolean;
  anonymousSharing: boolean;
  
  // Metadata
  timestamp: Date;
  lastModified: Date;
  wordCount: number;
  estimatedReadTime: number; // in minutes
  
  // AI analysis (optional, for insights)
  aiAnalysis?: JournalAnalysis;
  
  // Responses or reflections
  followUpEntries?: string[]; // IDs of related entries
  counselorNotes?: CounselorNote[];
}

export interface JournalAnalysis {
  sentimentScore: number; // -1 to 1
  emotionalThemes: string[];
  suggestedResources: string[];
  riskFactors?: string[];
  positiveIndicators: string[];
  analyzedAt: Date;
}

export interface CounselorNote {
  counselorId: string;
  counselorName: string;
  note: string;
  isVisible: boolean; // visible to student
  timestamp: Date;
  tags: string[];
}

// Journal management types
export interface JournalStats {
  totalEntries: number;
  entriesThisWeek: number;
  averageMood: number;
  mostCommonEmotions: EmotionCategory[];
  streakDays: number;
  longestStreak: number;
}

export interface MoodTrend {
  date: Date;
  mood: MoodLevel;
  moodValue: number; // numeric representation
  emotions: EmotionCategory[];
  hasEntry: boolean;
}

export interface JournalPrompt {
  id: string;
  text: string;
  category: 'reflection' | 'gratitude' | 'goals' | 'challenges' | 'growth';
  culturallyAdapted?: boolean;
  targetMoods?: MoodLevel[];
}

// Journal composition types
export interface JournalDraft {
  content: string;
  title?: string;
  mood: MoodLevel;
  emotionTags: EmotionCategory[];
  intensityLevel: number;
  trigger?: string;
  isPrivate: boolean;
  promptId?: string; // if responding to a prompt
}

export interface JournalFilter {
  startDate?: Date;
  endDate?: Date;
  moods?: MoodLevel[];
  emotions?: EmotionCategory[];
  includePrivate: boolean;
  sortBy: 'date' | 'mood' | 'title';
  sortOrder: 'asc' | 'desc';
}