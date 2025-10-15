import { CulturalBackground } from './User';

// Core feedback scoring interfaces
export interface FeedbackScores {
  culturalSensitivity: number;      // 1-10: Respects cultural context
  culturalAwareness: number;        // 1-10: Shows understanding of background
  empathy: number;                  // 1-10: Shows understanding and care
  professionalism: number;          // 1-10: Maintains appropriate boundaries
  actionability: number;            // 1-10: Provides concrete, helpful guidance
  questionQuality: number;          // 1-10: Asks thoughtful, appropriate questions
  languageAppropriate: number;      // 1-10: Uses culturally appropriate language
  responseLength: number;           // 1-10: Appropriate length (not too long/short)
  overall: number;                  // 1-10: Overall response effectiveness
}

export interface CulturalAnalysis {
  assumptions: string[];            // Detected cultural assumptions
  biases: string[];                // Potential cultural biases identified
  strengths: string[];             // Cultural competency strengths
  culturalMisses: string[];        // Missed cultural opportunities
  appropriateReferences: string[]; // Good cultural references made
}

export interface ImprovementSuggestions {
  strengths: string[];             // What the counselor did well
  improvements: string[];          // Specific areas for improvement
  culturalTips: string[];          // Cultural context tips for this background
  alternativeApproaches: string[]; // Different ways to approach the response
  questionsToAsk: string[];        // Better questions for cultural context
}

export interface ResponseContext {
  studentMessage: string;          // Original student message
  counselorResponse: string;       // Counselor's response to analyze
  culturalBackground: CulturalBackground; // Student's cultural context
  conversationHistory: string[];   // Previous messages for context
  studentAge?: number;             // Age context if available
  sessionNumber?: number;          // Session count for relationship context
  urgencyLevel?: 'low' | 'medium' | 'high' | 'crisis'; // Message urgency
}

// New interface for full conversation analysis
export interface ConversationAnalysisContext {
  conversationId: string;
  studentId: string;
  counselorId: string;
  culturalBackground: CulturalBackground;
  
  // Complete conversation thread
  messages: Array<{
    id: string;
    content: string;
    senderType: 'student' | 'counselor' | 'ai';
    timestamp: Date;
    messageNumber: number;
  }>;
  
  // Conversation metadata
  conversationSummary: {
    totalMessages: number;
    studentMessages: number;
    counselorMessages: number;
    aiMessages: number;
    conversationStarted: Date;
    conversationEnded?: Date;
    conversationDuration: string; // e.g., "2 days, 3 hours"
    mainTopics: string[];
    emotionalProgression: string[]; // How student's emotional state changed
    urgencyLevel: 'low' | 'medium' | 'high' | 'crisis';
    conversationOutcome: 'resolved' | 'ongoing' | 'escalated' | 'abandoned';
  };
  
  // Student context
  studentProfile?: {
    age?: number;
    previousSessions?: number;
    culturalNotes?: string[];
    preferredCommunicationStyle?: string;
  };
}

// Enhanced feedback for full conversation analysis
export interface ConversationFeedback {
  id: string;
  conversationId: string;
  counselorId: string;
  studentId: string;
  
  // Overall conversation analysis
  overallPerformance: {
    conversationFlow: number;        // How well conversation progressed (1-10)
    culturalSensitivity: number;     // Cultural awareness throughout (1-10)
    therapeuticProgress: number;     // Student progress/resolution (1-10)
    professionalBoundaries: number;  // Maintained appropriate boundaries (1-10)
    empathy: number;                 // Consistent empathy shown (1-10)
    overallScore: number;            // Weighted average (1-10)
  };
  
  // Detailed conversation analysis
  conversationAnalysis: {
    strengths: string[];              // What counselor did well throughout
    weaknesses: string[];             // Areas that need improvement
    culturalMisses: string[];         // Cultural opportunities missed
    goodCulturalMoments: string[];    // Excellent cultural awareness moments
    conversationPacing: 'too-fast' | 'appropriate' | 'too-slow';
    questioningTechnique: string[];   // Analysis of questions asked
    responseTiming: string;           // Analysis of response patterns
  };
  
  // Specific improvement suggestions
  suggestions: {
    conversationFlow: string[];       // How to improve conversation guidance
    culturalCompetency: string[];     // Cultural sensitivity improvements
    therapeuticTechnique: string[];   // Better therapeutic approaches
    specificMoments: Array<{          // Specific moments to improve
      messageNumber: number;
      issue: string;
      betterApproach: string;
    }>;
    positiveReinforcement: Array<{    // Specific moments that were excellent
      messageNumber: number;
      whatWentWell: string;
      whyItWorked: string;
    }>;
  };
  
  // Context
  analysisContext: ConversationAnalysisContext;
  
  // Metadata
  analyzedAt: Date;
  aiModel: string;
  analysisVersion: string;
  reviewedByCounselor: boolean;
  flaggedForReview: boolean;
  trainingDataQuality: 'high' | 'medium' | 'low';
}

export interface AIFeedback {
  id: string;
  messageId: string;              // ID of the counselor message analyzed
  counselorId: string;            // ID of the counselor who responded
  studentId: string;              // ID of the student (anonymized in exports)
  
  // Analysis results
  scores: FeedbackScores;
  culturalAnalysis: CulturalAnalysis;
  suggestions: ImprovementSuggestions;
  
  // Context
  responseContext: ResponseContext;
  
  // Metadata
  analyzedAt: Date;
  aiModel: string;               // GPT-4, etc.
  analysisVersion: string;       // Version of analysis prompt
  reviewedByCounselor: boolean;  // Has counselor seen this feedback
  counselorRating?: number;      // 1-5: How helpful was this feedback
  
  // Training data flags
  flaggedForReview: boolean;     // Human review needed
  trainingDataQuality: 'high' | 'medium' | 'low'; // Quality for ML training
}

export interface CounselorPerformance {
  counselorId: string;
  timeframe: {
    start: Date;
    end: Date;
  };
  
  // Aggregate scores
  averageScores: FeedbackScores;
  scoresTrend: 'improving' | 'stable' | 'declining';
  
  // Volume metrics
  totalResponses: number;
  totalFeedback: number;
  responsesPerWeek: number;
  
  // Cultural competency
  culturalStrengths: string[];
  culturalAreasForGrowth: string[];
  culturalBackgroundsServed: CulturalBackground[];
  bestPerformingCultures: CulturalBackground[];
  challengingCultures: CulturalBackground[];
  
  // Progress tracking
  improvementAreas: string[];
  consistentStrengths: string[];
  recentImprovements: string[];
  
  // Student outcomes (proxy measures)
  averageConversationLength: number;
  studentReturnRate: number;      // % of students who continue with this counselor
  positiveOutcomeRate: number;    // % of conversations with positive indicators
}

export interface FeedbackFilters {
  counselorId?: string;
  dateFrom?: Date;
  dateTo?: Date;
  culturalBackground?: CulturalBackground | 'all';
  minScore?: number;
  maxScore?: number;
  scoreType?: keyof FeedbackScores;
  flaggedOnly?: boolean;
  highQualityOnly?: boolean;
}

export interface FeedbackAnalytics {
  totalFeedbackEntries: number;
  averageScores: FeedbackScores;
  topPerformingCounselors: Array<{
    counselorId: string;
    counselorName: string;
    averageScore: number;
    culturalStrengths: string[];
  }>;
  culturalCompetencyTrends: Array<{
    culture: CulturalBackground;
    averageScore: number;
    commonIssues: string[];
    improvements: string[];
  }>;
  commonImprovementAreas: Array<{
    area: string;
    frequency: number;
    averageScoreImpact: number;
  }>;
  trainingDataQuality: {
    highQuality: number;
    mediumQuality: number;
    lowQuality: number;
  };
}

// Constants for scoring and analysis
export const SCORE_THRESHOLDS = {
  EXCELLENT: 8.5,
  GOOD: 7.0,
  NEEDS_IMPROVEMENT: 5.5,
  POOR: 4.0
} as const;

export const CULTURAL_BACKGROUNDS_INFO = {
  'african-american': {
    commonFactors: ['community support', 'historical trauma', 'family dynamics', 'church/spirituality'],
    sensitivities: ['stereotypes', 'systemic barriers', 'code-switching'],
    strengths: ['resilience', 'family bonds', 'community ties']
  },
  'latino-hispanic': {
    commonFactors: ['family honor', 'machismo/marianismo', 'immigration stress', 'language barriers'],
    sensitivities: ['documentation status', 'family expectations', 'cultural assimilation'],
    strengths: ['family loyalty', 'community support', 'cultural pride']
  },
  'asian-american': {
    commonFactors: ['academic pressure', 'family expectations', 'mental health stigma', 'model minority myth'],
    sensitivities: ['shame/honor', 'intergenerational conflict', 'career expectations'],
    strengths: ['family support', 'educational values', 'work ethic']
  },
  'east-asian': {
    commonFactors: ['academic achievement', 'face/honor concepts', 'hierarchical relationships', 'mental health stigma'],
    sensitivities: ['family shame', 'perfectionism', 'emotional expression'],
    strengths: ['perseverance', 'respect for education', 'family loyalty']
  },
  'south-asian': {
    commonFactors: ['arranged marriages', 'caste considerations', 'religious practices', 'intergenerational conflict'],
    sensitivities: ['honor/shame', 'gender roles', 'family expectations'],
    strengths: ['strong family ties', 'educational emphasis', 'spiritual practices']
  },
  'middle-eastern': {
    commonFactors: ['religious practices', 'family honor', 'gender roles', 'immigration experiences'],
    sensitivities: ['discrimination', 'cultural misunderstanding', 'religious freedom'],
    strengths: ['family support', 'community ties', 'resilience']
  },
  'native-american': {
    commonFactors: ['historical trauma', 'connection to land', 'tribal identity', 'cultural preservation'],
    sensitivities: ['cultural appropriation', 'sovereignty issues', 'traditional healing'],
    strengths: ['spiritual connection', 'community support', 'cultural wisdom']
  },
  'african': {
    commonFactors: ['community orientation', 'extended family', 'religious practices', 'immigration challenges'],
    sensitivities: ['cultural differences', 'language barriers', 'economic pressures'],
    strengths: ['community support', 'resilience', 'cultural pride']
  },
  'white-american': {
    commonFactors: ['individualism', 'nuclear family', 'socioeconomic factors', 'regional differences'],
    sensitivities: ['privilege awareness', 'cultural blind spots', 'diversity understanding'],
    strengths: ['direct communication', 'self-advocacy', 'resource access']
  },
  'multiracial': {
    commonFactors: ['identity navigation', 'belonging questions', 'family dynamics', 'cultural code-switching'],
    sensitivities: ['identity validation', 'cultural authenticity', 'discrimination'],
    strengths: ['cultural adaptability', 'multiple perspectives', 'bridge-building']
  }
} as const;

export const FEEDBACK_CATEGORIES = {
  CULTURAL_COMPETENCY: 'cultural_competency',
  THERAPEUTIC_SKILLS: 'therapeutic_skills',
  COMMUNICATION: 'communication',
  PROFESSIONAL_DEVELOPMENT: 'professional_development'
} as const;

export type FeedbackCategory = typeof FEEDBACK_CATEGORIES[keyof typeof FEEDBACK_CATEGORIES];