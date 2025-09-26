// Student chat interface with AI/human toggle - Full Implementation
import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageCircle, 
  Bot, 
  Users, 
  Send, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Settings,
  X
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { MessageService } from '../../services/messageService';
import { OpenAIService } from '../../services/openaiService';
import { CulturalBackgroundModal } from '../shared/CulturalBackgroundModal';
import { 
  Message, 
  MessageDraft, 
  MessagePriority, 
  ResponseType, 
  CulturalBackground 
} from '../../types';

interface ChatMessage {
  id: string;
  content: string;
  sender: 'user' | 'assistant' | 'counselor';
  timestamp: Date;
  responseType?: 'ai' | 'human';
  status?: 'sending' | 'sent' | 'pending' | 'answered';
}

const ChatInterface: React.FC = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [responseType, setResponseType] = useState<ResponseType>('ai');
  const [priority, setPriority] = useState<MessagePriority>('medium');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showCulturalModal, setShowCulturalModal] = useState(false);
  const [conversationHistory, setConversationHistory] = useState<any[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const culturalBackground = user?.studentProfile?.culturalBackground || 'prefer-not-to-say';

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Initialize with welcome message
  useEffect(() => {
    if (messages.length === 0) {
      const welcomeMessage: ChatMessage = {
        id: `welcome-${Date.now()}`,
        content: `👋 Welcome to AIMES! I'm here to provide culturally-sensitive mental health support.

You can choose how you'd like to receive support:
• **AI Companion**: Immediate responses with cultural awareness
• **Human Counselor**: Professional guidance from certified counselors

What's on your mind today?`,
        sender: 'assistant',
        timestamp: new Date(),
        responseType: 'ai'
      };
      setMessages([welcomeMessage]);
    }
  }, []);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading || !user) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      content: inputMessage.trim(),
      sender: 'user',
      timestamp: new Date(),
      status: 'sending'
    };

    // Add user message immediately
    setMessages(prev => [...prev, userMessage]);
    const currentMessage = inputMessage.trim();
    setInputMessage('');
    setIsLoading(true);

    try {
      if (responseType === 'ai') {
        // Handle AI response
        await handleAIResponse(currentMessage, userMessage.id);
      } else {
        // Handle human counselor request
        await handleHumanRequest(currentMessage, userMessage.id);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Update message status to error
      setMessages(prev => prev.map(msg => 
        msg.id === userMessage.id 
          ? { ...msg, status: 'sent' }
          : msg
      ));

      // Add error message
      const errorMessage: ChatMessage = {
        id: `error-${Date.now()}`,
        content: '⚠️ Sorry, there was an error processing your message. Please try again.',
        sender: 'assistant',
        timestamp: new Date(),
        responseType: 'ai'
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAIResponse = async (message: string, userMessageId: string) => {
    try {
      // Check for crisis first
      const isCrisis = await OpenAIService.detectCrisis(message);
      
      if (isCrisis) {
        const crisisMessage: ChatMessage = {
          id: `crisis-${Date.now()}`,
          content: `🚨 **I'm concerned about your safety.** Please reach out for immediate help:

**Crisis Resources:**
• **National Suicide Prevention Lifeline**: 988
• **Crisis Text Line**: Text HOME to 741741
• **Emergency**: Call 911

You don't have to go through this alone. These trained professionals are available 24/7 and want to help.

Would you like me to help you find local mental health resources, or would you prefer to talk to a human counselor right away?`,
          sender: 'assistant',
          timestamp: new Date(),
          responseType: 'ai'
        };
        
        setMessages(prev => [
          ...prev.map(msg => msg.id === userMessageId ? { ...msg, status: 'sent' } : msg),
          crisisMessage
        ]);
        return;
      }

      // Generate AI response with conversation history
      const response = await OpenAIService.generateCulturalResponse(
        message,
        culturalBackground as CulturalBackground,
        conversationHistory
      );

      // Update conversation history
      setConversationHistory(prev => [
        ...prev,
        { role: 'user', content: message },
        { role: 'assistant', content: response.content }
      ].slice(-10)); // Keep last 10 messages

      // Add AI response
      const aiMessage: ChatMessage = {
        id: `ai-${Date.now()}`,
        content: response.content,
        sender: 'assistant',
        timestamp: new Date(),
        responseType: 'ai'
      };

      setMessages(prev => [
        ...prev.map(msg => msg.id === userMessageId ? { ...msg, status: 'sent' } : msg),
        aiMessage
      ]);

    } catch (error) {
      throw error; // Re-throw to be handled by parent
    }
  };

  const handleHumanRequest = async (message: string, userMessageId: string) => {
    try {
      // Create message draft
      const draft: MessageDraft = {
        content: message,
        responseType: 'human',
        priority,
        isAnonymous,
        includeJournalContext: false // TODO: Implement journal context selection
      };

      // Submit to counselor queue
      const messageId = await MessageService.submitMessage({
        draft,
        culturalContext: culturalBackground as CulturalBackground,
        studentId: user!.uid
      });

      // Update user message status
      setMessages(prev => prev.map(msg => 
        msg.id === userMessageId 
          ? { ...msg, status: 'sent' }
          : msg
      ));

      // Add confirmation message
      const confirmationMessage: ChatMessage = {
        id: `confirmation-${Date.now()}`,
        content: `✅ **Your message has been sent to our counselors!**

**What happens next:**
• A certified counselor will review your message
• You'll receive a response within 1 hour (usually much faster)
• We'll match you with a counselor who understands your cultural background

**Your request details:**
• Priority: ${priority}
• Cultural context: ${culturalBackground.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
• Anonymous: ${isAnonymous ? 'Yes' : 'No'}

You can continue chatting with me (AI) while you wait, or close this chat and come back later to check for responses.`,
        sender: 'assistant',
        timestamp: new Date(),
        responseType: 'ai',
        status: 'pending'
      };

      setMessages(prev => [...prev, confirmationMessage]);

      // TODO: Set up real-time listener for counselor responses
      
    } catch (error) {
      throw error; // Re-throw to be handled by parent
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatMessage = (content: string) => {
    // Convert markdown-style formatting to HTML
    let formatted = content;
    
    // Bold text
    formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // Bullet points
    formatted = formatted.replace(/^• (.+)$/gm, '<li>$1</li>');
    formatted = formatted.replace(/(<li>.*<\/li>)/s, '<ul class="list-disc list-inside space-y-1 ml-4">$1</ul>');
    
    // Line breaks
    formatted = formatted.replace(/\n\n/g, '</p><p class="mt-4">');
    formatted = `<p>${formatted}</p>`;
    
    return { __html: formatted };
  };

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-12rem)] flex flex-col">
      {/* Header */}
      <div className="bg-white rounded-t-xl shadow-sm border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <MessageCircle className="text-teal-600" size={24} />
            <div>
              <h2 className="font-semibold text-gray-900">Mental Health Chat</h2>
              <p className="text-sm text-gray-600">
                Cultural context: {culturalBackground.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </p>
            </div>
          </div>
          
          <button
            onClick={() => setShowCulturalModal(true)}
            className="flex items-center space-x-1 text-gray-600 hover:text-gray-900 text-sm"
          >
            <Settings size={16} />
            <span>Change</span>
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 bg-gray-50 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                message.sender === 'user'
                  ? 'bg-gradient-to-r from-teal-600 to-blue-600 text-white'
                  : 'bg-white border border-gray-200 text-gray-900'
              }`}
            >
              {/* Message content */}
              <div
                className={message.sender === 'assistant' ? 'prose prose-sm max-w-none' : ''}
                dangerouslySetInnerHTML={formatMessage(message.content)}
              />
              
              {/* Message metadata */}
              <div className={`flex items-center justify-between mt-2 text-xs ${
                message.sender === 'user' ? 'text-blue-100' : 'text-gray-500'
              }`}>
                <span>
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
                
                {message.sender === 'user' && (
                  <div className="flex items-center space-x-1">
                    {message.status === 'sending' && (
                      <div className="animate-spin w-3 h-3 border border-white/50 border-t-white rounded-full" />
                    )}
                    {message.status === 'sent' && <CheckCircle size={14} />}
                    {message.status === 'pending' && <Clock size={14} />}
                  </div>
                )}
                
                {message.responseType && (
                  <div className="flex items-center space-x-1">
                    {message.responseType === 'ai' ? (
                      <Bot size={12} />
                    ) : (
                      <Users size={12} />
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white border border-gray-200 rounded-2xl px-4 py-3">
              <div className="flex items-center space-x-2">
                <div className="animate-spin w-4 h-4 border-2 border-gray-300 border-t-teal-600 rounded-full" />
                <span className="text-gray-600 text-sm">
                  {responseType === 'ai' ? 'AI is thinking...' : 'Submitting to counselor queue...'}
                </span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Response Type Selector */}
      <div className="bg-white border-t border-gray-200 p-4">
        <div className="mb-4">
          <label className="text-sm font-medium text-gray-700 mb-2 block">
            Choose your support type:
          </label>
          <div className="flex space-x-4">
            <button
              onClick={() => setResponseType('ai')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-all ${
                responseType === 'ai'
                  ? 'border-teal-500 bg-teal-50 text-teal-700'
                  : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Bot size={16} />
              <span className="font-medium">AI Companion</span>
              <span className="text-xs opacity-75">(Instant)</span>
            </button>
            
            <button
              onClick={() => setResponseType('human')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-all ${
                responseType === 'human'
                  ? 'border-purple-500 bg-purple-50 text-purple-700'
                  : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Users size={16} />
              <span className="font-medium">Human Counselor</span>
              <span className="text-xs opacity-75">(~1 hour)</span>
            </button>
          </div>
        </div>

        {/* Additional options for human counselor */}
        {responseType === 'human' && (
          <div className="mb-4 p-3 bg-purple-50 border border-purple-200 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-purple-900">Priority Level:</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as MessagePriority)}
                className="text-sm border border-purple-200 rounded px-2 py-1"
              >
                <option value="low">Low - General guidance</option>
                <option value="medium">Medium - Need support</option>
                <option value="high">High - Urgent concern</option>
                <option value="urgent">Urgent - Crisis situation</option>
              </select>
            </div>
            
            <label className="flex items-center space-x-2 text-sm text-purple-800">
              <input
                type="checkbox"
                checked={isAnonymous}
                onChange={(e) => setIsAnonymous(e.target.checked)}
                className="rounded border-purple-300"
              />
              <span>Send anonymously (counselor won't see your profile)</span>
            </label>
          </div>
        )}

        {/* Message Input */}
        <div className="flex space-x-2">
          <textarea
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder={
              responseType === 'ai'
                ? "Share what's on your mind - I'm here to listen and support you..."
                : "Describe your situation for a human counselor. Be as detailed as you'd like..."
            }
            className="flex-1 px-4 py-3 border border-gray-300 rounded-xl resize-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            rows={2}
            disabled={isLoading}
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || isLoading}
            className={`px-6 py-3 rounded-xl font-medium transition-all flex items-center space-x-2 ${
              responseType === 'ai'
                ? 'bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700 text-white'
                : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            <Send size={16} />
            <span>{responseType === 'ai' ? 'Send' : 'Submit'}</span>
          </button>
        </div>
      </div>

      {/* Cultural Background Modal */}
      <CulturalBackgroundModal
        isOpen={showCulturalModal}
        onClose={() => setShowCulturalModal(false)}
        onComplete={() => setShowCulturalModal(false)}
        isChanging={true}
      />
    </div>
  );
};

export default ChatInterface;