import React, { useState, useEffect, useRef } from 'react';
import {
  User,
  Clock,
  Send,
  AlertTriangle,
  CheckCircle,
  RotateCcw,
  Settings,
  Info,
  MessageCircle,
  BarChart3,
  X,
  Volume2,
  Languages
} from 'lucide-react';
import { 
  SimulatedPatient, 
  SimulationSession, 
  SimulationMessage, 
  PatientGenerationOptions,
  Gender,
  MentalHealthConcern
} from '../../types/SimulatedPatient';
import { PatientSimulationService } from '../../services/patientSimulationService';
import { SessionEndDetectionService } from '../../services/sessionEndDetectionService';
import { ConversationAnalysisService } from '../../services/conversationAnalysisService';
import { TrainingSessionService } from '../../services/trainingSessionService';
import { useAuth } from '../../contexts/AuthContext';
import { ConversationFeedback } from '../../types/Feedback';
import { CulturalBackground } from '../../types/User';

interface CBTSimulatorContext {
  suggestedConcern: string;
  objective: string;
  tips: string[];
}

interface SimulatedSessionInterfaceProps {
  cbtContext?: CBTSimulatorContext | null;
  onSessionComplete?: (session: SimulationSession) => void;
  onSessionAnalysisReady?: (analysis: ConversationFeedback) => void;
}

export const SimulatedSessionInterface: React.FC<SimulatedSessionInterfaceProps> = ({
  cbtContext,
  onSessionComplete,
  onSessionAnalysisReady
}) => {
  const { user } = useAuth();
  
  // Session state
  const [currentSession, setCurrentSession] = useState<SimulationSession | null>(null);
  const [currentPatient, setCurrentPatient] = useState<SimulatedPatient | null>(null);
  const [messages, setMessages] = useState<SimulationMessage[]>([]);
  const [sessionActive, setSessionActive] = useState(false);
  
  // UI state
  const [counselorInput, setCounselorInput] = useState('');
  const [isPatientTyping, setIsPatientTyping] = useState(false);
  const [sessionEndDetected, setSessionEndDetected] = useState(false);
  const [sessionEndConfidence, setSessionEndConfidence] = useState<'high' | 'medium' | 'low' | null>(null);
  const [showPatientInfo, setShowPatientInfo] = useState(false);
  const [showSessionOptions, setShowSessionOptions] = useState(false);
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);
  const [sessionDuration, setSessionDuration] = useState(0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResults, setAnalysisResults] = useState<ConversationFeedback | null>(null);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Generation options and selection state
  const [generationOptions, setGenerationOptions] = useState<PatientGenerationOptions>({});
  const [showPatientSelection, setShowPatientSelection] = useState(true);
  const [selectedOptions, setSelectedOptions] = useState<PatientGenerationOptions>({});
  
  // Audio state for text-to-speech
  const [playingAudio, setPlayingAudio] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Translation state for bilingual mediation
  const [translations, setTranslations] = useState<Record<string, string>>({});
  const [showingTranslation, setShowingTranslation] = useState<Record<string, boolean>>({});
  const [translating, setTranslating] = useState<Record<string, boolean>>({});

  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Pre-select concern when CBT context is provided
  useEffect(() => {
    if (cbtContext?.suggestedConcern) {
      setSelectedOptions(prev => ({
        ...prev,
        concern: cbtContext.suggestedConcern as MentalHealthConcern,
      }));
    }
  }, [cbtContext]);

  // Timer for session duration
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (sessionActive && sessionStartTime) {
      interval = setInterval(() => {
        const now = new Date();
        const duration = Math.floor((now.getTime() - sessionStartTime.getTime()) / 1000);
        setSessionDuration(duration);
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [sessionActive, sessionStartTime]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // Start new training session with selected patient characteristics
  const startNewSession = async () => {
    try {
      // Use selected options to generate patient
      const patient = PatientSimulationService.generateRandomPatient(selectedOptions);
      const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const session: SimulationSession = {
        id: sessionId,
        counselorId: user?.uid || 'demo',
        simulatedPatient: patient,
        sessionStarted: new Date(),
        messages: [],
        sessionOutcome: 'ongoing'
      };

      // Generate opening patient message
      const openingMessage: SimulationMessage = {
        id: `msg_${Date.now()}`,
        sessionId,
        content: generateOpeningMessage(patient),
        senderType: 'patient',
        timestamp: new Date(),
        messageNumber: 1
      };

      setCurrentSession(session);
      setCurrentPatient(patient);
      setMessages([openingMessage]);
      setSessionActive(true);
      setSessionStartTime(new Date());
      setSessionEndDetected(false);
      setSessionEndConfidence(null);
      setCounselorInput('');
      setShowPatientSelection(false);
      
      console.log('Started new training session with patient:', patient.name);
    } catch (error) {
      console.error('Failed to start training session:', error);
    }
  };

  // Show patient selection screen
  const showSelectionScreen = () => {
    setShowPatientSelection(true);
    setSessionActive(false);
    setCurrentSession(null);
    setCurrentPatient(null);
    setMessages([]);
  };

  // Send counselor message
  const sendCounselorMessage = async () => {
    if (!counselorInput.trim() || !currentSession || !currentPatient) return;

    const messageId = `msg_${Date.now()}`;
    const counselorMessage: SimulationMessage = {
      id: messageId,
      sessionId: currentSession.id,
      content: counselorInput.trim(),
      senderType: 'counselor',
      timestamp: new Date(),
      messageNumber: messages.length + 1
    };

    // Update messages
    const updatedMessages = [...messages, counselorMessage];
    setMessages(updatedMessages);
    setCounselorInput('');

    // Check for session end
    const endDetection = SessionEndDetectionService.detectSessionEnd(counselorInput);
    if (endDetection.isSessionEnd) {
      setSessionEndDetected(true);
      setSessionEndConfidence(endDetection.confidence);
      
      if (endDetection.confidence === 'high') {
        // Auto-end session after a delay
        console.log('Auto-ending session in 3 seconds due to high confidence end detection');
        setTimeout(() => {
          console.log('Auto-ending session now');
          endTrainingSession();
        }, 3000);
        return;
      }
    }

    // Generate patient response
    try {
      setIsPatientTyping(true);
      
      // Simulate typing delay
      await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

      const cbtContextString = cbtContext
        ? `The counselor is practicing CBT skills. Objective: ${cbtContext.objective}. Respond in a way that gives the counselor opportunities to practice these CBT techniques.`
        : undefined;

      const patientResponse = await PatientSimulationService.generatePatientResponse(
        currentPatient,
        updatedMessages,
        counselorInput,
        cbtContextString
      );

      const patientMessage: SimulationMessage = {
        id: `msg_${Date.now()}`,
        sessionId: currentSession.id,
        content: patientResponse,
        senderType: 'patient',
        timestamp: new Date(),
        messageNumber: updatedMessages.length + 1
      };

      setMessages(prev => [...prev, patientMessage]);
    } catch (error) {
      console.error('Failed to generate patient response:', error);
    } finally {
      setIsPatientTyping(false);
    }
  };

  // End training session
  const endTrainingSession = async () => {
    console.log('endTrainingSession called');
    console.log('currentSession:', currentSession);
    console.log('currentPatient:', currentPatient);
    console.log('user:', user);
    console.log('messages length:', messages.length);
    
    if (!currentSession || !currentPatient) {
      console.log('Exiting: Missing session or patient');
      return;
    }

    try {
      setSessionActive(false);
      setIsSaving(true);
      
      const sessionSummary = SessionEndDetectionService.generateSessionSummary(messages);
      const sessionValidation = SessionEndDetectionService.validateSessionForAnalysis(messages);

      // Update session
      const completedSession: SimulationSession = {
        ...currentSession,
        sessionEnded: new Date(),
        messages,
        sessionOutcome: 'completed',
        sessionDuration: sessionSummary.duration
      };

      // Save session to Firestore
      console.log('Saving training session...');
      const savedSessionId = await TrainingSessionService.saveTrainingSession(completedSession);
      completedSession.id = savedSessionId;

      // Generate analysis if session is valid
      if (sessionValidation.isValid && messages.length >= 6) {
        console.log('Analyzing training session...');
        setIsAnalyzing(true);
        
        try {
          // Convert to format expected by analysis service
          const analysisMessages = messages.map(msg => ({
            content: msg.content,
            senderType: msg.senderType === 'patient' ? 'student' as const : 'counselor' as const
          }));

          const conversationAnalysis = await ConversationAnalysisService.quickConversationAnalysis(
            savedSessionId,
            currentSession.counselorId,
            'simulated_patient',
            currentPatient.culturalBackground,
            analysisMessages
          );

          // Save analysis to Firestore
          // await TrainingSessionService.saveTrainingAnalysis(savedSessionId, conversationAnalysis);
          
          setAnalysisResults({
            ...conversationAnalysis,
            id: savedSessionId,
            analyzedAt: new Date()
          });
          setShowAnalysis(true);
          
          // onSessionAnalysisReady?.(conversationAnalysis);
        } catch (error) {
          console.error('Failed to analyze training session:', error);
        } finally {
          setIsAnalyzing(false);
        }
      } else {
        console.log('Session too short for analysis:', sessionValidation.issues);
      }

      onSessionComplete?.(completedSession);
      setCurrentSession(completedSession);
      
      console.log('Training session completed successfully!');
      
    } catch (error) {
      console.error('Failed to end training session:', error);
      alert('Failed to save training session: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setIsSaving(false);
      console.log('endTrainingSession finished');
    }
  };

  // Reset session
  const resetSession = () => {
    setCurrentSession(null);
    setCurrentPatient(null);
    setMessages([]);
    setSessionActive(false);
    setSessionStartTime(null);
    setSessionDuration(0);
    setSessionEndDetected(false);
    setSessionEndConfidence(null);
    setCounselorInput('');
    setShowPatientSelection(true);
    setSelectedOptions({});
  };

  // Handle key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendCounselorMessage();
    }
  };

  // Detect language of message (simple heuristic)
  const detectLanguage = (text: string): 'en' | 'es' => {
    // Simple Spanish detection: check for common Spanish words/patterns
    const spanishPattern = /\b(el|la|los|las|un|una|de|que|en|por|para|con|mi|tu|su|soy|eres|está|están|¿|¡)\b/i;
    return spanishPattern.test(text) ? 'es' : 'en';
  };

  // Handle translation toggle
  const handleTranslateToggle = async (messageId: string, text: string, currentLang: 'en' | 'es') => {
    // If already showing translation, just toggle it off
    if (showingTranslation[messageId]) {
      setShowingTranslation(prev => ({ ...prev, [messageId]: false }));
      return;
    }

    // If we already have the translation, just show it
    if (translations[messageId]) {
      setShowingTranslation(prev => ({ ...prev, [messageId]: true }));
      return;
    }

    // Otherwise, fetch the translation
    try {
      setTranslating(prev => ({ ...prev, [messageId]: true }));

      const targetLang = currentLang === 'en' ? 'es' : 'en';

      const response = await fetch('/api/translate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          text,
          sourceLanguage: currentLang,
          targetLanguage: targetLang
        })
      });

      if (!response.ok) {
        throw new Error('Translation failed');
      }

      const data = await response.json();

      if (data.success) {
        setTranslations(prev => ({ ...prev, [messageId]: data.translation }));
        setShowingTranslation(prev => ({ ...prev, [messageId]: true }));
      } else {
        throw new Error(data.error || 'Translation failed');
      }
    } catch (error) {
      console.error('Translation error:', error);
      alert('Failed to translate message. Please try again.');
    } finally {
      setTranslating(prev => ({ ...prev, [messageId]: false }));
    }
  };

  // Handle text-to-speech playback for accessibility
  const handlePlayAudio = async (messageId: string, text: string, language: 'en' | 'es') => {
    try {
      // Stop any currently playing audio
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }

      setPlayingAudio(messageId);

      const response = await fetch('/api/text-to-speech', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ text, language })
      });

      if (!response.ok) {
        throw new Error('Audio generation failed');
      }

      // Create audio from the response blob
      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);

      audioRef.current = audio;

      audio.onended = () => {
        setPlayingAudio(null);
        URL.revokeObjectURL(audioUrl);
        audioRef.current = null;
      };

      audio.onerror = () => {
        setPlayingAudio(null);
        URL.revokeObjectURL(audioUrl);
        audioRef.current = null;
        alert('Failed to play audio. Please try again.');
      };

      await audio.play();
    } catch (error) {
      console.error('Audio playback error:', error);
      setPlayingAudio(null);
      alert('Failed to generate audio. Please try again.');
    }
  };

  // Format duration
  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <h2 className="font-semibold text-gray-900">
                {currentPatient ? `Training Session: ${currentPatient.name}` : 'Training Session'}
              </h2>
              {sessionActive && (
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Clock className="w-3 h-3" />
                  <span>{formatDuration(sessionDuration)}</span>
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span>Active</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {currentPatient && (
            <button
              onClick={() => setShowPatientInfo(!showPatientInfo)}
              className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
              title="Patient Information"
            >
              <Info className="w-4 h-4" />
            </button>
          )}
          
          <button
            onClick={() => setShowSessionOptions(!showSessionOptions)}
            className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
            title="Session Options"
          >
            <Settings className="w-4 h-4" />
          </button>

          {sessionActive && (
            <button
              onClick={endTrainingSession}
              className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
            >
              End Training Session
            </button>
          )}
        </div>
      </div>

      {/* Patient Information Panel */}
      {showPatientInfo && currentPatient && (
        <div className="p-4 bg-blue-50 border-b border-blue-200">
          <h3 className="font-medium text-blue-900 mb-2">Patient Context</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-blue-700 font-medium">Cultural Background:</span>
              <span className="ml-2 text-blue-800">{currentPatient.culturalBackground}</span>
            </div>
            <div>
              <span className="text-blue-700 font-medium">Primary Concern:</span>
              <span className="ml-2 text-blue-800">{currentPatient.mentalHealthConcern}</span>
            </div>
            <div>
              <span className="text-blue-700 font-medium">Communication Style:</span>
              <span className="ml-2 text-blue-800">{currentPatient.communicationStyle}</span>
            </div>
            <div>
              <span className="text-blue-700 font-medium">Trust Level:</span>
              <span className="ml-2 text-blue-800">{currentPatient.trustLevel}</span>
            </div>
          </div>
          <div className="mt-2">
            <span className="text-blue-700 font-medium">Background:</span>
            <p className="text-blue-800 mt-1">{currentPatient.backstory}</p>
          </div>
        </div>
      )}

      {/* Session End Detection Alert */}
      {sessionEndDetected && (
        <div className={`p-3 border-b ${
          sessionEndConfidence === 'high' ? 'bg-green-50 border-green-200' :
          sessionEndConfidence === 'medium' ? 'bg-yellow-50 border-yellow-200' :
          'bg-orange-50 border-orange-200'
        }`}>
          <div className="flex items-center space-x-2">
            {sessionEndConfidence === 'high' ? (
              <CheckCircle className="w-4 h-4 text-green-600" />
            ) : sessionEndConfidence === 'medium' ? (
              <AlertTriangle className="w-4 h-4 text-yellow-600" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-orange-600" />
            )}
            <span className={`text-sm font-medium ${
              sessionEndConfidence === 'high' ? 'text-green-800' :
              sessionEndConfidence === 'medium' ? 'text-yellow-800' :
              'text-orange-800'
            }`}>
              Session ending detected ({sessionEndConfidence} confidence)
            </span>
          </div>
        </div>
      )}

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {showPatientSelection ? (
          // Patient Selection Screen
          <div className="max-w-4xl mx-auto">
            {/* CBT Context Banner */}
            {cbtContext && (
              <div className="mb-6 bg-purple-50 border border-purple-200 rounded-lg p-4">
                <h4 className="font-semibold text-purple-900 mb-2">CBT Practice Objective</h4>
                <p className="text-sm text-purple-800 mb-3">{cbtContext.objective}</p>
                <div>
                  <p className="text-xs font-medium text-purple-700 mb-1">Tips for this exercise:</p>
                  <ul className="text-xs text-purple-700 space-y-1">
                    {cbtContext.tips.map((tip, i) => (
                      <li key={i}>&#8226; {tip}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Select Your Simulated Patient</h3>
              <p className="text-gray-600">
                Choose the characteristics of the AI patient you&apos;d like to practice with. This helps create targeted training scenarios.
              </p>
            </div>

            {/* Cultural Background Selection */}
            <div className="mb-8">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Cultural Background</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {[
                  { value: 'african-american', label: 'African American' },
                  { value: 'african', label: 'African (International)' },
                  { value: 'asian-american', label: 'Asian American' },
                  { value: 'east-asian', label: 'East Asian' },
                  { value: 'south-asian', label: 'South Asian' },
                  { value: 'latino-hispanic', label: 'Latino/Hispanic' },
                  { value: 'white-american', label: 'White American' },
                  { value: 'middle-eastern', label: 'Middle Eastern' },
                  { value: 'native-american', label: 'Native American' },
                  { value: 'multiracial', label: 'Multiracial' },
                  { value: 'other', label: 'Other' },
                  { value: 'random', label: '🎲 Random' }
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setSelectedOptions(prev => ({ 
                      ...prev, 
                      culturalBackground: option.value === 'random' ? undefined : option.value as CulturalBackground
                    }))}
                    className={`p-3 border-2 rounded-lg text-sm font-medium transition-all ${
                      selectedOptions.culturalBackground === option.value || 
                      (option.value === 'random' && !selectedOptions.culturalBackground)
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:border-gray-300 text-gray-700'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Gender Selection */}
            <div className="mb-8">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Gender</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { value: 'female', label: 'Female' },
                  { value: 'male', label: 'Male' },
                  { value: 'non-binary', label: 'Non-binary' },
                  { value: 'random', label: '🎲 Random' }
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setSelectedOptions(prev => ({ 
                      ...prev, 
                      gender: option.value === 'random' ? undefined : option.value as Gender
                    }))}
                    className={`p-3 border-2 rounded-lg text-sm font-medium transition-all ${
                      selectedOptions.gender === option.value || 
                      (option.value === 'random' && !selectedOptions.gender)
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:border-gray-300 text-gray-700'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Mental Health Concern Selection */}
            <div className="mb-8">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Mental Health Concern</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {[
                  { value: 'anxiety', label: 'Anxiety' },
                  { value: 'depression', label: 'Depression' },
                  { value: 'family-conflict', label: 'Family Conflict' },
                  { value: 'academic-stress', label: 'Academic Stress' },
                  { value: 'identity-issues', label: 'Identity Issues' },
                  { value: 'relationship-issues', label: 'Relationship Issues' },
                  { value: 'cultural-adjustment', label: 'Cultural Adjustment' },
                  { value: 'perfectionism', label: 'Perfectionism' },
                  { value: 'random', label: '🎲 Random' }
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setSelectedOptions(prev => ({ 
                      ...prev, 
                      concern: option.value === 'random' ? undefined : option.value as MentalHealthConcern
                    }))}
                    className={`p-3 border-2 rounded-lg text-sm font-medium transition-all ${
                      selectedOptions.concern === option.value || 
                      (option.value === 'random' && !selectedOptions.concern)
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:border-gray-300 text-gray-700'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Age Range Selection */}
            <div className="mb-8">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Age Range</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { value: [18, 20], label: '18-20 years' },
                  { value: [21, 23], label: '21-23 years' },
                  { value: [24, 26], label: '24-26 years' },
                  { value: 'random', label: '🎲 Random (18-26)' }
                ].map((option) => (
                  <button
                    key={option.label}
                    onClick={() => setSelectedOptions(prev => ({ 
                      ...prev, 
                      ageRange: option.value === 'random' ? undefined : option.value as string
                    }))}
                    className={`p-3 border-2 rounded-lg text-sm font-medium transition-all ${
                      JSON.stringify(selectedOptions.ageRange) === JSON.stringify(option.value) || 
                      (option.value === 'random' && !selectedOptions.ageRange)
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:border-gray-300 text-gray-700'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Selection Summary */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
              <h4 className="font-medium text-gray-900 mb-2">Selected Patient Profile:</h4>
              <div className="text-sm text-gray-600 space-y-1">
                <p>
                  <strong>Cultural Background:</strong> {
                    selectedOptions.culturalBackground 
                      ? selectedOptions.culturalBackground.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())
                      : 'Random'
                  }
                </p>
                <p>
                  <strong>Gender:</strong> {
                    selectedOptions.gender 
                      ? selectedOptions.gender.charAt(0).toUpperCase() + selectedOptions.gender.slice(1)
                      : 'Random'
                  }
                </p>
                <p>
                  <strong>Concern:</strong> {
                    selectedOptions.concern 
                      ? selectedOptions.concern.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())
                      : 'Random'
                  }
                </p>
                <p>
                  <strong>Age:</strong> {
                    selectedOptions.ageRange 
                      ? `${selectedOptions.ageRange[0]}-${selectedOptions.ageRange[1]} years`
                      : 'Random (18-26 years)'
                  }
                </p>
              </div>
            </div>

            {/* Start Session Button */}
            <div className="text-center">
              <button
                onClick={startNewSession}
                className="px-8 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors text-lg"
              >
                Start Training Session with This Patient
              </button>
            </div>
          </div>
        ) : !sessionActive && !currentSession ? (
          // Pre-session state (shouldn't show if selection is working)
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageCircle className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Ready to Start Training?</h3>
            <p className="text-gray-600 mb-6">
              Practice your counseling skills with an AI-powered patient in a safe, culturally-informed environment.
            </p>
            <button
              onClick={() => setShowPatientSelection(true)}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Select Patient & Start Session
            </button>
          </div>
        ) : (
          // Chat messages
          <>
            {messages.map((message) => {
              const messageLang = detectLanguage(message.content);
              return (
                <div
                  key={message.id}
                  className={`flex ${message.senderType === 'counselor' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-xs lg:max-w-md ${message.senderType === 'counselor' ? 'text-right' : 'text-left'}`}>
                    <div
                      className={`px-4 py-2 rounded-lg inline-block ${
                        message.senderType === 'counselor'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-200 text-gray-900'
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                      <div
                        className={`text-xs mt-1 ${
                          message.senderType === 'counselor' ? 'text-blue-200' : 'text-gray-500'
                        }`}
                      >
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>

                    {/* Translation and Audio controls */}
                    <div className={`mt-2 flex flex-wrap items-center gap-2 ${message.senderType === 'counselor' ? 'justify-end' : 'justify-start'}`}>
                      {/* Translation toggle */}
                      <button
                        onClick={() => handleTranslateToggle(message.id, message.content, messageLang)}
                        disabled={translating[message.id]}
                        className="inline-flex items-center space-x-1 px-2 py-1 text-xs text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-lg transition-colors disabled:opacity-50"
                        title={showingTranslation[message.id] ? "Show original" : `Translate to ${messageLang === 'en' ? 'Spanish' : 'English'}`}
                      >
                        <Languages size={12} />
                        <span>
                          {translating[message.id]
                            ? 'Translating...'
                            : showingTranslation[message.id]
                            ? 'Show original'
                            : `Show ${messageLang === 'en' ? 'Spanish' : 'English'}`}
                        </span>
                      </button>

                      {/* Audio read-aloud */}
                      <button
                        onClick={() => {
                          const displayedText = showingTranslation[message.id] ? translations[message.id] : message.content;
                          const displayedLang = showingTranslation[message.id] ? (messageLang === 'en' ? 'es' : 'en') : messageLang;
                          handlePlayAudio(message.id + (showingTranslation[message.id] ? '-translation' : ''), displayedText, displayedLang);
                        }}
                        disabled={playingAudio === (message.id + (showingTranslation[message.id] ? '-translation' : ''))}
                        className="inline-flex items-center space-x-1 px-2 py-1 text-xs text-purple-600 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-colors disabled:opacity-50"
                        title="Read aloud (accessibility)"
                      >
                        <Volume2 size={12} className={playingAudio === (message.id + (showingTranslation[message.id] ? '-translation' : '')) ? 'animate-pulse' : ''} />
                        <span>
                          {playingAudio === (message.id + (showingTranslation[message.id] ? '-translation' : ''))
                            ? 'Playing...'
                            : 'Listen'}
                        </span>
                      </button>
                    </div>

                    {/* Show translation text if toggled */}
                    {showingTranslation[message.id] && translations[message.id] && (
                      <div className={`mt-2 p-3 rounded-lg bg-indigo-50 border border-indigo-200 ${message.senderType === 'counselor' ? 'text-right' : 'text-left'}`}>
                        <p className="text-xs text-indigo-600 font-medium mb-1">
                          {messageLang === 'en' ? 'Spanish' : 'English'} translation:
                        </p>
                        <p className="text-sm text-indigo-900 whitespace-pre-wrap">{translations[message.id]}</p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Typing indicator */}
            {isPatientTyping && (
              <div className="flex justify-start">
                <div className="bg-gray-200 text-gray-900 px-4 py-2 rounded-lg">
                  <div className="flex items-center space-x-1">
                    <span className="text-sm">{currentPatient?.name} is typing</span>
                    <div className="flex space-x-1">
                      <div className="w-1 h-1 bg-gray-500 rounded-full animate-bounce"></div>
                      <div className="w-1 h-1 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-1 h-1 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      {sessionActive && (
        <div className="border-t border-gray-200 p-4">
          <div className="flex space-x-2">
            <textarea
              ref={inputRef}
              value={counselorInput}
              onChange={(e) => setCounselorInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your response as a counselor..."
              className="flex-1 min-h-[60px] p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
              disabled={isPatientTyping}
            />
            <button
              onClick={sendCounselorMessage}
              disabled={!counselorInput.trim() || isPatientTyping}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Session completed state */}
      {!sessionActive && currentSession && currentSession.sessionOutcome === 'completed' && (
        <div className="p-4 border-t border-gray-200 bg-green-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="text-green-800 font-medium">
                {isSaving ? 'Saving Training Session...' : 
                 isAnalyzing ? 'Analyzing Session...' : 
                 'Training Session Completed'}
              </span>
              {(isSaving || isAnalyzing) && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
              )}
            </div>
            <div className="flex space-x-2">
              <button
                onClick={resetSession}
                disabled={isSaving || isAnalyzing}
                className="flex items-center space-x-2 px-3 py-2 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                <span>New Session</span>
              </button>
              {analysisResults && (
                <button 
                  onClick={() => setShowAnalysis(true)}
                  className="flex items-center space-x-2 px-3 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  <BarChart3 className="w-4 h-4" />
                  <span>View Analysis</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Analysis Modal */}
      {showAnalysis && analysisResults && (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-green-600 to-blue-600 px-6 py-4 text-white relative">
              <button
                onClick={() => setShowAnalysis(false)}
                className="absolute top-4 right-4 text-white/80 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
              
              <div className="flex items-center space-x-3">
                <div className="bg-white/20 backdrop-blur-sm rounded-full p-2">
                  <BarChart3 className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Training Session Analysis</h2>
                  <p className="text-white/90 mt-1">
                    Cultural competency evaluation for your conversation with {currentPatient?.name}
                  </p>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 max-h-[75vh] overflow-y-auto">
              {/* Overall Performance */}
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Overall Performance</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {analysisResults.overallPerformance && Object.entries(analysisResults.overallPerformance).map(([key, value]) => (
                    <div key={key} className="bg-gray-50 rounded-lg p-4">
                      <div className="text-sm text-gray-600 mb-1">
                        {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                      </div>
                      <div className={`text-2xl font-bold ${
                        (value as number) >= 8 ? 'text-green-600' : 
                        (value as number) >= 6 ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {Number(value).toFixed(1)}/10
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Cultural Analysis */}
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Cultural Competency Analysis</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h4 className="font-semibold text-green-900 mb-2">Strengths</h4>
                    <ul className="space-y-1 text-sm text-green-800">
                      {analysisResults.conversationAnalysis?.strengths?.map((strength: string, index: number) => (
                        <li key={index}>• {strength}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-900 mb-2">Cultural Highlights</h4>
                    <ul className="space-y-1 text-sm text-blue-800">
                      {analysisResults.conversationAnalysis?.goodCulturalMoments?.map((moment: string, index: number) => (
                        <li key={index}>• {moment}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Areas for Improvement */}
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Areas for Improvement</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <h4 className="font-semibold text-yellow-900 mb-2">General Improvements</h4>
                    <ul className="space-y-1 text-sm text-yellow-800">
                      {analysisResults.conversationAnalysis?.weaknesses?.map((weakness: string, index: number) => (
                        <li key={index}>• {weakness}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                    <h4 className="font-semibold text-orange-900 mb-2">Cultural Opportunities</h4>
                    <ul className="space-y-1 text-sm text-orange-800">
                      {analysisResults.conversationAnalysis?.culturalMisses?.map((miss: string, index: number) => (
                        <li key={index}>• {miss}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Specific Suggestions */}
              {analysisResults.suggestions && (
                <div className="mb-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Specific Suggestions</h3>
                  <div className="space-y-4">
                    {analysisResults.suggestions.culturalCompetency?.length > 0 && (
                      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                        <h4 className="font-semibold text-purple-900 mb-2">Cultural Competency</h4>
                        <ul className="space-y-1 text-sm text-purple-800">
                          {analysisResults.suggestions.culturalCompetency.map((suggestion: string, index: number) => (
                            <li key={index}>• {suggestion}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {analysisResults.suggestions.therapeuticTechnique?.length > 0 && (
                      <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                        <h4 className="font-semibold text-indigo-900 mb-2">Therapeutic Technique</h4>
                        <ul className="space-y-1 text-sm text-indigo-800">
                          {analysisResults.suggestions.therapeuticTechnique.map((suggestion: string, index: number) => (
                            <li key={index}>• {suggestion}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Patient Context Reminder */}
              {currentPatient && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">Patient Context</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                    <div>
                      <span className="font-medium">Cultural Background:</span><br />
                      {currentPatient.culturalBackground.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </div>
                    <div>
                      <span className="font-medium">Primary Concern:</span><br />
                      {currentPatient.mentalHealthConcern.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </div>
                    <div>
                      <span className="font-medium">Communication Style:</span><br />
                      {currentPatient.communicationStyle}
                    </div>
                    <div>
                      <span className="font-medium">Trust Level:</span><br />
                      {currentPatient.trustLevel}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="bg-gray-50 px-6 py-4 flex justify-between items-center">
              <p className="text-sm text-gray-600">
                💡 This analysis helps you improve your cultural competency skills
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowAnalysis(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={resetSession}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Start New Session
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Helper function to generate opening message
function generateOpeningMessage(patient: SimulatedPatient): string {
  const openings = {
    anxiety: [
      "Hi, I'm not really sure how to start this. I've been feeling really anxious lately and thought maybe talking to someone would help.",
      "I've been having a lot of anxiety recently, especially about school. My friends said I should talk to a counselor.",
      "This is my first time doing this. I guess I'm here because I can't seem to stop worrying about everything."
    ],
    depression: [
      "I don't really know what's wrong with me. I just feel... empty lately. Nothing seems to matter anymore.",
      "My mom thinks I should talk to someone. I've been really down and can't seem to shake it off.",
      "I feel like I'm just going through the motions. Everything feels pointless right now."
    ],
    'family-conflict': [
      "I'm having a lot of problems with my family right now. We just can't seem to understand each other.",
      "Things at home are really tense. My parents have expectations that I'm struggling to meet.",
      "I love my family, but sometimes I feel like we're from completely different worlds."
    ]
  };

  const concern = patient.mentalHealthConcern;
  const messages = openings[concern] || [
    `Hi, I'm ${patient.name}. I'm dealing with some ${concern.replace('-', ' ')} issues and could use some support.`
  ];

  return messages[Math.floor(Math.random() * messages.length)];
}