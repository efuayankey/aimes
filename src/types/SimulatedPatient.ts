import { CulturalBackground } from './User';

export type MentalHealthConcern = 
  | 'anxiety' 
  | 'depression' 
  | 'family-conflict' 
  | 'academic-stress' 
  | 'identity-issues'
  | 'relationship-issues'
  | 'cultural-adjustment'
  | 'perfectionism';

export type Gender = 'male' | 'female' | 'non-binary';

export type SessionOutcome = 'completed' | 'abandoned' | 'ongoing';

export interface SimulatedPatient {
  id: string;
  name: string;
  culturalBackground: CulturalBackground;
  gender: Gender;
  age: number;
  mentalHealthConcern: MentalHealthConcern;
  personalityTraits: string[];
  backstory: string;
  sessionGoals: string[];
  communicationStyle: 'direct' | 'indirect' | 'mixed';
  emotionalExpression: 'open' | 'reserved' | 'selective';
  trustLevel: 'high' | 'medium' | 'low'; // How quickly they open up
  culturalFactors: string[]; // Specific cultural elements affecting their case
}

export interface SimulationSession {
  id: string;
  counselorId: string;
  simulatedPatient: SimulatedPatient;
  sessionStarted: Date;
  sessionEnded?: Date;
  messages: SimulationMessage[];
  sessionOutcome: SessionOutcome;
  counselorFeedback?: string;
  sessionDuration?: number; // in minutes
  analysisResults?: SessionAnalysisResults;
}

export interface SimulationMessage {
  id: string;
  sessionId: string;
  content: string;
  senderType: 'counselor' | 'patient';
  timestamp: Date;
  messageNumber: number;
  emotionalTone?: string;
  culturalReferences?: string[];
}

export interface SessionAnalysisResults {
  culturalCompetencyScore: number;
  empathyScore: number;
  therapeuticProgressScore: number;
  sessionFlowScore: number;
  overallScore: number;
  strengths: string[];
  improvements: string[];
  culturalHighlights: string[];
  missedOpportunities: string[];
}

export interface PatientPersonaPrompt {
  basePersona: string;
  culturalNuances: string[];
  commonResponses: string[];
  progressionStages: string[];
  triggerTopics: string[]; // Topics that might cause strong reactions
  culturalStrengths: string[]; // Cultural resources they might reference
}

export interface PatientSimulationPrompts {
  [key: string]: { // Format: "culturalBackground-gender-concern"
    [concern in MentalHealthConcern]?: PatientPersonaPrompt;
  };
}

export interface ValidationFeedback {
  id: string;
  participantId: string;
  culturalBackground: CulturalBackground;
  simulatedSessionId: string;
  authenticity: {
    culturalAccuracy: number;      // 1-10 scale
    languagePatterns: number;      // Realistic speech patterns
    emotionalResponses: number;    // Authentic emotional reactions
    culturalReferences: number;    // Appropriate cultural references
    overallAuthenticity: number;   // Overall believability
  };
  improvements: string[];
  positiveAspects: string[];
  overallRating: number;
  participantComments?: string;
  submittedAt: Date;
}

export interface TrainingEffectiveness {
  id: string;
  counselorId: string;
  preTrainingScores?: SessionAnalysisResults;
  postTrainingScores?: SessionAnalysisResults;
  improvementAreas: string[];
  confidenceRating: number;       // 1-10: How confident they feel
  systemUsability: number;        // 1-10: How easy was the system to use
  feedbackHelpfulness: number;    // 1-10: How helpful was the feedback
  wouldRecommend: boolean;
  additionalComments?: string;
  completedAt: Date;
}

export interface PatientGenerationOptions {
  culturalBackground?: CulturalBackground;
  gender?: Gender;
  concern?: MentalHealthConcern;
  ageRange?: [number, number];
  complexityLevel?: 'beginner' | 'intermediate' | 'advanced';
}

// Constants for random generation
export const PERSONALITY_TRAITS = [
  'introverted', 'extroverted', 'analytical', 'emotional', 'practical', 
  'idealistic', 'independent', 'family-oriented', 'ambitious', 'laid-back',
  'perfectionist', 'flexible', 'traditional', 'progressive', 'spiritual',
  'skeptical', 'optimistic', 'pessimistic', 'resilient', 'sensitive'
] as const;

export const COMMUNICATION_STYLES = {
  direct: 'Speaks openly and directly about feelings and problems',
  indirect: 'Uses subtle hints and expects counselor to read between lines',
  mixed: 'Sometimes direct, sometimes indirect depending on topic comfort level'
} as const;

export const EMOTIONAL_EXPRESSION_STYLES = {
  open: 'Easily shares emotions and personal experiences',
  reserved: 'Takes time to open up, may minimize emotional impact',
  selective: 'Open about some topics but guarded about others'
} as const;

export const TRUST_LEVELS = {
  high: 'Trusts counselor quickly, open to feedback',
  medium: 'Cautiously optimistic, needs to feel heard first',
  low: 'Skeptical of counseling, may test counselor initially'
} as const;