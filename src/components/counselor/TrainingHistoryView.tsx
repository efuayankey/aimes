import React, { useState, useEffect } from 'react';
import { Calendar, Clock, User, Brain, TrendingUp, BarChart3, Eye, Download, RefreshCw, AlertCircle } from 'lucide-react';
import { TrainingSessionService } from '../../services/trainingSessionService';
import { ConversationAnalysisService } from '../../services/conversationAnalysisService';
import { SimulationSession } from '../../types/SimulatedPatient';
import { ConversationFeedback } from '../../types/Feedback';

type TrainingStats = {
  totalSessions: number;
  totalDuration: number;
  averageScore: number;
  culturesExplored: string[];
  concernsAddressed: string[];
  recentSessions: SimulationSession[];
  improvementTrend: 'improving' | 'stable' | 'declining';
};

interface TrainingHistoryViewProps {
  counselorId: string;
  className?: string;
}

export const TrainingHistoryView: React.FC<TrainingHistoryViewProps> = ({
  counselorId,
  className = ''
}) => {
  const [sessions, setSessions] = useState<SimulationSession[]>([]);
  const [stats, setStats] = useState<TrainingStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSession, setSelectedSession] = useState<SimulationSession | null>(null);
  const [sessionAnalysis, setSessionAnalysis] = useState<ConversationFeedback | null>(null);
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);
  const [isReanalyzing, setIsReanalyzing] = useState(false);
  const [showAnalysisModal, setShowAnalysisModal] = useState(false);

  useEffect(() => {
    loadTrainingData();
  }, [counselorId]);

  const loadTrainingData = async () => {
    try {
      setLoading(true);
      const [sessionsData, statsData] = await Promise.all([
        TrainingSessionService.getCounselorTrainingSessions(counselorId, 20),
        TrainingSessionService.getCounselorTrainingStats(counselorId)
      ]);
      
      setSessions(sessionsData);
      setStats(statsData);
    } catch (error) {
      console.error('Failed to load training data:', error);
    } finally {
      setLoading(false);
    }
  };

  const viewSessionDetails = async (session: SimulationSession) => {
    setSelectedSession(session);
    setLoadingAnalysis(true);
    
    try {
      const analysis = await TrainingSessionService.getTrainingAnalysis(session.id);
      setSessionAnalysis(analysis);
    } catch (error) {
      console.error('Failed to load session analysis:', error);
      setSessionAnalysis(null);
    } finally {
      setLoadingAnalysis(false);
    }
  };

  const reanalyzeSession = async (session: SimulationSession) => {
    if (!session || !session.messages || session.messages.length < 3) {
      alert('Session is too short for analysis. Need at least 3 messages.');
      return;
    }

    try {
      setIsReanalyzing(true);
      
      // Convert messages to format expected by analysis service
      const analysisMessages = session.messages.map(msg => ({
        content: msg.content,
        senderType: msg.senderType === 'patient' ? 'student' as const : 'counselor' as const
      }));

      console.log('Re-analyzing training session:', session.id);
      
      const conversationAnalysis = await ConversationAnalysisService.quickConversationAnalysis(
        session.id,
        session.counselorId,
        'simulated_patient',
        session.simulatedPatient.culturalBackground,
        analysisMessages
      );

      // Save analysis to Firestore
      await TrainingSessionService.saveTrainingAnalysis(session.id, conversationAnalysis);
      
      setSessionAnalysis(conversationAnalysis);
      setShowAnalysisModal(true);
      
    } catch (error) {
      console.error('Failed to re-analyze training session:', error);
      alert('Failed to analyze session: ' + error.message);
    } finally {
      setIsReanalyzing(false);
    }
  };

  const exportTrainingData = async () => {
    try {
      const exportData = await TrainingSessionService.exportTrainingDataForResearch(counselorId);
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `training-data-${counselorId}-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export training data:', error);
    }
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${Math.round(minutes)}m`;
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    return `${hours}h ${mins}m`;
  };

  const getOutcomeColor = (outcome: string) => {
    switch (outcome) {
      case 'successful': return 'text-green-600 bg-green-50';
      case 'partial': return 'text-yellow-600 bg-yellow-50';
      case 'needs_improvement': return 'text-orange-600 bg-orange-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving': return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'declining': return <TrendingUp className="w-4 h-4 text-red-600 transform rotate-180" />;
      default: return <BarChart3 className="w-4 h-4 text-gray-600" />;
    }
  };

  if (loading) {
    return (
      <div className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}>
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            <div className="h-4 bg-gray-200 rounded w-4/6"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg border border-gray-200 ${className}`}>
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Training History</h2>
          <button
            onClick={exportTrainingData}
            className="flex items-center space-x-2 px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Export Data</span>
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      {stats && (
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-600 font-medium">Total Sessions</p>
                  <p className="text-2xl font-bold text-blue-900">{stats.totalSessions}</p>
                </div>
                <Brain className="w-8 h-8 text-blue-600" />
              </div>
            </div>

            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-600 font-medium">Total Time</p>
                  <p className="text-2xl font-bold text-green-900">{formatDuration(stats.totalDuration)}</p>
                </div>
                <Clock className="w-8 h-8 text-green-600" />
              </div>
            </div>

            <div className="bg-purple-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-purple-600 font-medium">Average Score</p>
                  <p className="text-2xl font-bold text-purple-900">{stats.averageScore.toFixed(1)}</p>
                </div>
                <BarChart3 className="w-8 h-8 text-purple-600" />
              </div>
            </div>

            <div className="bg-orange-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-orange-600 font-medium">Progress</p>
                  <p className="text-lg font-bold text-orange-900 capitalize">{stats.improvementTrend}</p>
                </div>
                {getTrendIcon(stats.improvementTrend)}
              </div>
            </div>
          </div>

          {/* Cultural Diversity */}
          <div className="mt-4 grid md:grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">Cultures Explored ({stats.culturesExplored.length})</h4>
              <div className="flex flex-wrap gap-1">
                {stats.culturesExplored.slice(0, 6).map((culture, index) => (
                  <span key={index} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {culture}
                  </span>
                ))}
                {stats.culturesExplored.length > 6 && (
                  <span className="text-xs text-gray-500">+{stats.culturesExplored.length - 6} more</span>
                )}
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">Concerns Addressed ({stats.concernsAddressed.length})</h4>
              <div className="flex flex-wrap gap-1">
                {stats.concernsAddressed.slice(0, 4).map((concern, index) => (
                  <span key={index} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    {concern}
                  </span>
                ))}
                {stats.concernsAddressed.length > 4 && (
                  <span className="text-xs text-gray-500">+{stats.concernsAddressed.length - 4} more</span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sessions List */}
      <div className="px-6 py-4">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Training Sessions</h3>
        
        {sessions.length === 0 ? (
          <div className="text-center py-8">
            <Brain className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500">No training sessions yet</p>
            <p className="text-sm text-gray-400 mt-1">Complete some simulated patient sessions to see your progress</p>
          </div>
        ) : (
          <div className="space-y-3">
            {sessions.map((session) => (
              <div key={session.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-4 mb-2">
                      <div className="flex items-center space-x-2">
                        <User className="w-4 h-4 text-gray-400" />
                        <span className="text-sm font-medium text-gray-900">
                          {session.simulatedPatient.gender} • {session.simulatedPatient.culturalBackground}
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-500">
                          {session.sessionStarted.toLocaleDateString()}
                        </span>
                      </div>
                      
                      {session.sessionDuration && (
                        <div className="flex items-center space-x-2">
                          <Clock className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-500">
                            {formatDuration(session.sessionDuration)}
                          </span>
                        </div>
                      )}
                    </div>

                    <p className="text-sm text-gray-700 mb-2">
                      <strong>Concern:</strong> {session.simulatedPatient.mentalHealthConcern}
                    </p>

                    {session.sessionOutcome && (
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getOutcomeColor(session.sessionOutcome)}`}>
                        {session.sessionOutcome.replace('_', ' ')}
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => viewSessionDetails(session)}
                    className="flex items-center space-x-1 px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                    <span>View Details</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Session Details Modal */}
      {selectedSession && (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold">Training Session Details</h2>
                  <p className="text-white/90">{selectedSession.sessionStarted.toLocaleDateString()}</p>
                </div>
                <button
                  onClick={() => setSelectedSession(null)}
                  className="text-white/80 hover:text-white text-xl"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="p-6 max-h-[70vh] overflow-y-auto">
              {/* Patient Info */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Simulated Patient</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-700 font-medium">Cultural Background</p>
                      <p className="font-semibold">{selectedSession.simulatedPatient.culturalBackground}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-700 font-medium">Gender</p>
                      <p className="font-semibold">{selectedSession.simulatedPatient.gender}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-700 font-medium">Age Range</p>
                      <p className="font-semibold">{selectedSession.simulatedPatient.ageRange}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-700 font-medium">Mental Health Concern</p>
                      <p className="font-semibold">{selectedSession.simulatedPatient.mentalHealthConcern}</p>
                    </div>
                  </div>
                  <div className="mt-3">
                    <p className="text-sm text-gray-700 font-medium">Background Story</p>
                    <p className="text-sm text-gray-900 mt-1">{selectedSession.simulatedPatient.backgroundStory}</p>
                  </div>
                </div>
              </div>

              {/* Analysis */}
              {loadingAnalysis ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <span className="ml-3 text-gray-600">Loading analysis...</span>
                </div>
              ) : sessionAnalysis ? (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Cultural Competency Analysis</h3>
                  <div className="space-y-4">
                    {/* Overall Score */}
                    <div className="bg-blue-50 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-blue-900">Overall Performance</h4>
                        <span className="text-2xl font-bold text-blue-900">
                          {sessionAnalysis.overallPerformance?.overallScore?.toFixed(1) || 'N/A'}
                        </span>
                      </div>
                    </div>

                    {/* Cultural Competency Scores */}
                    {sessionAnalysis.culturalCompetency && (
                      <div className="grid md:grid-cols-3 gap-4">
                        <div className="bg-green-50 rounded-lg p-3">
                          <p className="text-sm font-medium text-green-900">Cultural Awareness</p>
                          <p className="text-lg font-bold text-green-700">
                            {sessionAnalysis.culturalCompetency.culturalAwareness?.toFixed(1) || 'N/A'}
                          </p>
                        </div>
                        <div className="bg-purple-50 rounded-lg p-3">
                          <p className="text-sm font-medium text-purple-900">Cultural Sensitivity</p>
                          <p className="text-lg font-bold text-purple-700">
                            {sessionAnalysis.culturalCompetency.culturalSensitivity?.toFixed(1) || 'N/A'}
                          </p>
                        </div>
                        <div className="bg-orange-50 rounded-lg p-3">
                          <p className="text-sm font-medium text-orange-900">Cultural Adaptation</p>
                          <p className="text-lg font-bold text-orange-700">
                            {sessionAnalysis.culturalCompetency.culturalAdaptation?.toFixed(1) || 'N/A'}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Feedback Summary */}
                    {sessionAnalysis.feedback && (
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h4 className="font-medium text-gray-900 mb-2">Key Feedback</h4>
                        <div className="text-sm text-gray-700 space-y-2">
                          {sessionAnalysis.feedback.strengths && (
                            <div>
                              <strong className="text-green-700">Strengths:</strong>
                              <ul className="list-disc list-inside ml-2 mt-1">
                                {sessionAnalysis.feedback.strengths.map((strength: string, index: number) => (
                                  <li key={index}>{strength}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                          {sessionAnalysis.feedback.improvements && (
                            <div>
                              <strong className="text-orange-700">Areas for Improvement:</strong>
                              <ul className="list-disc list-inside ml-2 mt-1">
                                {sessionAnalysis.feedback.improvements.map((improvement: string, index: number) => (
                                  <li key={index}>{improvement}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Analysis</h3>
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-start space-x-2">
                      <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                      <div>
                        <p className="text-yellow-800 font-medium">No analysis available for this session</p>
                        <p className="text-yellow-700 text-sm mt-1">Click &quot;Analyze Session&quot; to generate cultural competency analysis</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Session Messages Summary */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Session Summary</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="grid md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-gray-700 font-medium">Total Messages</p>
                      <p className="font-semibold text-gray-900">{selectedSession.messages.length}</p>
                    </div>
                    <div>
                      <p className="text-gray-700 font-medium">Counselor Messages</p>
                      <p className="font-semibold text-gray-900">
                        {selectedSession.messages.filter(m => m.senderType === 'counselor').length}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-700 font-medium">Session Duration</p>
                      <p className="font-semibold text-gray-900">
                        {selectedSession.sessionDuration ? formatDuration(selectedSession.sessionDuration) : 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Conversation Transcript */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Conversation Transcript</h3>
                <div className="bg-white border border-gray-200 rounded-lg max-h-96 overflow-y-auto">
                  <div className="p-4 space-y-4">
                    {selectedSession.messages.map((message, index) => (
                      <div
                        key={index}
                        className={`flex ${
                          message.senderType === 'counselor' ? 'justify-end' : 'justify-start'
                        }`}
                      >
                        <div
                          className={`max-w-[80%] rounded-lg px-4 py-3 ${
                            message.senderType === 'counselor'
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-200 text-gray-900 border border-gray-300'
                          }`}
                        >
                          <div className="flex items-center space-x-2 mb-1">
                            <span className={`text-xs font-medium ${
                              message.senderType === 'counselor' 
                                ? 'text-blue-100' 
                                : 'text-gray-700'
                            }`}>
                              {message.senderType === 'counselor' ? 'Counselor' : 'Patient'}
                            </span>
                            <span className={`text-xs ${
                              message.senderType === 'counselor' 
                                ? 'text-blue-100' 
                                : 'text-gray-600'
                            }`}>
                              {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <p className="text-sm leading-relaxed whitespace-pre-wrap">
                            {message.content}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {selectedSession.messages.length === 0 && (
                    <div className="p-8 text-center text-gray-700">
                      <p>No messages found in this session</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-gray-50 px-6 py-4 flex justify-between items-center">
              <div className="flex space-x-3">
                {sessionAnalysis ? (
                  <button
                    onClick={() => setShowAnalysisModal(true)}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <BarChart3 className="w-4 h-4" />
                    <span>View Full Analysis</span>
                  </button>
                ) : null}
                
                <button
                  onClick={() => reanalyzeSession(selectedSession!)}
                  disabled={isReanalyzing || selectedSession!.messages.length < 3}
                  className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isReanalyzing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Analyzing...</span>
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-4 h-4" />
                      <span>{sessionAnalysis ? 'Re-analyze' : 'Analyze'} Session</span>
                    </>
                  )}
                </button>
              </div>
              
              <button
                onClick={() => setSelectedSession(null)}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Full Analysis Modal */}
      {showAnalysisModal && sessionAnalysis && (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-green-600 to-blue-600 px-6 py-4 text-white relative">
              <button
                onClick={() => setShowAnalysisModal(false)}
                className="absolute top-4 right-4 text-white/80 hover:text-white text-xl"
              >
                ×
              </button>
              
              <div className="flex items-center space-x-3">
                <div className="bg-white/20 backdrop-blur-sm rounded-full p-2">
                  <BarChart3 size={24} />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Cultural Competency Analysis</h2>
                  <p className="text-white/90 mt-1">Training Session Analysis Results</p>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 max-h-[70vh] overflow-y-auto">
              <div className="space-y-6">
                {/* Overall Performance */}
                {sessionAnalysis.overallPerformance && (
                  <div className="mb-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Overall Performance</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {Object.entries(sessionAnalysis.overallPerformance).map(([key, value]) => (
                        <div key={key} className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-4">
                          <div className="text-sm text-blue-600 font-medium mb-1">
                            {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                          </div>
                          <div className="text-2xl font-bold text-blue-900">
                            {typeof value === 'number' ? value.toFixed(1) : value}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Cultural Competency Scores */}
                {sessionAnalysis.culturalCompetency && (
                  <div className="mb-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Cultural Competency Breakdown</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {Object.entries(sessionAnalysis.culturalCompetency).map(([key, value]) => (
                        <div key={key} className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg p-4">
                          <div className="text-sm text-purple-600 font-medium mb-1">
                            {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                          </div>
                          <div className="text-2xl font-bold text-purple-900">
                            {typeof value === 'number' ? value.toFixed(1) : value}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Conversation Analysis */}
                {sessionAnalysis.conversationAnalysis && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Strengths */}
                    {sessionAnalysis.conversationAnalysis.strengths?.length > 0 && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <h4 className="font-semibold text-green-900 mb-3 flex items-center">
                          <span className="w-2 h-2 bg-green-600 rounded-full mr-2"></span>
                          Strengths
                        </h4>
                        <ul className="space-y-2 text-sm text-green-800">
                          {sessionAnalysis.conversationAnalysis.strengths.map((strength: string, index: number) => (
                            <li key={index} className="flex items-start">
                              <span className="text-green-600 mr-2">•</span>
                              <span>{strength}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Areas for Improvement */}
                    {sessionAnalysis.conversationAnalysis.weaknesses?.length > 0 && (
                      <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                        <h4 className="font-semibold text-orange-900 mb-3 flex items-center">
                          <span className="w-2 h-2 bg-orange-600 rounded-full mr-2"></span>
                          Areas for Improvement
                        </h4>
                        <ul className="space-y-2 text-sm text-orange-800">
                          {sessionAnalysis.conversationAnalysis.weaknesses.map((weakness: string, index: number) => (
                            <li key={index} className="flex items-start">
                              <span className="text-orange-600 mr-2">•</span>
                              <span>{weakness}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Cultural Highlights */}
                    {sessionAnalysis.conversationAnalysis.goodCulturalMoments?.length > 0 && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <h4 className="font-semibold text-blue-900 mb-3 flex items-center">
                          <span className="w-2 h-2 bg-blue-600 rounded-full mr-2"></span>
                          Cultural Highlights
                        </h4>
                        <ul className="space-y-2 text-sm text-blue-800">
                          {sessionAnalysis.conversationAnalysis.goodCulturalMoments.map((moment: string, index: number) => (
                            <li key={index} className="flex items-start">
                              <span className="text-blue-600 mr-2">•</span>
                              <span>{moment}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Cultural Opportunities */}
                    {sessionAnalysis.conversationAnalysis.culturalMisses?.length > 0 && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <h4 className="font-semibold text-red-900 mb-3 flex items-center">
                          <span className="w-2 h-2 bg-red-600 rounded-full mr-2"></span>
                          Cultural Opportunities
                        </h4>
                        <ul className="space-y-2 text-sm text-red-800">
                          {sessionAnalysis.conversationAnalysis.culturalMisses.map((miss: string, index: number) => (
                            <li key={index} className="flex items-start">
                              <span className="text-red-600 mr-2">•</span>
                              <span>{miss}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                {/* Suggestions */}
                {sessionAnalysis.suggestions && (
                  <div className="mt-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Specific Recommendations</h3>
                    <div className="space-y-4">
                      {sessionAnalysis.suggestions.culturalCompetency?.length > 0 && (
                        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                          <h4 className="font-semibold text-purple-900 mb-2">Cultural Competency</h4>
                          <ul className="space-y-1 text-sm text-purple-800">
                            {sessionAnalysis.suggestions.culturalCompetency.map((suggestion: string, index: number) => (
                              <li key={index} className="flex items-start">
                                <span className="text-purple-600 mr-2">▸</span>
                                <span>{suggestion}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {sessionAnalysis.suggestions.therapeuticTechnique?.length > 0 && (
                        <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                          <h4 className="font-semibold text-indigo-900 mb-2">Therapeutic Technique</h4>
                          <ul className="space-y-1 text-sm text-indigo-800">
                            {sessionAnalysis.suggestions.therapeuticTechnique.map((suggestion: string, index: number) => (
                              <li key={index} className="flex items-start">
                                <span className="text-indigo-600 mr-2">▸</span>
                                <span>{suggestion}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="bg-gray-50 px-6 py-4 flex justify-end">
              <button
                onClick={() => setShowAnalysisModal(false)}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Close Analysis
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};