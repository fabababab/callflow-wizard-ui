
// This is a new file to properly handle toast types
import { useCallback } from 'react';
import { StateMachineInterface } from '@/hooks/useStateMachine';
import { MessageHandlingInterface } from '@/hooks/useMessageHandling';
import { ConversationStateInterface } from '@/hooks/useConversationState';
import { TransitionExtractorInterface } from '@/hooks/useTransitionExtractor';
import { CallStateInterface } from '@/hooks/useCallState';

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

interface StateChangeProcessorParams {
  stateMachine: StateMachineInterface;
  messageHandling: MessageHandlingInterface;
  conversationState: ConversationStateInterface;
  transitionExtractor: TransitionExtractorInterface;
  callState: CallStateInterface;
  toast: ToastInterface;
}

export function useStateChangeProcessor({
  stateMachine,
  messageHandling,
  conversationState,
  transitionExtractor,
  callState,
  toast
}: StateChangeProcessorParams) {
  
  const processStateChange = useCallback(() => {
    const { currentState, stateData } = stateMachine;
    
    console.log(`Processing state change to: ${currentState}`);
    
    if (!stateData || !currentState || !callState.callActive) {
      console.log('Cannot process state change: missing data or call not active');
      return;
    }
    
    // Check if we have meta data with messages to display
    if (stateData.meta) {
      // Handle system message
      if (stateData.meta.systemMessage) {
        console.log(`Adding system message: ${stateData.meta.systemMessage}`);
        messageHandling.addSystemMessage(stateData.meta.systemMessage);
        
        // Notify about important system events via toast
        if (stateData.meta.systemMessage.includes("completed") || 
            stateData.meta.systemMessage.includes("verified")) {
          toast.toast({
            title: "System Update",
            description: stateData.meta.systemMessage,
            variant: "default"
          });
        }
      }
      
      // Handle agent text
      if (stateData.meta.agentText) {
        console.log(`Adding agent message: ${stateData.meta.agentText}`);
        messageHandling.addAgentMessage(stateData.meta.agentText, {
          responseOptions: stateData.meta.responseOptions
        });
      }
      
      // Handle customer text
      if (stateData.meta.customerText) {
        console.log(`Adding customer message: ${stateData.meta.customerText}`);
        messageHandling.addCustomerMessage(stateData.meta.customerText);
        
        // Update conversation state
        conversationState.setAwaitingUserResponse(false);
      }
    }
    
    // Check for special states
    if (currentState === 'call_ended') {
      console.log('Call has ended state detected');
      callState.setCallActive(false);
      
      // Notify about call end
      toast.toast({
        title: "Call Ended",
        description: "The call has been completed",
        variant: "default"
      });
    }
    
  }, [stateMachine, messageHandling, conversationState, callState, toast]);
  
  return {
    processStateChange
  };
}
