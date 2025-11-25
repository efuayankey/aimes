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
    } catch (error: unknown) {
      throw new Error('Failed to submit message: ' + (error instanceof Error ? error.message : 'Unknown error'));
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
    } catch (error: unknown) {
      throw new Error('Failed to fetch pending messages: ' + (error instanceof Error ? error.message : 'Unknown error'));
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
    } catch (error: unknown) {
      throw new Error('Failed to claim message: ' + (error instanceof Error ? error.message : 'Unknown error'));
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
    } catch (error: unknown) {
      throw new Error('Failed to release message: ' + (error instanceof Error ? error.message : 'Unknown error'));
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
        timestamp: new Date(),
        readByStudent: false
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
    } catch (error: unknown) {
      throw new Error('Failed to submit response: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  }

  // Get responses for a specific message
  static async getMessageResponses(messageId: string): Promise<Response[]> {
    try {
      const q = query(
        collection(db, 'responses'),
        where('messageId', '==', messageId)
      );

      const snapshot = await getDocs(q);
      const responses = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate()
      } as Response));

      // Sort in memory by timestamp ascending
      return responses.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
    } catch (error: unknown) {
      throw new Error('Failed to fetch responses: ' + (error instanceof Error ? error.message : 'Unknown error'));
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
    } catch (error: unknown) {
      throw new Error('Failed to fetch counselor responses: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  }

  // Get unclaimed messages for counselor queue (oldest first)
  static async getUnclaimedMessages(): Promise<Message[]> {
    try {
      const q = query(
        collection(db, 'messages'),
        where('responseType', '==', 'human'),
        where('status', '==', 'pending'),
        orderBy('timestamp', 'asc') // Oldest first
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().timestamp?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate()
      } as Message));
    } catch (error: unknown) {
      throw new Error('Failed to fetch unclaimed messages: ' + (error instanceof Error ? error.message : 'Unknown error'));
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
        readByStudent: false,
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

  // Get student's messages and their responses
  static async getStudentConversations(studentId: string): Promise<{ message: Message; responses: Response[] }[]> {
    try {
      // Get all messages from this student
      const messagesQuery = query(
        collection(db, 'messages'),
        where('studentId', '==', studentId),
        orderBy('timestamp', 'desc')
      );

      const messagesSnapshot = await getDocs(messagesQuery);
      const conversations: { message: Message; responses: Response[] }[] = [];

      // For each message, get its responses
      for (const messageDoc of messagesSnapshot.docs) {
        const messageData = {
          id: messageDoc.id,
          ...messageDoc.data(),
          timestamp: messageDoc.data().timestamp?.toDate(),
          updatedAt: messageDoc.data().updatedAt?.toDate()
        } as Message;

        const responses = await this.getMessageResponses(messageDoc.id);
        
        conversations.push({
          message: messageData,
          responses: responses
        });
      }

      return conversations;
    } catch (error: unknown) {
      throw new Error('Failed to fetch student conversations: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  }

  // Get student conversations filtered by response type - simplified for now
  static async getStudentConversationsByType(studentId: string, responseType: 'ai' | 'human' | 'all'): Promise<{ message: Message; responses: Response[] }[]> {
    try {
      // Get all student messages first (simple query)
      const messagesQuery = query(
        collection(db, 'messages'),
        where('studentId', '==', studentId)
      );

      const messagesSnapshot = await getDocs(messagesQuery);
      let allMessages = messagesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate()
      } as Message));

      // Filter by response type in memory if needed
      if (responseType !== 'all') {
        allMessages = allMessages.filter(msg => msg.responseType === responseType);
      }

      // Sort by timestamp descending
      allMessages.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

      const conversations: { message: Message; responses: Response[] }[] = [];

      for (const messageData of allMessages) {
        const responses = await this.getMessageResponses(messageData.id);
        
        conversations.push({
          message: messageData,
          responses: responses
        });
      }

      return conversations;
    } catch (error: unknown) {
      throw new Error('Failed to fetch filtered conversations: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  }

  // Get unread responses for a student (notifications) - simplified
  static async getUnreadResponses(studentId: string): Promise<Response[]> {
    try {
      // First get all student's messages
      const messagesQuery = query(
        collection(db, 'messages'),
        where('studentId', '==', studentId)
      );

      const messagesSnapshot = await getDocs(messagesQuery);
      const messageIds = messagesSnapshot.docs.map(doc => doc.id);

      if (messageIds.length === 0) return [];

      // Get all responses to these messages
      const allResponses: Response[] = [];
      
      // Process in batches of 10 (Firestore 'in' query limit)
      for (let i = 0; i < messageIds.length; i += 10) {
        const batch = messageIds.slice(i, i + 10);
        const responsesQuery = query(
          collection(db, 'responses'),
          where('messageId', 'in', batch)
        );

        const responsesSnapshot = await getDocs(responsesQuery);
        const batchResponses = responsesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          timestamp: doc.data().timestamp?.toDate()
        } as Response));
        
        allResponses.push(...batchResponses);
      }

      // Filter unread responses and sort in memory
      const unreadResponses = allResponses.filter(response => response.readByStudent !== true);
      return unreadResponses.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    } catch (error: unknown) {
      throw new Error('Failed to fetch unread responses: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  }

  // Mark response as read by student
  static async markResponseAsRead(responseId: string): Promise<void> {
    try {
      await updateDoc(doc(db, 'responses', responseId), {
        readByStudent: true,
        readAt: serverTimestamp()
      });
    } catch (error: unknown) {
      throw new Error('Failed to mark response as read: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
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