
import { useCallback, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';

interface ResponseSelectionProps {
  conversationState: {
    awaitingUserResponse: boolean;
    isInitialStateProcessed: boolean;
    setIsUserAction: (isUserAction: boolean) => void;
    setAwaitingUserResponse: (awaitingUserResponse: boolean) => void;
  };
  messageHandling: {
    addAgentMessage: (message: string) => void;
    addSystemMessage: (message: string) => void;
  };
  stateMachine: {
    currentState: string;
    stateData: any;
    processSelection: (selection: string) => boolean;
  };
  directVerificationTransitionRef?: React.MutableRefObject<boolean>;
}

export function useResponseSelection({
  conversationState,
  messageHandling,
  stateMachine,
  directVerificationTransitionRef
}: ResponseSelectionProps) {
  const { toast } = useToast();
  const responseToastShownRef = useRef<Record<string, boolean>>({});
  const verificationInProgressRef = useRef(false);
  
  // This is our primary interaction method - handles response selection
  const handleSelectResponse = useCallback((response: string) => {
    console.log('===== RESPONSE SELECTION BEGIN =====');
    console.log('User selecting response:', response);
    console.log('Current state:', stateMachine.currentState);
    console.log('Conversation state:', {
      awaitingUserResponse: conversationState.awaitingUserResponse,
      isInitialStateProcessed: conversationState.isInitialStateProcessed
    });
    
    // If this is a direct transition from Valid button click, bypass checks
    const isDirectVerificationTransition = directVerificationTransitionRef?.current === true;
    
    // Only process if we're awaiting user response or at initial state or direct transition
    if (!isDirectVerificationTransition && !conversationState.awaitingUserResponse && !conversationState.isInitialStateProcessed) {
      console.warn('Not awaiting user response yet, skipping');
      
      // Show toast notification for better user feedback
      toast({
        title: "Bitte warten",
        description: "Die Konversation wird initialisiert",
        variant: "destructive",
        duration: 2000
      });
      return;
    }
    
    // Special case for "Verify customer identity first" option - auto-continue
    const isVerifyIdentityOption = response.toLowerCase().includes('verify') && 
                                  response.toLowerCase().includes('identity');
    
    // Show toast for selection feedback
    if (!responseToastShownRef.current[response]) {
      toast({
        title: "Auswahl getroffen",
        description: response,
        duration: 2000,
      });
      responseToastShownRef.current[response] = true;
    }
    
    // Set the user action flag
    conversationState.setIsUserAction(true);
    
    // Reset awaiting user response flag
    conversationState.setAwaitingUserResponse(false);
    
    // Add the selected response as an agent message
    messageHandling.addAgentMessage(response);
    
    // Process the selection in the state machine
    console.log('Processing selection in state machine:', response, 'from state:', stateMachine.currentState);
    console.log('Available transitions:', stateMachine.stateData?.on);
    
    // Small delay to ensure UI updates before state changes
    setTimeout(() => {
      console.log('Executing state transition for response:', response);
      const success = stateMachine.processSelection(response);
      
      if (!success) {
        console.warn('Failed to process selection:', response);
        console.log('Current state machine:', stateMachine.currentState);
        
        // Try with DEFAULT transition as fallback
        console.log("Using default response path");
        const defaultSuccess = stateMachine.processSelection("DEFAULT");
        
        if (!defaultSuccess) {
          console.error('Both specific and DEFAULT transitions failed');
          toast({
            title: "Fehler bei der Statusänderung",
            description: "Konnte nicht zum nächsten Status übergehen. Versuchen Sie, die Konversation zurückzusetzen.",
            variant: "destructive",
            duration: 3000
          });
        } else {
          console.log("Successfully transitioned using DEFAULT path to:", stateMachine.currentState);
        }
      } else {
        console.log("Successfully transitioned to new state:", stateMachine.currentState);
        console.log("New state data:", stateMachine.stateData);
      }
      
      // If directVerificationTransitionRef was used, reset it
      if (directVerificationTransitionRef && directVerificationTransitionRef.current) {
        directVerificationTransitionRef.current = false;
      }
      
      // Check if this state has an inline module that needs auto-completion
      const hasInlineModule = stateMachine.stateData?.meta?.module?.data?.isInline === true;
      const moduleId = stateMachine.stateData?.meta?.module?.id;
      const moduleType = stateMachine.stateData?.meta?.module?.type;
      
      // For verification flows, ensure we continue automatically if needed
      if (isVerifyIdentityOption || (hasInlineModule && moduleType === 'verification')) {
        console.log("Identity verification was selected, setting up auto-continue...");
        
        if (!verificationInProgressRef.current) {
          verificationInProgressRef.current = true;
          
          // Use a slightly longer delay to allow verification UI to show up
          setTimeout(() => {
            // Add verification message to chat
            messageHandling.addSystemMessage("Kundenidentität wurde automatisch verifiziert.");
            
            // Wait for verification modal to complete
            setTimeout(() => {
              console.log("Continuing flow after identity verification");
              verificationInProgressRef.current = false;
              
              // Get available responses
              const responseOptions = stateMachine.stateData?.meta?.responseOptions || [];
              
              if (responseOptions.length > 0) {
                // Pick the first available response option to continue the flow
                handleSelectResponse(responseOptions[0]);
              }
            }, 1500);
          }, 1500);
        }
      }
      
      console.log('===== RESPONSE SELECTION COMPLETE =====');
    }, 100);
    
  }, [
    conversationState.awaitingUserResponse, 
    conversationState.isInitialStateProcessed,
    conversationState.setIsUserAction,
    conversationState.setAwaitingUserResponse,
    messageHandling.addAgentMessage,
    messageHandling.addSystemMessage, 
    stateMachine.processSelection, 
    stateMachine.currentState,
    stateMachine.stateData,
    toast,
    directVerificationTransitionRef
  ]);

  return {
    handleSelectResponse,
    responseToastShownRef,
    verificationInProgressRef
  };
}
