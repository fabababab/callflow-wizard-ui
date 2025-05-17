
import { useCallback, useEffect, useRef } from 'react';

interface ModuleEventsProps {
  messageHandling: {
    addSystemMessage: (message: string) => void;
  };
  handleSelectResponse: (response: string) => void;
  stateMachine: {
    currentState: string;
    stateData: any;
  };
}

export function useModuleEvents({
  messageHandling,
  handleSelectResponse,
  stateMachine
}: ModuleEventsProps) {
  // Track all processed module events with detailed state info
  const moduleCompletionTrackerRef = useRef<Record<string, boolean>>({});
  const moduleEventInProgressRef = useRef(false);
  
  // Handle therapist selection events specifically
  useEffect(() => {
    const handleTherapistSelection = (event: CustomEvent) => {
      const { moduleId, selectedOptionId, targetState, timestamp } = event.detail;
      const currentState = stateMachine.currentState;
      const eventId = `therapist-selection-${moduleId}-${currentState}-${timestamp || Date.now()}`;
      
      // Skip if already processed or another event is in progress
      if (moduleCompletionTrackerRef.current[`therapist-selection-${moduleId}-${currentState}`] || 
          moduleEventInProgressRef.current) {
        console.log("Skipping duplicate therapist selection event:", eventId);
        return;
      }
      
      console.log(`Therapist selection detected: ${selectedOptionId}, target state: ${targetState}`);
      moduleCompletionTrackerRef.current[`therapist-selection-${moduleId}-${currentState}`] = true;
      moduleEventInProgressRef.current = true;
      
      // Add a short delay to ensure UI is updated
      setTimeout(() => {
        // System message about the selection
        let message = "Therapeutin ausgewählt.";
        
        if (selectedOptionId === 'jana_brunner') {
          message = "Jana Brunner wurde ausgewählt.";
          
          // For Jana Brunner, find the "Jana Brunner" response option
          const responseOptions = stateMachine.stateData?.meta?.responseOptions || [];
          const targetResponse = responseOptions.find((option: string) => 
            option === "Jana Brunner"
          );
          
          if (targetResponse) {
            console.log("Selecting response for Jana Brunner:", targetResponse);
            setTimeout(() => {
              moduleEventInProgressRef.current = false;
              handleSelectResponse(targetResponse);
            }, 500);
          } else {
            // If specific option not found, try to find any option that might work
            if (responseOptions.length > 0) {
              console.log("Jana Brunner option not found, using first available option:", responseOptions[0]);
              setTimeout(() => {
                moduleEventInProgressRef.current = false;
                handleSelectResponse(responseOptions[0]);
              }, 500);
            } else {
              moduleEventInProgressRef.current = false;
              console.warn("No response options available for therapist selection");
              // Force state transition as fallback
              const forceEvent = new CustomEvent('force-state-transition', {
                detail: { targetState: 'coverage_check' }
              });
              window.dispatchEvent(forceEvent);
            }
          }
        } else {
          // For other therapists, find a non-Jana Brunner option
          const responseOptions = stateMachine.stateData?.meta?.responseOptions || [];
          const targetResponse = responseOptions.find((option: string) => 
            option !== "Jana Brunner"
          );
          
          if (targetResponse) {
            console.log("Selecting response for other therapist:", targetResponse);
            setTimeout(() => {
              moduleEventInProgressRef.current = false;
              handleSelectResponse(targetResponse);
            }, 500);
          } else {
            // If no matching option, use first available
            if (responseOptions.length > 0) {
              console.log("Specific option not found for other therapist, using first available:", responseOptions[0]);
              setTimeout(() => {
                moduleEventInProgressRef.current = false;
                handleSelectResponse(responseOptions[0]);
              }, 500);
            } else {
              moduleEventInProgressRef.current = false;
              console.warn("No response options available for therapist selection");
            }
          }
        }
        
        messageHandling.addSystemMessage(message);
      }, 500);
    };
    
    window.addEventListener('therapist-selection-complete', handleTherapistSelection as EventListener);
    
    return () => {
      window.removeEventListener('therapist-selection-complete', handleTherapistSelection as EventListener);
    };
  }, [messageHandling, stateMachine.currentState, stateMachine.stateData, handleSelectResponse]);
  
  // Handle non-verification module completions (information, contracts) with better coordination
  useEffect(() => {
    const handleModuleComplete = (event: CustomEvent) => {
      const moduleId = event.detail?.moduleId || '';
      const moduleType = event.detail?.moduleType || '';
      const timestamp = event.detail?.timestamp || Date.now();
      const currentState = stateMachine.currentState;
      const eventId = `module-complete-${moduleId}-${moduleType}-${currentState}-${timestamp}`;
      const trackingId = `module-complete-${moduleId}-${moduleType}-${currentState}`;
      
      // Skip if already processed or another event is in progress
      if (moduleCompletionTrackerRef.current[trackingId] || moduleEventInProgressRef.current) {
        console.log("Skipping duplicate module completion event:", eventId);
        return;
      }
      
      // Skip verification modules as they are handled by useVerificationEvents
      if (moduleType.toLowerCase() === 'verification') {
        console.log("Skipping verification module handling in useModuleEvents");
        return;
      }
      
      console.log(`Module ${moduleType} (${moduleId}) completion detected:`, event.detail);
      moduleCompletionTrackerRef.current[trackingId] = true;
      moduleEventInProgressRef.current = true;
      
      // Skip therapist-suggestion-module as it's handled separately
      if (moduleId === 'therapist-suggestion-module') {
        moduleEventInProgressRef.current = false;
        console.log("Skipping default handling for therapist-suggestion-module");
        return;
      }
      
      // Add a short delay to ensure UI is updated
      setTimeout(() => {
        // System message about completion
        const moduleTypeLabels: Record<string, string> = {
          'information': 'Informations',
          'information_table': 'Informations',
          'nachbearbeitung': 'Nachbearbeitungs',
          'verification': 'Verifizierungs',
          'contract': 'Vertrags',
          'choice_list': 'Auswahl'
        };
        
        const moduleTypeLabel = moduleTypeLabels[moduleType.toLowerCase()] || moduleType.charAt(0).toUpperCase() + moduleType.slice(1);
        messageHandling.addSystemMessage(`${moduleTypeLabel}modul abgeschlossen.`);
        
        // Special handling for coverage-info-module
        if (moduleId === 'coverage-info-module') {
          // Force state transition if not already in coverage_check
          if (currentState !== 'coverage_check') {
            console.log("Forcing transition to coverage_check for coverage info module");
            const forceEvent = new CustomEvent('force-state-transition', {
              detail: { targetState: 'coverage_check' }
            });
            window.dispatchEvent(forceEvent);
          }
        }
        
        // Get available responses for the current state
        const responseOptions = stateMachine.stateData?.meta?.responseOptions || [];
        
        // If there are response options, automatically pick the first one after a delay
        if (responseOptions.length > 0) {
          console.log("Auto-selecting response after module completion:", responseOptions[0]);
          
          // Add a delay to make the flow feel more natural
          setTimeout(() => {
            moduleEventInProgressRef.current = false;
            handleSelectResponse(responseOptions[0]);
          }, 1500);
        } else {
          console.warn("No response options available after module completion in state:", currentState);
          moduleEventInProgressRef.current = false;
          
          // If no response options and we're in certain states, try to force transition
          if (moduleId === 'coverage-info-module') {
            console.log("No response options for coverage module, forcing transition to next state");
            const forceEvent = new CustomEvent('force-state-transition', {
              detail: { targetState: 'session_count' }
            });
            window.dispatchEvent(forceEvent);
          }
        }
      }, 500);
    };
    
    window.addEventListener('module-complete', handleModuleComplete as EventListener);
    
    // Handle specific events for certain module types
    const handleSpecificModuleEvent = (e: Event) => {
      const event = e as CustomEvent;
      const moduleId = event.detail?.moduleId || '';
      const currentState = stateMachine.currentState;
      const eventType = e.type;
      
      console.log(`Specific module event detected: ${eventType} for module ${moduleId} in state ${currentState}`);
      
      // Only handle if not already being processed
      if (!moduleEventInProgressRef.current) {
        // Use the same pattern for tracking to avoid duplicate handling
        const trackingId = `${eventType}-${moduleId}-${currentState}`;
        
        if (!moduleCompletionTrackerRef.current[trackingId]) {
          moduleCompletionTrackerRef.current[trackingId] = true;
          
          // For coverage info events, ensure we transition to the next state
          if (eventType === 'coverage-info-complete') {
            setTimeout(() => {
              messageHandling.addSystemMessage("Informationen zur Kostenübernahme wurden angezeigt.");
              
              // Get response options for auto-selection
              const responseOptions = stateMachine.stateData?.meta?.responseOptions || [];
              if (responseOptions.length > 0) {
                console.log(`Auto-selecting response for ${eventType}:`, responseOptions[0]);
                setTimeout(() => handleSelectResponse(responseOptions[0]), 1500);
              } else {
                console.warn(`No response options for ${eventType} in state ${currentState}`);
              }
            }, 500);
          }
        }
      }
    };
    
    window.addEventListener('coverage-info-complete', handleSpecificModuleEvent);
    window.addEventListener('information-module-complete', handleSpecificModuleEvent);
    window.addEventListener('contract-module-complete', handleSpecificModuleEvent);
    window.addEventListener('franchise-complete', handleSpecificModuleEvent);
    window.addEventListener('nachbearbeitung-complete', handleSpecificModuleEvent);
    
    return () => {
      window.removeEventListener('module-complete', handleModuleComplete as EventListener);
      window.removeEventListener('coverage-info-complete', handleSpecificModuleEvent);
      window.removeEventListener('information-module-complete', handleSpecificModuleEvent);
      window.removeEventListener('contract-module-complete', handleSpecificModuleEvent);
      window.removeEventListener('franchise-complete', handleSpecificModuleEvent);
      window.removeEventListener('nachbearbeitung-complete', handleSpecificModuleEvent);
    };
  }, [messageHandling, stateMachine.stateData, stateMachine.currentState, handleSelectResponse]);

  return {
    moduleCompletionTrackerRef,
    moduleEventInProgressRef
  };
}
