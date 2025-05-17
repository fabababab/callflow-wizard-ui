
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

  // Handle module verification events
  const handleModuleVerification = (e: Event) => {
    const event = e as CustomEvent;
    if (event.detail && event.detail.moduleId && event.detail.success) {
      console.log("Module verification event detected:", event.detail);
      
      // If verification is successful and we're in verify_identity state, trigger state transition
      if (event.detail.success === true && stateMachine.currentState === 'verify_identity') {
        setTimeout(() => {
          const verificationEvent = new CustomEvent('verification-complete');
          window.dispatchEvent(verificationEvent);
        }, 1000);
      }
    }
  };

  // Add event listener for verification-successful events
  window.addEventListener('verification-successful', handleModuleVerification);

  // Return the main handler function
  return {
    handleSelectResponse: responseSelection.handleSelectResponse
  };
}
