
import { useEffect, useRef, useCallback } from 'react';

interface VerificationEventsProps {
  messageHandling: any;
  stateMachine: any;
  handleSelectResponse: (response: string) => void;
}

/**
 * Hook to handle verification completion events
 */
export function useVerificationEvents({
  messageHandling,
  stateMachine,
  handleSelectResponse
}: VerificationEventsProps) {
  // Track which verification events we've already processed with more robust tracking
  const processedVerificationEventsRef = useRef<Set<string>>(new Set());
  
  // Track the last time we processed a verification event
  const lastVerificationTimeRef = useRef<number>(0);
  const VERIFICATION_COOLDOWN_MS = 3000; // 3 seconds cooldown between verification events
  
  // Handler for verification events
  const handleVerificationComplete = useCallback((event: Event) => {
    const customEvent = event as CustomEvent;
    const now = Date.now();
    
    // Create a unique event identifier with more details
    const moduleId = customEvent.detail?.moduleId || 'inline';
    const eventId = `${customEvent.type}-${moduleId}-${Math.floor(now / 1000)}`; // Round to seconds for deduping
    
    // Check if we've already processed this event or if we're in cooldown period
    if (processedVerificationEventsRef.current.has(eventId) || 
        (now - lastVerificationTimeRef.current) < VERIFICATION_COOLDOWN_MS) {
      console.log("Skipping duplicate/throttled verification event:", eventId);
      return;
    }
    
    console.log("Verification complete event detected:", customEvent.detail, "with ID:", eventId);
    
    // Mark this event as processed and update the last verification time
    processedVerificationEventsRef.current.add(eventId);
    lastVerificationTimeRef.current = now;
    
    // Add a small delay for UI updates
    setTimeout(() => {
      // Add verified message - but only if we haven't shown it already
      messageHandling.addSystemMessage("Customer identity has been successfully verified.");
      
      // Get available responses for the current state
      const responseOptions = stateMachine.stateData?.meta?.responseOptions || [];
      
      // Only trigger auto-response once after verification
      if (responseOptions.length > 0) {
        console.log("Auto-selecting first response after verification:", responseOptions[0]);
        
        // Single delayed auto-selection to ensure state machine has time to update
        setTimeout(() => {
          if (typeof handleSelectResponse === 'function') {
            console.log("Executing auto-selection after verification");
            handleSelectResponse(responseOptions[0]);
          }
        }, 1500);
      }
    }, 500);
  }, [messageHandling, stateMachine.stateData, handleSelectResponse]);

  // Add event listeners for verification completion events
  useEffect(() => {
    // Add event listener for verification complete
    window.addEventListener('verification-complete', handleVerificationComplete);
    window.addEventListener('verification-successful', handleVerificationComplete);
    
    // Clean up listener on unmount
    return () => {
      window.removeEventListener('verification-complete', handleVerificationComplete);
      window.removeEventListener('verification-successful', handleVerificationComplete);
    };
  }, [handleVerificationComplete]);
  
  return { processedVerificationEventsRef, lastVerificationTimeRef };
}
