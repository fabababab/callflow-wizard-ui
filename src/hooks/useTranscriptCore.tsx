
// Core transcript hook functionality that composes other hooks
import { useRef, useCallback } from 'react';
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
import { useDebugLogging } from '@/hooks/useDebugLogging';
import { useModuleCompletionEvents } from '@/hooks/useModuleCompletionEvents';
import { useMessagesScrolling } from '@/hooks/useMessagesScrolling';
import { useStateChangeEffect } from '@/hooks/useStateChangeEffect';
import { useMessageUpdates } from '@/hooks/useMessageUpdates';
import { useScenarioChangeEffect } from '@/hooks/useScenarioChangeEffect';

export function useTranscriptCore(activeScenario: ScenarioType) {
  const { toast } = useToast();
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
  
  // Get Nachbearbeitung handler - fix: pass completeModule directly
  const { showNachbearbeitungSummary } = useNachbearbeitungHandler(
    moduleManager.completeModule
  );

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
    setHasInitializedConversation: () => {}, // Will be replaced by useScenarioChangeEffect
    toast,
    showNachbearbeitungSummary
  });

  // Use debug logging hooks
  const { debugLastStateChange } = useDebugLogging({
    activeScenario,
    stateData: stateMachine.stateData,
    currentState: stateMachine.currentState,
    debugLastStateChange: ""
  });
  
  // Use module completion events hook
  useModuleCompletionEvents({
    addSystemMessage: messageHandling.addSystemMessage
  });
  
  // Use messages scrolling hook - accepts Date or string type for lastTranscriptUpdate
  useMessagesScrolling({
    messagesEndRef,
    lastTranscriptUpdate: conversationState.lastTranscriptUpdate
  });
  
  // Use state change effect hook
  const stateChangeDebug = useStateChangeEffect({
    stateData: stateMachine.stateData,
    lastStateChange: stateMachine.lastStateChange,
    callActive: callState.callActive,
    currentState: stateMachine.currentState,
    processStateChange: stateChangeProcessor.processStateChange,
    debounceTimerRef: conversationState.debounceTimerRef
  });
  
  // Use message updates hook - make sure we pass the correct type for lastMessageUpdate
  useMessageUpdates({
    lastMessageUpdate: messageHandling.lastMessageUpdate,
    setLastTranscriptUpdate: conversationState.setLastTranscriptUpdate
  });
  
  // Use scenario change effect hook
  const scenarioChangeState = useScenarioChangeEffect({
    activeScenario,
    resetConversationState: conversationState.resetConversationState
  });

  // Handle inline module completion
  const handleInlineModuleComplete = useCallback((messageId: string, moduleId: string, result: any) => {
    console.log(`Inline module ${moduleId} completed for message ${messageId}`, result);
  }, []);
  
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
        messageHandling.addSystemMessage(`Gesprächszusammenfassung abgeschlossen. Punkte bestätigt: ${result.points?.length || 0}`, {
          responseOptions: ["Vielen Dank für Ihren Anruf. Einen schönen Tag noch!"]
        });
        conversationState.setShowNachbearbeitungModule(false);
      }
    }
  }, [moduleManager, messageHandling, conversationState]);
  
  // Combine state from scenario change effect with conversation initializer
  const enhancedConversationInitializer = {
    ...conversationInitializer,
    handleCall: useCallback(() => {
      console.log('Enhanced handleCall triggered');
      conversationInitializer.handleCall();
    }, [conversationInitializer]),
    resetConversation: useCallback(() => {
      conversationInitializer.resetConversation();
      scenarioChangeState.setHasInitializedConversation(false);
    }, [conversationInitializer, scenarioChangeState])
  };

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
    handleCall: enhancedConversationInitializer.handleCall,
    handleAcceptCall: conversationInitializer.handleAcceptCall,
    handleHangUpCall: conversationInitializer.handleHangUpCall,
    resetConversation: enhancedConversationInitializer.resetConversation,
    handleModuleComplete,
    handleInlineModuleComplete,
    showNachbearbeitungSummary,
    handleSelectResponse: responseHandler.handleSelectResponse,
    ...moduleManager,
    getStateJson: transitionExtractor.getStateJson,
    debugLastStateChange: stateChangeDebug.debugLastStateChange || debugLastStateChange,
    hasInitializedConversation: scenarioChangeState.hasInitializedConversation,
  };
}
