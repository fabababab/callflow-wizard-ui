
// Hook for call termination
import { useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

interface CallTerminationProps {
  callState: any;
  stateMachine: any;
  messageHandling: any;
  conversationState: any;
  showNachbearbeitungSummary: () => void;
  toast: ReturnType<typeof useToast>;
}

export function useCallTermination({
  callState,
  stateMachine,
  messageHandling,
  conversationState,
  showNachbearbeitungSummary,
  toast
}: CallTerminationProps) {
  // Function to handle hanging up a call
  const handleHangUpCall = useCallback(() => {
    console.log('Hanging up call...');
    
    // Set call as inactive
    callState.setCallActive(false);
    
    // Reset state machine
    stateMachine.resetStateMachine();
    
    // Add system message
    messageHandling.addSystemMessage('Call ended.');
    
    // Reset conversation state tracking but don't clear messages
    conversationState.resetConversationState(false);
    
    // Show summary screen
    if (conversationState.showNachbearbeitungModule) {
      console.log('Showing Nachbearbeitung summary...');
      showNachbearbeitungSummary();
    } else {
      toast.toast({
        title: "Call Ended",
        description: "The call has been ended successfully.",
        duration: 3000
      });
    }
  }, [callState, stateMachine, messageHandling, conversationState, showNachbearbeitungSummary, toast]);

  return {
    handleHangUpCall
  };
}
