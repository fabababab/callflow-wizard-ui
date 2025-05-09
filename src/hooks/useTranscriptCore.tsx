
// Core transcript hook functionality that composes other hooks
import { useRef, useEffect, useCallback, useState } from 'react';
import { ScenarioType } from '@/components/ScenarioSelector';
import { useStateMachine } from '@/hooks/useStateMachine';
import { useMessageHandling } from '@/hooks/useMessageHandling';
import { useCallState } from '@/hooks/useCallState';
import { useConversationState } from '@/hooks/useConversationState';
import { useTransitionExtractor } from '@/hooks/useTransitionExtractor';
import { useNachbearbeitungHandler } from '@/hooks/useNachbearbeitungHandler';
import { useModuleManager } from '@/hooks/useModuleManager';
import { useConversationInitializer } from '@/hooks/useConversationInitializer';
import { useResponseHandler } from '@/hooks/useResponseHandler';
import { useStateChangeProcessor } from '@/hooks/useStateChangeProcessor';
import { useToast } from '@/hooks/use-toast';
import { ModuleType } from '@/types/modules';

export function useTranscriptCore(activeScenario: ScenarioType) {
  const toast = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Get the message handling functionality
  const messageHandling = useMessageHandling();
  
  // Get the state machine data
  const stateMachine = useStateMachine(activeScenario);
  
  // Get call state - use the consolidated hook
  const callState = useCallState();
  
  // Get conversation state
  const conversationState = useConversationState();
  
  // Get transition extractor
  const transitionExtractor = useTransitionExtractor(stateMachine.stateMachine);
  
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
  
  // Track if we've already initialized the conversation
  const [hasInitializedConversation, setHasInitializedConversation] = useState(false);
  
  // Use response handler
  const responseHandler = useResponseHandler({
    stateMachine,
    messageHandling,
    conversationState,
    toast
  });

  // Use state change processor
  const stateChangeProcessor = useStateChangeProcessor({
    stateMachine,
    messageHandling,
    conversationState,
    transitionExtractor,
    callState,
    toast
  });

  // Use conversation initializer
  const conversationInitializer = useConversationInitializer({
    activeScenario,
    conversationState,
    stateMachine,
    messageHandling,
    callState,
    setHasInitializedConversation,
    toast,
    showNachbearbeitungSummary
  });
  
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

  // Prevent full reset on scenario change - just reset conversation state, not messages
  useEffect(() => {
    console.log("Scenario changed to:", activeScenario);
    // Only reset conversation tracking state, not messages
    conversationState.resetConversationState(false);
    setHasInitializedConversation(false);
  }, [activeScenario, conversationState]);
  
  // Update to properly update UI when state changes
  useEffect(() => {
    if (!stateMachine.stateData || !callState.callActive || !stateMachine.lastStateChange) {
      return;
    }
    
    // For debugging purposes, track state changes
    setDebugLastStateChange(new Date().toISOString());
    console.log(`State change detected: ${stateMachine.currentState} at ${new Date().toISOString()}`);
    
    stateChangeProcessor.processStateChange();
    
    return () => {
      if (conversationState.debounceTimerRef.current) {
        clearTimeout(conversationState.debounceTimerRef.current);
      }
    };
  }, [
    stateMachine.stateData, 
    stateMachine.lastStateChange, 
    callState.callActive, 
    stateChangeProcessor,
    conversationState.debounceTimerRef,
    stateMachine.currentState
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

  // Add debug logging for state changes
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

  return {
    // Combine properties and methods from all hooks
    ...messageHandling,
    ...callState, // This now includes all call state methods
    lastTranscriptUpdate: conversationState.lastTranscriptUpdate,
    awaitingUserResponse: conversationState.awaitingUserResponse,
    messagesEndRef,
    currentState: stateMachine.currentState,
    stateData: stateMachine.stateData,
    lastStateChange: stateMachine.lastStateChange,
    handleCall: conversationInitializer.handleCall, // Use the initializer's handleCall
    handleAcceptCall: conversationInitializer.handleAcceptCall,
    handleHangUpCall: conversationInitializer.handleHangUpCall,
    resetConversation: conversationInitializer.resetConversation,
    handleModuleComplete,
    showNachbearbeitungSummary,
    handleSelectResponse: responseHandler.handleSelectResponse,
    ...moduleManager,
    getStateJson: transitionExtractor.getStateJson,
    debugLastStateChange,
    hasInitializedConversation,
  };
}
