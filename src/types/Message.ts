import { CulturalBackground } from './User';

export type MessageType = 'support-request' | 'journal-entry';
export type ResponseType = 'ai' | 'human' | 'none';
export type MessageStatus = 'pending' | 'claimed' | 'answered' | 'archived';
export type MessagePriority = 'low' | 'medium' | 'high' | 'urgent';

export interface Message {
  id: string;
  studentId: string;
  content: string;
  messageType: MessageType;
  responseType: ResponseType;
  status: MessageStatus;
  priority: MessagePriority;
  culturalContext: CulturalBackground;
  timestamp: Date;
  updatedAt: Date;
  
  // Metadata
  tags: string[];
  estimatedResponseTime?: number; // in minutes
  isAnonymous: boolean;
  
  // Counselor assignment
  claimedBy?: string; // counselor ID
  claimedAt?: Date;
  responseDeadline?: Date;
  
  // Context from journal entries (if student opts to share)
  sharedJournalContext?: JournalContext[];
  
  // Response tracking
  responses: Response[];
  responseCount: number;
}

export interface Response {
  id: string;
  messageId: string;
  responderId: string; // counselor ID or 'ai'
  responderType: 'ai' | 'human';
  responderName?: string; // for human counselors
  content: string;
  timestamp: Date;
  readByStudent?: boolean; // For notification tracking
  
  // Quality metrics and feedback
  feedback?: ResponseFeedback;
  
  // AI response metadata
  aiModel?: string;
  promptTokens?: number;
  completionTokens?: number;
  
  // Human response metadata
  timeSpentMinutes?: number;
  revisionCount?: number;
}

export interface ResponseFeedback {
  // AI-generated scores (1-10)
  empathyScore?: number;
  culturalSensitivityScore?: number;
  questioningScore?: number;
  goalOrientationScore?: number;
  professionalismScore?: number;
  
  // Overall assessment
  overallRating?: number;
  aiAnalysis?: string;
  improvementSuggestions?: string[];
  
  // Counselor self-assessment
  selfRating?: number;
  selfReflection?: string;
  
  // Metadata
  analyzedAt: Date;
  feedbackVersion: string;
}

export interface JournalContext {
  entryId: string;
  date: Date;
  mood: string;
  emotionTags: string[];
  relevantSnippet?: string; // Relevant portion of journal entry
}

// Queue management types
export interface MessageQueue {
  pendingMessages: Message[];
  claimedMessages: Message[];
  respondedMessages: Message[];
  archivedMessages: Message[];
}

export interface QueueStats {
  totalPending: number;
  totalClaimed: number;
  averageWaitTime: number;
  oldestPendingAge: number; // in minutes
  counselorsOnline: number;
}

// Message composition types
export interface MessageDraft {
  content: string;
  responseType: ResponseType;
  priority: MessagePriority;
  isAnonymous: boolean;
  includeJournalContext: boolean;
  selectedJournalEntries?: string[]; // journal entry IDs
}

export interface MessageSubmission {
  draft: MessageDraft;
  culturalContext: CulturalBackground;
  studentId: string;
  estimatedTokens?: number;
  conversationId?: string; // For continuing existing conversations
}

// New types for continuous conversations
export interface Conversation {
  id: string;
  studentId: string;
  counselorId?: string; // Assigned counselor for human conversations
  type: 'ai' | 'human';
  title: string; // Auto-generated or user-set
  status: 'active' | 'closed' | 'archived';
  culturalContext: CulturalBackground;
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
  lastMessageAt: Date;
  messageCount: number;
  
  // Conversation settings
  isAnonymous: boolean;
  priority: MessagePriority;
  tags: string[];
}

export interface ConversationMessage {
  id: string;
  conversationId: string;
  senderId: string; // student or counselor ID
  senderType: 'student' | 'counselor' | 'ai';
  content: string;
  timestamp: Date;
  
  // Message metadata
  readBy: string[]; // Array of user IDs who have read this message
  editedAt?: Date;
  replyTo?: string; // Message ID this is replying to
  
  // AI metadata (if from AI)
  aiModel?: string;
  promptTokens?: number;
  completionTokens?: number;
}

export interface ConversationParticipant {
  conversationId: string;
  userId: string;
  userType: 'student' | 'counselor';
  joinedAt: Date;
  lastReadAt: Date;
  isTyping: boolean;
  role: 'participant' | 'observer'; // For group conversations later
}