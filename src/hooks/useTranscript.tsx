
import { useState, useRef, useEffect, useCallback } from 'react';
import { ScenarioType } from '@/components/ScenarioSelector';
import { useStateMachine } from '@/hooks/useStateMachine';
import { useMessageHandling } from '@/hooks/useMessageHandling';
import { detectSensitiveData } from '@/data/scenarioData';
import { useModuleManager } from '@/hooks/useModuleManager';
import { ModuleType } from '@/types/modules';

export function useTranscript(activeScenario: ScenarioType) {
  // Basic state
  const [isRecording, setIsRecording] = useState(false);
  const [callActive, setCallActive] = useState(false);
  const [elapsedTime, setElapsedTime] = useState('00:00');
  const [acceptedCallId, setAcceptedCallId] = useState<string | null>(null);
  const [lastTranscriptUpdate, setLastTranscriptUpdate] = useState<Date>(new Date());
  
  // State to track conversation flow
  const [processedStates, setProcessedStates] = useState<Set<string>>(new Set());
  const [isInitialStateProcessed, setIsInitialStateProcessed] = useState(false);
  const [isUserAction, setIsUserAction] = useState(false);
  const [awaitingUserResponse, setAwaitingUserResponse] = useState(false);
  const [showNachbearbeitungModule, setShowNachbearbeitungModule] = useState(false);
  
  // Refs for timing
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
  const hasProcessedState = useCallback((state: string): boolean => {
    return processedStates.has(state);
  }, [processedStates]);
  
  // Mark a state as processed
  const markStateAsProcessed = useCallback((state: string) => {
    setProcessedStates(prev => {
      const newSet = new Set(prev);
      newSet.add(state);
      return newSet;
    });
  }, []);

  // Reset processed states when the scenario changes
  useEffect(() => {
    console.log("Resetting processed states due to scenario change:", activeScenario);
    setProcessedStates(new Set());
    setIsInitialStateProcessed(false);
    setIsUserAction(false);
    setAwaitingUserResponse(false);
    setShowNachbearbeitungModule(false);
  }, [activeScenario]);
  
  // Handle module completion
  const handleModuleComplete = useCallback((result: any) => {
    console.log('Module completed with result:', result);
    completeModule(result);
    
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
  }, [activeModule, completeModule, addSystemMessage]);

  // Function to extract available transitions from the current state
  const extractTransitionsAsResponseOptions = useCallback((state: string): string[] => {
    if (!stateMachine || !stateMachine.states[state]) {
      console.log(`No state machine or state not found: ${state}`);
      return [];
    }
    
    const currentStateData = stateMachine.states[state];
    const options: string[] = [];
    
    // First check if there are responseOptions explicitly defined
    if (currentStateData.meta?.responseOptions && currentStateData.meta.responseOptions.length > 0) {
      console.log(`Found explicit responseOptions for state ${state}:`, currentStateData.meta.responseOptions);
      return currentStateData.meta.responseOptions;
    }
    
    // If no explicit responseOptions, extract them from the transitions
    if (currentStateData.on) {
      // Get all available transitions except special ones like DEFAULT and START_CALL
      for (const transition in currentStateData.on) {
        if (transition !== 'DEFAULT' && transition !== 'START_CALL') {
          options.push(transition);
        }
      }
      
      if (options.length > 0) {
        console.log(`Extracted transitions for state ${state}:`, options);
      }
    }
    
    // If we have no transitions or only special ones, check for nextState as fallback
    if (options.length === 0 && currentStateData.nextState) {
      options.push("Continue");
    }
    
    return options;
  }, [stateMachine]);

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
        
        // Extract response options from transitions
        const responseOptions = extractTransitionsAsResponseOptions(currentState);
        console.log(`Extracted response options for state ${currentState}:`, responseOptions);
        
        // Add customer message with detected sensitive data and response options
        addCustomerMessage(stateData.meta.customerText, sensitiveData, responseOptions);
        
        // Set flag that we're waiting for user to respond
        setAwaitingUserResponse(true);
      }
      
      if (stateData.meta?.agentText && !isUserAction) {
        console.log(`Adding agent message: ${stateData.meta.agentText}`);
        
        // Extract response options for next state if needed
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
  }, [
    stateData, 
    lastStateChange, 
    callActive, 
    addSystemMessage, 
    addCustomerMessage, 
    addAgentMessage, 
    currentState, 
    hasProcessedState, 
    markStateAsProcessed, 
    isUserAction,
    addInlineModuleMessage, 
    extractTransitionsAsResponseOptions
  ]);
  
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

  // This is our primary interaction method - updated to ensure explicit user action
  const handleSelectResponse = useCallback((response: string) => {
    console.log('Selecting response:', response);
    
    // Only process if we're awaiting user response or at initial state
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
      processSelection("DEFAULT");
    }
  }, [awaitingUserResponse, isInitialStateProcessed, addAgentMessage, processSelection, currentState]);

  // Toggle recording state
  const toggleRecording = () => setIsRecording(!isRecording);

  // Reset the conversation
  const resetConversation = useCallback(() => {
    console.log('Resetting conversation');
    clearMessages();
    resetStateMachine();
    setProcessedStates(new Set());
    setIsInitialStateProcessed(false);
    setLastTranscriptUpdate(new Date());
    setIsUserAction(false);
    setAwaitingUserResponse(false);
    setShowNachbearbeitungModule(false);
  }, [clearMessages, resetStateMachine]);

  // Improved call start function to properly initialize state
  const handleCall = useCallback(() => {
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
  }, [
    callActive, 
    activeScenario, 
    clearMessages, 
    addSystemMessage, 
    processStartCall, 
    processSelection, 
    showNachbearbeitungModule
  ]);

  // Show the Nachbearbeitung (call summary) module
  const showNachbearbeitungSummary = useCallback(() => {
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
  }, [completeModule]);

  // Accept incoming call with improved state handling
  const handleAcceptCall = useCallback((callId: string) => {
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
  }, [addSystemMessage, processStartCall, processSelection]);

  // Hang up call with cleanup
  const handleHangUpCall = useCallback(() => {
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
  }, [addSystemMessage, showNachbearbeitungModule, showNachbearbeitungSummary]);
  
  return {
    messages,
    isRecording,
    callActive,
    elapsedTime,
    acceptedCallId,
    lastTranscriptUpdate,
    messagesEndRef,
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
    handleSelectResponse,
  };
}
