
// This is a new file to properly handle toast types
import { useCallback } from 'react';
import { StateMachineInterface } from '@/hooks/useStateMachine';
import { MessageHandlingInterface } from '@/hooks/useMessageHandling';
import { ConversationStateInterface } from '@/hooks/useConversationState';

// Define proper ToastInterface to match what's used in useTranscriptCore
interface ToastInterface {
  toast: (props: any) => { id: string; dismiss: () => void; update: (props: any) => void };
  dismiss: (toastId?: string) => void;
  dismissAll: () => void;
  clear: (toastId?: string) => void;
  clearAll: () => void;
  markAsRead: (toastId?: string | "all") => void;
  toasts: any[];
  notifications: any[];
  unreadCount: number;
}

interface ResponseHandlerParams {
  stateMachine: StateMachineInterface;
  messageHandling: MessageHandlingInterface;
  conversationState: ConversationStateInterface;
  toast: ToastInterface;
}

export function useResponseHandler({
  stateMachine,
  messageHandling,
  conversationState,
  toast
}: ResponseHandlerParams) {
  
  const handleSelectResponse = useCallback((response: string) => {
    console.log(`Selected response: "${response}"`);
    
    // Add agent message for the selected response
    messageHandling.addAgentMessage(response);
    
    // Set state to indicate we're awaiting user response
    conversationState.setAwaitingUserResponse(true);
    
    // Process transition based on the selected response if needed
    stateMachine.processTransition(response);
    
    // Notify about user selection via toast only when needed for important actions
    if (response.includes("bestätigen") || response.includes("abschließen")) {
      toast.toast({
        title: "Aktion ausgewählt",
        description: `Sie haben "${response}" ausgewählt`,
        variant: "default"
      });
    }
  }, [messageHandling, conversationState, stateMachine, toast]);
  
  return {
    handleSelectResponse
  };
}
