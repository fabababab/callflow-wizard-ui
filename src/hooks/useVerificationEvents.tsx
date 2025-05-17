
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
          }, 2000); // Slightly shorter delay since we're not showing module UI
        } else {
          verificationInProgressRef.current = false;
        }
      }, 500);
    };

    // Add manual verification handler for identity validation
    const handleManualVerification = () => {
      if (stateMachine.currentState === 'verify_identity' && 
          !verificationHandledRef.current[stateMachine.currentState]) {
        
        // For verify_identity state without module, simulate verification
        setTimeout(() => {
          messageHandling.addSystemMessage("Kundenidentität wurde manuell verifiziert.");
          verificationHandledRef.current[stateMachine.currentState] = true;
          
          // Get available responses for the current state
          const responseOptions = stateMachine.stateData?.meta?.responseOptions || [];
          
          // If there are response options, automatically pick the first one after a delay
          if (responseOptions.length > 0) {
            handleSelectResponse(responseOptions[0]);
          }
        }, 1500);
      }
    };

    // Add event listeners for all verification events
    window.addEventListener('verification-complete', handleVerificationComplete as EventListener);
    window.addEventListener('verification-successful', handleVerificationComplete as EventListener);
    window.addEventListener('manual-verification', handleManualVerification as EventListener);
    
    // In verify_identity state without module, automatically progress after a short delay
    if (stateMachine.currentState === 'verify_identity' && 
        !stateMachine.stateData?.meta?.module &&
        !verificationHandledRef.current[stateMachine.currentState]) {
      const timer = setTimeout(() => {
        // Simulate verification event for non-module verification state
        const customEvent = new CustomEvent('manual-verification');
        window.dispatchEvent(customEvent);
      }, 2000);
      
      return () => clearTimeout(timer);
    }
    
    // Cleanup
    return () => {
      window.removeEventListener('verification-complete', handleVerificationComplete as EventListener);
      window.removeEventListener('verification-successful', handleVerificationComplete as EventListener);
      window.removeEventListener('manual-verification', handleManualVerification as EventListener);
    };
  }, [messageHandling, stateMachine.stateData, stateMachine.currentState, handleSelectResponse]);

  return {
    verificationInProgressRef,
    verificationHandledRef
  };
}
