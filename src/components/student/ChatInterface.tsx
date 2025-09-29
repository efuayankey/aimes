// Updated chat interface using continuous conversation system
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { ConversationService } from '../../services/conversationService';
import { Conversation } from '../../types';
import ConversationList from '../chat/ConversationList';
import ContinuousChat from '../chat/ContinuousChatInterface';
import NewConversationModal from '../chat/NewConversationModal';

interface ChatInterfaceProps {
  onUnreadCountChange?: () => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ onUnreadCountChange }) => {
  const { user } = useAuth();
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [showNewConversationModal, setShowNewConversationModal] = useState(false);
  const [newConversationType, setNewConversationType] = useState<'ai' | 'human'>('ai');

  const handleSelectConversation = (conversation: Conversation) => {
    setSelectedConversation(conversation);
  };

  const handleCreateConversation = (type: 'ai' | 'human') => {
    setNewConversationType(type);
    setShowNewConversationModal(true);
  };

  const handleConversationCreated = async (conversationId: string) => {
    // Load the new conversation and select it
    try {
      const conversation = await ConversationService.getConversation(conversationId);
      if (conversation) {
        setSelectedConversation(conversation);
      }
    } catch (error) {
      console.error('Failed to load new conversation:', error);
    }
  };

  const handleBackToList = () => {
    setSelectedConversation(null);
    // Refresh unread count when going back to list
    if (onUnreadCountChange) {
      onUnreadCountChange();
    }
  };

  // Show conversation list by default, or selected conversation
  if (selectedConversation) {
    return (
      <ContinuousChat 
        conversation={selectedConversation}
        onBack={handleBackToList}
        onUnreadCountChange={onUnreadCountChange}
      />
    );
  }

  return (
    <>
      <ConversationList
        onSelectConversation={handleSelectConversation}
        onCreateConversation={handleCreateConversation}
      />
      
      <NewConversationModal
        isOpen={showNewConversationModal}
        onClose={() => setShowNewConversationModal(false)}
        conversationType={newConversationType}
        onConversationCreated={handleConversationCreated}
      />
    </>
  );
};

export default ChatInterface;