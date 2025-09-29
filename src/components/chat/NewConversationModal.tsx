// Modal for starting new conversations
import React, { useState } from 'react';
import { X, Bot, User, AlertCircle, Lock, Globe } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { ConversationService } from '../../services/conversationService';
import { MessagePriority } from '../../types';

interface NewConversationModalProps {
  isOpen: boolean;
  onClose: () => void;
  conversationType: 'ai' | 'human';
  onConversationCreated: (conversationId: string) => void;
}

const NewConversationModal: React.FC<NewConversationModalProps> = ({
  isOpen,
  onClose,
  conversationType,
  onConversationCreated
}) => {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [firstMessage, setFirstMessage] = useState('');
  const [priority, setPriority] = useState<MessagePriority>('medium');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  if (!isOpen) return null;

  const handleCreate = async () => {
    if (!user?.uid || !title.trim() || !firstMessage.trim()) return;

    try {
      setIsCreating(true);
      
      // Create conversation
      const conversationId = await ConversationService.createConversation(
        user.uid,
        conversationType,
        title.trim(),
        user.studentProfile?.culturalBackground || 'general',
        isAnonymous,
        priority
      );

      // Send first message
      await ConversationService.sendMessage(
        conversationId,
        user.uid,
        'student',
        firstMessage.trim()
      );

      onConversationCreated(conversationId);
      
      // Reset form
      setTitle('');
      setFirstMessage('');
      setPriority('medium');
      setIsAnonymous(false);
      onClose();
    } catch (error) {
      console.error('Failed to create conversation:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const generateTitle = () => {
    if (!firstMessage.trim()) return;
    
    // Simple title generation from first few words
    const words = firstMessage.trim().split(' ').slice(0, 6);
    const generatedTitle = words.join(' ') + (words.length === 6 ? '...' : '');
    setTitle(generatedTitle);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                conversationType === 'ai' 
                  ? 'bg-gradient-to-r from-purple-500 to-indigo-500' 
                  : 'bg-gradient-to-r from-green-500 to-teal-500'
              }`}>
                {conversationType === 'ai' ? (
                  <Bot size={20} className="text-white" />
                ) : (
                  <User size={20} className="text-white" />
                )}
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Start {conversationType === 'ai' ? 'AI' : 'Human Counselor'} Conversation
                </h2>
                <p className="text-sm text-gray-600">
                  {conversationType === 'ai' 
                    ? 'Get immediate support from our AI companion' 
                    : 'Connect with a professional counselor'
                  }
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Conversation Title */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Conversation Title
            </label>
            <div className="flex space-x-2">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Stress about exams, Family issues, etc."
                className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                maxLength={100}
              />
              <button
                onClick={generateTitle}
                disabled={!firstMessage.trim()}
                className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Auto-generate
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              This helps you identify the conversation later
            </p>
          </div>

          {/* First Message */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              What would you like to talk about?
            </label>
            <textarea
              value={firstMessage}
              onChange={(e) => setFirstMessage(e.target.value)}
              placeholder="Share what's on your mind. Be as detailed as you'd like..."
              className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              rows={4}
              maxLength={1000}
            />
            <p className="text-xs text-gray-500 mt-1">
              {firstMessage.length}/1000 characters
            </p>
          </div>

          {/* Settings */}
          <div className="space-y-4 mb-6">
            {/* Priority */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Priority Level
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { value: 'low', label: 'Low', color: 'bg-green-100 text-green-800' },
                  { value: 'medium', label: 'Medium', color: 'bg-yellow-100 text-yellow-800' },
                  { value: 'high', label: 'High', color: 'bg-orange-100 text-orange-800' },
                  { value: 'urgent', label: 'Urgent', color: 'bg-red-100 text-red-800' }
                ].map((p) => (
                  <button
                    key={p.value}
                    onClick={() => setPriority(p.value as MessagePriority)}
                    className={`p-2 rounded-lg text-sm font-medium transition-colors ${
                      priority === p.value 
                        ? p.color + ' ring-2 ring-offset-2 ring-current' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Anonymous option */}
            <div>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={isAnonymous}
                  onChange={(e) => setIsAnonymous(e.target.checked)}
                  className="rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                />
                <span className="text-sm font-medium text-gray-700">Anonymous conversation</span>
              </label>
              <p className="text-xs text-gray-500 mt-1 ml-6">
                Your name and profile won't be shared with the counselor
              </p>
            </div>
          </div>

          {/* Info Banner */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                {conversationType === 'ai' ? (
                  <Bot className="w-5 h-5 text-blue-600" />
                ) : (
                  <User className="w-5 h-5 text-blue-600" />
                )}
              </div>
              <div className="text-sm text-blue-800">
                <h4 className="font-medium mb-1">
                  {conversationType === 'ai' ? 'AI Companion Features:' : 'Human Counselor Features:'}
                </h4>
                <ul className="space-y-1 text-xs">
                  {conversationType === 'ai' ? (
                    <>
                      <li>• Immediate responses available 24/7</li>
                      <li>• Culturally-aware guidance</li>
                      <li>• Safe space to explore thoughts</li>
                      <li>• Can escalate to human counselor if needed</li>
                    </>
                  ) : (
                    <>
                      <li>• Professional licensed counselors</li>
                      <li>• Personalized therapeutic approach</li>
                      <li>• Ongoing relationship building</li>
                      <li>• Response within 2 hours during business hours</li>
                    </>
                  )}
                </ul>
              </div>
            </div>
          </div>

          {/* Privacy Notice */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
            <div className="flex items-center space-x-2 mb-2">
              <Lock size={16} className="text-gray-600" />
              <span className="text-sm font-medium text-gray-700">Privacy & Security</span>
            </div>
            <div className="text-xs text-gray-600 space-y-1">
              <p>• All conversations are encrypted and secure</p>
              <p>• Your data is protected by FERPA and HIPAA standards</p>
              <p>• Only you and your assigned counselor can see your messages</p>
              <p>• You can request conversation deletion at any time</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
            <button
              onClick={handleCreate}
              disabled={!title.trim() || !firstMessage.trim() || isCreating}
              className={`flex items-center space-x-2 px-6 py-2 rounded-lg font-medium transition-colors ${
                title.trim() && firstMessage.trim() && !isCreating
                  ? conversationType === 'ai'
                    ? 'bg-purple-600 text-white hover:bg-purple-700'
                    : 'bg-green-600 text-white hover:bg-green-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {isCreating ? (
                <>
                  <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                  <span>Creating...</span>
                </>
              ) : (
                <>
                  {conversationType === 'ai' ? <Bot size={16} /> : <User size={16} />}
                  <span>Start Conversation</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewConversationModal;