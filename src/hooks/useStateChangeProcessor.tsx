// Hook for processing state changes
import { useCallback } from 'react';
import { detectSensitiveData } from '@/data/scenarioData';
import { ModuleType } from '@/types/modules';
import { useToast } from '@/hooks/use-toast';

interface StateChangeProcessorProps {
  stateMachine: any;
  messageHandling: any;
  conversationState: any;
  transitionExtractor: any;
  callState: any;
  toast: ReturnType<typeof useToast>;
}

export function useStateChangeProcessor({
  stateMachine,
  messageHandling,
  conversationState,
  transitionExtractor,
  callState,
  toast
}: StateChangeProcessorProps) {

  const processStateChange = useCallback(() => {
    // Clear any existing timers first
    if (conversationState.debounceTimerRef.current) {
      clearTimeout(conversationState.debounceTimerRef.current);
      conversationState.debounceTimerRef.current = null;
    }

    // If not active or already processed, skip
    if (!callState.callActive || !stateMachine.stateData) {
      console.log('Skipping state change processing: call not active or no state data', {
        callActive: callState.callActive,
        hasStateData: !!stateMachine.stateData
      });
      return;
    }
    
    // Special handling for initial states
    if (stateMachine.currentState && 
        (stateMachine.currentState === 'start' || 
         stateMachine.currentState === 'initial' || 
         stateMachine.currentState.includes('initial'))) {
      console.log('Processing initial state immediately without debounce');
      processStateChangeInternal();
      return;
    }

    // Prevent duplicate processing of the same state - check before setting timeout
    if (conversationState.hasProcessedState(stateMachine.currentState)) {
      console.log(`State ${stateMachine.currentState} already processed, skipping message updates`);
      return;
    }
    
    console.log('===== QUEUING STATE CHANGE PROCESSING =====');
    console.log(`Queueing state change processing for state: ${stateMachine.currentState}`);
    console.log('State data to be processed:', stateMachine.stateData);
    
    // Set new timer
    conversationState.debounceTimerRef.current = window.setTimeout(() => {
      processStateChangeInternal();
    }, 300); // 300ms debounce
    
    function processStateChangeInternal() {
      // Guard against processing already handled states (double check after timeout)
      if (stateMachine.currentState && conversationState.hasProcessedState(stateMachine.currentState)) {
        console.log(`State ${stateMachine.currentState} already processed after debounce, skipping`);
        return;
      }

      console.log('===== PROCESSING STATE CHANGE (INTERNAL) =====');
      console.log('Debounce complete, actually processing state change:', stateMachine.currentState);
      console.log('State data for processing:', stateMachine.stateData);
      
      // Log the current state transitions for debugging
      transitionExtractor.logStateTransitions(stateMachine.currentState);
      
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
        const responseOptions = transitionExtractor.extractTransitionsAsResponseOptions(stateMachine.currentState);
        console.log(`Extracted response options for state ${stateMachine.currentState}:`, responseOptions);
        
        // Add customer message with detected sensitive data and response options
        messageHandling.addCustomerMessage(
          stateMachine.stateData.meta.customerText, 
          sensitiveData, 
          responseOptions, 
          stateMachine.stateData.requiresVerification // Pass verification flag
        );
        
        // Set flag that we're waiting for user to respond
        conversationState.setAwaitingUserResponse(true);
        
        // If requires verification, add to pending verifications
        if (stateMachine.stateData.requiresVerification) {
          conversationState.addPendingVerification(stateMachine.currentState);
        }
        
        // If sensitive data was detected, show toast notification
        if (sensitiveData && sensitiveData.length > 0 && 
            !conversationState.hasShownToastFor(stateMachine.currentState)) {
          toast.toast({
            title: "Sensitive Data Detected",
            description: "Please verify the detected information before proceeding.",
            duration: 3000
          });
          conversationState.markToastShown(stateMachine.currentState);
        }
      }
      
      if (stateMachine.stateData.meta?.agentText && !conversationState.isUserAction) {
        console.log(`Adding agent message: ${stateMachine.stateData.meta.agentText}`);
        
        // Extract response options for next state if needed
        const responseOptions = stateMachine.stateData.meta?.responseOptions || [];
        
        // If explicit responseOptions aren't provided, extract them from transitions
        const effectiveResponseOptions = responseOptions.length > 0 
          ? responseOptions
          : transitionExtractor.extractTransitionsAsResponseOptions(stateMachine.currentState);
        
        console.log("Agent message response options:", effectiveResponseOptions);
          
        messageHandling.addAgentMessage(
          stateMachine.stateData.meta.agentText, 
          [], 
          effectiveResponseOptions.length > 0 ? effectiveResponseOptions : undefined,
          stateMachine.stateData.requiresVerification // Pass verification flag
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
      if (stateMachine.currentState) {
        conversationState.markStateAsProcessed(stateMachine.currentState);
      }
      conversationState.setLastTranscriptUpdate(new Date());
      
      // Reset user action flag
      conversationState.setIsUserAction(false);
      
      console.log('===== STATE CHANGE PROCESSING COMPLETE (INTERNAL) =====');
    }
  }, [
    stateMachine.stateMachine, // Added dependency
    stateMachine.stateData, 
    stateMachine.currentState, 
    callState.callActive, 
    messageHandling,
    conversationState,
    transitionExtractor,
    toast
  ]);

  return {
    processStateChange
  };
}
