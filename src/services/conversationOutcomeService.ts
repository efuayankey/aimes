// Comprehensive conversation outcome analysis service
import { db } from './firebase';
import { collection, addDoc, query, where, getDocs, orderBy, Timestamp } from 'firebase/firestore';
import { Conversation, ConversationMessage } from '../types';

export interface StudentSentimentProgression {
  timepoint: number; // Position in conversation (0-100%)
  emotionalState: {
    distress: number; // 1-10 scale
    hope: number; // 1-10 scale  
    engagement: number; // 1-10 scale
    trust: number; // 1-10 scale
    empowerment: number; // 1-10 scale
  };
  keyIndicators: string[];
  significantQuotes: string[];
}

export interface ConversationOutcome {
  conversationId: string;
  counselorId: string;
  studentId: string;
  analyzedAt: Date;
  
  // Overall metrics
  overallEffectiveness: number; // 1-10
  studentSatisfactionEstimate: number; // 1-10
  culturalSensitivityScore: number; // 1-10
  
  // Student journey analysis
  emotionalProgression: StudentSentimentProgression[];
  startingState: {
    primaryConcerns: string[];
    emotionalIntensity: number;
    culturalFactors: string[];
  };
  endingState: {
    resolutionLevel: number; // 1-10
    empowermentLevel: number; // 1-10
    likelyToReturn: boolean;
    actionItemsIdentified: string[];
  };
  
  // Conversation quality metrics
  counselorPerformance: {
    empathyConsistency: number; // 1-10
    culturalAdaptation: number; // 1-10
    activeListening: number; // 1-10
    questionQuality: number; // 1-10
    appropriateBoundaries: number; // 1-10
    solutionOrientation: number; // 1-10
  };
  
  // Key insights
  whatWorkedWell: string[];
  areasForImprovement: string[];
  culturalConsiderations: string[];
  recommendedFollowUp: string[];
  
  // Conversation flow analysis
  conversationPhases: {
    buildingRapport: { duration: number; effectiveness: number };
    problemExploration: { duration: number; effectiveness: number };
    interventionDelivery: { duration: number; effectiveness: number };
    resolutionPlanning: { duration: number; effectiveness: number };
  };
  
  // Red flags or concerns
  concerns: {
    missedOpportunities: string[];
    potentialMisunderstandings: string[];
    culturalInsensitivities: string[];
    riskFactors: string[];
  };
}

export class ConversationOutcomeService {
  // Main analysis function - called when counselor ends conversation
  static async analyzeCompleteConversation(
    conversation: Conversation,
    messages: ConversationMessage[]
  ): Promise<ConversationOutcome> {
    console.log('Starting comprehensive conversation analysis...');
    
    try {
      // Prepare conversation text for analysis
      const conversationText = this.formatConversationForAnalysis(messages);
      const studentCulturalBackground = conversation.studentCulturalBackground;
      
      // Run comprehensive analysis
      const analysis = await this.runComprehensiveAnalysis(
        conversationText,
        studentCulturalBackground
      );
      
      // Save to database
      const outcome: ConversationOutcome = {
        conversationId: conversation.id,
        counselorId: conversation.counselorId!,
        studentId: conversation.studentId,
        analyzedAt: new Date(),
        ...analysis
      };
      
      await this.saveConversationOutcome(outcome);
      
      console.log('Conversation analysis completed successfully');
      return outcome;
      
    } catch (error: any) {
      console.error('Failed to analyze conversation:', error);
      throw new Error('Conversation analysis failed: ' + error.message);
    }
  }
  
  // Format conversation for AI analysis
  private static formatConversationForAnalysis(messages: ConversationMessage[]): string {
    return messages.map((msg, index) => {
      const timestamp = new Date(msg.timestamp).toLocaleTimeString();
      const speaker = msg.senderId === 'system' ? 'System' : 
                    msg.senderType === 'student' ? 'Student' : 'Counselor';
      
      return `[${timestamp}] ${speaker}: ${msg.content}`;
    }).join('\n\n');
  }
  
  // Main AI analysis function using API route
  private static async runComprehensiveAnalysis(
    conversationText: string,
    culturalBackground?: string
  ): Promise<Omit<ConversationOutcome, 'conversationId' | 'counselorId' | 'studentId' | 'analyzedAt'>> {
    
    try {
      const response = await fetch('/api/analyze-conversation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          conversationText,
          culturalBackground
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to analyze conversation');
      }

      const data = await response.json();
      
      if (!data.success || !data.analysis) {
        throw new Error('Invalid response from analysis API');
      }
      
      return data.analysis;
      
    } catch (error: any) {
      console.error('AI analysis failed:', error);
      throw new Error('Failed to generate conversation analysis: ' + error.message);
    }
  }
  
  // Save analysis to database
  private static async saveConversationOutcome(outcome: ConversationOutcome): Promise<void> {
    try {
      await addDoc(collection(db, 'conversation_outcomes'), {
        ...outcome,
        analyzedAt: Timestamp.fromDate(outcome.analyzedAt)
      });
    } catch (error: any) {
      console.error('Failed to save conversation outcome:', error);
      throw new Error('Failed to save analysis: ' + error.message);
    }
  }
  
  // Get conversation outcomes for a counselor
  static async getCounselorOutcomes(counselorId: string, limit: number = 20): Promise<ConversationOutcome[]> {
    try {
      const q = query(
        collection(db, 'conversation_outcomes'),
        where('counselorId', '==', counselorId),
        orderBy('analyzedAt', 'desc')
      );
      
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        ...doc.data(),
        analyzedAt: doc.data().analyzedAt?.toDate()
      } as ConversationOutcome));
      
    } catch (error: any) {
      console.error('Failed to get counselor outcomes:', error);
      throw new Error('Failed to retrieve conversation outcomes: ' + error.message);
    }
  }
  
  // Get aggregated performance metrics for a counselor
  static async getCounselorPerformanceMetrics(counselorId: string, timeframe: 'week' | 'month' | 'all' = 'month') {
    try {
      const outcomes = await this.getCounselorOutcomes(counselorId, 100);
      
      // Filter by timeframe
      const now = new Date();
      const timeframeDays = timeframe === 'week' ? 7 : timeframe === 'month' ? 30 : 365;
      const cutoffDate = new Date(now.getTime() - (timeframeDays * 24 * 60 * 60 * 1000));
      
      const filteredOutcomes = outcomes.filter(outcome => 
        outcome.analyzedAt >= cutoffDate
      );
      
      if (filteredOutcomes.length === 0) {
        return null;
      }
      
      // Calculate averages
      const averages = {
        overallEffectiveness: this.calculateAverage(filteredOutcomes, 'overallEffectiveness'),
        studentSatisfaction: this.calculateAverage(filteredOutcomes, 'studentSatisfactionEstimate'),
        culturalSensitivity: this.calculateAverage(filteredOutcomes, 'culturalSensitivityScore'),
        empathyConsistency: this.calculateAverage(filteredOutcomes, o => o.counselorPerformance.empathyConsistency),
        culturalAdaptation: this.calculateAverage(filteredOutcomes, o => o.counselorPerformance.culturalAdaptation),
        activeListening: this.calculateAverage(filteredOutcomes, o => o.counselorPerformance.activeListening),
        questionQuality: this.calculateAverage(filteredOutcomes, o => o.counselorPerformance.questionQuality),
        appropriateBoundaries: this.calculateAverage(filteredOutcomes, o => o.counselorPerformance.appropriateBoundaries),
        solutionOrientation: this.calculateAverage(filteredOutcomes, o => o.counselorPerformance.solutionOrientation)
      };
      
      return {
        timeframe,
        conversationCount: filteredOutcomes.length,
        averages,
        trends: this.calculateTrends(filteredOutcomes),
        recentFeedback: filteredOutcomes.slice(0, 5)
      };
      
    } catch (error: any) {
      console.error('Failed to calculate performance metrics:', error);
      throw new Error('Failed to calculate performance metrics: ' + error.message);
    }
  }
  
  // Helper function to calculate averages
  private static calculateAverage(outcomes: ConversationOutcome[], accessor: string | ((o: ConversationOutcome) => number)): number {
    if (outcomes.length === 0) return 0;
    
    const values = outcomes.map(outcome => {
      if (typeof accessor === 'string') {
        return (outcome as any)[accessor];
      } else {
        return accessor(outcome);
      }
    }).filter(v => typeof v === 'number' && !isNaN(v));
    
    return values.length > 0 ? values.reduce((sum, val) => sum + val, 0) / values.length : 0;
  }
  
  // Calculate performance trends
  private static calculateTrends(outcomes: ConversationOutcome[]) {
    if (outcomes.length < 2) return {};
    
    // Sort by date
    const sorted = outcomes.sort((a, b) => a.analyzedAt.getTime() - b.analyzedAt.getTime());
    
    // Compare first half vs second half
    const midpoint = Math.floor(sorted.length / 2);
    const firstHalf = sorted.slice(0, midpoint);
    const secondHalf = sorted.slice(midpoint);
    
    const firstAvg = this.calculateAverage(firstHalf, 'overallEffectiveness');
    const secondAvg = this.calculateAverage(secondHalf, 'overallEffectiveness');
    
    return {
      overallTrend: secondAvg > firstAvg ? 'improving' : secondAvg < firstAvg ? 'declining' : 'stable',
      trendPercentage: firstAvg > 0 ? ((secondAvg - firstAvg) / firstAvg) * 100 : 0
    };
  }
}