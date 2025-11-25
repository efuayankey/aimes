import { SimulationMessage } from '../types/SimulatedPatient';

interface SessionSummary {
  duration: number; // in minutes
  messageCount: number;
  counselorMessages: number;
  patientMessages: number;
  averageResponseLength: number;
  sessionTopics: string[];
  emotionalProgression: string[];
}

export class SessionEndDetectionService {
  // Phrases that indicate session ending
  private static readonly END_PHRASES = [
    'our time is up',
    'time is up',
    'we need to wrap up',
    'need to wrap up',
    'see you next time',
    'until next session',
    'next session',
    'let\'s schedule our next',
    'schedule our next',
    'that\'s all for today',
    'all for today',
    'we\'ll continue next time',
    'continue next time',
    'end our session',
    'closing our session',
    'session is ending',
    'time to end',
    'have to stop here',
    'stop here for today',
    'we should end',
    'session has ended',
    'good place to stop',
    'place to stop',
    'talk next time',
    'speak next time',
    'time for today',
    'enough for today',
    'conclude our session',
    'wrap up our session'
  ];

  // Professional closing phrases
  private static readonly PROFESSIONAL_CLOSINGS = [
    'thank you for sharing',
    'appreciate your openness',
    'good work today',
    'made great progress',
    'progress today',
    'see you soon',
    'take care',
    'be well',
    'good session',
    'productive session',
    'helpful session'
  ];

  // Session ending indicators
  private static readonly END_INDICATORS = [
    'homework',
    'assignment',
    'between sessions',
    'practice',
    'try this week',
    'work on',
    'focus on',
    'next week',
    'next time we meet',
    'until we meet again'
  ];

  /**
   * Detect if a counselor message indicates session ending
   */
  static detectSessionEnd(message: string): {
    isSessionEnd: boolean;
    confidence: 'high' | 'medium' | 'low';
    indicators: string[];
  } {
    const messageText = message.toLowerCase();
    const foundPhrases: string[] = [];
    let score = 0;

    // Check for direct end phrases (high weight)
    for (const phrase of this.END_PHRASES) {
      if (messageText.includes(phrase)) {
        foundPhrases.push(phrase);
        score += 3;
      }
    }

    // Check for professional closings (medium weight)
    for (const closing of this.PROFESSIONAL_CLOSINGS) {
      if (messageText.includes(closing)) {
        foundPhrases.push(closing);
        score += 2;
      }
    }

    // Check for session ending indicators (low weight)
    for (const indicator of this.END_INDICATORS) {
      if (messageText.includes(indicator)) {
        foundPhrases.push(indicator);
        score += 1;
      }
    }

    // Additional contextual checks
    if (messageText.includes('homework') || messageText.includes('assignment')) {
      score += 1;
    }

    if (messageText.includes('next') && (messageText.includes('time') || messageText.includes('week') || messageText.includes('session'))) {
      score += 2;
    }

    // Determine confidence and result
    let confidence: 'high' | 'medium' | 'low' = 'low';
    let isSessionEnd = false;

    if (score >= 5) {
      confidence = 'high';
      isSessionEnd = true;
    } else if (score >= 3) {
      confidence = 'medium';
      isSessionEnd = true;
    } else if (score >= 2) {
      confidence = 'low';
      isSessionEnd = true;
    }

    return {
      isSessionEnd,
      confidence,
      indicators: foundPhrases
    };
  }

  /**
   * Generate session summary from conversation
   */
  static generateSessionSummary(messages: SimulationMessage[]): SessionSummary {
    const counselorMessages = messages.filter(m => m.senderType === 'counselor');
    const patientMessages = messages.filter(m => m.senderType === 'patient');
    
    // Calculate duration
    const startTime = messages[0]?.timestamp || new Date();
    const endTime = messages[messages.length - 1]?.timestamp || new Date();
    const durationMs = endTime.getTime() - startTime.getTime();
    const duration = Math.round(durationMs / (1000 * 60)); // Convert to minutes

    // Calculate average response length
    const totalLength = messages.reduce((sum, msg) => sum + msg.content.length, 0);
    const averageResponseLength = Math.round(totalLength / messages.length);

    // Extract session topics (simple keyword extraction)
    const sessionTopics = this.extractSessionTopics(messages);

    // Track emotional progression (simplified)
    const emotionalProgression = this.analyzeEmotionalProgression(patientMessages);

    return {
      duration: Math.max(duration, 1), // At least 1 minute
      messageCount: messages.length,
      counselorMessages: counselorMessages.length,
      patientMessages: patientMessages.length,
      averageResponseLength,
      sessionTopics,
      emotionalProgression
    };
  }

  /**
   * Extract main topics discussed in session
   */
  private static extractSessionTopics(messages: SimulationMessage[]): string[] {
    const topicKeywords = {
      'anxiety': ['anxious', 'anxiety', 'worried', 'stress', 'nervous', 'panic'],
      'depression': ['depressed', 'depression', 'sad', 'hopeless', 'down', 'empty'],
      'family': ['family', 'parents', 'mom', 'dad', 'mother', 'father', 'siblings'],
      'academic': ['school', 'studies', 'grades', 'exam', 'test', 'homework', 'college'],
      'relationships': ['friends', 'relationship', 'dating', 'boyfriend', 'girlfriend', 'social'],
      'identity': ['identity', 'who am i', 'belong', 'culture', 'background', 'heritage'],
      'future': ['future', 'career', 'goals', 'plans', 'graduation', 'job']
    };

    const allText = messages.map(m => m.content.toLowerCase()).join(' ');
    const foundTopics: string[] = [];

    for (const [topic, keywords] of Object.entries(topicKeywords)) {
      const found = keywords.some(keyword => allText.includes(keyword));
      if (found) {
        foundTopics.push(topic);
      }
    }

    return foundTopics.length > 0 ? foundTopics : ['general wellbeing'];
  }

  /**
   * Analyze emotional progression through patient messages
   */
  private static analyzeEmotionalProgression(patientMessages: SimulationMessage[]): string[] {
    if (patientMessages.length < 2) return ['exploring'];

    const progression = ['initial concerns'];

    // Analyze message sentiment progression (simplified)
    const messageCount = patientMessages.length;
    
    if (messageCount >= 3) {
      progression.push('opening up');
    }
    
    if (messageCount >= 5) {
      progression.push('deeper exploration');
    }
    
    if (messageCount >= 7) {
      progression.push('gaining insights');
    }

    return progression;
  }

  /**
   * Validate if session had adequate depth for analysis
   */
  static validateSessionForAnalysis(messages: SimulationMessage[]): {
    isValid: boolean;
    issues: string[];
    recommendations: string[];
  } {
    const issues: string[] = [];
    const recommendations: string[] = [];

    const counselorMessages = messages.filter(m => m.senderType === 'counselor');
    const patientMessages = messages.filter(m => m.senderType === 'patient');

    // Check minimum message count
    if (messages.length < 6) {
      issues.push('Session too short - need at least 6 total messages');
      recommendations.push('Aim for longer conversations to demonstrate therapeutic progression');
    }

    // Check counselor participation
    if (counselorMessages.length < 3) {
      issues.push('Too few counselor responses for meaningful analysis');
      recommendations.push('Engage more actively in the therapeutic conversation');
    }

    // Check for balanced conversation
    const counselorToPatientRatio = counselorMessages.length / Math.max(patientMessages.length, 1);
    if (counselorToPatientRatio > 2) {
      issues.push('Counselor may be talking too much - let patient lead more');
      recommendations.push('Practice active listening and allow more patient expression');
    }

    // Check average message length
    const avgCounselorLength = counselorMessages.reduce((sum, msg) => sum + msg.content.length, 0) / Math.max(counselorMessages.length, 1);
    if (avgCounselorLength < 50) {
      issues.push('Counselor responses may be too brief');
      recommendations.push('Provide more thoughtful, detailed responses showing empathy');
    }

    const isValid = issues.length === 0;

    return {
      isValid,
      issues,
      recommendations
    };
  }

  /**
   * Generate end-of-session feedback prompt for patient
   */
  static generatePatientFeedbackPrompt(sessionSummary: SessionSummary): string {
    const topics = sessionSummary.sessionTopics.join(', ');
    const duration = sessionSummary.duration;

    return `
Thank you for this ${duration}-minute training session. We discussed ${topics} and I appreciate your openness in sharing your experiences.

As we end our session today, I'd like you to reflect on how understood and supported you felt during our conversation. Your feedback will help me improve my cultural competency and therapeutic skills.

How are you feeling as we conclude our time together?
    `.trim();
  }
}