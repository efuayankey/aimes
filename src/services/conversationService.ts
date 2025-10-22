// Continuous conversation service for real-time chat
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
  writeBatch,
  arrayUnion
} from 'firebase/firestore';
import { db } from './firebase';
import { 
  Conversation, 
  ConversationMessage, 
  ConversationParticipant,
  CulturalBackground,
  MessagePriority 
} from '../types';
import { OpenAIService } from './openaiService';

export class ConversationService {
  // Create a new conversation
  static async createConversation(
    studentId: string,
    type: 'ai' | 'human',
    title: string,
    culturalContext: CulturalBackground,
    isAnonymous: boolean = false,
    priority: MessagePriority = 'medium'
  ): Promise<string> {
    try {
      const conversationData: Omit<Conversation, 'id'> = {
        studentId,
        type,
        title,
        status: 'active',
        culturalContext,
        createdAt: new Date(),
        updatedAt: new Date(),
        lastMessageAt: new Date(),
        messageCount: 0,
        isAnonymous,
        priority,
        tags: []
      };

      const docRef = await addDoc(collection(db, 'conversations'), conversationData);

      // Create participant record for student
      await addDoc(collection(db, 'conversation_participants'), {
        conversationId: docRef.id,
        userId: studentId,
        userType: 'student',
        joinedAt: new Date(),
        lastReadAt: new Date(),
        isTyping: false,
        role: 'participant'
      });

      return docRef.id;
    } catch (error: any) {
      throw new Error('Failed to create conversation: ' + error.message);
    }
  }

  // Send a message in a conversation
  static async sendMessage(
    conversationId: string,
    senderId: string,
    senderType: 'student' | 'counselor',
    content: string,
    replyTo?: string
  ): Promise<string> {
    try {
      console.log('Sending message:', { conversationId, senderId, senderType, content });
      
      const batch = writeBatch(db);

      // Create message
      const messageData: Omit<ConversationMessage, 'id'> = {
        conversationId,
        senderId,
        senderType,
        content,
        timestamp: new Date(),
        readBy: [senderId], // Sender has read their own message
        ...(replyTo && { replyTo })
      };

      const messageRef = doc(collection(db, 'conversation_messages'));
      batch.set(messageRef, messageData);

      // Update conversation metadata
      const conversationRef = doc(db, 'conversations', conversationId);
      batch.update(conversationRef, {
        lastMessageAt: new Date(),
        updatedAt: new Date()
        // Note: messageCount will be calculated dynamically when needed
      });

      await batch.commit();
      console.log('Message sent successfully with ID:', messageRef.id);

      // If this is a student message in an AI conversation, generate AI response
      if (senderType === 'student') {
        const conversation = await this.getConversation(conversationId);
        console.log('Conversation details:', conversation);
        if (conversation && conversation.type === 'ai') {
          console.log('Generating AI response...');
          await this.generateAIResponse(conversationId, content, conversation.culturalContext);
        }
      }

      return messageRef.id;
    } catch (error: any) {
      console.error('Failed to send message:', error);
      throw new Error('Failed to send message: ' + error.message);
    }
  }

  // Get conversation details
  static async getConversation(conversationId: string): Promise<Conversation | null> {
    try {
      const conversationDoc = await getDoc(doc(db, 'conversations', conversationId));
      
      if (!conversationDoc.exists()) {
        return null;
      }

      return {
        id: conversationDoc.id,
        ...conversationDoc.data(),
        createdAt: conversationDoc.data().createdAt?.toDate(),
        updatedAt: conversationDoc.data().updatedAt?.toDate(),
        lastMessageAt: conversationDoc.data().lastMessageAt?.toDate()
      } as Conversation;
    } catch (error: any) {
      throw new Error('Failed to get conversation: ' + error.message);
    }
  }

  // Get messages in a conversation
  static async getConversationMessages(conversationId: string): Promise<ConversationMessage[]> {
    try {
      if (!conversationId) {
        console.error('getConversationMessages called with undefined conversationId');
        return [];
      }

      const q = query(
        collection(db, 'conversation_messages'),
        where('conversationId', '==', conversationId)
      );

      const snapshot = await getDocs(q);
      const messages = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate()
      } as ConversationMessage));

      // Sort by timestamp
      return messages.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
    } catch (error: any) {
      console.error('Error in getConversationMessages:', error);
      throw new Error('Failed to get conversation messages: ' + error.message);
    }
  }

  // Get student's conversations
  static async getStudentConversations(studentId: string): Promise<Conversation[]> {
    try {
      const q = query(
        collection(db, 'conversations'),
        where('studentId', '==', studentId)
      );

      const snapshot = await getDocs(q);
      const conversations = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate(),
        lastMessageAt: doc.data().lastMessageAt?.toDate()
      } as Conversation));

      // Sort by last message time
      return conversations.sort((a, b) => b.lastMessageAt.getTime() - a.lastMessageAt.getTime());
    } catch (error: any) {
      throw new Error('Failed to get student conversations: ' + error.message);
    }
  }

  // Get conversations available for counselors to claim
  static async getAvailableConversations(): Promise<Conversation[]> {
    try {
      // Get all human conversations that are active
      const q = query(
        collection(db, 'conversations'),
        where('type', '==', 'human'),
        where('status', '==', 'active')
      );

      const snapshot = await getDocs(q);
      const allConversations = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate(),
        lastMessageAt: doc.data().lastMessageAt?.toDate()
      } as Conversation));

      // Filter out conversations that already have a counselor assigned
      return allConversations.filter(conv => !conv.counselorId);
    } catch (error: any) {
      throw new Error('Failed to get available conversations: ' + error.message);
    }
  }

  // Get counselor's active conversations (conversations they've claimed)
  static async getCounselorConversations(counselorId: string): Promise<Conversation[]> {
    try {
      const q = query(
        collection(db, 'conversations'),
        where('counselorId', '==', counselorId),
        where('status', '==', 'active')
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate(),
        lastMessageAt: doc.data().lastMessageAt?.toDate()
      } as Conversation));
    } catch (error: any) {
      throw new Error('Failed to get counselor conversations: ' + error.message);
    }
  }

  // Get unread message count for counselor across their conversations
  static async getCounselorUnreadCount(counselorId: string): Promise<number> {
    try {
      // Get all counselor conversations
      const conversationsQuery = query(
        collection(db, 'conversations'),
        where('counselorId', '==', counselorId)
      );

      const conversationsSnapshot = await getDocs(conversationsQuery);
      const conversationIds = conversationsSnapshot.docs.map(doc => doc.id);

      if (conversationIds.length === 0) return 0;

      let totalUnreadCount = 0;

      // Check unread messages in batches (Firestore 'in' query limit is 10)
      for (let i = 0; i < conversationIds.length; i += 10) {
        const batch = conversationIds.slice(i, i + 10);
        const messagesQuery = query(
          collection(db, 'conversation_messages'),
          where('conversationId', 'in', batch)
        );

        const messagesSnapshot = await getDocs(messagesQuery);
        const unreadMessages = messagesSnapshot.docs.filter(doc => {
          const messageData = doc.data() as ConversationMessage;
          return !messageData.readBy.includes(counselorId) && messageData.senderId !== counselorId;
        });

        totalUnreadCount += unreadMessages.length;
      }

      return totalUnreadCount;
    } catch (error: any) {
      throw new Error('Failed to get counselor unread count: ' + error.message);
    }
  }

  // Claim a conversation (counselor)
  static async claimConversation(conversationId: string, counselorId: string): Promise<void> {
    try {
      const batch = writeBatch(db);

      // Update conversation
      const conversationRef = doc(db, 'conversations', conversationId);
      batch.update(conversationRef, {
        counselorId,
        updatedAt: new Date()
      });

      // Add counselor as participant
      const participantRef = doc(collection(db, 'conversation_participants'));
      batch.set(participantRef, {
        conversationId,
        userId: counselorId,
        userType: 'counselor',
        joinedAt: new Date(),
        lastReadAt: new Date(),
        isTyping: false,
        role: 'participant'
      });

      await batch.commit();
    } catch (error: any) {
      throw new Error('Failed to claim conversation: ' + error.message);
    }
  }

  // Mark messages as read
  static async markMessagesAsRead(conversationId: string, userId: string): Promise<void> {
    try {
      // Get unread messages in this conversation
      const q = query(
        collection(db, 'conversation_messages'),
        where('conversationId', '==', conversationId)
      );

      const snapshot = await getDocs(q);
      const batch = writeBatch(db);

      snapshot.docs.forEach(doc => {
        const messageData = doc.data() as ConversationMessage;
        if (!messageData.readBy.includes(userId)) {
          batch.update(doc.ref, {
            readBy: arrayUnion(userId)
          });
        }
      });

      // Update participant's last read time
      const participantQ = query(
        collection(db, 'conversation_participants'),
        where('conversationId', '==', conversationId),
        where('userId', '==', userId)
      );

      const participantSnapshot = await getDocs(participantQ);
      participantSnapshot.docs.forEach(doc => {
        batch.update(doc.ref, {
          lastReadAt: new Date()
        });
      });

      await batch.commit();
    } catch (error: any) {
      throw new Error('Failed to mark messages as read: ' + error.message);
    }
  }

  // Real-time listener for conversation messages
  static subscribeToConversationMessages(
    conversationId: string,
    callback: (messages: ConversationMessage[]) => void
  ) {
    const q = query(
      collection(db, 'conversation_messages'),
      where('conversationId', '==', conversationId)
    );

    return onSnapshot(q, (snapshot) => {
      const messages = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate()
      } as ConversationMessage));

      // Sort by timestamp
      const sortedMessages = messages.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
      callback(sortedMessages);
    });
  }

  // Generate AI response in conversation
  private static async generateAIResponse(
    conversationId: string,
    userMessage: string,
    culturalContext: CulturalBackground
  ): Promise<void> {
    try {
      // Get conversation history for context
      const messages = await this.getConversationMessages(conversationId);
      const conversationHistory = messages.map(msg => ({
        role: msg.senderType === 'student' ? 'user' : 'assistant',
        content: msg.content
      }));

      const aiResponse = await OpenAIService.generateCulturalResponse(
        userMessage,
        culturalContext,
        conversationHistory
      );

      // Send AI response
      await this.sendAIMessage(conversationId, aiResponse.content, aiResponse);
    } catch (error) {
      console.error('Failed to generate AI response:', error);
      // Send fallback message
      await this.sendAIMessage(
        conversationId,
        "I'm sorry, I'm having trouble processing your message right now. Please try again in a moment."
      );
    }
  }

  // Send AI message (internal helper)
  private static async sendAIMessage(
    conversationId: string,
    content: string,
    aiMetadata?: any
  ): Promise<void> {
    const messageData: Omit<ConversationMessage, 'id'> = {
      conversationId,
      senderId: 'ai',
      senderType: 'ai',
      content,
      timestamp: new Date(),
      readBy: [], // AI messages start unread
      ...(aiMetadata?.model && { aiModel: aiMetadata.model }),
      ...(aiMetadata?.usage?.prompt_tokens && { promptTokens: aiMetadata.usage.prompt_tokens }),
      ...(aiMetadata?.usage?.completion_tokens && { completionTokens: aiMetadata.usage.completion_tokens })
    };

    await addDoc(collection(db, 'conversation_messages'), messageData);

    // Update conversation metadata
    await updateDoc(doc(db, 'conversations', conversationId), {
      lastMessageAt: new Date(),
      updatedAt: new Date()
    });
  }

  // Get unread message count for a student across all their conversations
  static async getUnreadMessageCount(studentId: string): Promise<number> {
    try {
      // Get all student conversations
      const conversationsQuery = query(
        collection(db, 'conversations'),
        where('studentId', '==', studentId)
      );

      const conversationsSnapshot = await getDocs(conversationsQuery);
      const conversationIds = conversationsSnapshot.docs.map(doc => doc.id);

      if (conversationIds.length === 0) return 0;

      let totalUnreadCount = 0;

      // Check unread messages in batches (Firestore 'in' query limit is 10)
      for (let i = 0; i < conversationIds.length; i += 10) {
        const batch = conversationIds.slice(i, i + 10);
        const messagesQuery = query(
          collection(db, 'conversation_messages'),
          where('conversationId', 'in', batch)
        );

        const messagesSnapshot = await getDocs(messagesQuery);
        const unreadMessages = messagesSnapshot.docs.filter(doc => {
          const messageData = doc.data() as ConversationMessage;
          return !messageData.readBy.includes(studentId) && messageData.senderId !== studentId;
        });

        totalUnreadCount += unreadMessages.length;
      }

      return totalUnreadCount;
    } catch (error: any) {
      throw new Error('Failed to get unread message count: ' + error.message);
    }
  }

  // Close/archive conversation
  static async closeConversation(conversationId: string): Promise<void> {
    try {
      await updateDoc(doc(db, 'conversations', conversationId), {
        status: 'closed',
        updatedAt: new Date()
      });
    } catch (error: any) {
      throw new Error('Failed to close conversation: ' + error.message);
    }
  }

  // Mark conversation as completed by counselor
  static async markConversationComplete(conversationId: string, counselorId: string): Promise<void> {
    try {
      const conversationRef = doc(db, 'conversations', conversationId);
      
      await updateDoc(conversationRef, {
        status: 'completed',
        completedAt: serverTimestamp(),
        completedBy: counselorId,
        updatedAt: serverTimestamp()
      });

      console.log('Conversation marked as completed');
    } catch (error: any) {
      console.error('Failed to mark conversation complete:', error);
      throw new Error('Failed to mark conversation complete: ' + error.message);
    }
  }
}