
import { useState, useRef, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { ScenarioType } from '@/components/ScenarioSelector';
import { useStateMachine } from '@/hooks/useStateMachine';
import { useMessageHandling } from '@/hooks/useMessageHandling';

export function useTranscript(activeScenario: ScenarioType) {
  const { toast } = useToast();
  const [inputValue, setInputValue] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [callActive, setCallActive] = useState(false);
  const [elapsedTime, setElapsedTime] = useState('00:00');
  const [acceptedCallId, setAcceptedCallId] = useState<string | null>(null);
  const [lastTranscriptUpdate, setLastTranscriptUpdate] = useState<Date>(new Date());
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  
  // Get the message handling functionality
  const {
    messages,
    sensitiveDataStats,
    verificationBlocking,
    lastMessageUpdate,
    addSystemMessage,
    addAgentMessage,
    addCustomerMessage,
    clearMessages,
    handleValidateSensitiveData,
    handleVerifySystemCheck,
    setVerificationBlocking
  } = useMessageHandling();
  
  // Get the state machine data
  const {
    currentState,
    stateData,
    processSelection,
    processStartCall,
    lastStateChange,
    resetStateMachine
  } = useStateMachine(activeScenario);
  
  // Update to properly update UI when state changes
  useEffect(() => {
    if (stateData && callActive && lastStateChange) {
      console.log('State changed, updating transcript with new state data:', stateData);
      
      // When state changes, check for messages to display
      if (stateData.meta?.systemMessage) {
        addSystemMessage(stateData.meta.systemMessage, stateData.requiresVerification);
      }
      
      if (stateData.meta?.agentText) {
        addAgentMessage(stateData.meta.agentText, stateData.meta?.suggestions || []);
      }
      
      setLastTranscriptUpdate(new Date());
    }
  }, [stateData, lastStateChange, callActive]);
  
  // Update when messages update
  useEffect(() => {
    if (lastMessageUpdate) {
      setLastTranscriptUpdate(lastMessageUpdate);
    }
  }, [lastMessageUpdate]);

  // Update timer when call is active
  useEffect(() => {
    if (callActive) {
      startTimeRef.current = Date.now();
      timerRef.current = window.setInterval(() => {
        const seconds = Math.floor((Date.now() - startTimeRef.current) / 1000);
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        setElapsedTime(
          `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
        );
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [callActive]);

  // Handle sending a message
  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    // Add message based on who is sending it
    addAgentMessage(inputValue);
    setInputValue('');

    // Process the selected option in the state machine
    processSelection(inputValue);
  };

  // Handle accepting a suggestion
  const handleAcceptSuggestion = (messageId: string, suggestionId: string) => {
    // Find the suggestion text by ID
    const suggestionText = stateData?.meta?.suggestions?.find((_, index) => index.toString() === suggestionId);
    
    if (suggestionText) {
      console.log('Accepting suggestion:', suggestionId, suggestionText);
      // Add the accepted suggestion as a new agent message
      addAgentMessage(suggestionText);
      
      // Process the selected option in the state machine
      processSelection(suggestionText);
    }
  };

  // Handle rejecting a suggestion
  const handleRejectSuggestion = (suggestionId: string, messageId: string) => {
    // For now, just log the rejection
    console.log(`Suggestion ${suggestionId} rejected for message ${messageId}`);
  };

  // Handle selecting a response
  const handleSelectResponse = (response: string) => {
    console.log('Selecting response:', response);
    addCustomerMessage(response);
    processSelection(response);
  };

  // Toggle recording state
  const toggleRecording = () => {
    setIsRecording(!isRecording);
  };

  // Reset the conversation
  const resetConversation = () => {
    console.log('Resetting conversation');
    clearMessages();
    resetStateMachine();
    setLastTranscriptUpdate(new Date());
  };

  // Start a call
  const handleCall = () => {
    if (!callActive) {
      console.log('Starting call for scenario:', activeScenario);
      setCallActive(true);
      clearMessages();
      setLastTranscriptUpdate(new Date());
      
      addSystemMessage('Call started');
      
      // Important: Wait a moment to ensure state is updated before triggering the initial state
      setTimeout(() => {
        console.log('Triggering processStartCall');
        const success = processStartCall();
        console.log('Process start call result:', success);
        
        // If start call wasn't successful, try sending the START_CALL event directly
        if (!success) {
          console.log('Trying to process START_CALL event manually');
          processSelection('START_CALL');
        }
      }, 100);
    } else {
      console.log('Ending call');
      setCallActive(false);
      addSystemMessage('Call ended');
    }
  };

  // Accept incoming call
  const handleAcceptCall = (callId: string) => {
    console.log('Accepting call:', callId);
    setAcceptedCallId(callId);
    setCallActive(true);
    setLastTranscriptUpdate(new Date());
    addSystemMessage(`Call accepted from ${callId}`);
    
    // Trigger initial state with START_CALL event
    setTimeout(() => {
      console.log('Triggering processStartCall from accept call');
      const success = processStartCall();
      console.log('Process start call result:', success);
      
      // If start call wasn't successful, try sending the START_CALL event directly
      if (!success) {
        console.log('Trying to process START_CALL event manually');
        processSelection('START_CALL');
      }
    }, 100);
  };

  // Hang up call
  const handleHangUpCall = () => {
    setCallActive(false);
    setAcceptedCallId(null);
    setLastTranscriptUpdate(new Date());
    addSystemMessage('Call ended');
  };
  
  return {
    messages,
    inputValue,
    setInputValue,
    isRecording,
    callActive,
    elapsedTime,
    acceptedCallId,
    lastTranscriptUpdate,
    messagesEndRef,
    handleSendMessage,
    handleAcceptSuggestion,
    handleRejectSuggestion,
    handleSelectResponse,
    toggleRecording,
    handleCall,
    handleAcceptCall,
    handleHangUpCall,
    currentState,
    stateData,
    lastStateChange,
    addAgentMessage,
    addCustomerMessage,
    addSystemMessage,
    handleVerifySystemCheck,
    resetConversation,
    handleValidateSensitiveData,
    sensitiveDataStats,
    verificationBlocking
  };
}
