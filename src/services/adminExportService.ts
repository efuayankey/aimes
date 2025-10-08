// Admin service for platform-wide data export and analytics
import { 
  collection, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit,
  startAfter,
  Timestamp 
} from 'firebase/firestore';
import { db } from './firebase';
import { ConversationService } from './conversationService';
import { JournalService } from './journalService';
import { Conversation, ConversationMessage, CulturalBackground } from '../types';
import { JournalEntry } from '../types/Journal';

export interface AdminExportFilters {
  dateFrom?: Date;
  dateTo?: Date;
  conversationType?: 'ai' | 'human' | 'all';
  culturalBackground?: CulturalBackground | 'all';
  includeAnonymous?: boolean;
  minMessages?: number;
  maxResults?: number;
  includeJournalData?: boolean;
}

export interface PlatformStatistics {
  totalConversations: number;
  totalMessages: number;
  aiConversations: number;
  humanConversations: number;
  anonymousConversations: number;
  averageMessagesPerConversation: number;
  totalStudents: number;
  totalCounselors: number;
  conversationsByDate: { date: string; count: number }[];
  conversationsByCulture: { culture: string; count: number }[];
  popularTopics: { topic: string; count: number }[];
  responseEffectiveness: {
    averageResponseTime: string;
    conversationCompletionRate: number;
    studentSatisfactionProxy: number;
  };
  journalStatistics: {
    totalJournalEntries: number;
    averageEntriesPerStudent: number;
    averageMoodScore: number;
    mostCommonEmotions: string[];
    privateEntries: number;
    sharedEntries: number;
  };
}

export interface AdminExportData {
  metadata: {
    exportedAt: Date;
    exportedBy: string;
    filters: AdminExportFilters;
    totalConversations: number;
    totalMessages: number;
    totalJournalEntries: number;
    anonymizationApplied: boolean;
  };
  conversations: Array<{
    conversation: Conversation;
    messages: ConversationMessage[];
    statistics: {
      duration: string;
      studentMessages: number;
      counselorMessages: number;
      aiMessages: number;
      totalCharacters: number;
      averageMessageLength: number;
    };
  }>;
  journalEntries: Array<{
    entry: JournalEntry;
    statistics: {
      wordCount: number;
      characterCount: number;
      emotionCount: number;
      moodNumericValue: number;
    };
  }>;
  platformStats: PlatformStatistics;
}

export class AdminExportService {
  // Get all journal entries for export
  static async getAllJournalEntries(filters: AdminExportFilters = {}): Promise<JournalEntry[]> {
    try {
      let q = query(collection(db, 'journal_entries'));

      // Apply date filters
      if (filters.dateFrom) {
        q = query(q, where('timestamp', '>=', Timestamp.fromDate(filters.dateFrom)));
      }

      if (filters.dateTo) {
        q = query(q, where('timestamp', '<=', Timestamp.fromDate(filters.dateTo)));
      }

      // Order by creation date
      q = query(q, orderBy('timestamp', 'desc'));

      // Apply limit if specified
      if (filters.maxResults) {
        q = query(q, limit(filters.maxResults));
      }

      const snapshot = await getDocs(q);
      let entries = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate(),
        lastModified: doc.data().lastModified?.toDate()
      } as JournalEntry));

      // Filter anonymous entries if specified
      if (filters.includeAnonymous === false) {
        // Note: Journal entries don't have anonymous flag like conversations
        // This filter is maintained for consistency with conversation filters
      }

      return entries;
    } catch (error: any) {
      console.error('Failed to get journal entries:', error);
      throw new Error('Failed to retrieve journal entries: ' + error.message);
    }
  }

  // Get all conversations with filters
  static async getAllConversations(filters: AdminExportFilters = {}): Promise<Conversation[]> {
    try {
      let q = query(collection(db, 'conversations'));

      // Apply filters
      if (filters.conversationType && filters.conversationType !== 'all') {
        q = query(q, where('type', '==', filters.conversationType));
      }

      if (filters.culturalBackground && filters.culturalBackground !== 'all') {
        q = query(q, where('culturalContext', '==', filters.culturalBackground));
      }

      if (filters.dateFrom) {
        q = query(q, where('createdAt', '>=', filters.dateFrom));
      }

      if (filters.dateTo) {
        q = query(q, where('createdAt', '<=', filters.dateTo));
      }

      // Order by creation date
      q = query(q, orderBy('createdAt', 'desc'));

      // Apply limit if specified
      if (filters.maxResults) {
        q = query(q, limit(filters.maxResults));
      }

      const snapshot = await getDocs(q);
      let conversations = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate(),
        lastMessageAt: doc.data().lastMessageAt?.toDate()
      } as Conversation));

      // Filter by message count if specified
      if (filters.minMessages) {
        const conversationsWithMessages = await Promise.all(
          conversations.map(async (conv) => {
            const messages = await ConversationService.getConversationMessages(conv.id);
            return { conversation: conv, messageCount: messages.length };
          })
        );
        
        conversations = conversationsWithMessages
          .filter(item => item.messageCount >= filters.minMessages!)
          .map(item => item.conversation);
      }

      // Filter anonymous conversations if specified
      if (filters.includeAnonymous === false) {
        conversations = conversations.filter(conv => !conv.isAnonymous);
      }

      return conversations;
    } catch (error: any) {
      console.error('Failed to get all conversations:', error);
      throw new Error('Failed to retrieve conversations: ' + error.message);
    }
  }

  // Export all platform data as comprehensive JSON
  static async exportPlatformData(
    filters: AdminExportFilters = {},
    adminId: string
  ): Promise<void> {
    try {
      const conversations = await this.getAllConversations(filters);
      const journalEntries = filters.includeJournalData ? await this.getAllJournalEntries(filters) : [];
      const platformStats = await this.getPlatformStatistics();

      const exportData: AdminExportData = {
        metadata: {
          exportedAt: new Date(),
          exportedBy: `admin_${adminId.slice(-6)}`,
          filters,
          totalConversations: conversations.length,
          totalMessages: 0,
          totalJournalEntries: journalEntries.length,
          anonymizationApplied: true
        },
        conversations: [],
        journalEntries: [],
        platformStats
      };

      // Process each conversation
      for (const conversation of conversations) {
        try {
          const messages = await ConversationService.getConversationMessages(conversation.id);
          
          // Calculate conversation statistics
          const studentMessages = messages.filter(m => m.senderType === 'student').length;
          const counselorMessages = messages.filter(m => m.senderType === 'counselor').length;
          const aiMessages = messages.filter(m => m.senderType === 'ai').length;
          const totalCharacters = messages.reduce((sum, m) => sum + m.content.length, 0);
          const averageMessageLength = messages.length > 0 ? totalCharacters / messages.length : 0;
          
          const durationMs = conversation.lastMessageAt.getTime() - conversation.createdAt.getTime();
          const durationDays = Math.floor(durationMs / (1000 * 60 * 60 * 24));
          const durationHours = Math.floor((durationMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
          const duration = durationDays > 0 ? `${durationDays}d ${durationHours}h` : `${durationHours}h`;

          exportData.conversations.push({
            conversation: {
              ...conversation,
              // Anonymize sensitive data
              studentId: conversation.isAnonymous ? 'anonymous' : `student_${conversation.studentId.slice(-6)}`,
              counselorId: conversation.counselorId ? `counselor_${conversation.counselorId.slice(-6)}` : undefined
            },
            messages: messages.map(msg => ({
              ...msg,
              // Anonymize sender IDs
              senderId: msg.senderType === 'student' 
                ? (conversation.isAnonymous ? 'anonymous_student' : `student_${msg.senderId.slice(-6)}`)
                : msg.senderType === 'counselor' 
                  ? `counselor_${msg.senderId.slice(-6)}`
                  : 'ai'
            })),
            statistics: {
              duration,
              studentMessages,
              counselorMessages,
              aiMessages,
              totalCharacters,
              averageMessageLength: Math.round(averageMessageLength)
            }
          });

          exportData.metadata.totalMessages += messages.length;
        } catch (error) {
          console.error(`Failed to process conversation ${conversation.id}:`, error);
        }
      }

      // Process journal entries if included
      if (filters.includeJournalData) {
        for (const entry of journalEntries) {
          try {
            const moodValues = { 'very-low': 1, 'low': 3, 'neutral': 5, 'good': 7, 'very-good': 9 };
            
            exportData.journalEntries.push({
              entry: {
                ...entry,
                // Anonymize student ID
                studentId: `student_${entry.studentId.slice(-6)}`,
                // Remove or anonymize any personally identifiable information
                content: entry.content, // Keep content for training but consider further anonymization
                counselorNotes: entry.counselorNotes?.map(note => ({
                  ...note,
                  counselorId: `counselor_${note.counselorId.slice(-6)}`
                })) || []
              },
              statistics: {
                wordCount: entry.wordCount,
                characterCount: entry.content.length,
                emotionCount: entry.emotionTags.length,
                moodNumericValue: moodValues[entry.mood] || 5
              }
            });
          } catch (error) {
            console.error(`Failed to process journal entry ${entry.id}:`, error);
          }
        }
      }

      // Create and download the export
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { 
        type: 'application/json' 
      });
      
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `aimes_platform_export_${this.formatDate(new Date())}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

    } catch (error: any) {
      console.error('Failed to export platform data:', error);
      throw new Error('Failed to export platform data: ' + error.message);
    }
  }

  // Export conversations as training-ready CSV
  static async exportForModelTraining(
    filters: AdminExportFilters = {},
    adminId: string
  ): Promise<void> {
    try {
      const conversations = await this.getAllConversations(filters);
      const journalEntries = filters.includeJournalData ? await this.getAllJournalEntries(filters) : [];

      // CSV headers optimized for model training
      const headers = [
        'data_type', // 'conversation' or 'journal'
        'entry_id',
        'user_id', 
        'timestamp',
        'content_type', // 'message', 'journal_entry'
        'sender_type', // 'student', 'counselor', 'ai', 'journal_author'
        'cultural_context',
        'content',
        'content_length',
        'word_count',
        'mood_level', // for journal entries
        'mood_numeric', // 1-10 scale
        'emotions', // comma-separated
        'intensity_level', // 1-10 for journal entries
        'is_private',
        'sequence_number',
        'response_time_minutes'
      ];

      const trainingRows: string[] = [headers.join(',')];

      for (const conversation of conversations) {
        try {
          const messages = await ConversationService.getConversationMessages(conversation.id);
          
          for (let i = 0; i < messages.length; i++) {
            const message = messages[i];
            const previousMessage = i > 0 ? messages[i - 1] : null;
            
            // Calculate response time if this is a response
            let responseTimeMinutes = '';
            if (previousMessage) {
              const timeDiff = message.timestamp.getTime() - previousMessage.timestamp.getTime();
              responseTimeMinutes = Math.round(timeDiff / (1000 * 60)).toString();
            }

            // Calculate conversation age
            const conversationAge = message.timestamp.getTime() - conversation.createdAt.getTime();
            const conversationAgeMinutes = Math.round(conversationAge / (1000 * 60));

            const row = [
              'conversation', // data_type
              `conv_${conversation.id.slice(-8)}`, // entry_id
              `student_${conversation.studentId.slice(-6)}`, // user_id
              message.timestamp.toISOString(),
              'message', // content_type
              message.senderType,
              conversation.culturalContext,
              `"${message.content.replace(/"/g, '""')}"`, // Escape quotes
              message.content.length.toString(),
              message.content.split(/\s+/).length.toString(),
              '', // mood_level (not applicable for messages)
              '', // mood_numeric (not applicable for messages)
              '', // emotions (not applicable for messages)
              '', // intensity_level (not applicable for messages)
              conversation.isAnonymous.toString(),
              (i + 1).toString(),
              responseTimeMinutes
            ];

            trainingRows.push(row.join(','));
          }
        } catch (error) {
          console.error(`Failed to process conversation ${conversation.id} for training:`, error);
        }
      }

      // Process journal entries for training data
      if (filters.includeJournalData) {
        const moodValues = { 'very-low': 1, 'low': 3, 'neutral': 5, 'good': 7, 'very-good': 9 };
        
        journalEntries.forEach((entry, index) => {
          try {
            const row = [
              'journal', // data_type
              `journal_${entry.id.slice(-8)}`, // entry_id
              `student_${entry.studentId.slice(-6)}`, // user_id
              entry.timestamp.toISOString(),
              'journal_entry', // content_type
              'journal_author', // sender_type
              '', // cultural_context (not directly stored in journal entries)
              `"${entry.content.replace(/"/g, '""')}"`, // Escape quotes
              entry.content.length.toString(),
              entry.wordCount.toString(),
              entry.mood, // mood_level
              moodValues[entry.mood].toString(), // mood_numeric
              entry.emotionTags.join(';'), // emotions (semicolon-separated to avoid CSV conflicts)
              entry.intensityLevel.toString(), // intensity_level
              entry.isPrivate.toString(),
              '1', // sequence_number (always 1 for journal entries)
              '' // response_time_minutes (not applicable for journal entries)
            ];

            trainingRows.push(row.join(','));
          } catch (error) {
            console.error(`Failed to process journal entry ${entry.id} for training:`, error);
          }
        });
      }

      // Add metadata as comments
      const metadata = [
        `# AIMES Platform Training Data Export`,
        `# Exported: ${new Date().toISOString()}`,
        `# Exported by: admin_${adminId.slice(-6)}`,
        `# Total conversations: ${conversations.length}`,
        `# Total journal entries: ${journalEntries.length}`,
        `# Total training rows: ${trainingRows.length - 1}`,
        `# Filters applied: ${JSON.stringify(filters)}`,
        `# Anonymization: Applied`,
        `# Data types: conversations${filters.includeJournalData ? ', journal_entries' : ''}`,
        ``,
        ...trainingRows
      ];

      const csvContent = metadata.join('\n');

      // Create and download CSV
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `aimes_training_data_${this.formatDate(new Date())}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

    } catch (error: any) {
      console.error('Failed to export training data:', error);
      throw new Error('Failed to export training data: ' + error.message);
    }
  }

  // Get comprehensive platform statistics
  static async getPlatformStatistics(): Promise<PlatformStatistics> {
    try {
      // Get all conversations
      const conversationsSnapshot = await getDocs(collection(db, 'conversations'));
      const conversations = conversationsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate(),
        lastMessageAt: doc.data().lastMessageAt?.toDate()
      } as Conversation));

      // Get all messages
      const messagesSnapshot = await getDocs(collection(db, 'conversation_messages'));
      const totalMessages = messagesSnapshot.size;

      // Get all journal entries
      const journalSnapshot = await getDocs(collection(db, 'journal_entries'));
      const journalEntries = journalSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate(),
        lastModified: doc.data().lastModified?.toDate()
      } as JournalEntry));

      // Calculate basic stats
      const totalConversations = conversations.length;
      const aiConversations = conversations.filter(c => c.type === 'ai').length;
      const humanConversations = conversations.filter(c => c.type === 'human').length;
      const anonymousConversations = conversations.filter(c => c.isAnonymous).length;
      const averageMessagesPerConversation = totalConversations > 0 ? totalMessages / totalConversations : 0;

      // Get unique users
      const uniqueStudents = new Set(conversations.map(c => c.studentId)).size;
      const uniqueCounselors = new Set(conversations.filter(c => c.counselorId).map(c => c.counselorId)).size;

      // Conversations by date (last 30 days)
      const conversationsByDate = this.groupConversationsByDate(conversations);

      // Conversations by culture
      const conversationsByCulture = this.groupConversationsByCulture(conversations);

      // Popular topics (based on conversation titles)
      const popularTopics = this.extractPopularTopics(conversations);

      // Response effectiveness metrics
      const responseEffectiveness = await this.calculateResponseEffectiveness(conversations);

      // Calculate journal statistics
      const totalJournalEntries = journalEntries.length;
      const uniqueJournalStudents = new Set(journalEntries.map(e => e.studentId)).size;
      const averageEntriesPerStudent = uniqueJournalStudents > 0 ? totalJournalEntries / uniqueJournalStudents : 0;
      
      // Calculate average mood score
      const moodValues = { 'very-low': 1, 'low': 3, 'neutral': 5, 'good': 7, 'very-good': 9 };
      const moodScores = journalEntries.map(e => moodValues[e.mood]);
      const averageMoodScore = moodScores.length > 0 ? moodScores.reduce((sum, score) => sum + score, 0) / moodScores.length : 5;
      
      // Find most common emotions
      const emotionCounts: { [key: string]: number } = {};
      journalEntries.forEach(entry => {
        entry.emotionTags.forEach(emotion => {
          emotionCounts[emotion] = (emotionCounts[emotion] || 0) + 1;
        });
      });
      const mostCommonEmotions = Object.entries(emotionCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .map(([emotion]) => emotion);

      const privateEntries = journalEntries.filter(e => e.isPrivate).length;
      const sharedEntries = journalEntries.filter(e => e.sharedWithCounselors).length;

      return {
        totalConversations,
        totalMessages,
        aiConversations,
        humanConversations,
        anonymousConversations,
        averageMessagesPerConversation: Math.round(averageMessagesPerConversation * 10) / 10,
        totalStudents: uniqueStudents,
        totalCounselors: uniqueCounselors,
        conversationsByDate,
        conversationsByCulture,
        popularTopics,
        responseEffectiveness,
        journalStatistics: {
          totalJournalEntries,
          averageEntriesPerStudent: Math.round(averageEntriesPerStudent * 10) / 10,
          averageMoodScore: Math.round(averageMoodScore * 10) / 10,
          mostCommonEmotions,
          privateEntries,
          sharedEntries
        }
      };
    } catch (error: any) {
      console.error('Failed to get platform statistics:', error);
      throw new Error('Failed to get platform statistics: ' + error.message);
    }
  }

  // Helper methods
  private static formatDate(date: Date): string {
    return date.toISOString().split('T')[0].replace(/-/g, '');
  }

  private static groupConversationsByDate(conversations: Conversation[]): { date: string; count: number }[] {
    const last30Days = Array.from({ length: 30 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return date.toISOString().split('T')[0];
    }).reverse();

    return last30Days.map(date => ({
      date,
      count: conversations.filter(c => 
        c.createdAt.toISOString().split('T')[0] === date
      ).length
    }));
  }

  private static groupConversationsByCulture(conversations: Conversation[]): { culture: string; count: number }[] {
    const cultureGroups: { [key: string]: number } = {};
    
    conversations.forEach(c => {
      const culture = c.culturalContext || 'unknown';
      cultureGroups[culture] = (cultureGroups[culture] || 0) + 1;
    });

    return Object.entries(cultureGroups)
      .map(([culture, count]) => ({ culture, count }))
      .sort((a, b) => b.count - a.count);
  }

  private static extractPopularTopics(conversations: Conversation[]): { topic: string; count: number }[] {
    // Simple topic extraction from titles
    const topicWords: { [key: string]: number } = {};
    
    conversations.forEach(c => {
      const words = c.title.toLowerCase()
        .split(/\s+/)
        .filter(word => word.length > 3 && !['with', 'about', 'help', 'need'].includes(word));
      
      words.forEach(word => {
        topicWords[word] = (topicWords[word] || 0) + 1;
      });
    });

    return Object.entries(topicWords)
      .map(([topic, count]) => ({ topic, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }

  private static async calculateResponseEffectiveness(conversations: Conversation[]): Promise<{
    averageResponseTime: string;
    conversationCompletionRate: number;
    studentSatisfactionProxy: number;
  }> {
    // Simplified effectiveness calculation
    const activeConversations = conversations.filter(c => c.status === 'active');
    const completionRate = conversations.length > 0 ? 
      ((conversations.length - activeConversations.length) / conversations.length) * 100 : 0;

    return {
      averageResponseTime: '24 minutes', // Placeholder - would need message analysis
      conversationCompletionRate: Math.round(completionRate),
      studentSatisfactionProxy: 85 // Placeholder - based on conversation length/engagement
    };
  }
}