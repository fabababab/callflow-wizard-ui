
// This is a major refactoring of the useTranscript hook to fix state transitions and response options
import { useState, useRef, useEffect, useCallback } from 'react';
import { ScenarioType } from '@/components/ScenarioSelector';
import { useStateMachine } from '@/hooks/useStateMachine';
import { useMessageHandling } from '@/hooks/useMessageHandling';
import { detectSensitiveData } from '@/data/scenarioData';
import { useModuleManager } from '@/hooks/useModuleManager';
import { ModuleType } from '@/types/modules';
import { useCallState } from '@/hooks/useCallState';
import { useConversationState } from '@/hooks/useConversationState';
import { useTransitionExtractor } from '@/hooks/useTransitionExtractor';
import { useNachbearbeitungHandler } from '@/hooks/useNachbearbeitungHandler';
import { useToast } from '@/hooks/use-toast';

export function useTranscript(activeScenario: ScenarioType) {
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Get the message handling functionality
  const messageHandling = useMessageHandling();
  
  // Get the state machine data
  const stateMachine = useStateMachine(activeScenario);
  
  // Get call state
  const callState = useCallState();
  
  // Get conversation state
  const conversationState = useConversationState();
  
  // Get transition extractor
  const { 
    extractTransitionsAsResponseOptions,
    getStateJson,
    logStateTransitions
  } = useTransitionExtractor(stateMachine.stateMachine);
  
  // Get the module manager functionality
  const moduleManager = useModuleManager(
    stateMachine.stateMachine,
    stateMachine.currentState,
    stateMachine.stateData
  );
  
  // Get Nachbearbeitung handler
  const { showNachbearbeitungSummary } = useNachbearbeitungHandler(
    moduleManager.completeModule
  );

  // Debug timers for state tracking
  const [debugLastStateChange, setDebugLastStateChange] = useState<string>("");
  
  // Prevent full reset on scenario change - just reset conversation state, not messages
  useEffect(() => {
    console.log("Scenario changed to:", activeScenario);
    // Only reset conversation tracking state, not messages
    conversationState.resetConversationState();
  }, [activeScenario, conversationState]);
  
  // Handle module completion
  const handleModuleComplete = useCallback((result: any) => {
    console.log('Module completed with result:', result);
    moduleManager.completeModule(result);
    
    if (moduleManager.activeModule) {
      // Only add system message if it's not the Nachbearbeitung module
      if (moduleManager.activeModule.type !== ModuleType.NACHBEARBEITUNG) {
        messageHandling.addSystemMessage(`${moduleManager.activeModule.title} completed: ${result.verified ? "Success" : "Failed"}`);
      } else {
        // For Nachbearbeitung module, add a summary message
        messageHandling.addSystemMessage(`Call summary completed. Points verified: ${result.points?.length || 0}`, {
          responseOptions: ["Thank you for your call. Have a nice day!"]
        });
        conversationState.setShowNachbearbeitungModule(false);
      }
    }
  }, [moduleManager, messageHandling, conversationState]);

  // Update to properly update UI when state changes, with debouncing and duplicate prevention
  useEffect(() => {
    if (!stateMachine.stateData || !callState.callActive || !stateMachine.lastStateChange) {
      return;
    }
    
    // For debugging purposes, track state changes
    setDebugLastStateChange(new Date().toISOString());
    console.log(`State change detected: ${stateMachine.currentState} at ${new Date().toISOString()}`);
    
    // Prevent duplicate processing of the same state
    if (conversationState.hasProcessedState(stateMachine.currentState)) {
      console.log(`State ${stateMachine.currentState} already processed, skipping message updates`);
      return;
    }
    
    // Clear any existing debounce timer
    if (conversationState.debounceTimerRef.current) {
      clearTimeout(conversationState.debounceTimerRef.current);
    }
    
    // Log the current state transitions for debugging
    logStateTransitions(stateMachine.currentState);
    
    // Debounce the state processing to prevent rapid fire updates
    conversationState.debounceTimerRef.current = window.setTimeout(() => {
      console.log('Processing state change with data:', stateMachine.stateData);
      
      // When state changes, check for messages to display
      if (stateMachine.stateData.meta?.systemMessage) {
        console.log(`Adding system message: ${stateMachine.stateData.meta.systemMessage}`);
        messageHandling.addSystemMessage(stateMachine.stateData.meta.systemMessage);
      }
      
      if (stateMachine.stateData.meta?.customerText) {
        console.log(`Adding customer message: ${stateMachine.stateData.meta.customerText}`);
        // Detect sensitive data in customer text
        const sensitiveData = detectSensitiveData(stateMachine.stateData.meta.customerText);
        
        // Extract response options from transitions
        const responseOptions = extractTransitionsAsResponseOptions(stateMachine.currentState);
        console.log(`Extracted response options for state ${stateMachine.currentState}:`, responseOptions);
        
        // Add customer message with detected sensitive data and response options
        messageHandling.addCustomerMessage(stateMachine.stateData.meta.customerText, sensitiveData, responseOptions);
        
        // Set flag that we're waiting for user to respond
        conversationState.setAwaitingUserResponse(true);
        
        // If sensitive data was detected, show toast notification
        if (sensitiveData && sensitiveData.length > 0) {
          toast({
            title: "Sensitive Data Detected",
            description: "Please verify the detected information before proceeding.",
            duration: 3000
          });
        }
      }
      
      if (stateMachine.stateData.meta?.agentText && !conversationState.isUserAction) {
        console.log(`Adding agent message: ${stateMachine.stateData.meta.agentText}`);
        
        // Extract response options for next state if needed
        const responseOptions = stateMachine.stateData.meta?.responseOptions || [];
        
        // If explicit responseOptions aren't provided, extract them from transitions
        const effectiveResponseOptions = responseOptions.length > 0 
          ? responseOptions
          : extractTransitionsAsResponseOptions(stateMachine.currentState);
        
        console.log("Effective response options:", effectiveResponseOptions);
          
        messageHandling.addAgentMessage(
          stateMachine.stateData.meta.agentText, 
          [], 
          effectiveResponseOptions.length > 0 ? effectiveResponseOptions : undefined
        );
      }
      
      // Check if this state has a module trigger
      if (stateMachine.stateData.meta?.module) {
        console.log(`Module trigger found in state:`, stateMachine.stateData.meta.module);
        
        // Special handling for verification modules - make them inline
        if (stateMachine.stateData.meta.module.type === ModuleType.VERIFICATION) {
          // Add inline verification module
          messageHandling.addInlineModuleMessage(
            `Please verify the following information:`,
            stateMachine.stateData.meta.module
          );
        } else {
          // Add a system message about the module if not already shown
          messageHandling.addSystemMessage(`Opening ${stateMachine.stateData.meta.module.title}`);
        }
      }
      
      // Mark this state as processed to prevent duplicate messages
      conversationState.markStateAsProcessed(stateMachine.currentState);
      conversationState.setLastTranscriptUpdate(new Date());
      
      // Reset user action flag
      conversationState.setIsUserAction(false);
    }, 300); // 300ms debounce
    
    return () => {
      if (conversationState.debounceTimerRef.current) {
        clearTimeout(conversationState.debounceTimerRef.current);
      }
    };
  }, [
    stateMachine.stateData, 
    stateMachine.lastStateChange, 
    callState.callActive, 
    messageHandling.addSystemMessage, 
    messageHandling.addCustomerMessage, 
    messageHandling.addAgentMessage, 
    stateMachine.currentState, 
    conversationState.hasProcessedState, 
    conversationState.markStateAsProcessed, 
    conversationState.isUserAction,
    messageHandling.addInlineModuleMessage, 
    extractTransitionsAsResponseOptions,
    conversationState,
    logStateTransitions,
    toast
  ]);
  
  // Update when messages update
  useEffect(() => {
    if (messageHandling.lastMessageUpdate) {
      conversationState.setLastTranscriptUpdate(messageHandling.lastMessageUpdate);
    }
  }, [messageHandling.lastMessageUpdate, conversationState]);

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
          
        messageHandling.addSystemMessage(`Module ${resultText}`);
      }
    };
    
    window.addEventListener('module-completed', handleModuleCompletedEvent as EventListener);
    
    return () => {
      window.removeEventListener('module-completed', handleModuleCompletedEvent as EventListener);
    };
  }, [messageHandling.addSystemMessage]);

  // This is our primary interaction method - updated to ensure explicit user action
  const handleSelectResponse = useCallback((response: string) => {
    console.log('User selecting response:', response);
    
    // Only process if we're awaiting user response or at initial state
    if (!conversationState.awaitingUserResponse && !conversationState.isInitialStateProcessed) {
      console.warn('Not awaiting user response yet, skipping');
      toast({
        title: "Cannot select response",
        description: "Please wait for the conversation to initialize first",
        variant: "destructive",
      });
      return;
    }
    
    // Show toast notification for response selection
    toast({
      title: "Response Selected",
      description: response,
      duration: 2000,
    });
    
    // Set the user action flag
    conversationState.setIsUserAction(true);
    
    // Reset awaiting user response flag
    conversationState.setAwaitingUserResponse(false);
    
    // Add the selected response as an agent message
    messageHandling.addAgentMessage(response);
    
    // Process the selection in the state machine
    console.log('Processing selection in state machine:', response, 'from state:', stateMachine.currentState);
    
    // Small delay to ensure UI updates before state changes
    setTimeout(() => {
      const success = stateMachine.processSelection(response);
      
      if (!success) {
        console.warn('Failed to process selection:', response);
        // Try with DEFAULT transition as fallback
        console.log("Using default response path");
        const defaultSuccess = stateMachine.processSelection("DEFAULT");
        
        if (!defaultSuccess) {
          toast({
            title: "State Transition Failed",
            description: "Could not proceed to the next state. Try resetting the conversation.",
            variant: "destructive",
          });
        } else {
          console.log("Successfully transitioned using DEFAULT path");
        }
      } else {
        console.log("Successfully transitioned to new state:", stateMachine.currentState);
      }
    }, 100);
    
  }, [
    conversationState.awaitingUserResponse, 
    conversationState.isInitialStateProcessed, 
    messageHandling.addAgentMessage, 
    stateMachine.processSelection, 
    stateMachine.currentState,
    conversationState,
    toast
  ]);

  // Reset the conversation
  const resetConversation = useCallback(() => {
    console.log('Manually resetting conversation');
    messageHandling.clearMessages();
    stateMachine.resetStateMachine();
    conversationState.resetConversationState();
    
    toast({
      title: "Conversation Reset",
      description: "The conversation has been reset to its initial state.",
      duration: 2000,
    });
  }, [messageHandling.clearMessages, stateMachine.resetStateMachine, conversationState, toast]);

  // Improved call start function to properly initialize state - fixed toast issue here
  const handleCall = useCallback(() => {
    try {
      if (!callState.callActive) {
        console.log('Starting call for scenario:', activeScenario);
        
        // Validate scenario is loaded
        if (!stateMachine.stateMachine) {
          throw new Error('State machine not loaded');
        }
        
        // Clear previous state
        callState.setCallActiveState(true);
        
        // IMPORTANT: Only clear messages if this is the first time starting the call
        // Don't clear messages when the call is already active to prevent duplications
        if (messageHandling.messages.length === 0) {
          messageHandling.addSystemMessage('Call started');
          
          // Use a proper delay to ensure UI state is updated
          setTimeout(() => {
            console.log('Triggering processStartCall');
            const success = stateMachine.processStartCall();
            console.log('Process start call result:', success);
            
            if (!success) {
              console.log('Trying to process START_CALL event manually');
              const manualSuccess = stateMachine.processSelection('START_CALL');
              
              if (!manualSuccess) {
                console.error('Failed to start call - both automatic and manual methods failed');
                throw new Error('Failed to initialize call state');
              }
            }
            
            // Mark initial state as processed after starting the call
            conversationState.setIsInitialStateProcessed(true);
            
            // Dispatch event for successful call start
            const startEvent = new CustomEvent('call-started', {
              detail: { scenario: activeScenario }
            });
            window.dispatchEvent(startEvent);
            
          }, 500);
        } else {
          console.log('Call is already initialized with messages, not clearing or re-initializing');
        }
      } else {
        console.log('Ending call');
        callState.setCallActiveState(false);
        messageHandling.addSystemMessage('Call ended');
        
        // Show the Nachbearbeitung module at the end of the call
        if (!conversationState.showNachbearbeitungModule) {
          showNachbearbeitungSummary();
        }
        
        // Dispatch event for call end
        const endEvent = new CustomEvent('call-ended');
        window.dispatchEvent(endEvent);
      }
    } catch (error) {
      console.error('Error in handleCall:', error);
      messageHandling.addSystemMessage(`Error: ${error instanceof Error ? error.message : 'Failed to handle call'}`);
      callState.setCallActiveState(false);
      
      // Dispatch error event
      const errorEvent = new CustomEvent('call-error', {
        detail: { error: error instanceof Error ? error.message : 'Unknown error' }
      });
      window.dispatchEvent(errorEvent);
      
      throw error; // Re-throw to be handled by UI layer
    }
  }, [
    callState, 
    activeScenario, 
    messageHandling.clearMessages, 
    messageHandling.addSystemMessage, 
    stateMachine.processStartCall, 
    stateMachine.processSelection,
    stateMachine.currentState,
    stateMachine.stateData,
    stateMachine.stateMachine,
    conversationState,
    showNachbearbeitungSummary,
    messageHandling.messages.length
  ]);

  // Accept incoming call with improved state handling
  const handleAcceptCall = useCallback((callId: string) => {
    console.log('Accepting call:', callId);
    callState.setAcceptedCallId(callId);
    callState.setCallActiveState(true);
    
    // Only reset on explicit accept
    conversationState.resetConversationState();
    
    messageHandling.addSystemMessage(`Call accepted from ${callId}`);
    
    toast({
      title: "Call Accepted",
      description: `Connected to caller ${callId}`,
      duration: 2000,
    });
    
    // Trigger initial state with START_CALL event
    setTimeout(() => {
      console.log('Triggering processStartCall from accept call');
      const success = stateMachine.processStartCall();
      console.log('Process start call result:', success);
      
      if (!success) {
        console.log('Trying to process START_CALL event manually');
        stateMachine.processSelection('START_CALL');
      }
      
      // Mark initial state as processed
      conversationState.setIsInitialStateProcessed(true);
    }, 500);
  }, [callState, messageHandling.addSystemMessage, stateMachine.processStartCall, stateMachine.processSelection, conversationState, toast]);

  // Hang up call with cleanup
  const handleHangUpCall = useCallback(() => {
    callState.setCallActiveState(false);
    callState.setAcceptedCallId(null);
    
    // Don't reset conversation state on hang up to preserve messages
    messageHandling.addSystemMessage('Call ended');
    
    toast({
      title: "Call Ended",
      description: "Call successfully completed.",
      duration: 2000,
    });
    
    // Show the Nachbearbeitung module at the end of the call
    if (!conversationState.showNachbearbeitungModule) {
      showNachbearbeitungSummary();
    }
  }, [callState, messageHandling.addSystemMessage, conversationState, showNachbearbeitungSummary, toast]);

  // Add debug logging for scenario changes
  useEffect(() => {
    console.log('Active scenario changed:', activeScenario);
  }, [activeScenario]);

  // Add debug logging for state machine changes
  useEffect(() => {
    if (stateMachine.stateData) {
      console.log('State machine data:', {
        currentState: stateMachine.currentState,
        stateData: stateMachine.stateData,
        meta: stateMachine.stateData.meta
      });
    }
  }, [stateMachine.stateData, stateMachine.currentState]);

  // Fix state processing logic and prevent toast notifications on every update
  useEffect(() => {
    if (!stateMachine.stateData || !callState.callActive) {
      return;
    }

    // Clear any existing timer
    if (conversationState.debounceTimerRef.current) {
      clearTimeout(conversationState.debounceTimerRef.current);
    }

    // Skip processing if we've already processed this state
    if (conversationState.hasProcessedState(stateMachine.currentState)) {
      console.log(`Skipping already processed state: ${stateMachine.currentState}`);
      return;
    }

    // Process state changes immediately for initial state without triggering toast
    if (!conversationState.isInitialStateProcessed) {
      console.log('Processing initial state');
      processStateChange();
      conversationState.setIsInitialStateProcessed(true);
      return;
    }

    // Debounce other state changes
    conversationState.debounceTimerRef.current = window.setTimeout(processStateChange, 300);

    function processStateChange() {
      console.log('Processing state change:', {
        state: stateMachine.currentState,
        data: stateMachine.stateData
      });

      // Process system message first
      if (stateMachine.stateData.meta?.systemMessage) {
        messageHandling.addSystemMessage(stateMachine.stateData.meta.systemMessage);
      }

      // Process customer message if present
      if (stateMachine.stateData.meta?.customerText) {
        const sensitiveData = detectSensitiveData(stateMachine.stateData.meta.customerText);
        const responseOptions = extractTransitionsAsResponseOptions(stateMachine.currentState);
        
        messageHandling.addCustomerMessage(
          stateMachine.stateData.meta.customerText,
          sensitiveData,
          responseOptions
        );

        conversationState.setAwaitingUserResponse(true);
      }

      // Process agent message if present and not from user action
      if (stateMachine.stateData.meta?.agentText && !conversationState.isUserAction) {
        const responseOptions = stateMachine.stateData.meta?.responseOptions || 
          extractTransitionsAsResponseOptions(stateMachine.currentState);

        messageHandling.addAgentMessage(
          stateMachine.stateData.meta.agentText,
          [],
          responseOptions
        );
      }

      // Process modules
      if (stateMachine.stateData.meta?.module) {
        if (stateMachine.stateData.meta.module.type === ModuleType.VERIFICATION) {
          messageHandling.addInlineModuleMessage(
            'Please verify the following information:',
            stateMachine.stateData.meta.module
          );
        } else {
          messageHandling.addSystemMessage(
            `Opening ${stateMachine.stateData.meta.module.title}`
          );
        }
      }

      // Update state
      conversationState.markStateAsProcessed(stateMachine.currentState);
      conversationState.setLastTranscriptUpdate(new Date());
      conversationState.setIsUserAction(false);
    }

    return () => {
      if (conversationState.debounceTimerRef.current) {
        clearTimeout(conversationState.debounceTimerRef.current);
      }
    };
  }, [
    stateMachine.stateData,
    stateMachine.currentState,
    callState.callActive,
    conversationState.isInitialStateProcessed,
    conversationState.hasProcessedState,
    conversationState
  ]);

  return {
    // Combine properties and methods from all hooks
    ...messageHandling,
    ...callState,
    lastTranscriptUpdate: conversationState.lastTranscriptUpdate,
    awaitingUserResponse: conversationState.awaitingUserResponse,
    messagesEndRef,
    currentState: stateMachine.currentState,
    stateData: stateMachine.stateData,
    lastStateChange: stateMachine.lastStateChange,
    handleCall,
    handleAcceptCall,
    handleHangUpCall,
    resetConversation,
    handleModuleComplete,
    showNachbearbeitungSummary,
    handleSelectResponse,
    ...moduleManager,
    getStateJson, // Add the JSON state getter
    debugLastStateChange, // Add debug info
  };
}

