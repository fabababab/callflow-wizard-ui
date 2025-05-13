
// Main response handler hook - now a thin wrapper around more focused hooks
import { useResponseSelection } from './response-handler/useResponseSelection';
import { useResponseToastTracking } from './response-handler/useResponseToastTracking';
import { useVerificationEvents } from './response-handler/useVerificationEvents';

interface ResponseHandlerProps {
  stateMachine: any;
  messageHandling: any;
  conversationState: any;
}

export function useResponseHandler(props: ResponseHandlerProps) {
  const { stateMachine, messageHandling, conversationState } = props;
  
  // Use the response selection hook
  const { handleSelectResponse } = useResponseSelection({
    stateMachine,
    messageHandling,
    conversationState
  });
  
  // Use the response toast tracking hook
  const { trackResponseToast } = useResponseToastTracking();
  
  // Use the verification events hook
  useVerificationEvents({
    messageHandling,
    stateMachine, 
    handleSelectResponse
  });
  
  // Track response toast before returning the select function
  const wrappedHandleSelectResponse = (response: string) => {
    // Track the response toast
    trackResponseToast(response);
    
    // Call the original handler
    handleSelectResponse(response);
  };

  return {
    handleSelectResponse: wrappedHandleSelectResponse
  };
}
