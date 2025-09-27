// Counselor dashboard with message queue functionality
import React, { useState, useEffect } from 'react';
import { 
  Users, 
  MessageSquare, 
  Clock, 
  AlertCircle, 
  CheckCircle,
  User,
  Calendar,
  Globe,
  ArrowRight,
  Filter,
  LogOut
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { MessageService } from '../../services/messageService';
import { Message, MessagePriority } from '../../types';

interface MessageQueueProps {
  messages: Message[];
  onClaimMessage: (messageId: string) => void;
  isLoading: boolean;
}

const MessageQueue: React.FC<MessageQueueProps> = ({ messages, onClaimMessage, isLoading }) => {
  const getPriorityColor = (priority: MessagePriority) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTimeAgo = (timestamp: Date) => {
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
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse bg-gray-100 rounded-lg h-32"></div>
        ))}
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg">
        <MessageSquare size={48} className="mx-auto text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No pending messages</h3>
        <p className="text-gray-600">All student requests have been handled. Great work!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {messages.map((message) => (
        <div 
          key={message.id} 
          className="bg-white border rounded-lg p-6 hover:shadow-md transition-shadow"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-teal-500 to-blue-500 rounded-full flex items-center justify-center">
                <User size={20} className="text-white" />
              </div>
              <div>
                <p className="font-medium text-gray-900">
                  {message.isAnonymous ? 'Anonymous Student' : `Student #${message.studentId.slice(-6)}`}
                </p>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Clock size={14} />
                  <span>{getTimeAgo(message.createdAt)}</span>
                  <span>•</span>
                  <Globe size={14} />
                  <span>{message.culturalContext.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(message.priority)}`}>
                {message.priority.toUpperCase()}
              </span>
              {message.priority === 'urgent' && (
                <AlertCircle size={16} className="text-red-500" />
              )}
            </div>
          </div>

          <div className="mb-4">
            <p className="text-gray-800 line-clamp-3">
              {message.content}
            </p>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <span>Response Type: Human Counselor</span>
              {message.includeJournalContext && (
                <span className="flex items-center space-x-1">
                  <Calendar size={14} />
                  <span>Journal Context Included</span>
                </span>
              )}
            </div>
            
            <button
              onClick={() => onClaimMessage(message.id)}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <span>Claim & Respond</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

const CounselorDashboard: React.FC = () => {
  const { user, signOut } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | MessagePriority>('all');
  const [stats, setStats] = useState({
    total: 0,
    urgent: 0,
    claimed: 0,
    avgResponseTime: '45 min'
  });

  useEffect(() => {
    loadMessages();
    // Set up real-time listener for new messages
    const interval = setInterval(loadMessages, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, [filter]);

  const loadMessages = async () => {
    try {
      setIsLoading(true);
      const allMessages = await MessageService.getUnclaimedMessages();
      console.log('Fetched messages:', allMessages);
      
      // Filter messages based on selected filter
      const filteredMessages = filter === 'all' 
        ? allMessages 
        : allMessages.filter(msg => msg.priority === filter);
      
      setMessages(filteredMessages);
      
      // Update stats
      setStats({
        total: allMessages.length,
        urgent: allMessages.filter(msg => msg.priority === 'urgent').length,
        claimed: 0, // TODO: Add claimed messages count
        avgResponseTime: '45 min' // TODO: Calculate actual average
      });
    } catch (error) {
      console.error('Failed to load messages:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClaimMessage = async (messageId: string) => {
    try {
      await MessageService.claimMessage(messageId, user!.uid);
      // TODO: Navigate to response interface
      console.log('Message claimed:', messageId);
      loadMessages(); // Refresh the list
    } catch (error) {
      console.error('Failed to claim message:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Counselor Dashboard
              </h1>
              <p className="text-gray-600">
                Welcome back, {user?.firstName || user?.profile?.firstName}. Manage student support requests below.
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Messages</option>
                <option value="urgent">Urgent</option>
                <option value="high">High Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="low">Low Priority</option>
              </select>
              
              <button
                onClick={() => signOut()}
                className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <LogOut size={16} />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Messages</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <MessageSquare className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Urgent</p>
                <p className="text-2xl font-bold text-red-600">{stats.urgent}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Your Claims</p>
                <p className="text-2xl font-bold text-green-600">{stats.claimed}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Response</p>
                <p className="text-2xl font-bold text-purple-600">{stats.avgResponseTime}</p>
              </div>
              <Clock className="h-8 w-8 text-purple-600" />
            </div>
          </div>
        </div>

        {/* Message Queue */}
        <div className="bg-white rounded-xl shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Message Queue</h2>
              <span className="text-sm text-gray-600">
                Showing {messages.length} message{messages.length !== 1 ? 's' : ''}
                {filter !== 'all' && ` (${filter} priority)`}
              </span>
            </div>
          </div>
          
          <div className="p-6">
            <MessageQueue 
              messages={messages}
              onClaimMessage={handleClaimMessage}
              isLoading={isLoading}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CounselorDashboard;