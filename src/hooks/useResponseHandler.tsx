
// Hook for handling user response selections
import { useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

interface ResponseHandlerProps {
  stateMachine: any;
  messageHandling: any;
  conversationState: any;
  toast: ReturnType<typeof useToast>;
}

export function useResponseHandler({
  stateMachine,
  messageHandling,
  conversationState,
  toast
}: ResponseHandlerProps) {
  // This is our primary interaction method - updated to ensure explicit user action
  const handleSelectResponse = useCallback((response: string) => {
    console.log('User selecting response:', response);
    
    // Only process if we're awaiting user response or at initial state
    if (!conversationState.awaitingUserResponse && !conversationState.isInitialStateProcessed) {
      console.warn('Not awaiting user response yet, skipping');
      toast({
        title: "Cannot select response",
        description: "Please wait for the conversation to initialize first",
        variant: "destructive",
        duration: 2000
      });
      return;
    }
    
    // Show toast notification for response selection
    toast({
      title: "Response Selected",
      description: response,
      duration: 2000,
    });
    
    // Set the user action flag
    conversationState.setIsUserAction(true);
    
    // Reset awaiting user response flag
    conversationState.setAwaitingUserResponse(false);
    
    // Add the selected response as an agent message
    messageHandling.addAgentMessage(response);
    
    // Process the selection in the state machine
    console.log('Processing selection in state machine:', response, 'from state:', stateMachine.currentState);
    
    // Small delay to ensure UI updates before state changes
    setTimeout(() => {
      const success = stateMachine.processSelection(response);
      
      if (!success) {
        console.warn('Failed to process selection:', response);
        // Try with DEFAULT transition as fallback
        console.log("Using default response path");
        const defaultSuccess = stateMachine.processSelection("DEFAULT");
        
        if (!defaultSuccess) {
          toast({
            title: "State Transition Failed",
            description: "Could not proceed to the next state. Try resetting the conversation.",
            variant: "destructive",
            duration: 3000
          });
        } else {
          console.log("Successfully transitioned using DEFAULT path");
        }
      } else {
        console.log("Successfully transitioned to new state:", stateMachine.currentState);
      }
    }, 100);
    
  }, [
    conversationState.awaitingUserResponse, 
    conversationState.isInitialStateProcessed, 
    messageHandling.addAgentMessage, 
    stateMachine.processSelection, 
    stateMachine.currentState,
    conversationState,
    toast
  ]);

  return {
    handleSelectResponse
  };
}
