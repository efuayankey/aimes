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
  LogOut,
  Send,
  X,
  Download,
  BarChart3,
  Target
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { MessageService } from '../../services/messageService';
import { ConversationService } from '../../services/conversationService';
import { ExportService } from '../../services/exportService';
import { Message, MessagePriority, Conversation, ConversationMessage } from '../../types';
import ContinuousChat from '../chat/ContinuousChatInterface';

// Lazy load the feedback dashboard
const CounselorFeedbackDashboard = React.lazy(() => import('../feedback/CounselorFeedbackDashboard'));

interface ConversationQueueProps {
  conversations: Conversation[];
  onClaimConversation: (conversationId: string) => void;
  onSelectConversation?: (conversation: Conversation) => void;
  isLoading: boolean;
  isMyConversations?: boolean;
}

const ConversationQueue: React.FC<ConversationQueueProps> = ({ conversations, onClaimConversation, onSelectConversation, isLoading, isMyConversations = false }) => {
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

  if (conversations.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg">
        <MessageSquare size={48} className="mx-auto text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No pending conversations</h3>
        <p className="text-gray-600">All student conversations have been claimed. Great work!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {conversations.map((conversation) => (
        <div 
          key={conversation.id} 
          className="bg-white border rounded-lg p-6 hover:shadow-md transition-shadow"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-teal-500 to-blue-500 rounded-full flex items-center justify-center">
                <User size={20} className="text-white" />
              </div>
              <div>
                <p className="font-medium text-gray-900">
                  {conversation.isAnonymous ? 'Anonymous Student' : `Student #${conversation.studentId.slice(-6)}`}
                </p>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Clock size={14} />
                  <span>{getTimeAgo(conversation.lastMessageAt)}</span>
                  <span>•</span>
                  <Globe size={14} />
                  <span>{conversation.culturalContext.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(conversation.priority)}`}>
                {conversation.priority.toUpperCase()}
              </span>
              {conversation.priority === 'urgent' && (
                <AlertCircle size={16} className="text-red-500" />
              )}
            </div>
          </div>

          <div className="mb-4">
            <h3 className="font-medium text-gray-900 mb-2">{conversation.title}</h3>
            <p className="text-gray-600 text-sm">
              {conversation.messageCount} messages • Last activity {getTimeAgo(conversation.lastMessageAt)}
            </p>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <span>New Conversation Request</span>
              <span>Status: {conversation.status}</span>
            </div>
            
            <button
              onClick={() => {
                if (isMyConversations && onSelectConversation) {
                  onSelectConversation(conversation);
                } else {
                  onClaimConversation(conversation.id);
                }
              }}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <span>{isMyConversations ? 'Open Chat' : 'Claim Conversation'}</span>
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
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [myConversations, setMyConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | MessagePriority>('all');
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [activeTab, setActiveTab] = useState<'new' | 'mine'>('new');
  const [myUnreadCount, setMyUnreadCount] = useState(0);
  const [currentView, setCurrentView] = useState<'queue' | 'feedback'>('queue');
  const [stats, setStats] = useState({
    total: 0,
    urgent: 0,
    claimed: 0,
    avgResponseTime: '45 min'
  });

  useEffect(() => {
    loadConversations();
    loadMyConversations();
    loadMyUnreadCount();
    // Set up real-time listener for new conversations
    const interval = setInterval(() => {
      loadConversations();
      loadMyConversations();
      loadMyUnreadCount();
    }, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, [filter, user?.uid]);

  const loadConversations = async () => {
    try {
      setIsLoading(true);
      const availableConversations = await ConversationService.getAvailableConversations();
      console.log('Fetched conversations:', availableConversations);
      
      // Filter conversations based on selected filter
      const filteredConversations = filter === 'all' 
        ? availableConversations 
        : availableConversations.filter(conv => conv.priority === filter);
      
      setConversations(filteredConversations);
      
      // Update stats
      setStats({
        total: availableConversations.length,
        urgent: availableConversations.filter(conv => conv.priority === 'urgent').length,
        claimed: 0, // TODO: Add claimed conversations count
        avgResponseTime: '45 min' // TODO: Calculate actual average
      });
    } catch (error) {
      console.error('Failed to load conversations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadMyConversations = async () => {
    if (!user?.uid) return;
    
    try {
      const counselorConversations = await ConversationService.getCounselorConversations(user.uid);
      console.log('Fetched my conversations:', counselorConversations);
      setMyConversations(counselorConversations);
    } catch (error) {
      console.error('Failed to load my conversations:', error);
    }
  };

  const loadMyUnreadCount = async () => {
    if (!user?.uid) return;
    
    try {
      const unreadCount = await ConversationService.getCounselorUnreadCount(user.uid);
      setMyUnreadCount(unreadCount);
    } catch (error) {
      console.error('Failed to load unread count:', error);
    }
  };

  const handleClaimConversation = async (conversationId: string) => {
    try {
      await ConversationService.claimConversation(conversationId, user!.uid);
      
      // Find the conversation and select it for chat
      const conversation = conversations.find(c => c.id === conversationId);
      if (conversation) {
        setSelectedConversation(conversation);
      }
      
      loadConversations(); // Refresh the list
      loadMyConversations(); // Refresh my conversations
    } catch (error) {
      console.error('Failed to claim conversation:', error);
      alert('Failed to claim conversation. Please try again.');
    }
  };

  const handleSelectMyConversation = (conversation: Conversation) => {
    setSelectedConversation(conversation);
    // Refresh unread count when opening a conversation
    loadMyUnreadCount();
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

        {/* Main Navigation */}
        <div className="mb-8">
          <div className="bg-white rounded-xl shadow-sm">
            <div className="border-b border-gray-200">
              <nav className="flex space-x-8 px-6">
                <button
                  onClick={() => setCurrentView('queue')}
                  className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors flex items-center space-x-2 ${
                    currentView === 'queue'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <MessageSquare size={16} />
                  <span>Message Queue</span>
                </button>
                <button
                  onClick={() => setCurrentView('feedback')}
                  className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors flex items-center space-x-2 ${
                    currentView === 'feedback'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <BarChart3 size={16} />
                  <span>Performance & Feedback</span>
                </button>
              </nav>
            </div>
          </div>
        </div>

        {currentView === 'queue' ? (
          /* Conversation Management */
          <div className="bg-white rounded-xl shadow-sm">
            {/* Tab Navigation */}
            <div className="border-b border-gray-200">
              <nav className="flex space-x-8 px-6">
                <button
                  onClick={() => setActiveTab('new')}
                  className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === 'new'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  New Requests ({conversations.length})
                </button>
                <button
                  onClick={() => setActiveTab('mine')}
                  className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors relative ${
                    activeTab === 'mine'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  My Conversations ({myConversations.length})
                  {myUnreadCount > 0 && (
                    <span className="absolute -top-1 -right-2 bg-red-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] h-5 flex items-center justify-center">
                      {myUnreadCount}
                    </span>
                  )}
                </button>
              </nav>
            </div>
          
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">
                {activeTab === 'new' ? 'New Conversation Requests' : 'My Active Conversations'}
              </h2>
              <div className="flex items-center space-x-4">
                {activeTab === 'mine' && myConversations.length > 0 && (
                  <button
                    onClick={async () => {
                      try {
                        const conversationIds = myConversations.map(c => c.id);
                        await ExportService.exportMultipleConversationsAsJSON(conversationIds, user!.uid);
                      } catch (error) {
                        console.error('Failed to export conversations:', error);
                        alert('Failed to export conversations. Please try again.');
                      }
                    }}
                    className="flex items-center space-x-2 px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Download size={16} />
                    <span>Export All</span>
                  </button>
                )}
                <span className="text-sm text-gray-600">
                  {activeTab === 'new' ? (
                    <>
                      Showing {conversations.length} request{conversations.length !== 1 ? 's' : ''}
                      {filter !== 'all' && ` (${filter} priority)`}
                    </>
                  ) : (
                    <>
                      {myConversations.length} active conversation{myConversations.length !== 1 ? 's' : ''}
                      {myUnreadCount > 0 && ` • ${myUnreadCount} unread`}
                    </>
                  )}
                </span>
              </div>
            </div>
          </div>
          
            <div className="p-6">
              {activeTab === 'new' ? (
                <ConversationQueue 
                  conversations={conversations}
                  onClaimConversation={handleClaimConversation}
                  isLoading={isLoading}
                />
              ) : (
                <ConversationQueue 
                  conversations={myConversations}
                  onClaimConversation={() => {}} // Not used for my conversations
                  onSelectConversation={handleSelectMyConversation}
                  isLoading={isLoading}
                  isMyConversations={true}
                />
              )}
            </div>
          </div>
        ) : (
          /* Feedback Dashboard */
          <React.Suspense fallback={
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          }>
            <CounselorFeedbackDashboard />
          </React.Suspense>
        )}
      </div>

      {/* Conversation Chat Interface */}
      {selectedConversation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="h-full">
              <ContinuousChat 
                conversation={selectedConversation}
                onBack={() => {
                  setSelectedConversation(null);
                  loadMyUnreadCount(); // Refresh unread count when closing chat
                }}
                onUnreadCountChange={loadMyUnreadCount}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CounselorDashboard;