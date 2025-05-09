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
    console.log('===== RESPONSE SELECTION BEGIN =====');
    console.log('User selecting response:', response);
    console.log('Current state:', stateMachine.currentState);
    console.log('Conversation state:', {
      awaitingUserResponse: conversationState.awaitingUserResponse,
      isInitialStateProcessed: conversationState.isInitialStateProcessed,
      isUserAction: conversationState.isUserAction
    });
    
    // Only process if we're awaiting user response or at initial state
    if (!conversationState.awaitingUserResponse && !conversationState.isInitialStateProcessed) {
      console.warn('Not awaiting user response yet, skipping');
      toast.toast({
        title: "Cannot select response",
        description: "Please wait for the conversation to initialize first",
        variant: "destructive",
        duration: 2000
      });
      return;
    }
    
    // Show toast notification for response selection
    toast.toast({
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
    console.log('Available transitions:', stateMachine.stateData?.on);
    
    // Small delay to ensure UI updates before state changes
    setTimeout(() => {
      console.log('Executing state transition for response:', response);
      const success = stateMachine.processSelection(response);
      
      if (!success) {
        console.warn('Failed to process selection:', response);
        console.log('Current state machine:', stateMachine.stateMachine);
        
        // Try with DEFAULT transition as fallback
        console.log("Using default response path");
        const defaultSuccess = stateMachine.processSelection("DEFAULT");
        
        if (!defaultSuccess) {
          console.error('Both specific and DEFAULT transitions failed');
          toast.toast({
            title: "State Transition Failed",
            description: "Could not proceed to the next state. Try resetting the conversation.",
            variant: "destructive",
            duration: 3000
          });
        } else {
          console.log("Successfully transitioned using DEFAULT path to:", stateMachine.currentState);
        }
      } else {
        console.log("Successfully transitioned to new state:", stateMachine.currentState);
        console.log("New state data:", stateMachine.stateData);
      }
      
      console.log('===== RESPONSE SELECTION COMPLETE =====');
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
