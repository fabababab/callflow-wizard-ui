
import { useRef } from 'react';
import { useResponseSelection } from './useResponseSelection';
import { useVerificationEvents } from './useVerificationEvents';
import { useModuleEvents } from './useModuleEvents';

interface ResponseHandlerProps {
  stateMachine: any;
  messageHandling: any;
  conversationState: any;
  toast: any;
}

export function useResponseHandler({
  stateMachine,
  messageHandling,
  conversationState
}: ResponseHandlerProps) {
  // Create response selection hook
  const responseSelection = useResponseSelection({
    conversationState,
    messageHandling,
    stateMachine
  });

  // Set up verification events hook - pass the handleSelectResponse from responseSelection
  const verificationEvents = useVerificationEvents({
    messageHandling,
    handleSelectResponse: responseSelection.handleSelectResponse,
    stateMachine
  });

  // Set up module events hook - pass the handleSelectResponse from responseSelection
  useModuleEvents({
    messageHandling,
    handleSelectResponse: responseSelection.handleSelectResponse,
    stateMachine
  });

  // Handle module verification events with improved tracking
  const seenVerificationEvents = useRef<Set<string>>(new Set());

  const handleModuleVerification = (e: Event) => {
    const event = e as CustomEvent;
    if (event.detail && event.detail.moduleId && event.detail.success) {
      const eventTime = event.detail.timestamp || Date.now();
      const eventId = `verification-${event.detail.moduleId}-${eventTime}`;
      
      // Skip if we've already seen this event
      if (seenVerificationEvents.current.has(eventId)) {
        console.log("Skipping duplicate verification event:", eventId);
        return;
      }
      
      // Mark this event as seen
      seenVerificationEvents.current.add(eventId);
      console.log("Module verification event detected:", event.detail);
      
      // If verification is successful and we're in verify_identity state, trigger state transition
      if (event.detail.success === true && stateMachine.currentState === 'verify_identity') {
        setTimeout(() => {
          console.log("Dispatching verification-complete after module verification");
          const verificationEvent = new CustomEvent('verification-complete', {
            detail: {
              success: true, 
              moduleId: event.detail.moduleId,
              timestamp: Date.now()
            }
          });
          window.dispatchEvent(verificationEvent);
        }, 1000);
      }
      
      // Regularly clean up old events to prevent memory leaks
      setTimeout(() => {
        // Create a new set with only events from the last 5 seconds
        const currentTime = Date.now();
        const recentEvents = new Set<string>();
        seenVerificationEvents.current.forEach(id => {
          const eventTime = parseInt(id.split('-').pop() || '0');
          if (currentTime - eventTime < 5000) {
            recentEvents.add(id);
          }
        });
        seenVerificationEvents.current = recentEvents;
      }, 10000);
    }
  };

  // Add event listener for verification-successful events
  window.addEventListener('verification-successful', handleModuleVerification);

  // Return the main handler function
  return {
    handleSelectResponse: responseSelection.handleSelectResponse
  };
}
