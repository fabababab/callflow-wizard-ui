
// Hook for conversation reset
import { useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

interface ConversationResetProps {
  callState: any;
  conversationState: any;
  messageHandling: any;
  stateMachine: any;
  setHasInitializedConversation: (value: boolean) => void;
  toast: ReturnType<typeof useToast>;
}

export function useConversationReset({
  callState,
  conversationState,
  messageHandling,
  stateMachine,
  setHasInitializedConversation,
  toast
}: ConversationResetProps) {
  // Function to reset the conversation
  const resetConversation = useCallback(() => {
    console.log('Resetting conversation...');
    
    // First check if call is active
    if (callState.callActive) {
      // End call first
      callState.setCallActive(false);
      messageHandling.addSystemMessage('Call ended.');
    }
    
    // Reset state machine
    stateMachine.resetStateMachine();
    
    // Reset conversation state including messages
    conversationState.resetConversationState(true);
    
    // Clear messages
    messageHandling.clearMessages();
    
    // Add reset message
    messageHandling.addSystemMessage('Conversation reset. Ready to start a new call.');
    
    // Update last transcript update time
    conversationState.setLastTranscriptUpdate(new Date());
    
    // Set flag for initialization
    setHasInitializedConversation(false);
    
    // Show toast
    toast.toast({
      title: "Conversation Reset",
      description: "The conversation has been reset. Ready to start a new call.",
      duration: 3000
    });
  }, [callState, conversationState, messageHandling, stateMachine, toast, setHasInitializedConversation]);

  return {
    resetConversation
  };
}
