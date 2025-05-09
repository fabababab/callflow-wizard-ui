
// Hook for initializing and resetting conversations
import { useCallback } from 'react';
import { ScenarioType } from '@/components/ScenarioSelector';
import { useToast } from '@/hooks/use-toast';

interface ConversationInitializerProps {
  activeScenario: ScenarioType;
  conversationState: any;
  stateMachine: any;
  messageHandling: any;
  callState: any;
  setHasInitializedConversation: React.Dispatch<React.SetStateAction<boolean>>;
  toast: ReturnType<typeof useToast>;
  showNachbearbeitungSummary: () => void;
}

export function useConversationInitializer({
  activeScenario,
  conversationState,
  stateMachine,
  messageHandling,
  callState,
  setHasInitializedConversation,
  toast,
  showNachbearbeitungSummary
}: ConversationInitializerProps) {

  // Reset the conversation - ONLY when explicitly requested by the user
  const resetConversation = useCallback(() => {
    console.log('Manually resetting conversation');
    messageHandling.clearMessages();
    stateMachine.resetStateMachine();
    conversationState.resetConversationState(true);
    setHasInitializedConversation(false);
    
    toast({
      title: "Conversation Reset",
      description: "The conversation has been reset to its initial state.",
      duration: 2000,
    });
  }, [messageHandling.clearMessages, stateMachine.resetStateMachine, conversationState, setHasInitializedConversation, toast]);

  // Improved call start function to properly initialize state
  const handleCall = useCallback(() => {
    try {
      if (!callState.callActive) {
        console.log('Starting call for scenario:', activeScenario);
        
        // Validate scenario is loaded
        if (!stateMachine.stateMachine) {
          throw new Error('State machine not loaded');
        }
        
        // Set call active state
        callState.setCallActiveState(true);
        
        // IMPORTANT: Only clear messages if this is a manual reset or first initialization
        if (conversationState.manualReset || !messageHandling.messages.length) {
          if (messageHandling.messages.length > 0) {
            console.log('Clearing existing messages due to manual reset or first initialization');
          }
          
          // Add system message only if we don't already have messages
          if (!messageHandling.messages.length) {
            messageHandling.addSystemMessage('Call started');
            setHasInitializedConversation(true);
          }
          
          // Reset the manual reset flag
          conversationState.setManualReset(false);
          
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
          
          // Still need to trigger the state machine
          setTimeout(() => {
            if (!conversationState.isInitialStateProcessed) {
              console.log('Processing start call for already initialized conversation');
              stateMachine.processStartCall() || stateMachine.processSelection('START_CALL');
              conversationState.setIsInitialStateProcessed(true);
            } else {
              console.log('Initial state already processed, not triggering state machine');
            }
          }, 100);
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
    messageHandling, 
    stateMachine, 
    conversationState,
    showNachbearbeitungSummary,
    setHasInitializedConversation
  ]);

  // Accept incoming call with improved state handling
  const handleAcceptCall = useCallback((callId: string) => {
    console.log('Accepting call:', callId);
    callState.setAcceptedCallId(callId);
    callState.setCallActiveState(true);
    
    // Only reset on explicit accept
    conversationState.resetConversationState(true);
    setHasInitializedConversation(true);
    
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
  }, [
    callState, 
    messageHandling.addSystemMessage, 
    stateMachine.processStartCall, 
    stateMachine.processSelection, 
    conversationState, 
    setHasInitializedConversation,
    toast
  ]);

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

  return {
    resetConversation,
    handleCall,
    handleAcceptCall,
    handleHangUpCall
  };
}
