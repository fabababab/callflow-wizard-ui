
// Hook for processing state changes
import { useCallback } from 'react';
import { useNotifications } from '@/contexts/NotificationsContext';

interface StateChangeProcessorProps {
  stateMachine: any;
  messageHandling: any;
  conversationState: any;
  transitionExtractor: any;
  callState: any;
}

export function useStateChangeProcessor({
  stateMachine,
  messageHandling,
  conversationState,
  transitionExtractor,
  callState
}: StateChangeProcessorProps) {
  const { addNotification } = useNotifications();

  // Function to process state changes
  const processStateChange = useCallback((state: string) => {
    console.log(`Processing state change to: ${state}`);
    
    // Don't process if the state is already processed or if we're not in a call
    if (conversationState.processedStates.has(state) || !callState.callActive) {
      console.log(`State ${state} already processed or call not active - skipping`);
      return;
    }
    
    // Mark this state as processed
    conversationState.processedStates.add(state);
    
    // Check if the state has meta data
    if (!stateMachine.stateData || !stateMachine.stateData.meta) {
      console.log(`No meta data for state ${state} - skipping`);
      return;
    }
    
    const { systemMessage, customerText, agentText, responseOptions } = stateMachine.stateData.meta;
    
    // If we've just processed the initial state and we have response options
    if (!conversationState.isInitialStateProcessed && responseOptions?.length > 0) {
      conversationState.setIsInitialStateProcessed(true);
      conversationState.setAwaitingUserResponse(true);
      
      // Add a notification
      addNotification({
        title: "Conversation Started",
        description: "Please select a response to continue",
        type: "info"
      });
      
      return;
    }
    
    // Process system message if present
    if (systemMessage && !conversationState.hasShownToastFor(state)) {
      console.log(`Adding system message for state ${state}: ${systemMessage}`);
      messageHandling.addSystemMessage(systemMessage, { 
        responseOptions: responseOptions || [] 
      });
      
      // Add a notification
      addNotification({
        title: "System Message",
        description: systemMessage,
        type: "info"
      });
      
      conversationState.toastsShown.add(state);
    }
    
    // Process customer text if present
    if (customerText && !conversationState.isUserAction) {
      console.log(`Adding customer message for state ${state}: ${customerText}`);
      messageHandling.addCustomerMessage(customerText);
    }
    
    // Process agent text if present and we haven't manually selected a response
    if (agentText && !conversationState.isUserAction) {
      console.log(`Adding agent message for state ${state}: ${agentText}`);
      messageHandling.addAgentMessage(agentText);
    }
    
    // Set awaiting response flag if we have response options
    if (responseOptions?.length > 0) {
      console.log(`Setting awaiting user response for state ${state}`);
      conversationState.setAwaitingUserResponse(true);
      
      if (!conversationState.hasShownToastFor(`${state}-responses`)) {
        addNotification({
          title: "Response Options Available",
          description: "Please select a response to continue",
          type: "info"
        });
        conversationState.toastsShown.add(`${state}-responses`);
      }
    }
    
    // Reset the user action flag
    conversationState.setIsUserAction(false);
    
  }, [stateMachine, messageHandling, conversationState, callState, addNotification]);

  return {
    processStateChange
  };
}
