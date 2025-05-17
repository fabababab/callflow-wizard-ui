
import { useCallback, useEffect, useRef } from 'react';

interface VerificationEventsProps {
  messageHandling: {
    addSystemMessage: (message: string) => void;
  };
  handleSelectResponse: (response: string) => void;
  stateMachine: {
    currentState: string;
    stateData: any;
  };
}

export function useVerificationEvents({
  messageHandling,
  handleSelectResponse,
  stateMachine
}: VerificationEventsProps) {
  // Track which verification events we've already processed
  const processedVerificationEventsRef = useRef<Set<string>>(new Set());
  const verificationHandledRef = useRef<Record<string, boolean>>({});
  const verificationInProgressRef = useRef(false);
  
  // Add event listeners for verification completion events
  useEffect(() => {
    const handleVerificationComplete = (event: CustomEvent) => {
      // Generate a unique ID for this verification event based on state
      const eventId = `${event.type}-${event.detail?.moduleId || 'inline'}-${stateMachine.currentState}`;
      
      // Skip if we've already processed this verification event
      if (processedVerificationEventsRef.current.has(eventId) || verificationInProgressRef.current) {
        console.log("Skipping duplicate verification event:", eventId);
        return;
      }
      
      console.log("Verification complete event detected:", event.detail);
      processedVerificationEventsRef.current.add(eventId);
      verificationInProgressRef.current = true;
      
      // Add a short delay to ensure UI is updated
      setTimeout(() => {
        // System message about verification - only show once per state
        if (!verificationHandledRef.current[stateMachine.currentState]) {
          messageHandling.addSystemMessage("Kundenidentität wurde erfolgreich verifiziert.");
          verificationHandledRef.current[stateMachine.currentState] = true;
        }
        
        // Check if this is a direct transition request (from Valid button click)
        const shouldAutoTransition = event.detail?.autoTransition === true;
        const targetState = event.detail?.triggerState;
        
        if (shouldAutoTransition && targetState === 'customer_issue') {
          console.log("Direct transition to customer_issue state requested");
          
          // Get available responses for the current state
          const responseOptions = stateMachine.stateData?.meta?.responseOptions || [];
          console.log("Available responses:", responseOptions);
          
          // If there are response options, automatically pick the first one
          if (responseOptions.length > 0) {
            const responseToSelect = responseOptions[0];
            console.log("Auto-selecting response after verification:", responseToSelect);
            
            // Add a slightly longer delay to make the flow feel more natural
            // and ensure the message is visible first
            setTimeout(() => {
              console.log("Executing direct state transition to customer_issue");
              handleSelectResponse(responseToSelect);
            }, 800); // Delay for UX flow
          } else {
            console.warn("No response options available for state transition");
          }
        }
        // Standard logic for verify_identity state when not direct transition
        else if (stateMachine.currentState === 'verify_identity') {
          console.log("In verify_identity state, will auto-select response");
          
          // Get available responses for the current state
          const responseOptions = stateMachine.stateData?.meta?.responseOptions || [];
          console.log("Available responses:", responseOptions);
          
          // If there are response options, automatically pick the first one
          if (responseOptions.length > 0) {
            const responseToSelect = responseOptions[0];
            console.log("Auto-selecting response after verification:", responseToSelect);
            
            // Add a slightly longer delay to make the flow feel more natural
            // and ensure the message is visible first
            setTimeout(() => {
              console.log("Executing auto-selection now");
              handleSelectResponse(responseToSelect);
              console.log("State transition initiated to customer_issue");
            }, 1000); // Increased delay for better UX flow
          } else {
            console.warn("No response options available for state transition");
          }
        } else {
          console.log("Not in verify_identity state, current state:", stateMachine.currentState);
        }
        
        // Reset verification in progress after a delay
        setTimeout(() => {
          verificationInProgressRef.current = false;
          console.log("Verification processing completed, ready for next event");
        }, 1500);
      }, 500); // Increased initial delay for UI update
    };

    console.log("Setting up verification event listeners");
    
    // Add event listeners for all verification events
    window.addEventListener('verification-complete', handleVerificationComplete as EventListener);
    window.addEventListener('verification-successful', handleVerificationComplete as EventListener);
    
    // Cleanup
    return () => {
      console.log("Removing verification event listeners");
      window.removeEventListener('verification-complete', handleVerificationComplete as EventListener);
      window.removeEventListener('verification-successful', handleVerificationComplete as EventListener);
    };
  }, [messageHandling, stateMachine.stateData, stateMachine.currentState, handleSelectResponse]);

  return {
    verificationInProgressRef,
    verificationHandledRef
  };
}
