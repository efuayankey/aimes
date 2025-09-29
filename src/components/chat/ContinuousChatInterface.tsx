// Continuous chat interface for real-time conversations
import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, 
  MessageCircle, 
  User, 
  Bot, 
  Clock, 
  CheckCircle,
  Circle,
  MoreVertical,
  X,
  ArrowLeft
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { ConversationService } from '../../services/conversationService';
import { Conversation, ConversationMessage } from '../../types';

interface ContinuousChatProps {
  conversation: Conversation;
  onBack: () => void;
  onUnreadCountChange?: () => void;
}

const ContinuousChat: React.FC<ContinuousChatProps> = ({ conversation, onBack, onUnreadCountChange }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadMessages();
    
    // Set up real-time listener
    const unsubscribe = ConversationService.subscribeToConversationMessages(
      conversation.id,
      (updatedMessages) => {
        setMessages(updatedMessages);
        scrollToBottom();
        
        // Mark messages as read
        if (user?.uid) {
          ConversationService.markMessagesAsRead(conversation.id, user.uid);
          // Notify parent to refresh unread count
          if (onUnreadCountChange) {
            onUnreadCountChange();
          }
        }
      }
    );

    return () => unsubscribe();
  }, [conversation.id, user?.uid]);

  const loadMessages = async () => {
    try {
      setIsLoading(true);
      const conversationMessages = await ConversationService.getConversationMessages(conversation.id);
      setMessages(conversationMessages);
      
      // Mark as read
      if (user?.uid) {
        await ConversationService.markMessagesAsRead(conversation.id, user.uid);
      }
    } catch (error) {
      console.error('Failed to load messages:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !user?.uid || isSending) return;

    try {
      setIsSending(true);
      
      // Determine sender type based on user type
      const senderType = user.userType === 'counselor' ? 'counselor' : 'student';
      
      await ConversationService.sendMessage(
        conversation.id,
        user.uid,
        senderType,
        newMessage.trim()
      );
      setNewMessage('');
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getTimeDisplay = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return timestamp.toLocaleDateString();
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  const renderMessage = (message: ConversationMessage) => {
    const isCurrentUser = message.senderId === user?.uid;
    const isRead = user?.uid ? message.readBy.includes(user.uid) : false;

    return (
      <div
        key={message.id}
        className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'} mb-4`}
      >
        <div className={`flex items-start space-x-2 max-w-[80%] ${isCurrentUser ? 'flex-row-reverse space-x-reverse' : ''}`}>
          {/* Avatar */}
          <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
            isCurrentUser 
              ? 'bg-gradient-to-r from-teal-500 to-blue-500' 
              : message.senderType === 'ai'
                ? 'bg-gradient-to-r from-purple-500 to-indigo-500'
                : message.senderType === 'counselor'
                  ? 'bg-gradient-to-r from-green-500 to-teal-500'
                  : 'bg-gradient-to-r from-blue-500 to-indigo-500'
          }`}>
            {isCurrentUser ? (
              <span className="text-white font-medium text-sm">
                {(user?.firstName || user?.profile?.firstName)?.charAt(0) || 'U'}
              </span>
            ) : message.senderType === 'ai' ? (
              <Bot size={16} className="text-white" />
            ) : (
              <User size={16} className="text-white" />
            )}
          </div>

          {/* Message bubble */}
          <div className={`relative ${isCurrentUser ? 'text-right' : 'text-left'}`}>
            <div className={`rounded-2xl px-4 py-2 ${
              isCurrentUser
                ? 'bg-gradient-to-r from-teal-500 to-blue-500 text-white'
                : 'bg-gray-100 text-gray-900'
            }`}>
              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
            </div>
            
            {/* Timestamp and read status */}
            <div className={`flex items-center mt-1 text-xs text-gray-500 ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
              <span>{getTimeDisplay(message.timestamp)}</span>
              {isCurrentUser && (
                <div className="ml-1">
                  {isRead ? (
                    <CheckCircle size={12} className="text-teal-500" />
                  ) : (
                    <Circle size={12} className="text-gray-400" />
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[600px] bg-white rounded-xl shadow-lg overflow-hidden">
      {/* Chat Header */}
      <div className="bg-gradient-to-r from-teal-600 to-blue-600 text-white p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={onBack}
              className="text-white hover:text-gray-200 transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              conversation.type === 'ai' 
                ? 'bg-purple-500' 
                : 'bg-green-500'
            }`}>
              {conversation.type === 'ai' ? (
                <Bot size={20} className="text-white" />
              ) : (
                <User size={20} className="text-white" />
              )}
            </div>
            <div>
              <h3 className="font-semibold">{conversation.title}</h3>
              <p className="text-sm text-teal-100">
                {conversation.type === 'ai' ? 'AI Companion' : 'Human Counselor'}
                {conversation.isAnonymous && ' • Anonymous'}
              </p>
            </div>
          </div>
          <button className="text-white hover:text-gray-200">
            <MoreVertical size={20} />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center py-12">
            <MessageCircle size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Start your conversation</h3>
            <p className="text-gray-600">
              Share what's on your mind. This is a safe, {conversation.isAnonymous ? 'anonymous' : 'confidential'} space.
            </p>
          </div>
        ) : (
          messages.map(renderMessage)
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="border-t border-gray-200 p-4">
        <div className="flex items-end space-x-2">
          <div className="flex-1">
            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              className="w-full p-3 border border-gray-300 rounded-xl resize-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              rows={1}
              style={{ minHeight: '44px', maxHeight: '120px' }}
            />
          </div>
          <button
            onClick={handleSendMessage}
            disabled={!newMessage.trim() || isSending}
            className={`p-3 rounded-xl transition-colors ${
              newMessage.trim() && !isSending
                ? 'bg-gradient-to-r from-teal-500 to-blue-500 text-white hover:from-teal-600 hover:to-blue-600'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {isSending ? (
              <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
            ) : (
              <Send size={20} />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ContinuousChat;