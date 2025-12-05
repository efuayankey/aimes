// Conversation list component for managing multiple chats
import React, { useState, useEffect, useCallback } from 'react';
import { 
  MessageCircle, 
  Bot, 
  User, 
  Clock,
  Circle,
  Search
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { ConversationService } from '../../services/conversationService';
import { Conversation } from '../../types';

interface ConversationListProps {
  onSelectConversation: (conversation: Conversation) => void;
  onCreateConversation: (type: 'ai' | 'human') => void;
}

const ConversationList: React.FC<ConversationListProps> = ({ 
  onSelectConversation, 
  onCreateConversation 
}) => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'ai' | 'human'>('all');

  const loadConversations = useCallback(async () => {
    if (!user?.uid) return;
    
    try {
      setIsLoading(true);
      const userConversations = await ConversationService.getStudentConversations(user.uid);
      setConversations(userConversations);
    } catch (error) {
      console.error('Failed to load conversations:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user?.uid]);

  useEffect(() => {
    if (user?.uid) {
      loadConversations();
    }
  }, [user?.uid, loadConversations]);

  const filteredConversations = conversations.filter(conversation => {
    const matchesSearch = conversation.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === 'all' || conversation.type === filter;
    return matchesSearch && matchesFilter;
  });

  const getTimeDisplay = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-xl shadow-lg">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Conversations</h2>
              <p className="text-gray-600">Chat with AI companion or human counselors</p>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => onCreateConversation('ai')}
                className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                <Bot size={16} />
                <span>AI Chat</span>
              </button>
              <button
                onClick={() => onCreateConversation('human')}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <User size={16} />
                <span>Human Counselor</span>
              </button>
            </div>
          </div>

          {/* Search and Filter */}
          <div className="flex items-center space-x-4">
            <div className="flex-1 relative">
              <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-black"
              />
            </div>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as 'all' | 'ai' | 'human')}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-black"
            >
              <option value="all">All Conversations</option>
              <option value="ai">AI Companion</option>
              <option value="human">Human Counselors</option>
            </select>
          </div>
        </div>

        {/* Conversation List */}
        <div className="divide-y divide-gray-200">
          {filteredConversations.length === 0 ? (
            <div className="text-center py-12">
              <MessageCircle size={48} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm || filter !== 'all' ? 'No matching conversations' : 'No conversations yet'}
              </h3>
              <p className="text-gray-600 mb-6">
                {searchTerm || filter !== 'all' 
                  ? 'Try adjusting your search or filter'
                  : 'Start a conversation to get support and guidance'
                }
              </p>
              {!searchTerm && filter === 'all' && (
                <div className="flex items-center justify-center space-x-4">
                  <button
                    onClick={() => onCreateConversation('ai')}
                    className="flex items-center space-x-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    <Bot size={20} />
                    <span>Start AI Chat</span>
                  </button>
                  <button
                    onClick={() => onCreateConversation('human')}
                    className="flex items-center space-x-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <User size={20} />
                    <span>Talk to Counselor</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            filteredConversations.map((conversation) => (
              <div
                key={conversation.id}
                onClick={() => onSelectConversation(conversation)}
                className="p-6 hover:bg-gray-50 cursor-pointer transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    {/* Avatar */}
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                      conversation.type === 'ai' 
                        ? 'bg-gradient-to-r from-purple-500 to-indigo-500' 
                        : 'bg-gradient-to-r from-green-500 to-teal-500'
                    }`}>
                      {conversation.type === 'ai' ? (
                        <Bot size={24} className="text-white" />
                      ) : (
                        <User size={24} className="text-white" />
                      )}
                    </div>

                    {/* Conversation Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="font-semibold text-gray-900 truncate">
                          {conversation.title}
                        </h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          conversation.type === 'ai' 
                            ? 'bg-purple-100 text-purple-800' 
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {conversation.type === 'ai' ? 'AI' : 'Human'}
                        </span>
                        {conversation.isAnonymous && (
                          <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs">
                            Anonymous
                          </span>
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Clock size={14} />
                        <span>Last message {getTimeDisplay(conversation.lastMessageAt)}</span>
                        <span>•</span>
                        <span>{conversation.messageCount} messages</span>
                      </div>

                      {/* Status */}
                      <div className="mt-2">
                        <span className={`inline-flex items-center space-x-1 text-xs ${
                          conversation.status === 'active' 
                            ? 'text-green-600' 
                            : 'text-gray-500'
                        }`}>
                          <Circle size={8} className={`${
                            conversation.status === 'active' ? 'fill-current' : ''
                          }`} />
                          <span className="capitalize">{conversation.status}</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Priority indicator */}
                  {conversation.priority === 'urgent' && (
                    <div className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-medium">
                      Urgent
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ConversationList;