
import { useState, useRef, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { ScenarioType } from '@/components/ScenarioSelector';
import { useStateMachine } from '@/hooks/useStateMachine';
import { useMessageHandling } from '@/hooks/useMessageHandling';
import { StateMachineState } from '@/utils/stateMachineLoader';

// We'll use the StateMachineState type from stateMachineLoader.ts instead of defining our own
// This ensures consistency between the state machine definition and usage

export function useTranscript(activeScenario: ScenarioType) {
  const { toast } = useToast();
  const [inputValue, setInputValue] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [callActive, setCallActive] = useState(false);
  const [elapsedTime, setElapsedTime] = useState('00:00');
  const [acceptedCallId, setAcceptedCallId] = useState<string | null>(null);
  const [lastTranscriptUpdate, setLastTranscriptUpdate] = useState<Date>(new Date());
  const [processedStates, setProcessedStates] = useState<Set<string>>(new Set());
  const [isInitialStateProcessed, setIsInitialStateProcessed] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  const debounceTimerRef = useRef<number | null>(null);
  
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
  
  // Function to check if we've already processed this state to avoid duplicate messages
  const hasProcessedState = (state: string): boolean => {
    return processedStates.has(state);
  };
  
  // Mark a state as processed
  const markStateAsProcessed = (state: string) => {
    setProcessedStates(prev => {
      const newSet = new Set(prev);
      newSet.add(state);
      return newSet;
    });
  };

  // Reset processed states when the scenario changes
  useEffect(() => {
    setProcessedStates(new Set());
    setIsInitialStateProcessed(false);
  }, [activeScenario]);
  
  // Update to properly update UI when state changes, with debouncing and duplicate prevention
  useEffect(() => {
    if (!stateData || !callActive || !lastStateChange) {
      return;
    }
    
    // Prevent duplicate processing of the same state
    if (hasProcessedState(currentState)) {
      console.log(`State ${currentState} already processed, skipping message updates`);
      return;
    }
    
    // Clear any existing debounce timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    
    // Debounce the state processing to prevent rapid fire updates
    debounceTimerRef.current = window.setTimeout(() => {
      console.log('Processing state change with data:', stateData);
      
      // When state changes, check for messages to display
      if (stateData.meta?.systemMessage) {
        console.log(`Adding system message: ${stateData.meta.systemMessage}`);
        addSystemMessage(stateData.meta.systemMessage, stateData.requiresVerification);
      }
      
      if (stateData.meta?.customerText) {
        // Add customer text directly as a customer message
        console.log(`Adding customer message: ${stateData.meta.customerText}`);
        addCustomerMessage(stateData.meta.customerText, stateData.meta?.suggestions || []);
      }
      
      if (stateData.meta?.agentText) {
        console.log(`Adding agent message: ${stateData.meta.agentText}`);
        addAgentMessage(stateData.meta.agentText, stateData.meta?.suggestions || []);
      }
      
      // Mark this state as processed to prevent duplicate messages
      markStateAsProcessed(currentState);
      setLastTranscriptUpdate(new Date());
    }, 300); // 300ms debounce
    
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [stateData, lastStateChange, callActive, addSystemMessage, addCustomerMessage, addAgentMessage, currentState, processedStates]);
  
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
    addAgentMessage(response);
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
    setProcessedStates(new Set());
    setIsInitialStateProcessed(false);
    setLastTranscriptUpdate(new Date());
  };

  // Improved call start function to properly initialize state
  const handleCall = () => {
    if (!callActive) {
      console.log('Starting call for scenario:', activeScenario);
      setCallActive(true);
      clearMessages();
      setProcessedStates(new Set());
      setIsInitialStateProcessed(false);
      setLastTranscriptUpdate(new Date());
      
      addSystemMessage('Call started');
      
      // Important: Use a proper delay to ensure UI state is updated
      setTimeout(() => {
        console.log('Triggering processStartCall');
        const success = processStartCall();
        console.log('Process start call result:', success);
        
        if (!success) {
          console.log('Trying to process START_CALL event manually');
          processSelection('START_CALL');
        }
        
        // Mark initial state as processed after starting the call
        setIsInitialStateProcessed(true);
      }, 500); // Slightly longer delay to ensure proper initialization
    } else {
      console.log('Ending call');
      setCallActive(false);
      addSystemMessage('Call ended');
    }
  };

  // Accept incoming call with improved state handling
  const handleAcceptCall = (callId: string) => {
    console.log('Accepting call:', callId);
    setAcceptedCallId(callId);
    setCallActive(true);
    setProcessedStates(new Set());
    setIsInitialStateProcessed(false);
    setLastTranscriptUpdate(new Date());
    
    addSystemMessage(`Call accepted from ${callId}`);
    
    // Trigger initial state with START_CALL event
    setTimeout(() => {
      console.log('Triggering processStartCall from accept call');
      const success = processStartCall();
      console.log('Process start call result:', success);
      
      if (!success) {
        console.log('Trying to process START_CALL event manually');
        processSelection('START_CALL');
      }
      
      // Mark initial state as processed
      setIsInitialStateProcessed(true);
    }, 500);
  };

  // Hang up call with cleanup
  const handleHangUpCall = () => {
    setCallActive(false);
    setAcceptedCallId(null);
    setProcessedStates(new Set());
    setIsInitialStateProcessed(false);
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
