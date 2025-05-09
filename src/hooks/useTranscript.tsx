
import { useState, useRef, useEffect, useCallback } from 'react';
import { ScenarioType } from '@/components/ScenarioSelector';
import { useStateMachine } from '@/hooks/useStateMachine';
import { useMessageHandling } from '@/hooks/useMessageHandling';
import { StateMachineState } from '@/utils/stateMachineLoader';
import { detectSensitiveData } from '@/data/scenarioData';
import { useModuleManager } from '@/hooks/useModuleManager';
import { ModuleType } from '@/types/modules';

export function useTranscript(activeScenario: ScenarioType) {
  const [isRecording, setIsRecording] = useState(false);
  const [callActive, setCallActive] = useState(false);
  const [elapsedTime, setElapsedTime] = useState('00:00');
  const [acceptedCallId, setAcceptedCallId] = useState<string | null>(null);
  const [lastTranscriptUpdate, setLastTranscriptUpdate] = useState<Date>(new Date());
  const [processedStates, setProcessedStates] = useState<Set<string>>(new Set());
  const [isInitialStateProcessed, setIsInitialStateProcessed] = useState(false);
  const [isUserAction, setIsUserAction] = useState(false);
  const [awaitingUserResponse, setAwaitingUserResponse] = useState(false);
  const [showNachbearbeitungModule, setShowNachbearbeitungModule] = useState(false);
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
    addInlineModuleMessage,
    clearMessages,
    handleValidateSensitiveData,
    handleVerifySystemCheck,
    handleInlineModuleComplete,
    setVerificationBlocking
  } = useMessageHandling();
  
  // Get the state machine data
  const {
    currentState,
    stateData,
    processSelection,
    processStartCall,
    lastStateChange,
    resetStateMachine,
    stateMachine
  } = useStateMachine(activeScenario);

  // Get the module manager functionality
  const {
    activeModule,
    moduleHistory,
    closeModule,
    completeModule
  } = useModuleManager(
    stateMachine,
    currentState,
    stateData
  );
  
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
    console.log("Resetting processed states due to scenario change");
    setProcessedStates(new Set());
    setIsInitialStateProcessed(false);
    setIsUserAction(false);
    setAwaitingUserResponse(false);
    setShowNachbearbeitungModule(false);
  }, [activeScenario]);
  
  // Handle module completion
  const handleModuleComplete = (result: any) => {
    console.log('Module completed with result:', result);
    completeModule(result);
    
    // Update the transcript to reflect the module interaction
    if (activeModule) {
      // Only add system message if it's not the Nachbearbeitung module
      if (activeModule.type !== ModuleType.NACHBEARBEITUNG) {
        addSystemMessage(`${activeModule.title} completed: ${result.verified ? "Success" : "Failed"}`);
      } else {
        // For Nachbearbeitung module, add a summary message
        addSystemMessage(`Call summary completed. Points verified: ${result.points?.length || 0}`, {
          responseOptions: ["Thank you for your call. Have a nice day!"]
        });
        setShowNachbearbeitungModule(false);
      }
    }
  };

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
        addSystemMessage(stateData.meta.systemMessage);
      }
      
      if (stateData.meta?.customerText) {
        console.log(`Adding customer message: ${stateData.meta.customerText}`);
        // Detect sensitive data in customer text
        const sensitiveData = detectSensitiveData(stateData.meta.customerText);
        
        // Add customer message with detected sensitive data
        const message = {
          id: Math.random().toString(),
          text: stateData.meta.customerText,
          sender: 'customer' as const,
          timestamp: new Date(),
          sensitiveData: sensitiveData.length > 0 ? sensitiveData : undefined
        };
        
        // Add the customer message with potential sensitive data
        addCustomerMessage(stateData.meta.customerText);
        
        // Set flag that we're waiting for user to respond
        setAwaitingUserResponse(true);

        // If this state has response options, add them to the last customer message
        if (stateData.meta?.responseOptions && stateData.meta.responseOptions.length > 0) {
          const lastMessage = messages[messages.length - 1];
          if (lastMessage && lastMessage.sender === 'customer') {
            // Update the last message with response options
            messages[messages.length - 1].responseOptions = stateData.meta.responseOptions;
          }
        }
      }
      
      if (stateData.meta?.agentText && !isUserAction) {
        console.log(`Adding agent message: ${stateData.meta.agentText}`);
        
        // Check if there are response options to add after the agent message
        const responseOptions = stateData.meta?.responseOptions || [];
        addAgentMessage(stateData.meta.agentText, [], responseOptions.length > 0 ? responseOptions : undefined);
      }
      
      // Check if this state has a module trigger
      if (stateData.meta?.module) {
        console.log(`Module trigger found in state:`, stateData.meta.module);
        
        // Special handling for verification modules - make them inline
        if (stateData.meta.module.type === ModuleType.VERIFICATION) {
          // Add inline verification module
          addInlineModuleMessage(
            `Please verify the following information:`,
            stateData.meta.module
          );
        } else {
          // Add a system message about the module if not already shown
          addSystemMessage(`Opening ${stateData.meta.module.title}`);
        }
      }
      
      // Mark this state as processed to prevent duplicate messages
      markStateAsProcessed(currentState);
      setLastTranscriptUpdate(new Date());
      
      // Reset user action flag
      setIsUserAction(false);
    }, 300); // 300ms debounce
    
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [stateData, lastStateChange, callActive, addSystemMessage, addCustomerMessage, addAgentMessage, currentState, processedStates, isUserAction, messages, addInlineModuleMessage]);
  
  // Update when messages update
  useEffect(() => {
    if (lastMessageUpdate) {
      setLastTranscriptUpdate(lastMessageUpdate);
    }
  }, [lastMessageUpdate]);

  // Listen for module completion events
  useEffect(() => {
    const handleModuleCompletedEvent = (event: Event) => {
      const customEvent = event as CustomEvent;
      console.log('Module completed event:', customEvent.detail);
      
      // Add a system message about the module completion
      if (customEvent.detail && customEvent.detail.moduleId) {
        const resultText = customEvent.detail.result?.verified 
          ? 'successfully verified'
          : customEvent.detail.result?.action
          ? `completed action: ${customEvent.detail.result.action}`
          : customEvent.detail.result?.acknowledged
          ? 'acknowledged'
          : 'completed';
          
        addSystemMessage(`Module ${resultText}`);
      }
    };
    
    window.addEventListener('module-completed', handleModuleCompletedEvent);
    
    return () => {
      window.removeEventListener('module-completed', handleModuleCompletedEvent);
    };
  }, [addSystemMessage]);

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

  // Handle accepting a suggestion - simplified to focus on responsiveness
  const handleAcceptSuggestion = (messageId: string, suggestionId: string) => {
    // Set the user action flag
    setIsUserAction(true);
    
    // Find the message and suggestion
    const message = messages.find(m => m.id === messageId);
    if (!message || !message.suggestions) return;
    
    // Find the suggestion text by ID
    const suggestion = message.suggestions.find(s => s.id === suggestionId);
    
    if (suggestion) {
      console.log('Accepting suggestion:', suggestionId, suggestion.text);
      // Add the accepted suggestion as a new agent message
      addAgentMessage(suggestion.text);
      
      // Process the selected option in the state machine
      processSelection(suggestion.text);
    }
  };

  // Handle rejecting a suggestion - likely won't be used much with the new flow
  const handleRejectSuggestion = (suggestionId: string, messageId: string) => {
    // For now, just log the rejection
    console.log(`Suggestion ${suggestionId} rejected for message ${messageId}`);
  };

  // This is our primary interaction method - updated to ensure explicit user action
  const handleSelectResponse = (response: string) => {
    console.log('Selecting response:', response);
    
    // Only process if we're awaiting user response
    if (!awaitingUserResponse && !isInitialStateProcessed) {
      console.log('Not awaiting user response yet, skipping');
      return;
    }
    
    // Set the user action flag
    setIsUserAction(true);
    
    // Reset awaiting user response flag
    setAwaitingUserResponse(false);
    
    // Add the selected response as an agent message
    addAgentMessage(response);
    
    // Process the selection in the state machine
    console.log('Processing selection in state machine:', response, 'from state:', currentState);
    const success = processSelection(response);
    
    if (!success) {
      console.warn('Failed to process selection:', response);
      // Try with DEFAULT transition as fallback
      console.log("Using default response path");
    }
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
    setIsUserAction(false);
    setAwaitingUserResponse(false);
    setShowNachbearbeitungModule(false);
  };

  // Improved call start function to properly initialize state
  const handleCall = () => {
    if (!callActive) {
      console.log('Starting call for scenario:', activeScenario);
      setCallActive(true);
      clearMessages();
      setProcessedStates(new Set());
      setIsInitialStateProcessed(false);
      setIsUserAction(false);
      setAwaitingUserResponse(false);
      setShowNachbearbeitungModule(false);
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
      
      // Show the Nachbearbeitung module at the end of the call
      if (!showNachbearbeitungModule) {
        showNachbearbeitungSummary();
      }
    }
  };

  // Show the Nachbearbeitung (call summary) module
  const showNachbearbeitungSummary = () => {
    setShowNachbearbeitungModule(true);
    
    // Create nachbearbeitung module config
    const nachbearbeitungModuleConfig = {
      id: 'nachbearbeitung-' + Date.now(),
      title: 'Call Summary',
      type: ModuleType.NACHBEARBEITUNG,
      data: {
        summaryPoints: [
          { id: '1', text: 'Customer identity was verified', checked: false, important: true },
          { id: '2', text: 'Customer issue was addressed', checked: false, important: true },
          { id: '3', text: 'Relevant information was provided', checked: false, important: true },
          { id: '4', text: 'Next steps were explained to customer', checked: false, important: false },
          { id: '5', text: 'Customer was offered additional assistance', checked: false, important: false }
        ]
      }
    };
    
    // Update module manager
    completeModule({ showSummary: true });
    
    // Set the active module to show the Nachbearbeitung
    setTimeout(() => {
      const event = new CustomEvent('module-trigger', { 
        detail: { module: nachbearbeitungModuleConfig } 
      });
      window.dispatchEvent(event);
    }, 300);
  };

  // Accept incoming call with improved state handling
  const handleAcceptCall = (callId: string) => {
    console.log('Accepting call:', callId);
    setAcceptedCallId(callId);
    setCallActive(true);
    setProcessedStates(new Set());
    setIsInitialStateProcessed(false);
    setIsUserAction(false);
    setAwaitingUserResponse(false);
    setShowNachbearbeitungModule(false);
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
    setIsUserAction(false);
    setAwaitingUserResponse(false);
    setLastTranscriptUpdate(new Date());
    addSystemMessage('Call ended');
    
    // Show the Nachbearbeitung module at the end of the call
    if (!showNachbearbeitungModule) {
      showNachbearbeitungSummary();
    }
  };
  
  return {
    messages,
    isRecording,
    callActive,
    elapsedTime,
    acceptedCallId,
    lastTranscriptUpdate,
    messagesEndRef,
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
    verificationBlocking,
    awaitingUserResponse,
    activeModule,
    closeModule,
    handleModuleComplete,
    showNachbearbeitungSummary,
    handleInlineModuleComplete,
  };
}
