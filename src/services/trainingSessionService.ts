import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  limit,
  Timestamp 
} from 'firebase/firestore';
import { db } from './firebase';
import { 
  SimulationSession, 
  SimulationMessage, 
  SessionAnalysisResults
} from '../types/SimulatedPatient';

export class TrainingSessionService {
  private static readonly TRAINING_SESSIONS_COLLECTION = 'trainingSessions';
  private static readonly TRAINING_ANALYSIS_COLLECTION = 'trainingAnalysis';
  private static readonly TRAINING_STATS_COLLECTION = 'trainingStats';

  // Save a training session to Firestore
  static async saveTrainingSession(session: SimulationSession): Promise<string> {
    try {
      // Convert session to Firestore format
      const sessionData = {
        ...session,
        sessionStarted: Timestamp.fromDate(session.sessionStarted),
        sessionEnded: session.sessionEnded ? Timestamp.fromDate(session.sessionEnded) : null,
        messages: session.messages.map(msg => ({
          ...msg,
          timestamp: Timestamp.fromDate(msg.timestamp)
        })),
        createdAt: Timestamp.now()
      };

      const docRef = await addDoc(collection(db, this.TRAINING_SESSIONS_COLLECTION), sessionData);
      console.log('Training session saved with ID:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('Failed to save training session:', error);
      throw new Error('Failed to save training session');
    }
  }

  // Update an existing training session
  static async updateTrainingSession(sessionId: string, updates: Partial<SimulationSession>): Promise<void> {
    try {
      const sessionRef = doc(db, this.TRAINING_SESSIONS_COLLECTION, sessionId);
      
      // Convert dates to Timestamps
      const updateData = { ...updates };
      if (updateData.sessionEnded) {
        updateData.sessionEnded = Timestamp.fromDate(updateData.sessionEnded) as unknown as Date;
      }
      if (updateData.messages) {
        updateData.messages = updateData.messages.map(msg => ({
          ...msg,
          timestamp: Timestamp.fromDate(msg.timestamp)
        })) as unknown as SimulationMessage[];
      }

      await updateDoc(sessionRef, updateData);
      console.log('Training session updated:', sessionId);
    } catch (error) {
      console.error('Failed to update training session:', error);
      throw new Error('Failed to update training session');
    }
  }

  // Get training sessions for a counselor
  static async getCounselorTrainingSessions(
    counselorId: string, 
    limitCount: number = 20
  ): Promise<SimulationSession[]> {
    try {
      // Use simpler query without orderBy to avoid index requirement
      const q = query(
        collection(db, this.TRAINING_SESSIONS_COLLECTION),
        where('counselorId', '==', counselorId),
        limit(limitCount * 2) // Get more to allow for client-side sorting
      );

      const querySnapshot = await getDocs(q);
      const sessions: SimulationSession[] = [];

      querySnapshot.forEach(doc => {
        const data = doc.data();
        sessions.push({
          id: doc.id,
          ...data,
          sessionStarted: data.sessionStarted.toDate(),
          sessionEnded: data.sessionEnded ? data.sessionEnded.toDate() : undefined,
          messages: data.messages.map((msg: {timestamp: {toDate(): Date}, [key: string]: unknown}) => ({
            ...msg,
            timestamp: msg.timestamp.toDate()
          }))
        } as SimulationSession);
      });

      // Sort client-side by sessionStarted descending
      sessions.sort((a, b) => b.sessionStarted.getTime() - a.sessionStarted.getTime());
      
      // Limit to requested count
      return sessions.slice(0, limitCount);
    } catch (error) {
      console.error('Failed to fetch training sessions:', error);
      throw new Error('Failed to fetch training sessions');
    }
  }

  // Get a specific training session
  static async getTrainingSession(sessionId: string): Promise<SimulationSession | null> {
    try {
      const sessionRef = doc(db, this.TRAINING_SESSIONS_COLLECTION, sessionId);
      const sessionSnap = await getDoc(sessionRef);

      if (!sessionSnap.exists()) {
        return null;
      }

      const data = sessionSnap.data();
      return {
        id: sessionSnap.id,
        ...data,
        sessionStarted: data.sessionStarted.toDate(),
        sessionEnded: data.sessionEnded ? data.sessionEnded.toDate() : undefined,
        messages: data.messages.map((msg: {timestamp: {toDate(): Date}, [key: string]: unknown}) => ({
          ...msg,
          timestamp: msg.timestamp.toDate()
        }))
      } as SimulationSession;
    } catch (error) {
      console.error('Failed to fetch training session:', error);
      throw new Error('Failed to fetch training session');
    }
  }

  // Save training session analysis
  static async saveTrainingAnalysis(
    sessionId: string,
    analysis: SessionAnalysisResults // This will be the conversation analysis result
  ): Promise<string> {
    try {
      const analysisData = {
        sessionId,
        ...analysis,
        analyzedAt: Timestamp.now(),
        sessionType: 'training'
      };

      const docRef = await addDoc(collection(db, this.TRAINING_ANALYSIS_COLLECTION), analysisData);
      console.log('Training analysis saved with ID:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('Failed to save training analysis:', error);
      throw new Error('Failed to save training analysis');
    }
  }

  // Get training analysis for a session
  static async getTrainingAnalysis(sessionId: string): Promise<SessionAnalysisResults | null> {
    try {
      const q = query(
        collection(db, this.TRAINING_ANALYSIS_COLLECTION),
        where('sessionId', '==', sessionId)
      );

      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        return null;
      }

      const doc = querySnapshot.docs[0];
      const data = doc.data();
      
      return {
        id: doc.id,
        ...data,
        analyzedAt: data.analyzedAt.toDate()
      };
    } catch (error) {
      console.error('Failed to fetch training analysis:', error);
      throw new Error('Failed to fetch training analysis');
    }
  }

  // Get training session statistics for a counselor
  static async getCounselorTrainingStats(counselorId: string): Promise<{
    totalSessions: number;
    totalDuration: number; // in minutes
    averageScore: number;
    culturesExplored: string[];
    concernsAddressed: string[];
    recentSessions: SimulationSession[];
    improvementTrend: 'improving' | 'stable' | 'declining';
  }> {
    try {
      const sessions = await this.getCounselorTrainingSessions(counselorId, 50);
      
      if (sessions.length === 0) {
        return {
          totalSessions: 0,
          totalDuration: 0,
          averageScore: 0,
          culturesExplored: [],
          concernsAddressed: [],
          recentSessions: [],
          improvementTrend: 'stable'
        };
      }

      // Calculate statistics
      const totalSessions = sessions.length;
      const totalDuration = sessions.reduce((sum, session) => sum + (session.sessionDuration || 0), 0);
      
      const culturesExplored = [...new Set(sessions.map(s => s.simulatedPatient.culturalBackground))];
      const concernsAddressed = [...new Set(sessions.map(s => s.simulatedPatient.mentalHealthConcern))];
      
      // Get analyses to calculate average score
      const analysisPromises = sessions.slice(0, 10).map(s => this.getTrainingAnalysis(s.id));
      const analyses = (await Promise.all(analysisPromises)).filter(a => a !== null);
      
      const averageScore = analyses.length > 0 
        ? analyses.reduce((sum, analysis) => sum + (analysis.overallPerformance?.overallScore || 0), 0) / analyses.length
        : 0;

      // Calculate improvement trend (compare first 5 vs last 5 sessions)
      let improvementTrend: 'improving' | 'stable' | 'declining' = 'stable';
      if (analyses.length >= 5) {
        const recentScores = analyses.slice(0, 3).map(a => a.overallPerformance?.overallScore || 0);
        const olderScores = analyses.slice(-3).map(a => a.overallPerformance?.overallScore || 0);
        
        const recentAvg = recentScores.reduce((a, b) => a + b, 0) / recentScores.length;
        const olderAvg = olderScores.reduce((a, b) => a + b, 0) / olderScores.length;
        
        if (recentAvg > olderAvg + 0.5) improvementTrend = 'improving';
        else if (recentAvg < olderAvg - 0.5) improvementTrend = 'declining';
      }

      return {
        totalSessions,
        totalDuration,
        averageScore,
        culturesExplored,
        concernsAddressed,
        recentSessions: sessions.slice(0, 5),
        improvementTrend
      };
    } catch (error) {
      console.error('Failed to fetch training stats:', error);
      throw new Error('Failed to fetch training stats');
    }
  }

  // Delete a training session
  static async deleteTrainingSession(sessionId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, this.TRAINING_SESSIONS_COLLECTION, sessionId));
      
      // Also delete associated analysis
      const q = query(
        collection(db, this.TRAINING_ANALYSIS_COLLECTION),
        where('sessionId', '==', sessionId)
      );
      
      const querySnapshot = await getDocs(q);
      const deletePromises = querySnapshot.docs.map(doc => deleteDoc(doc.ref));
      await Promise.all(deletePromises);
      
      console.log('Training session deleted:', sessionId);
    } catch (error) {
      console.error('Failed to delete training session:', error);
      throw new Error('Failed to delete training session');
    }
  }

  // Get training sessions by cultural background for research
  static async getTrainingSessionsByCulture(
    culturalBackground: string, 
    limitCount: number = 50
  ): Promise<SimulationSession[]> {
    try {
      // Use simpler query without orderBy to avoid index requirement
      const q = query(
        collection(db, this.TRAINING_SESSIONS_COLLECTION),
        where('simulatedPatient.culturalBackground', '==', culturalBackground),
        limit(limitCount * 2) // Get more to allow for client-side sorting
      );

      const querySnapshot = await getDocs(q);
      const sessions: SimulationSession[] = [];

      querySnapshot.forEach(doc => {
        const data = doc.data();
        sessions.push({
          id: doc.id,
          ...data,
          sessionStarted: data.sessionStarted.toDate(),
          sessionEnded: data.sessionEnded ? data.sessionEnded.toDate() : undefined,
          messages: data.messages.map((msg: {timestamp: {toDate(): Date}, [key: string]: unknown}) => ({
            ...msg,
            timestamp: msg.timestamp.toDate()
          }))
        } as SimulationSession);
      });

      // Sort client-side by sessionStarted descending
      sessions.sort((a, b) => b.sessionStarted.getTime() - a.sessionStarted.getTime());
      
      // Limit to requested count
      return sessions.slice(0, limitCount);
    } catch (error) {
      console.error('Failed to fetch sessions by culture:', error);
      throw new Error('Failed to fetch sessions by culture');
    }
  }

  // Export training data for research (anonymized)
  static async exportTrainingDataForResearch(counselorId: string): Promise<{
    sessionId: string;
    culturalBackground: string;
    gender: string;
    concern: string;
    sessionDuration?: number;
    messageCount: number;
    counselorMessages: number;
    sessionOutcome?: string;
    sessionDate: string;
  }[]> {
    try {
      const sessions = await this.getCounselorTrainingSessions(counselorId, 100);
      
      return sessions.map(session => ({
        sessionId: session.id,
        culturalBackground: session.simulatedPatient.culturalBackground,
        gender: session.simulatedPatient.gender,
        concern: session.simulatedPatient.mentalHealthConcern,
        sessionDuration: session.sessionDuration,
        messageCount: session.messages.length,
        counselorMessages: session.messages.filter(m => m.senderType === 'counselor').length,
        sessionOutcome: session.sessionOutcome,
        sessionDate: session.sessionStarted.toISOString().split('T')[0] // Date only
        // Note: No actual message content for privacy
      }));
    } catch (error) {
      console.error('Failed to export training data:', error);
      throw new Error('Failed to export training data');
    }
  }
}