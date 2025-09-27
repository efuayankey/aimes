// Student dashboard with quick access to features
import React, { useState } from 'react';
import { MessageCircle, BookOpen, Brain, Settings, LogOut, Sparkles, Menu, X, Lock, Globe, Users } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

// Placeholder components - we'll build these
const ChatInterface = React.lazy(() => import('./ChatInterface'));
const JournalingInterface = React.lazy(() => import('./JournalingInterface'));
const MindfulnessLibrary = React.lazy(() => import('../mindfulness/MindfulnessLibrary'));

type StudentView = 'dashboard' | 'chat' | 'journal' | 'mindfulness' | 'settings';

const StudentDashboard: React.FC = () => {
  const { user, signOut } = useAuth();
  const [currentView, setCurrentView] = useState<StudentView>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Safety check - don't render if no user
  if (!user) {
    return <div>Loading...</div>;
  }

  const handleSignOut = async () => {
    await signOut();
  };

  const navigationItems = [
    {
      id: 'dashboard' as StudentView,
      label: 'Dashboard',
      icon: <Sparkles size={20} />,
      description: 'Overview and quick actions'
    },
    {
      id: 'chat' as StudentView,
      label: 'Mental Health Chat',
      icon: <MessageCircle size={20} />,
      description: 'AI companion and human counselors'
    },
    {
      id: 'journal' as StudentView,
      label: 'Personal Journal',
      icon: <BookOpen size={20} />,
      description: 'Private mood tracking and reflection'
    },
    {
      id: 'mindfulness' as StudentView,
      label: 'Mindfulness Library',
      icon: <Brain size={20} />,
      description: 'Cultural meditation and wellness videos'
    }
  ];

  const renderNavigation = () => (
    <nav className="space-y-2">
      {navigationItems.map((item) => (
        <button
          key={item.id}
          onClick={() => {
            setCurrentView(item.id);
            setSidebarOpen(false);
          }}
          className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
            currentView === item.id
              ? 'bg-teal-100 text-teal-800 border border-teal-200'
              : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
          }`}
        >
          <div className={`${
            currentView === item.id ? 'text-teal-600' : 'text-gray-400'
          }`}>
            {item.icon}
          </div>
          <div>
            <div className="font-medium">{item.label}</div>
            <div className="text-xs text-gray-500">{item.description}</div>
          </div>
        </button>
      ))}
    </nav>
  );

  const renderDashboardContent = () => (
    <div className="space-y-8">
      {/* Welcome Message */}
      <div className="bg-gradient-to-r from-teal-600 to-blue-600 rounded-2xl p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">
          Welcome back, {user?.firstName || user?.profile?.firstName}!
        </h1>
        <p className="text-teal-100 mb-4">
          Your mental health companion is here to support you with culturally-aware guidance.
        </p>
        <div className="flex flex-wrap gap-4">
          <span className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-sm flex items-center space-x-1">
            <Lock size={14} />
            <span>Anonymous & Secure</span>
          </span>
          <span className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-sm flex items-center space-x-1">
            <Globe size={14} />
            <span>Culturally Sensitive</span>
          </span>
          <span className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-sm flex items-center space-x-1">
            <Users size={14} />
            <span>AI + Human Support</span>
          </span>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-3 gap-6">
        <div 
          className="bg-white rounded-xl shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow cursor-pointer"
          onClick={() => setCurrentView('chat')}
        >
          <div className="flex items-center space-x-4 mb-4">
            <div className="bg-gradient-to-br from-teal-600 to-blue-600 rounded-full p-3">
              <MessageCircle size={24} className="text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Start Chatting</h3>
              <p className="text-sm text-gray-600">AI or human counselor</p>
            </div>
          </div>
          <p className="text-gray-600 text-sm mb-4">
            Get immediate support from our culturally-aware AI, or connect with a human counselor when you need deeper guidance.
          </p>
          <div className="flex items-center text-teal-600 text-sm font-medium">
            <span>Begin conversation</span>
            <span className="ml-2">→</span>
          </div>
        </div>

        <div 
          className="bg-white rounded-xl shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow cursor-pointer"
          onClick={() => setCurrentView('journal')}
        >
          <div className="flex items-center space-x-4 mb-4">
            <div className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-full p-3">
              <BookOpen size={24} className="text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Daily Journal</h3>
              <p className="text-sm text-gray-600">Private reflection space</p>
            </div>
          </div>
          <p className="text-gray-600 text-sm mb-4">
            Track your moods, reflect on your experiences, and share insights with counselors when you're ready.
          </p>
          <div className="flex items-center text-purple-600 text-sm font-medium">
            <span>Write entry</span>
            <span className="ml-2">→</span>
          </div>
        </div>

        <div 
          className="bg-white rounded-xl shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow cursor-pointer"
          onClick={() => setCurrentView('mindfulness')}
        >
          <div className="flex items-center space-x-4 mb-4">
            <div className="bg-gradient-to-br from-green-600 to-teal-600 rounded-full p-3">
              <Brain size={24} className="text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Mindfulness</h3>
              <p className="text-sm text-gray-600">Cultural wellness practices</p>
            </div>
          </div>
          <p className="text-gray-600 text-sm mb-4">
            Explore guided meditation, breathing exercises, and wellness practices adapted to your cultural background.
          </p>
          <div className="flex items-center text-green-600 text-sm font-medium">
            <span>Explore library</span>
            <span className="ml-2">→</span>
          </div>
        </div>
      </div>

      {/* Cultural Context Display */}
      {user?.studentProfile?.culturalBackground && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
          <h3 className="font-semibold text-amber-900 mb-2">Your Cultural Context</h3>
          <p className="text-amber-800 text-sm mb-4">
            AIMES adapts its responses based on your cultural background: 
            <span className="font-medium ml-1">
              {user.studentProfile.culturalBackground.split('-').map(word => 
                word.charAt(0).toUpperCase() + word.slice(1)
              ).join(' ')}
            </span>
          </p>
          <button 
            onClick={() => setCurrentView('settings')}
            className="text-amber-700 hover:text-amber-800 text-sm underline"
          >
            Update cultural background
          </button>
        </div>
      )}
    </div>
  );

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return renderDashboardContent();
      case 'chat':
        return (
          <React.Suspense fallback={<div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
          </div>}>
            <ChatInterface />
          </React.Suspense>
        );
      case 'journal':
        return (
          <React.Suspense fallback={<div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
          </div>}>
            <JournalingInterface />
          </React.Suspense>
        );
      case 'mindfulness':
        return (
          <React.Suspense fallback={<div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
          </div>}>
            <MindfulnessLibrary />
          </React.Suspense>
        );
      case 'settings':
        return (
          <div className="bg-white rounded-xl shadow-md p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Settings</h2>
            <p className="text-gray-600">Settings panel coming soon...</p>
          </div>
        );
      default:
        return renderDashboardContent();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className={`
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 transition-transform duration-300 ease-in-out
        fixed lg:relative z-30 lg:z-auto
        w-80 h-full bg-white shadow-lg border-r border-gray-200
      `}>
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-teal-600 to-blue-600 rounded-full p-2">
                <Sparkles size={20} className="text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">AIMES</h1>
                <p className="text-sm text-gray-600">Student Portal</p>
              </div>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-gray-400 hover:text-gray-600"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        <div className="p-6 flex-1">
          {renderNavigation()}
        </div>

        <div className="p-6 border-t border-gray-200">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center">
              <span className="text-white font-medium text-sm">
                {(user?.firstName || user?.profile?.firstName)?.charAt(0) || 'U'}
              </span>
            </div>
            <div>
              <p className="font-medium text-gray-900">
                {user?.firstName || user?.profile?.firstName} {user?.lastName || user?.profile?.lastName}
              </p>
              <p className="text-sm text-gray-500">Student</p>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 w-full"
          >
            <LogOut size={16} />
            <span className="text-sm">Sign Out</span>
          </button>
        </div>
      </div>

      {/* Sidebar overlay for mobile */}
      {sidebarOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-20"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 lg:ml-0">
        {/* Top Navigation */}
        <div className="bg-white shadow-sm border-b border-gray-200 px-6 py-4 lg:hidden">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setSidebarOpen(true)}
              className="text-gray-600 hover:text-gray-900"
            >
              <Menu size={24} />
            </button>
            <h1 className="font-semibold text-gray-900">AIMES Student Portal</h1>
            <div className="w-6" /> {/* Spacer */}
          </div>
        </div>

        <div className="p-6">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;