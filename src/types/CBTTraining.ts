// CBT Training Module Types

export type CBTTopicId =
  | 'identifying-problems'
  | 'setting-goals'
  | 'thought-records'
  | 'challenging-thoughts'
  | 'behavioral-activation'
  | 'wrapping-up';

export interface CBTExampleByContext {
  concern: string;
  scenario: string;
  counselorExample: string;
  explanation: string;
}

export interface CBTPracticeExercise {
  scenario: string;
  instructions: string;
  hints: string[];
  skillFocus: string;
}

export interface CBTTopic {
  id: CBTTopicId;
  title: string;
  shortDescription: string;
  overview: string;
  cognitiveTriangleConnection: string;
  keyPrinciples: string[];
  steps: string[];
  examples: CBTExampleByContext[];
  exercises: CBTPracticeExercise[];
  simulatorContext: {
    suggestedConcern: string;
    objective: string;
    tips: string[];
  };
}

export interface CBTExerciseFeedback {
  overallScore: number;
  techniqueScore: number;
  empathyScore: number;
  strengths: string[];
  improvements: string[];
  modelResponse: string;
}
