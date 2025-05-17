
// Hook for handling user response selections
import { useCallback, useEffect, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';

interface ResponseHandlerProps {
  stateMachine: any;
  messageHandling: any;
  conversationState: any;
  toast: ReturnType<typeof useToast>;
}

export function useResponseHandler({
  stateMachine,
  messageHandling,
  conversationState,
  toast
}: ResponseHandlerProps) {
  // Track if we've shown a response selection toast
  const responseToastShownRef = useRef<Record<string, boolean>>({});
  
  // Add refs to track verification states
  const verificationHandledRef = useRef<Record<string, boolean>>({});
  const verificationInProgressRef = useRef(false);
  const moduleCompletionTrackerRef = useRef<Record<string, boolean>>({});
  
  // This is our primary interaction method - updated to ensure explicit user action
  const handleSelectResponse = useCallback((response: string) => {
    console.log('===== RESPONSE SELECTION BEGIN =====');
    console.log('User selecting response:', response);
    console.log('Current state:', stateMachine.currentState);
    console.log('Conversation state:', {
      awaitingUserResponse: conversationState.awaitingUserResponse,
      isInitialStateProcessed: conversationState.isInitialStateProcessed,
      isUserAction: conversationState.isUserAction
    });
    
    // Only process if we're awaiting user response or at initial state
    if (!conversationState.awaitingUserResponse && !conversationState.isInitialStateProcessed) {
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
        console.log('Current state machine:', stateMachine.stateMachine);
        
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
            // Add verification message to chat only if not already handled
            if (!verificationHandledRef.current[stateMachine.currentState]) {
              messageHandling.addSystemMessage("Kundenidentität wurde automatisch verifiziert.");
              verificationHandledRef.current[stateMachine.currentState] = true;
            }
            
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
      // For information or contract modules, we want to wait for user action
      else if (hasInlineModule && (moduleType === 'information' || moduleType === 'contract')) {
        console.log(`Inline ${moduleType} module detected:`, moduleId);
        // These modules won't auto-continue, user will need to click buttons
      }
      
      console.log('===== RESPONSE SELECTION COMPLETE =====');
    }, 100);
    
  }, [
    conversationState.awaitingUserResponse, 
    conversationState.isInitialStateProcessed, 
    messageHandling.addAgentMessage,
    messageHandling.addSystemMessage, 
    stateMachine.processSelection, 
    stateMachine.currentState,
    conversationState,
    toast
  ]);

  // Track which verification events we've already processed
  const processedVerificationEventsRef = useRef<Set<string>>(new Set());
  
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
        if (!verificationHandledRef.current[stateMachine.currentState]) {
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
          }, 2500); // Extended delay to ensure verification success is visible
        } else {
          verificationInProgressRef.current = false;
        }
      }, 500);
    };

    // Handle non-verification module completions (information, contracts)
    const handleModuleComplete = (event: CustomEvent) => {
      const moduleId = event.detail?.moduleId || '';
      const moduleType = event.detail?.moduleType || '';
      const currentState = stateMachine.currentState;
      const eventId = `module-complete-${moduleId}-${currentState}`;
      
      // Skip if already processed
      if (moduleCompletionTrackerRef.current[eventId]) {
        console.log("Skipping duplicate module completion event:", eventId);
        return;
      }
      
      console.log(`Module ${moduleType} (${moduleId}) completion detected:`, event.detail);
      moduleCompletionTrackerRef.current[eventId] = true;
      
      // Add a short delay to ensure UI is updated
      setTimeout(() => {
        // System message about completion
        const moduleTypeLabels: Record<string, string> = {
          'information': 'Informations',
          'nachbearbeitung': 'Nachbearbeitungs',
          'verification': 'Verifizierungs',
          'contract': 'Vertrags'
        };
        
        const moduleTypeLabel = moduleTypeLabels[moduleType.toLowerCase()] || moduleType.charAt(0).toUpperCase() + moduleType.slice(1);
        messageHandling.addSystemMessage(`${moduleTypeLabel}modul abgeschlossen.`);
        
        // Get available responses for the current state
        const responseOptions = stateMachine.stateData?.meta?.responseOptions || [];
        
        // If there are response options, automatically pick the first one after a delay
        if (responseOptions.length > 0) {
          console.log("Auto-selecting response after module completion:", responseOptions[0]);
          
          // Add a delay to make the flow feel more natural
          setTimeout(() => {
            handleSelectResponse(responseOptions[0]);
          }, 2000);
        }
      }, 500);
    };
    
    // Add event listeners for all relevant events
    window.addEventListener('verification-complete', handleVerificationComplete as EventListener);
    window.addEventListener('verification-successful', handleVerificationComplete as EventListener);
    window.addEventListener('module-complete', handleModuleComplete as EventListener);
    
    // Cleanup
    return () => {
      window.removeEventListener('verification-complete', handleVerificationComplete as EventListener);
      window.removeEventListener('verification-successful', handleVerificationComplete as EventListener);
      window.removeEventListener('module-complete', handleModuleComplete as EventListener);
    };
  }, [messageHandling, stateMachine.stateData, stateMachine.currentState, handleSelectResponse]);

  return {
    handleSelectResponse
  };
}
