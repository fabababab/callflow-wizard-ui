
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
  // Track which verification events we've already processed with detailed state info
  const processedVerificationEventsRef = useRef<Set<string>>(new Set());
  const verificationHandledRef = useRef<Record<string, boolean>>({});
  const verificationInProgressRef = useRef(false);
  
  // Add event listeners for verification completion events with improved handling
  useEffect(() => {
    const handleVerificationComplete = (event: CustomEvent) => {
      // Generate a unique ID for this verification event based on state, module ID and timestamp
      const timestamp = event.detail?.timestamp || Date.now();
      const moduleId = event.detail?.moduleId || 'inline';
      const eventId = `${event.type}-${moduleId}-${stateMachine.currentState}-${timestamp}`;
      const trackingId = `${event.type}-${moduleId}-${stateMachine.currentState}`;
      
      // Skip if we've already processed this verification event or any verification is in progress
      if (processedVerificationEventsRef.current.has(trackingId) || verificationInProgressRef.current) {
        console.log("Skipping duplicate verification event:", eventId);
        return;
      }
      
      console.log("Verification complete event detected:", event.detail);
      // Track this event with the state to prevent future duplicates
      processedVerificationEventsRef.current.add(trackingId);
      verificationInProgressRef.current = true;
      
      // Only proceed if verification was successful
      if (!event.detail?.success) {
        console.log("Verification was not successful, not proceeding with state transition");
        verificationInProgressRef.current = false;
        return;
      }
      
      // Add a short delay to ensure UI is updated
      setTimeout(() => {
        // System message about verification - only show once per state
        if (!verificationHandledRef.current[stateMachine.currentState] && 
            (stateMachine.currentState === 'verify_identity' || 
             stateMachine.currentState?.includes('verification'))) {
          messageHandling.addSystemMessage("Kundenidentität wurde erfolgreich verifiziert.");
          verificationHandledRef.current[stateMachine.currentState] = true;
        }
        
        // Get available responses for the current state
        const responseOptions = stateMachine.stateData?.meta?.responseOptions || [];
        
        // If there are response options, automatically pick the first one after a delay
        if (responseOptions.length > 0) {
          console.log("Auto-selecting response after verification:", responseOptions[0]);
          
          // Add a longer delay to make the flow feel more natural and ensure verification UI is visible
          setTimeout(() => {
            verificationInProgressRef.current = false;
            handleSelectResponse(responseOptions[0]);
          }, 1500);
        } else {
          console.warn("No response options available after verification in state:", stateMachine.currentState);
          verificationInProgressRef.current = false;
        }
      }, 500);
    };

    // Add event listeners for verification events - using a specific handler for each event type
    const verificationCompleteHandler = (e: Event) => {
      console.log("verification-complete event received");
      handleVerificationComplete(e as CustomEvent);
    };
    
    const verificationSuccessfulHandler = (e: Event) => {
      console.log("verification-successful event received");
      handleVerificationComplete(e as CustomEvent);
    };
    
    window.addEventListener('verification-complete', verificationCompleteHandler);
    window.addEventListener('verification-successful', verificationSuccessfulHandler);
    
    // Handle module complete events that are verification types
    const moduleCompleteHandler = (e: Event) => {
      const event = e as CustomEvent;
      if (event.detail?.moduleType === 'VERIFICATION' && event.detail?.result?.verified) {
        console.log("module-complete event for verification type received");
        handleVerificationComplete(event);
      }
    };
    
    window.addEventListener('module-complete', moduleCompleteHandler);
    
    // In verify_identity state without module, automatically progress after a short delay
    if (stateMachine.currentState === 'verify_identity' && 
        !stateMachine.stateData?.meta?.module &&
        !verificationHandledRef.current[stateMachine.currentState]) {
      console.log("Auto-triggering verification for verify_identity state without module");
      const timer = setTimeout(() => {
        // Simulate verification event for non-module verification state
        const customEvent = new CustomEvent('verification-complete', {
          detail: {
            success: true,
            moduleId: 'auto-verify',
            timestamp: Date.now()
          }
        });
        window.dispatchEvent(customEvent);
      }, 1500);
      
      return () => clearTimeout(timer);
    }
    
    // Cleanup
    return () => {
      window.removeEventListener('verification-complete', verificationCompleteHandler);
      window.removeEventListener('verification-successful', verificationSuccessfulHandler);
      window.removeEventListener('module-complete', moduleCompleteHandler);
    };
  }, [messageHandling, stateMachine.stateData, stateMachine.currentState, handleSelectResponse]);

  return {
    verificationInProgressRef,
    verificationHandledRef
  };
}
