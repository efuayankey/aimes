// Message queue and response management service
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  getDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp,
  Timestamp,
  writeBatch
} from 'firebase/firestore';
import { db } from './firebase';
import { 
  Message, 
  Response, 
  MessageDraft, 
  MessageSubmission, 
  MessageStatus, 
  CulturalBackground,
  ResponseFeedback 
} from '../types';
import { OpenAIService } from './openaiService';

export class MessageService {
  // Submit a new message to the queue
  static async submitMessage(submission: MessageSubmission): Promise<string> {
    try {
      const messageData: Omit<Message, 'id'> = {
        studentId: submission.studentId,
        content: submission.draft.content,
        messageType: 'support-request',
        responseType: submission.draft.responseType,
        status: submission.draft.responseType === 'ai' ? 'answered' : 'pending',
        priority: submission.draft.priority,
        culturalContext: submission.culturalContext,
        timestamp: new Date(),
        updatedAt: new Date(),
        tags: await this.generateTags(submission.draft.content),
        estimatedResponseTime: this.calculateEstimatedResponseTime(submission.draft.responseType),
        isAnonymous: submission.draft.isAnonymous,
        responses: [],
        responseCount: 0,
        ...(submission.draft.includeJournalContext && {
          sharedJournalContext: [] // TODO: Implement journal context sharing
        })
      };

      const docRef = await addDoc(collection(db, 'messages'), messageData);

      // If AI response requested, generate it immediately
      if (submission.draft.responseType === 'ai') {
        await this.generateAIResponse(docRef.id, messageData);
      }

      return docRef.id;
    } catch (error: any) {
      throw new Error('Failed to submit message: ' + error.message);
    }
  }

  // Get pending messages for counselors (oldest first)
  static async getPendingMessages(counselorId?: string): Promise<Message[]> {
    try {
      const q = query(
        collection(db, 'messages'),
        where('responseType', '==', 'human'),
        where('status', '==', 'pending'),
        orderBy('timestamp', 'asc') // Oldest first as required
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate()
      } as Message));
    } catch (error: any) {
      throw new Error('Failed to fetch pending messages: ' + error.message);
    }
  }

  // Claim a message (counselor takes ownership)
  static async claimMessage(messageId: string, counselorId: string): Promise<void> {
    try {
      const messageRef = doc(db, 'messages', messageId);
      const messageDoc = await getDoc(messageRef);

      if (!messageDoc.exists()) {
        throw new Error('Message not found');
      }

      const messageData = messageDoc.data() as Message;

      // Check if message is still available
      if (messageData.status !== 'pending') {
        throw new Error('Message is no longer available');
      }

      // Set 2-hour deadline for response
      const responseDeadline = new Date();
      responseDeadline.setHours(responseDeadline.getHours() + 2);

      await updateDoc(messageRef, {
        status: 'claimed',
        claimedBy: counselorId,
        claimedAt: serverTimestamp(),
        responseDeadline: responseDeadline,
        updatedAt: serverTimestamp()
      });
    } catch (error: any) {
      throw new Error('Failed to claim message: ' + error.message);
    }
  }

  // Release a claimed message (if counselor can't respond)
  static async releaseMessage(messageId: string, counselorId: string): Promise<void> {
    try {
      const messageRef = doc(db, 'messages', messageId);
      const messageDoc = await getDoc(messageRef);

      if (!messageDoc.exists()) {
        throw new Error('Message not found');
      }

      const messageData = messageDoc.data() as Message;

      // Verify counselor owns this message
      if (messageData.claimedBy !== counselorId) {
        throw new Error('You do not have permission to release this message');
      }

      await updateDoc(messageRef, {
        status: 'pending',
        claimedBy: null,
        claimedAt: null,
        responseDeadline: null,
        updatedAt: serverTimestamp()
      });
    } catch (error: any) {
      throw new Error('Failed to release message: ' + error.message);
    }
  }

  // Submit counselor response
  static async submitResponse(messageId: string, counselorId: string, content: string): Promise<string> {
    try {
      const batch = writeBatch(db);

      // Create response document
      const responseData: Omit<Response, 'id'> = {
        messageId,
        responderId: counselorId,
        responderType: 'human',
        content,
        timestamp: new Date()
      };

      const responseRef = doc(collection(db, 'responses'));
      batch.set(responseRef, responseData);

      // Update message status
      const messageRef = doc(db, 'messages', messageId);
      batch.update(messageRef, {
        status: 'answered',
        responseCount: 1, // For now, assuming single response per message
        updatedAt: serverTimestamp()
      });

      await batch.commit();

      // Generate AI feedback for the response (async, don't wait)
      this.generateResponseFeedback(responseRef.id, content, messageId).catch(console.error);

      return responseRef.id;
    } catch (error: any) {
      throw new Error('Failed to submit response: ' + error.message);
    }
  }

  // Get responses for a specific message
  static async getMessageResponses(messageId: string): Promise<Response[]> {
    try {
      const q = query(
        collection(db, 'responses'),
        where('messageId', '==', messageId),
        orderBy('timestamp', 'asc')
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate()
      } as Response));
    } catch (error: any) {
      throw new Error('Failed to fetch responses: ' + error.message);
    }
  }

  // Get counselor's response history
  static async getCounselorResponses(counselorId: string): Promise<Response[]> {
    try {
      const q = query(
        collection(db, 'responses'),
        where('responderId', '==', counselorId),
        where('responderType', '==', 'human'),
        orderBy('timestamp', 'desc'),
        limit(50)
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate()
      } as Response));
    } catch (error: any) {
      throw new Error('Failed to fetch counselor responses: ' + error.message);
    }
  }

  // Real-time listener for pending messages
  static subscribeToPendingMessages(callback: (messages: Message[]) => void) {
    const q = query(
      collection(db, 'messages'),
      where('responseType', '==', 'human'),
      where('status', 'in', ['pending', 'claimed']),
      orderBy('timestamp', 'asc')
    );

    return onSnapshot(q, (snapshot) => {
      const messages = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate(),
        claimedAt: doc.data().claimedAt?.toDate(),
        responseDeadline: doc.data().responseDeadline?.toDate()
      } as Message));

      callback(messages);
    });
  }

  // Generate AI response for immediate AI requests
  private static async generateAIResponse(messageId: string, messageData: Omit<Message, 'id'>): Promise<void> {
    try {
      const aiResponse = await OpenAIService.generateCulturalResponse(
        messageData.content,
        messageData.culturalContext
      );

      const responseData: Omit<Response, 'id'> = {
        messageId,
        responderId: 'ai',
        responderType: 'ai',
        content: aiResponse.content,
        timestamp: new Date(),
        aiModel: aiResponse.model,
        promptTokens: aiResponse.usage?.prompt_tokens,
        completionTokens: aiResponse.usage?.completion_tokens
      };

      await addDoc(collection(db, 'responses'), responseData);

      // Update message response count
      await updateDoc(doc(db, 'messages', messageId), {
        responseCount: 1,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Failed to generate AI response:', error);
      // Update message status to indicate AI response failed
      await updateDoc(doc(db, 'messages', messageId), {
        status: 'pending', // Fall back to human response
        updatedAt: serverTimestamp()
      });
    }
  }

  // Generate AI feedback for counselor responses
  private static async generateResponseFeedback(responseId: string, content: string, messageId: string): Promise<void> {
    try {
      // Get original message for context
      const messageDoc = await getDoc(doc(db, 'messages', messageId));
      if (!messageDoc.exists()) return;

      const messageData = messageDoc.data() as Message;
      
      const feedback = await OpenAIService.analyzeCounselorResponse(
        messageData.content,
        content,
        messageData.culturalContext
      );

      await updateDoc(doc(db, 'responses', responseId), {
        feedback: feedback
      });
    } catch (error) {
      console.error('Failed to generate response feedback:', error);
    }
  }

  // Auto-generate tags from message content
  private static async generateTags(content: string): Promise<string[]> {
    try {
      // Simple keyword extraction (can be enhanced with AI later)
      const keywords = content.toLowerCase().match(/\b\w+\b/g) || [];
      const commonConcepts = [
        'anxiety', 'stress', 'depression', 'family', 'relationships', 
        'academic', 'career', 'identity', 'cultural', 'social'
      ];

      return commonConcepts.filter(concept => 
        keywords.some(keyword => keyword.includes(concept) || concept.includes(keyword))
      );
    } catch (error) {
      return [];
    }
  }

  // Calculate estimated response time based on type
  private static calculateEstimatedResponseTime(responseType: 'ai' | 'human'): number {
    if (responseType === 'ai') return 1; // 1 minute for AI
    
    // For human responses, calculate based on current queue
    // This is a simplified calculation - in production, consider:
    // - Current queue length
    // - Available counselors
    // - Historical response times
    // - Time of day/week
    return 60; // 60 minutes default for human responses
  }

  // Auto-release expired claimed messages (should run as a cloud function)
  static async releaseExpiredClaims(): Promise<void> {
    try {
      const now = new Date();
      const q = query(
        collection(db, 'messages'),
        where('status', '==', 'claimed'),
        where('responseDeadline', '<=', now)
      );

      const snapshot = await getDocs(q);
      const batch = writeBatch(db);

      snapshot.docs.forEach(doc => {
        batch.update(doc.ref, {
          status: 'pending',
          claimedBy: null,
          claimedAt: null,
          responseDeadline: null,
          updatedAt: serverTimestamp()
        });
      });

      await batch.commit();
      console.log(`Released ${snapshot.docs.length} expired message claims`);
    } catch (error) {
      console.error('Failed to release expired claims:', error);
    }
  }
}