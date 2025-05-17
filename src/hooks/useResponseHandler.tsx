
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

  // Handle field validation events
  const handleFieldValidation = (e: Event) => {
    const event = e as CustomEvent;
    if (event.detail && event.detail.fieldId && event.detail.status) {
      console.log("Field validation event detected:", event.detail);
      
      // If all fields are valid and we're in verify_identity state, trigger manual verification
      if (event.detail.status === 'valid' && stateMachine.currentState === 'verify_identity') {
        setTimeout(() => {
          const verificationEvent = new CustomEvent('manual-verification');
          window.dispatchEvent(verificationEvent);
        }, 1000);
      }
    }
  };

  // Add event listener for field validation
  window.addEventListener('field-validation', handleFieldValidation);

  // Return the main handler function
  return {
    handleSelectResponse: responseSelection.handleSelectResponse
  };
}
