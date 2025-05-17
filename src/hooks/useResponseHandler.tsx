
// Hook for handling responses
import { useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

interface ResponseHandlerProps {
  stateMachine: any;
  messageHandling: any;
  conversationState: any;
}

export function useResponseHandler({
  stateMachine,
  messageHandling,
  conversationState
}: ResponseHandlerProps) {
  const { toast } = useToast();

  const handleSelectResponse = useCallback((response: string) => {
    console.log(`Selected response: "${response}"`);
    
    // Skip if the response has already been used
    if (conversationState.isResponseOptionUsed(response)) {
      console.log(`Response "${response}" has already been used. Ignoring.`);
      return;
    }
    
    // Start transition process
    console.log('Processing response selection');
    
    // Mark as user action to differentiate from system-initiated state changes
    conversationState.setIsUserAction(true);
    
    // Mark this response as used to prevent duplicate clicks
    conversationState.markResponseOptionAsUsed(response);
    
    // Skip state changes if we're displaying loading or error states
    if (stateMachine.isLoading || stateMachine.error) {
      console.log(`Skipping state change for "${response}" - state machine is loading or has error`);
      toast({
        title: "Cannot process response",
        description: stateMachine.error || "System is loading, please try again later",
        variant: "destructive"
      });
      return;
    }

    // Set a short debounce to avoid rapid clicks causing race conditions
    setTimeout(() => {
      console.log("Debounce complete, processing selection:", response);
      
      // Process the selection through state machine
      const success = stateMachine.processSelection(response);
      
      if (success) {
        // Reset awaiting response flag
        conversationState.setAwaitingUserResponse(false);
      } else {
        console.error(`Failed to process response: "${response}"`);
        toast({
          title: "Failed to process response",
          description: `Could not find a valid transition for "${response}"`,
          variant: "destructive"
        });
      }
    }, 100);
    
  }, [stateMachine, toast, conversationState]);

  return {
    handleSelectResponse
  };
}
