// Service for exporting conversation data
import { ConversationService } from './conversationService';
import { Conversation, ConversationMessage } from '../types';

export interface ExportData {
  conversation: Conversation;
  messages: ConversationMessage[];
  exportedAt: Date;
  exportedBy: string;
}

export class ExportService {
  // Export conversation as JSON
  static async exportConversationAsJSON(
    conversationId: string, 
    counselorId: string
  ): Promise<void> {
    try {
      const conversation = await ConversationService.getConversation(conversationId);
      const messages = await ConversationService.getConversationMessages(conversationId);
      
      if (!conversation) {
        throw new Error('Conversation not found');
      }

      // Verify counselor has access to this conversation
      if (conversation.counselorId !== counselorId) {
        throw new Error('Unauthorized: You can only export your own conversations');
      }

      const exportData: ExportData = {
        conversation: {
          ...conversation,
          // Remove sensitive student ID for privacy
          studentId: conversation.isAnonymous ? 'anonymous' : `student_${conversation.studentId.slice(-6)}`
        },
        messages: messages.map(msg => ({
          ...msg,
          // Remove sensitive sender IDs for privacy
          senderId: msg.senderType === 'student' 
            ? (conversation.isAnonymous ? 'anonymous_student' : `student_${msg.senderId.slice(-6)}`)
            : msg.senderType === 'counselor' 
              ? `counselor_${msg.senderId.slice(-6)}`
              : 'ai'
        })),
        exportedAt: new Date(),
        exportedBy: `counselor_${counselorId.slice(-6)}`
      };

      // Create and download JSON file
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { 
        type: 'application/json' 
      });
      
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `conversation_${conversation.id}_${this.formatDate(new Date())}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error: Error | unknown) {
      console.error('Failed to export conversation as JSON:', error);
      throw new Error('Failed to export conversation: ' + error.message);
    }
  }

  // Export conversation as CSV
  static async exportConversationAsCSV(
    conversationId: string, 
    counselorId: string
  ): Promise<void> {
    try {
      const conversation = await ConversationService.getConversation(conversationId);
      const messages = await ConversationService.getConversationMessages(conversationId);
      
      if (!conversation) {
        throw new Error('Conversation not found');
      }

      // Verify counselor has access to this conversation
      if (conversation.counselorId !== counselorId) {
        throw new Error('Unauthorized: You can only export your own conversations');
      }

      // Create CSV content
      const headers = [
        'Message ID',
        'Timestamp',
        'Sender Type',
        'Sender ID',
        'Message Content',
        'Character Count',
        'Word Count'
      ];

      const csvRows = [
        headers.join(','),
        ...messages.map(msg => [
          msg.id,
          msg.timestamp.toISOString(),
          msg.senderType,
          msg.senderType === 'student' 
            ? (conversation.isAnonymous ? 'anonymous_student' : `student_${msg.senderId.slice(-6)}`)
            : msg.senderType === 'counselor' 
              ? `counselor_${msg.senderId.slice(-6)}`
              : 'ai',
          `"${msg.content.replace(/"/g, '""')}"`, // Escape quotes in CSV
          msg.content.length.toString(),
          msg.content.split(/\s+/).length.toString()
        ].join(','))
      ];

      // Add conversation metadata as comments
      const metadata = [
        `# Conversation Export`,
        `# Conversation ID: ${conversation.id}`,
        `# Title: ${conversation.title}`,
        `# Type: ${conversation.type}`,
        `# Cultural Context: ${conversation.culturalContext}`,
        `# Priority: ${conversation.priority}`,
        `# Status: ${conversation.status}`,
        `# Created: ${conversation.createdAt.toISOString()}`,
        `# Total Messages: ${messages.length}`,
        `# Exported: ${new Date().toISOString()}`,
        `# Exported By: counselor_${counselorId.slice(-6)}`,
        ``,
        ...csvRows
      ];

      const csvContent = metadata.join('\n');

      // Create and download CSV file
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `conversation_${conversation.id}_${this.formatDate(new Date())}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error: Error | unknown) {
      console.error('Failed to export conversation as CSV:', error);
      throw new Error('Failed to export conversation: ' + error.message);
    }
  }

  // Export multiple conversations as bulk JSON
  static async exportMultipleConversationsAsJSON(
    conversationIds: string[],
    counselorId: string
  ): Promise<void> {
    try {
      const exportData = {
        conversations: [] as ExportData[],
        exportedAt: new Date(),
        exportedBy: `counselor_${counselorId.slice(-6)}`,
        totalConversations: conversationIds.length
      };

      for (const conversationId of conversationIds) {
        try {
          const conversation = await ConversationService.getConversation(conversationId);
          const messages = await ConversationService.getConversationMessages(conversationId);
          
          if (!conversation || conversation.counselorId !== counselorId) {
            console.warn(`Skipping conversation ${conversationId} - not accessible`);
            continue;
          }

          exportData.conversations.push({
            conversation: {
              ...conversation,
              studentId: conversation.isAnonymous ? 'anonymous' : `student_${conversation.studentId.slice(-6)}`
            },
            messages: messages.map(msg => ({
              ...msg,
              senderId: msg.senderType === 'student' 
                ? (conversation.isAnonymous ? 'anonymous_student' : `student_${msg.senderId.slice(-6)}`)
                : msg.senderType === 'counselor' 
                  ? `counselor_${msg.senderId.slice(-6)}`
                  : 'ai'
            })),
            exportedAt: new Date(),
            exportedBy: `counselor_${counselorId.slice(-6)}`
          });
        } catch (error) {
          console.error(`Failed to export conversation ${conversationId}:`, error);
        }
      }

      if (exportData.conversations.length === 0) {
        throw new Error('No conversations available for export');
      }

      // Create and download JSON file
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { 
        type: 'application/json' 
      });
      
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `conversations_bulk_${this.formatDate(new Date())}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error: Error | unknown) {
      console.error('Failed to export multiple conversations:', error);
      throw new Error('Failed to export conversations: ' + error.message);
    }
  }

  // Helper function to format date for filenames
  private static formatDate(date: Date): string {
    return date.toISOString().split('T')[0].replace(/-/g, '');
  }

  // Get export statistics for a conversation
  static async getExportStatistics(conversationId: string): Promise<{
    messageCount: number;
    studentMessages: number;
    counselorMessages: number;
    aiMessages: number;
    totalCharacters: number;
    averageMessageLength: number;
    conversationDuration: string;
  }> {
    try {
      const conversation = await ConversationService.getConversation(conversationId);
      const messages = await ConversationService.getConversationMessages(conversationId);
      
      if (!conversation) {
        throw new Error('Conversation not found');
      }

      const studentMessages = messages.filter(m => m.senderType === 'student').length;
      const counselorMessages = messages.filter(m => m.senderType === 'counselor').length;
      const aiMessages = messages.filter(m => m.senderType === 'ai').length;
      const totalCharacters = messages.reduce((sum, m) => sum + m.content.length, 0);
      const averageMessageLength = messages.length > 0 ? totalCharacters / messages.length : 0;
      
      const startTime = conversation.createdAt;
      const endTime = conversation.lastMessageAt;
      const durationMs = endTime.getTime() - startTime.getTime();
      const durationDays = Math.floor(durationMs / (1000 * 60 * 60 * 24));
      const durationHours = Math.floor((durationMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      
      let conversationDuration = '';
      if (durationDays > 0) {
        conversationDuration = `${durationDays} days, ${durationHours} hours`;
      } else if (durationHours > 0) {
        conversationDuration = `${durationHours} hours`;
      } else {
        const durationMinutes = Math.floor(durationMs / (1000 * 60));
        conversationDuration = `${durationMinutes} minutes`;
      }

      return {
        messageCount: messages.length,
        studentMessages,
        counselorMessages,
        aiMessages,
        totalCharacters,
        averageMessageLength: Math.round(averageMessageLength),
        conversationDuration
      };
    } catch (error: Error | unknown) {
      console.error('Failed to get export statistics:', error);
      throw new Error('Failed to get statistics: ' + error.message);
    }
  }
}