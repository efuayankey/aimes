// Counselor feedback service with AI analysis
import { ResponseFeedback, Response, ConversationMessage } from '../types';
import { ENV } from '../config/env';

export interface FeedbackAnalysisRequest {
  responseContent: string;
  studentMessage: string;
  conversationHistory?: ConversationMessage[];
  counselorId: string;
  culturalContext: string;
}

export interface CounselorFeedbackSubmission {
  responseId: string;
  selfRating: number; // 1-10
  selfReflection: string;
  areas: {
    empathy: number;
    culturalSensitivity: number;
    questioning: number;
    goalOrientation: number;
    professionalism: number;
  };
  improvementGoals: string[];
  timeSpent: number; // minutes
}

export interface AIFeedbackAnalysis {
  empathyScore: number;
  culturalSensitivityScore: number;
  questioningScore: number;
  goalOrientationScore: number;
  professionalismScore: number;
  overallRating: number;
  aiAnalysis: string;
  improvementSuggestions: string[];
  strengths: string[];
  culturalConsiderations: string[];
}

export class FeedbackService {
  
  /**
   * Generate AI-powered feedback analysis for a counselor response
   */
  static async generateAIFeedback(request: FeedbackAnalysisRequest): Promise<AIFeedbackAnalysis> {
    try {
      console.log('Generating AI feedback for response:', request.responseContent.substring(0, 100));
      
      // Mock AI analysis for development (replace with actual OpenAI call in production)
      const mockAnalysis = await this.mockAIAnalysis(request);
      
      return mockAnalysis;
    } catch (error) {
      console.error('Failed to generate AI feedback:', error);
      throw error;
    }
  }

  /**
   * Submit counselor self-feedback and get combined analysis
   */
  static async submitCounselorFeedback(
    submission: CounselorFeedbackSubmission,
    aiAnalysis: AIFeedbackAnalysis
  ): Promise<ResponseFeedback> {
    try {
      const feedback: ResponseFeedback = {
        // AI scores
        empathyScore: aiAnalysis.empathyScore,
        culturalSensitivityScore: aiAnalysis.culturalSensitivityScore,
        questioningScore: aiAnalysis.questioningScore,
        goalOrientationScore: aiAnalysis.goalOrientationScore,
        professionalismScore: aiAnalysis.professionalismScore,
        
        // Overall assessment
        overallRating: aiAnalysis.overallRating,
        aiAnalysis: aiAnalysis.aiAnalysis,
        improvementSuggestions: aiAnalysis.improvementSuggestions,
        
        // Counselor self-assessment
        selfRating: submission.selfRating,
        selfReflection: submission.selfReflection,
        
        // Metadata
        analyzedAt: new Date(),
        feedbackVersion: '1.0'
      };

      console.log('Feedback generated:', feedback);
      
      return feedback;
    } catch (error) {
      console.error('Failed to submit counselor feedback:', error);
      throw error;
    }
  }

  /**
   * Get counselor analytics and improvement insights
   */
  static async getCounselorAnalytics(counselorId: string, timeframe: '7d' | '30d' | '90d' = '30d') {
    try {
      const mockAnalytics = {
        averageScores: {
          empathy: 7.8,
          culturalSensitivity: 8.2,
          questioning: 7.5,
          goalOrientation: 8.0,
          professionalism: 8.5
        },
        overallRating: 8.0,
        totalResponses: 45,
        improvementTrends: {
          empathy: +0.3,
          culturalSensitivity: +0.1,
          questioning: +0.5,
          goalOrientation: +0.2,
          professionalism: 0
        },
        commonStrengths: [
          'Excellent active listening skills',
          'Strong cultural awareness',
          'Professional tone and demeanor'
        ],
        improvementAreas: [
          'Could ask more open-ended questions',
          'Consider more goal-oriented approaches'
        ],
        responseCount: 45,
        averageResponseTime: 28, // minutes
        studentSatisfaction: 8.7
      };

      return mockAnalytics;
    } catch (error) {
      console.error('Failed to get counselor analytics:', error);
      throw error;
    }
  }

  /**
   * Mock AI analysis for development (replace with OpenAI API call)
   */
  private static async mockAIAnalysis(request: FeedbackAnalysisRequest): Promise<AIFeedbackAnalysis> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Generate realistic mock scores based on content analysis
    const responseLength = request.responseContent.length;
    const hasQuestions = request.responseContent.includes('?');
    const hasValidation = /feel|understand|hear|difficult|challenging/i.test(request.responseContent);
    const hasCulturalAwareness = /culture|background|family|community/i.test(request.responseContent);

    const baseScore = 6.5;
    const empathyBonus = hasValidation ? 1.5 : 0;
    const questioningBonus = hasQuestions ? 1.2 : 0;
    const culturalBonus = hasCulturalAwareness ? 1.0 : 0;
    const lengthBonus = responseLength > 100 && responseLength < 500 ? 0.8 : 0;

    return {
      empathyScore: Math.min(10, Math.round((baseScore + empathyBonus + Math.random() * 0.5) * 10) / 10),
      culturalSensitivityScore: Math.min(10, Math.round((baseScore + culturalBonus + Math.random() * 0.5) * 10) / 10),
      questioningScore: Math.min(10, Math.round((baseScore + questioningBonus + Math.random() * 0.5) * 10) / 10),
      goalOrientationScore: Math.min(10, Math.round((baseScore + lengthBonus + Math.random() * 0.5) * 10) / 10),
      professionalismScore: Math.min(10, Math.round((baseScore + 1.2 + Math.random() * 0.3) * 10) / 10),
      overallRating: Math.min(10, Math.round((baseScore + (empathyBonus + questioningBonus + culturalBonus + lengthBonus) / 4) * 10) / 10),
      
      aiAnalysis: this.generateMockAnalysis(request, hasValidation, hasQuestions, hasCulturalAwareness),
      improvementSuggestions: this.generateImprovementSuggestions(hasValidation, hasQuestions, hasCulturalAwareness),
      strengths: this.generateStrengths(hasValidation, hasQuestions, hasCulturalAwareness),
      culturalConsiderations: this.generateCulturalConsiderations(request.culturalContext)
    };
  }

  private static generateMockAnalysis(
    request: FeedbackAnalysisRequest, 
    hasValidation: boolean, 
    hasQuestions: boolean, 
    hasCulturalAwareness: boolean
  ): string {
    let analysis = "Your response demonstrates ";
    
    if (hasValidation) {
      analysis += "strong empathetic listening skills and emotional validation. ";
    }
    
    if (hasQuestions) {
      analysis += "Good use of open-ended questions to encourage reflection. ";
    } else {
      analysis += "Consider incorporating more questions to promote deeper self-exploration. ";
    }
    
    if (hasCulturalAwareness) {
      analysis += "Excellent cultural sensitivity and awareness of the student's background. ";
    }
    
    analysis += "The response maintains appropriate professional boundaries while being warm and supportive.";
    
    return analysis;
  }

  private static generateImprovementSuggestions(
    hasValidation: boolean, 
    hasQuestions: boolean, 
    hasCulturalAwareness: boolean
  ): string[] {
    const suggestions = [];
    
    if (!hasValidation) {
      suggestions.push("Incorporate more validation of the student's emotions and experiences");
    }
    
    if (!hasQuestions) {
      suggestions.push("Use more open-ended questions to encourage deeper reflection");
    }
    
    if (!hasCulturalAwareness) {
      suggestions.push("Consider the student's cultural background in your response");
    }
    
    suggestions.push("Consider summarizing key points to ensure understanding");
    suggestions.push("Explore specific actionable steps the student could take");
    
    return suggestions.slice(0, 3);
  }

  private static generateStrengths(
    hasValidation: boolean, 
    hasQuestions: boolean, 
    hasCulturalAwareness: boolean
  ): string[] {
    const strengths = [];
    
    if (hasValidation) {
      strengths.push("Excellent emotional validation and empathetic listening");
    }
    
    if (hasQuestions) {
      strengths.push("Effective use of questioning techniques");
    }
    
    if (hasCulturalAwareness) {
      strengths.push("Strong cultural sensitivity and awareness");
    }
    
    strengths.push("Professional and supportive communication style");
    strengths.push("Clear and thoughtful expression");
    
    return strengths.slice(0, 3);
  }

  private static generateCulturalConsiderations(culturalContext: string): string[] {
    const considerations = [];
    
    switch (culturalContext) {
      case 'african-american':
        considerations.push("Consider historical context and systemic factors");
        considerations.push("Acknowledge strength of community and family ties");
        break;
      case 'latino-hispanic':
        considerations.push("Family (familia) plays a central role in decision-making");
        considerations.push("Consider religious/spiritual beliefs in coping strategies");
        break;
      case 'asian-american':
        considerations.push("Academic/family expectations may be significant stressors");
        considerations.push("Face-saving and family honor may influence sharing");
        break;
      case 'middle-eastern':
        considerations.push("Religious practices may be important coping mechanisms");
        considerations.push("Family and community support systems are highly valued");
        break;
      default:
        considerations.push("Consider the student's unique cultural background");
        considerations.push("Ask about cultural resources and support systems");
    }
    
    return considerations;
  }
}