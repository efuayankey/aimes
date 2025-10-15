import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  Target,
  Users,
  Clock,
  Award,
  AlertCircle,
  CheckCircle,
  RefreshCw,
  Filter,
  Calendar,
  Eye,
  MessageSquare
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { AIAnalysisService } from '../../services/aiAnalysisService';
import { ConversationAnalysisService } from '../../services/conversationAnalysisService';
import { 
  collection, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  addDoc,
  Timestamp 
} from 'firebase/firestore';
import { db } from '../../services/firebase';
import { 
  AIFeedback, 
  ConversationFeedback,
  CounselorPerformance, 
  FeedbackScores,
  SCORE_THRESHOLDS 
} from '../../types/Feedback';
import { CulturalBackground } from '../../types/User';
import FeedbackScoreCard from './FeedbackScoreCard';
import ImprovementSuggestionsCard from './ImprovementSuggestionsCard';

// Lazy load the analytics component
const CounselorAnalytics = React.lazy(() => import('../counselor/CounselorAnalytics'));

interface CounselorFeedbackDashboardProps {
  counselorId?: string; // If not provided, uses current user
}

const CounselorFeedbackDashboard: React.FC<CounselorFeedbackDashboardProps> = ({
  counselorId
}) => {
  const { user } = useAuth();
  const [feedback, setFeedback] = useState<AIFeedback[]>([]);
  const [conversationFeedback, setConversationFeedback] = useState<ConversationFeedback[]>([]);
  const [performance, setPerformance] = useState<CounselorPerformance | null>(null);
  const [selectedFeedback, setSelectedFeedback] = useState<AIFeedback | null>(null);
  const [selectedConversationFeedback, setSelectedConversationFeedback] = useState<ConversationFeedback | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [timeframe, setTimeframe] = useState<'week' | 'month' | 'quarter'>('month');
  const [showDemoData, setShowDemoData] = useState(false);
  const [currentView, setCurrentView] = useState<'feedback' | 'analytics'>('feedback');

  const currentCounselorId = counselorId || user?.uid;

  useEffect(() => {
    if (currentCounselorId) {
      loadFeedbackData();
    }
  }, [currentCounselorId, timeframe]);

  const loadFeedbackData = async () => {
    if (!currentCounselorId) return;

    try {
      setIsLoading(true);
      
      // Try to load real feedback from Firestore
      const q = query(
        collection(db, 'ai_feedback'),
        where('counselorId', '==', currentCounselorId)
      );

      const snapshot = await getDocs(q);
      let realFeedback = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        analyzedAt: doc.data().analyzedAt?.toDate()
      } as AIFeedback));

      // Sort by date client-side to avoid index requirement
      realFeedback = realFeedback.sort((a, b) => 
        new Date(b.analyzedAt).getTime() - new Date(a.analyzedAt).getTime()
      );

      if (realFeedback.length > 0) {
        console.log('Loaded real feedback data:', realFeedback);
        setFeedback(realFeedback);
        setShowDemoData(false);
        generatePerformanceData(realFeedback);
      } else {
        console.log('No real feedback found, showing demo data');
        setShowDemoData(true);
        generateDemoData();
      }
    } catch (error) {
      console.error('Failed to load feedback data:', error);
      // Fallback to demo data
      setShowDemoData(true);
      generateDemoData();
    } finally {
      setIsLoading(false);
    }
  };

  const generatePerformanceData = (feedbackData: AIFeedback[]) => {
    if (feedbackData.length === 0) return;

    // Calculate real performance metrics from actual feedback
    const scores = feedbackData.map(f => f.scores);
    const averageScores = {
      culturalSensitivity: scores.reduce((sum, s) => sum + s.culturalSensitivity, 0) / scores.length,
      culturalAwareness: scores.reduce((sum, s) => sum + s.culturalAwareness, 0) / scores.length,
      empathy: scores.reduce((sum, s) => sum + s.empathy, 0) / scores.length,
      professionalism: scores.reduce((sum, s) => sum + s.professionalism, 0) / scores.length,
      actionability: scores.reduce((sum, s) => sum + s.actionability, 0) / scores.length,
      questionQuality: scores.reduce((sum, s) => sum + s.questionQuality, 0) / scores.length,
      languageAppropriate: scores.reduce((sum, s) => sum + s.languageAppropriate, 0) / scores.length,
      responseLength: scores.reduce((sum, s) => sum + s.responseLength, 0) / scores.length,
      overall: scores.reduce((sum, s) => sum + s.overall, 0) / scores.length
    };

    const realPerformance: CounselorPerformance = {
      counselorId: currentCounselorId!,
      timeframe: {
        start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        end: new Date()
      },
      averageScores,
      scoresTrend: 'stable', // Would need historical data to determine trend
      totalResponses: feedbackData.length,
      totalFeedback: feedbackData.length,
      responsesPerWeek: Math.round(feedbackData.length / 4),
      culturalStrengths: ['Based on real feedback analysis'],
      culturalAreasForGrowth: ['Based on real feedback analysis'],
      culturalBackgroundsServed: [...new Set(feedbackData.map(f => f.responseContext.culturalBackground))],
      bestPerformingCultures: [],
      challengingCultures: [],
      improvementAreas: [],
      consistentStrengths: [],
      recentImprovements: [],
      averageConversationLength: 10,
      studentReturnRate: 75,
      positiveOutcomeRate: Math.round(averageScores.overall * 10)
    };

    setPerformance(realPerformance);
  };

  const generateDemoData = () => {
    // Generate demo feedback data for testing
    const demoFeedback: AIFeedback[] = [
      {
        id: '1',
        messageId: 'msg_1',
        counselorId: currentCounselorId!,
        studentId: 'student_1',
        scores: {
          culturalSensitivity: 8.5,
          culturalAwareness: 7.8,
          empathy: 9.2,
          professionalism: 8.9,
          actionability: 7.5,
          questionQuality: 8.1,
          languageAppropriate: 8.7,
          responseLength: 8.0,
          overall: 8.3
        },
        culturalAnalysis: {
          assumptions: [],
          biases: [],
          strengths: ['Acknowledged cultural family dynamics', 'Used culturally appropriate language'],
          culturalMisses: ['Could explore cultural coping mechanisms'],
          appropriateReferences: ['Referenced importance of family honor']
        },
        suggestions: {
          strengths: [
            'Showed excellent empathy and understanding',
            'Acknowledged the cultural importance of family relationships',
            'Used appropriate and respectful language'
          ],
          improvements: [
            'Could ask more about specific cultural stressors',
            'Consider exploring traditional coping methods'
          ],
          culturalTips: [
            'In Latino families, family honor and loyalty are often central values',
            'Consider asking about extended family support systems'
          ],
          alternativeApproaches: [
            'Explore family-based intervention strategies',
            'Ask about cultural or religious practices that provide comfort'
          ],
          questionsToAsk: [
            'How does your family typically handle stress or difficult situations?',
            'Are there cultural traditions that bring you comfort?'
          ]
        },
        responseContext: {
          studentMessage: 'My family doesn\'t understand my anxiety...',
          counselorResponse: 'I can understand how challenging that must be...',
          culturalBackground: 'latino-hispanic',
          conversationHistory: [],
          urgencyLevel: 'medium'
        },
        analyzedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        aiModel: 'gpt-4',
        analysisVersion: '1.0',
        reviewedByCounselor: false,
        flaggedForReview: false,
        trainingDataQuality: 'high'
      },
      {
        id: '2',
        messageId: 'msg_2',
        counselorId: currentCounselorId!,
        studentId: 'student_2',
        scores: {
          culturalSensitivity: 6.2,
          culturalAwareness: 5.8,
          empathy: 8.1,
          professionalism: 8.5,
          actionability: 7.0,
          questionQuality: 6.5,
          languageAppropriate: 7.2,
          responseLength: 7.8,
          overall: 6.9
        },
        culturalAnalysis: {
          assumptions: ['Assumed Western therapy approach would be appropriate'],
          biases: ['Potential bias toward individual vs. community-based solutions'],
          strengths: ['Good empathy', 'Professional tone'],
          culturalMisses: ['Missed opportunity to explore cultural mental health stigma'],
          appropriateReferences: []
        },
        suggestions: {
          strengths: [
            'Maintained professional boundaries well',
            'Showed genuine care and concern'
          ],
          improvements: [
            'Learn more about Asian-American mental health stigma',
            'Consider cultural factors in treatment approach',
            'Ask about family expectations and pressure'
          ],
          culturalTips: [
            'Mental health is often stigmatized in Asian cultures',
            'Academic and career pressure are common stressors',
            'Family shame and honor concepts are important'
          ],
          alternativeApproaches: [
            'Explore culturally adapted therapy approaches',
            'Consider family involvement in treatment'
          ],
          questionsToAsk: [
            'How comfortable is your family with seeking mental health support?',
            'What cultural factors might be contributing to your stress?'
          ]
        },
        responseContext: {
          studentMessage: 'I can\'t tell my parents about my depression...',
          counselorResponse: 'It sounds like you\'re dealing with a lot...',
          culturalBackground: 'asian-american',
          conversationHistory: [],
          urgencyLevel: 'medium'
        },
        analyzedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        aiModel: 'gpt-4',
        analysisVersion: '1.0',
        reviewedByCounselor: false,
        flaggedForReview: true,
        trainingDataQuality: 'medium'
      }
    ];

    setFeedback(demoFeedback);

    // Generate demo performance data
    const demoPerformance: CounselorPerformance = {
      counselorId: currentCounselorId!,
      timeframe: {
        start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        end: new Date()
      },
      averageScores: {
        culturalSensitivity: 7.4,
        culturalAwareness: 6.8,
        empathy: 8.7,
        professionalism: 8.7,
        actionability: 7.3,
        questionQuality: 7.3,
        languageAppropriate: 7.9,
        responseLength: 7.9,
        overall: 7.6
      },
      scoresTrend: 'improving',
      totalResponses: 24,
      totalFeedback: 18,
      responsesPerWeek: 6,
      culturalStrengths: ['Empathy', 'Professional boundaries'],
      culturalAreasForGrowth: ['Cultural awareness', 'Cultural-specific interventions'],
      culturalBackgroundsServed: ['latino-hispanic', 'asian-american', 'african-american'],
      bestPerformingCultures: ['latino-hispanic'],
      challengingCultures: ['asian-american'],
      improvementAreas: ['Cultural sensitivity', 'Cultural-specific questioning'],
      consistentStrengths: ['Empathy', 'Professionalism'],
      recentImprovements: ['Better cultural language use'],
      averageConversationLength: 12.5,
      studentReturnRate: 78,
      positiveOutcomeRate: 82
    };

    setPerformance(demoPerformance);
  };

  const getScoreColor = (score: number): string => {
    if (score >= SCORE_THRESHOLDS.EXCELLENT) return 'text-green-600';
    if (score >= SCORE_THRESHOLDS.GOOD) return 'text-blue-600';
    if (score >= SCORE_THRESHOLDS.NEEDS_IMPROVEMENT) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getTrendIcon = (trend: 'improving' | 'stable' | 'declining') => {
    switch (trend) {
      case 'improving':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'declining':
        return <TrendingUp className="h-4 w-4 text-red-500 transform rotate-180" />;
      default:
        return <Target className="h-4 w-4 text-gray-500" />;
    }
  };

  const testAIAnalysis = async () => {
    try {
      setIsLoading(true);
      console.log('Starting real conversation analysis...');
      
      // Create a realistic full conversation for analysis
      const testConversation = [
        {
          content: "Hi, I've been feeling really overwhelmed lately. My parents keep pressuring me about my grades and I don't know how to handle it.",
          senderType: 'student' as const
        },
        {
          content: "Thank you for reaching out. It sounds like you're dealing with a lot of pressure right now. Can you tell me more about what this pressure feels like for you?",
          senderType: 'counselor' as const
        },
        {
          content: "It's like nothing I do is ever good enough. They keep comparing me to my cousins who got into Ivy League schools. They say I'm bringing shame to the family.",
          senderType: 'student' as const
        },
        {
          content: "That sounds incredibly difficult. The weight of family expectations can be especially challenging. In your family, what does academic success mean beyond just grades?",
          senderType: 'counselor' as const
        },
        {
          content: "My parents sacrificed a lot to come here from Korea. They think if I don't succeed academically, their sacrifice was worthless. But I'm trying my best!",
          senderType: 'student' as const
        },
        {
          content: "I can hear how much you care about honoring your parents' sacrifice - that shows a lot of love and respect. At the same time, it sounds like the pressure is affecting your wellbeing. How do you think we could help your parents understand your perspective while still respecting their values?",
          senderType: 'counselor' as const
        },
        {
          content: "I don't know... Maybe if they understood that I'm struggling with anxiety, not laziness? But they don't really believe in mental health issues.",
          senderType: 'student' as const
        },
        {
          content: "That's a really important distinction - anxiety versus laziness. Many Korean families have complex relationships with mental health concepts. Would it be helpful to explore some culturally sensitive ways to have this conversation with your parents?",
          senderType: 'counselor' as const
        }
      ];

      const result = await ConversationAnalysisService.quickConversationAnalysis(
        'test_conv_' + Date.now(),
        currentCounselorId!,
        user?.uid || 'test_student',
        'asian-american',
        testConversation
      );
      
      console.log('Conversation analysis result:', result);
      
      // Store the conversation feedback in Firestore
      const conversationFeedbackData = {
        conversationId: result.conversationId,
        counselorId: result.counselorId,
        studentId: result.studentId,
        overallPerformance: result.overallPerformance,
        conversationAnalysis: result.conversationAnalysis,
        suggestions: result.suggestions,
        analysisContext: result.analysisContext,
        aiModel: result.aiModel,
        analysisVersion: result.analysisVersion,
        reviewedByCounselor: result.reviewedByCounselor,
        flaggedForReview: result.flaggedForReview,
        trainingDataQuality: result.trainingDataQuality,
        analyzedAt: Timestamp.now()
      };
      
      console.log('Storing conversation feedback in Firestore...');
      const docRef = await addDoc(collection(db, 'conversation_feedback'), conversationFeedbackData);
      console.log('Conversation feedback stored with ID:', docRef.id);
      
      const storedFeedback: ConversationFeedback = {
        id: docRef.id,
        ...conversationFeedbackData,
        analyzedAt: new Date()
      };
      
      setSelectedConversationFeedback(storedFeedback);
      alert('Real conversation analysis generated! This analyzes the FULL conversation, not just individual messages.');
      
      // Reload the feedback data to show the new entry
      loadFeedbackData();
    } catch (error) {
      console.error('Conversation analysis test failed:', error);
      alert('Conversation analysis test failed. Check console for details.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!user || (user.userType !== 'counselor' && user.userType !== 'admin')) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600">This dashboard is only accessible to counselors.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {currentView === 'feedback' ? 'AI Feedback Dashboard' : 'Performance Analytics'}
              </h1>
              <p className="text-gray-600">
                {currentView === 'feedback' 
                  ? 'Cultural competency analysis and improvement suggestions'
                  : 'Track your counseling performance and cultural competency over time'
                }
              </p>
              <div className="mt-2 flex items-center space-x-2 text-sm px-3 py-1 rounded-full w-fit">
                {showDemoData ? (
                  <>
                    <AlertCircle className="h-4 w-4 text-orange-600" />
                    <span className="text-orange-600 bg-orange-50 px-2 py-1 rounded-full">
                      ⚠️ Demo Data - Generate real feedback to see actual analysis
                    </span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-green-600 bg-green-50 px-2 py-1 rounded-full">
                      ✅ Real AI Feedback Data
                    </span>
                  </>
                )}
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              {currentView === 'feedback' && (
                <>
                  <button
                    onClick={testAIAnalysis}
                    disabled={isLoading}
                    className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
                  >
                    <MessageSquare className="h-4 w-4" />
                    <span>{isLoading ? 'Analyzing Conversation...' : 'Analyze Full Conversation'}</span>
                  </button>
                  
                  <button
                    onClick={loadFeedbackData}
                    disabled={isLoading}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                    <span>Refresh</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-8">
          <div className="bg-white rounded-xl shadow-sm">
            <div className="border-b border-gray-200">
              <nav className="flex space-x-8 px-6">
                <button
                  onClick={() => setCurrentView('feedback')}
                  className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors flex items-center space-x-2 ${
                    currentView === 'feedback'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <MessageSquare size={16} />
                  <span>Feedback Analysis</span>
                </button>
                <button
                  onClick={() => setCurrentView('analytics')}
                  className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors flex items-center space-x-2 ${
                    currentView === 'analytics'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <BarChart3 size={16} />
                  <span>Performance Analytics</span>
                </button>
              </nav>
            </div>
          </div>
        </div>

        {/* Content based on current view */}
        {currentView === 'feedback' ? (
          <>
            {/* Performance Summary */}
            {performance && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Overall Score</p>
                  <p className={`text-2xl font-bold ${getScoreColor(performance.averageScores.overall)}`}>
                    {performance.averageScores.overall.toFixed(1)}/10
                  </p>
                  <div className="flex items-center space-x-1 mt-1">
                    {getTrendIcon(performance.scoresTrend)}
                    <span className="text-xs text-gray-500 capitalize">{performance.scoresTrend}</span>
                  </div>
                </div>
                <Award className="h-8 w-8 text-purple-600" />
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Cultural Competency</p>
                  <p className={`text-2xl font-bold ${getScoreColor(performance.averageScores.culturalSensitivity)}`}>
                    {performance.averageScores.culturalSensitivity.toFixed(1)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Sensitivity & Awareness
                  </p>
                </div>
                <Users className="h-8 w-8 text-blue-600" />
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Feedback</p>
                  <p className="text-2xl font-bold text-gray-900">{performance.totalFeedback}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {performance.responsesPerWeek}/week avg
                  </p>
                </div>
                <BarChart3 className="h-8 w-8 text-green-600" />
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Student Outcomes</p>
                  <p className="text-2xl font-bold text-gray-900">{performance.positiveOutcomeRate}%</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {performance.studentReturnRate}% return rate
                  </p>
                </div>
                <Target className="h-8 w-8 text-orange-600" />
              </div>
            </div>
          </div>
        )}

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Feedback List */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Recent Feedback</h2>
              </div>
              
              <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
                {feedback.map((item) => (
                  <div
                    key={item.id}
                    className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                      selectedFeedback?.id === item.id ? 'bg-blue-50 border-r-4 border-blue-500' : ''
                    }`}
                    onClick={() => setSelectedFeedback(item)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-lg font-semibold ${getScoreColor(item.scores.overall)}`}>
                        {item.scores.overall.toFixed(1)}
                      </span>
                      <div className="flex items-center space-x-1">
                        {item.flaggedForReview && (
                          <AlertCircle className="h-4 w-4 text-yellow-500" />
                        )}
                        <Eye className="h-4 w-4 text-gray-400" />
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-1 capitalize">
                      {item.responseContext.culturalBackground.replace('-', ' ')} context
                    </p>
                    
                    <p className="text-xs text-gray-500">
                      {item.analyzedAt.toLocaleDateString()} • 
                      Quality: {item.trainingDataQuality}
                    </p>
                  </div>
                ))}
                
                {feedback.length === 0 && !isLoading && (
                  <div className="p-8 text-center text-gray-500">
                    <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No feedback available yet</p>
                    <p className="text-sm">Try the "Test AI Analysis" button above</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Feedback Details */}
          <div className="lg:col-span-2 space-y-6">
            {selectedFeedback ? (
              <>
                <FeedbackScoreCard scores={selectedFeedback.scores} showDetails />
                <ImprovementSuggestionsCard
                  suggestions={selectedFeedback.suggestions}
                  culturalAnalysis={selectedFeedback.culturalAnalysis}
                  culturalBackground={selectedFeedback.responseContext.culturalBackground}
                />
              </>
            ) : (
              <div className="bg-white rounded-lg p-12 text-center border-2 border-dashed border-gray-200">
                <BarChart3 className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Select Feedback to View</h3>
                <p className="text-gray-600">
                  Choose a feedback item from the list to see detailed analysis and suggestions
                </p>
              </div>
            )}
          </div>
        </div>
          </>
        ) : (
          /* Analytics View */
          <React.Suspense fallback={
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          }>
            <CounselorAnalytics showDemoData={showDemoData} />
          </React.Suspense>
        )}
      </div>
    </div>
  );
};

export default CounselorFeedbackDashboard;