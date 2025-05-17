
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

  // Return the main handler function
  return {
    handleSelectResponse: responseSelection.handleSelectResponse
  };
}
