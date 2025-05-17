
import { useState, useEffect } from 'react';
import { useStateMachine } from '@/hooks/useStateMachine';
import { useToast } from '@/hooks/use-toast';

/**
 * This hook is used to manage the state machine for the physiotherapy coverage scenario
 */
export function usePhysioCoverageStateMachine() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Use the physio scenario state machine from the useStateMachine hook
  const {
    currentState,
    stateData,
    stateMachine,
    isLoading: machineLoading,
    error: machineError,
    processSelection,
    processStartCall,
    resetStateMachine,
    lastStateChange
  } = useStateMachine('leistungsabdeckungPhysio');

  // Set the loading and error states based on the state machine loading/error
  useEffect(() => {
    setIsLoading(machineLoading);
    if (machineError) {
      setError(machineError);
      toast({
        title: "Fehler",
        description: `Fehler beim Laden des Szenarios: ${machineError}`,
        variant: "destructive"
      });
    } else {
      setError(null);
    }
  }, [machineLoading, machineError, toast]);

  // Add debugging for state changes and better state transition handling
  useEffect(() => {
    if (currentState && stateData) {
      console.log(`Physio Coverage state changed to: ${currentState}`);
      console.log('State data:', stateData);
      
      // Check for modules in the state
      if (stateData.meta?.module) {
        console.log('Module found in state:', stateData.meta.module);
        
        // Handle specific module types
        if (stateData.meta.module.type === 'VERIFICATION') {
          console.log('Verification module detected in state:', currentState);
        } else if (stateData.meta.module.type === 'CHOICE_LIST') {
          console.log('Choice list module detected in state:', currentState);
        } else if (stateData.meta.module.type === 'INFORMATION_TABLE') {
          console.log('Information table module detected in state:', currentState);
        }
      }

      // Handle specific states
      if (currentState === 'verify_identity') {
        console.log('Customer verification state reached');
      } else if (currentState === 'fuzzy_matches') {
        console.log('Fuzzy matches state reached - showing therapist options');
      } else if (currentState === 'customer_confused') {
        console.log('Customer confused state reached - customer wanted Jana Brunner');
      } else if (currentState === 'coverage_check') {
        console.log('Coverage check state reached - therapist is covered');
        // Ensure the message appears for the coverage_check state
        // This is a debugging check to verify the message should be displayed
        if (stateData.meta?.agentText) {
          console.log('Agent message for coverage_check:', stateData.meta.agentText);
        } else {
          console.warn('No agent message found for coverage_check state');
        }
      } else if (currentState === 'end_call') {
        toast({
          title: "Gespräch abgeschlossen",
          description: "Das Gespräch wurde erfolgreich beendet.",
        });
      }
    }
  }, [currentState, stateData, lastStateChange, toast]);

  // Add specific event listener for direct state transition force
  useEffect(() => {
    const handleForceStateTransition = (e: Event) => {
      const event = e as CustomEvent;
      if (event.detail?.targetState === 'coverage_check') {
        console.log("Forcing transition to coverage_check state");
        
        // Access the coverage_check state data directly from state machine
        const coverageCheckStateData = stateMachine?.states?.['coverage_check'];
        
        if (coverageCheckStateData) {
          console.log("Found coverage_check state data:", coverageCheckStateData);
          toast({
            title: "Zustand geändert",
            description: "Wechsel zum Zustand: Kostenübernahme-Prüfung",
          });
          
          // Instead of directly modifying the state, use the proper state machine transition
          // Find an available path to the coverage_check state
          setTimeout(() => {
            // Try to process selection with the response "Jana Brunner"
            const success = processSelection("Jana Brunner");
            
            if (!success) {
              console.warn("Could not transition to coverage_check using standard path");
              
              // Try the DEFAULT transition
              const defaultSuccess = processSelection("DEFAULT");
              if (!defaultSuccess) {
                console.error("Could not force transition to coverage_check");
              } else {
                console.log("Successfully transitioned to coverage_check using DEFAULT path");
              }
            } else {
              console.log("Successfully transitioned to coverage_check using 'Jana Brunner' path");
            }
          }, 100);
        } else {
          console.error("Could not find coverage_check state data in state machine");
        }
      }
    };

    window.addEventListener('force-state-transition', handleForceStateTransition as EventListener);
    
    return () => {
      window.removeEventListener('force-state-transition', handleForceStateTransition as EventListener);
    };
  }, [stateMachine, toast, processSelection]);

  // Add event listener for therapist selection module completion
  useEffect(() => {
    const handleTherapistSelection = (e: Event) => {
      const event = e as CustomEvent;
      console.log("Therapist selection event detected:", event.detail);
      
      if (event.detail?.moduleId === 'therapist-suggestion-module') {
        const selectedOptionId = event.detail?.selectedOptionId;
        const targetState = event.detail?.targetState;
        
        toast({
          title: "Therapeutin ausgewählt",
          description: `Option ${selectedOptionId} wurde ausgewählt.`,
          duration: 2000
        });
        
        // For Jana Brunner, we should go to coverage_check state
        if (selectedOptionId === 'jana_brunner' && targetState === 'coverage_check') {
          console.log("Jana Brunner selected, should transition to coverage_check");
        }
      }
    };
    
    window.addEventListener('therapist-selection-complete', handleTherapistSelection as EventListener);
    
    return () => {
      window.removeEventListener('therapist-selection-complete', handleTherapistSelection as EventListener);
    };
  }, [toast]);

  return {
    currentState,
    stateData,
    stateMachine,
    isLoading,
    error,
    processSelection,
    processStartCall,
    resetStateMachine
  };
}
