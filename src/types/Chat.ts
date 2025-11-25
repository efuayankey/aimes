import { CulturalBackground } from './User';

export type SessionType = 'ai-only' | 'human-only' | 'mixed';
export type MessageSender = 'user' | 'assistant' | 'counselor';

export interface ChatSession {
  id: string;
  studentId: string;
  title: string;
  sessionType: SessionType;
  culturalBackground: CulturalBackground;
  
  // Timing
  startTime: Date;
  lastMessage: Date;
  duration?: number; // in minutes
  
  // Content
  messages: SessionMessage[];
  messageCount: number;
  
  // Metadata
  isActive: boolean;
  isArchived: boolean;
  tags: string[];
  
  // AI session specific
  aiModel?: string;
  totalTokensUsed?: number;
  
  // Human counselor session specific
  counselorId?: string;
  counselorName?: string;
  sessionNotes?: string;
}

export interface SessionMessage {
  id: string;
  sessionId: string;
  content: string;
  sender: MessageSender;
  timestamp: Date;
  
  // Response metadata
  responseType?: 'ai' | 'human';
  responderId?: string; // counselor ID for human responses
  responderName?: string;
  
  // Message processing
  isEdited: boolean;
  editHistory?: MessageEdit[];
  
  // AI response metadata
  aiModel?: string;
  promptTokens?: number;
  completionTokens?: number;
  responseTime?: number; // milliseconds
  
  // Human response metadata
  timeSpentMinutes?: number;
  isFromQueue?: boolean; // if this was a queued message response
  queueMessageId?: string;
  
  // Formatting and display
  formattedContent?: string;
  hasRichContent: boolean;
  attachments?: MessageAttachment[];
}

export interface MessageEdit {
  originalContent: string;
  editedContent: string;
  editedAt: Date;
  reason?: string;
}

export interface MessageAttachment {
  id: string;
  type: 'image' | 'document' | 'link' | 'resource';
  url: string;
  name: string;
  size?: number;
  mimeType?: string;
}

// Chat context and state management
export interface ChatState {
  currentSession: ChatSession | null;
  sessions: ChatSession[];
  isTyping: boolean;
  isConnected: boolean;
  culturalBackground: CulturalBackground | null;
  
  // UI state
  sidebarOpen: boolean;
  showCulturalModal: boolean;
  activeView: 'chat' | 'history' | 'settings';
}

export interface ChatContextType {
  // State
  state: ChatState;
  
  // Session management
  createNewSession: () => Promise<void>;
  loadSession: (sessionId: string) => Promise<void>;
  deleteSession: (sessionId: string) => Promise<void>;
  archiveSession: (sessionId: string) => Promise<void>;
  updateSessionTitle: (sessionId: string, title: string) => Promise<void>;
  
  // Messaging
  sendMessage: (content: string, responseType?: 'ai' | 'human') => Promise<void>;
  editMessage: (messageId: string, newContent: string) => Promise<void>;
  deleteMessage: (messageId: string) => Promise<void>;
  
  // AI interactions
  sendToAI: (message: string, context?: {conversationHistory?: SessionMessage[]; culturalBackground?: CulturalBackground; metadata?: Record<string, unknown>}) => Promise<void>;
  
  // Cultural context
  updateCulturalBackground: (background: CulturalBackground) => Promise<void>;
  
  // Utility
  exportSession: (sessionId: string) => void;
  searchSessions: (query: string) => ChatSession[];
  
  // UI actions
  toggleSidebar: () => void;
  showCulturalModal: () => void;
  hideCulturalModal: () => void;
}