
// Hook for call termination
import { useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { ScenarioType } from '@/components/ScenarioSelector';

interface CallTerminationProps {
  callState: any;
  stateMachine: any;
  messageHandling: any;
  conversationState: any;
  showNachbearbeitungSummary: () => void;
  toast: ReturnType<typeof useToast>;
  activeScenario?: ScenarioType;
}

export function useCallTermination({
  callState,
  stateMachine,
  messageHandling,
  conversationState,
  showNachbearbeitungSummary,
  toast,
  activeScenario
}: CallTerminationProps) {
  // Function to handle hanging up a call
  const handleHangUpCall = useCallback(() => {
    console.log('Hanging up call...', activeScenario);
    
    // Set call as inactive
    callState.setCallActive(false);
    
    // Reset state machine
    stateMachine.resetStateMachine();
    
    // Add system message
    messageHandling.addSystemMessage(activeScenario === 'deutscheVersion' ? 'Gespräch beendet.' : 'Call ended.');
    
    // Reset conversation state tracking but don't clear messages
    conversationState.resetConversationState(false);
    
    // Show summary screen
    if (conversationState.showNachbearbeitungModule) {
      console.log('Showing Nachbearbeitung summary...');
      showNachbearbeitungSummary();
    } else {
      toast.toast({
        title: activeScenario === 'deutscheVersion' ? "Gespräch Beendet" : "Call Ended",
        description: activeScenario === 'deutscheVersion' 
          ? "Das Gespräch wurde erfolgreich beendet." 
          : "The call has been ended successfully.",
        duration: 3000
      });
    }
  }, [callState, stateMachine, messageHandling, conversationState, showNachbearbeitungSummary, toast, activeScenario]);

  return {
    handleHangUpCall
  };
}
