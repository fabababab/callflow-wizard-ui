// Hook for handling user response selections
import { useCallback, useEffect, useRef } from 'react';
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
  // Track if we've shown a response selection toast
  const responseToastShownRef = useRef<Record<string, boolean>>({});
  
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
    
    // Special case for "Verify customer identity first" option - auto-continue
    const isVerifyIdentityOption = response.toLowerCase().includes('verify') && 
                                  response.toLowerCase().includes('identity');
    
    // Show toast notification for response selection (only once per unique response)
    if (!responseToastShownRef.current[response]) {
      toast.toast({
        title: "Response Selected",
        description: response,
        duration: 2000,
      });
      responseToastShownRef.current[response] = true;
    }
    
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
      
      // For verification flows, ensure we continue automatically if needed
      if (isVerifyIdentityOption) {
        console.log("Identity verification was selected, setting up auto-continue...");
        
        // Use a slightly longer delay to allow verification UI to show up
        setTimeout(() => {
          // Add verification message to chat
          messageHandling.addSystemMessage("Customer identity has been automatically verified.");
          
          // Wait for verification modal to complete
          setTimeout(() => {
            console.log("Continuing flow after identity verification");
            
            // Get available responses
            const responseOptions = stateMachine.stateData?.meta?.responseOptions || [];
            
            if (responseOptions.length > 0) {
              // Pick the first available response option to continue the flow
              handleSelectResponse(responseOptions[0]);
            }
          }, 2000);
        }, 2000);
      }
      
      console.log('===== RESPONSE SELECTION COMPLETE =====');
    }, 100);
    
  }, [
    stateMachine,
    messageHandling,
    conversationState,
    toast
  ]);

  // Track which verification events we've already processed
  const processedVerificationEventsRef = useRef<Set<string>>(new Set());
  
  // Add event listeners for verification completion events
  useEffect(() => {
    const handleVerificationComplete = (event: Event) => {
      const customEvent = event as CustomEvent;
      const eventId = `${customEvent.type}-${customEvent.detail?.moduleId || 'inline'}-${Date.now()}`;
      
      if (processedVerificationEventsRef.current.has(eventId)) {
        console.log("Skipping duplicate verification event:", eventId);
        return;
      }
      
      console.log("Verification complete event detected:", customEvent.detail);
      processedVerificationEventsRef.current.add(eventId);
      
      setTimeout(() => {
        messageHandling.addSystemMessage("Customer identity has been successfully verified.");
        const responseOptions = stateMachine.stateData?.meta?.responseOptions || [];
        if (responseOptions.length > 0) {
          console.log("Auto-selecting response after verification:", responseOptions[0]);
          setTimeout(() => {
            if (typeof handleSelectResponse === 'function') {
                handleSelectResponse(responseOptions[0]);
            }
          }, 1500);
        }
      }, 500);
    };
    
    // Add event listener for verification complete
    window.addEventListener('verification-complete', handleVerificationComplete);
    window.addEventListener('verification-successful', handleVerificationComplete);
    
    // Clean up listener on unmount
    return () => {
      window.removeEventListener('verification-complete', handleVerificationComplete);
      window.removeEventListener('verification-successful', handleVerificationComplete);
    };
  }, [messageHandling, stateMachine.stateData, handleSelectResponse]);

  return {
    handleSelectResponse
  };
}
