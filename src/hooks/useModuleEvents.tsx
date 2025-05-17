
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
  const moduleCompletionTrackerRef = useRef<Record<string, boolean>>({});
  
  // Handle non-verification module completions (information, contracts)
  useEffect(() => {
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
    
    window.addEventListener('module-complete', handleModuleComplete as EventListener);
    
    return () => {
      window.removeEventListener('module-complete', handleModuleComplete as EventListener);
    };
  }, [messageHandling, stateMachine.stateData, stateMachine.currentState, handleSelectResponse]);

  return {
    moduleCompletionTrackerRef
  };
}
