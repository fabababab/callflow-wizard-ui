
import { useState, useEffect, useCallback } from 'react';
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
          // Ensure verification module has all required fields
          if (stateData.meta.module.data?.fields) {
            console.log('Verification fields:', stateData.meta.module.data.fields);
          }
        } else if (stateData.meta.module.type === 'CHOICE_LIST') {
          console.log('Choice list module detected in state:', currentState);
          // Ensure choice list has options
          if (stateData.meta.module.data?.options) {
            console.log('Choice list options:', stateData.meta.module.data.options);
          }
        } else if (stateData.meta.module.type === 'INFORMATION_TABLE') {
          console.log('Information table module detected in state:', currentState);
          // Ensure information table has content
          if (stateData.meta.module.data?.coverageInfo) {
            console.log('Coverage info:', stateData.meta.module.data.coverageInfo);
          }
        }
      }

      // Handle specific states
      if (currentState === 'verify_identity') {
        console.log('Customer verification state reached');
        // Ensure response options exist
        checkAndLogResponseOptions(currentState, stateData);
      } else if (currentState === 'fuzzy_matches') {
        console.log('Fuzzy matches state reached - showing therapist options');
        // Ensure module exists and response options exist
        checkAndLogResponseOptions(currentState, stateData);
      } else if (currentState === 'customer_confused') {
        console.log('Customer confused state reached - customer wanted Jana Brunner');
        // Ensure response options exist
        checkAndLogResponseOptions(currentState, stateData);
      } else if (currentState === 'coverage_check') {
        console.log('Coverage check state reached - therapist is covered');
        // Ensure the message appears for the coverage_check state
        if (stateData.meta?.agentText) {
          console.log('Agent message for coverage_check:', stateData.meta.agentText);
        } else {
          console.warn('No agent message found for coverage_check state');
        }
        // Ensure module exists and response options exist
        checkAndLogResponseOptions(currentState, stateData);
      } else if (currentState === 'session_count') {
        console.log('Session count state reached');
        // Ensure response options exist
        checkAndLogResponseOptions(currentState, stateData);
      } else if (currentState === 'end_call') {
        toast({
          title: "Gespräch abgeschlossen",
          description: "Das Gespräch wurde erfolgreich beendet.",
        });
        // Check for Nachbearbeitung module
        if (stateData.meta?.module?.type === 'NACHBEARBEITUNG') {
          console.log('Nachbearbeitung module found in end_call state');
        }
      }
    }
  }, [currentState, stateData, lastStateChange, toast]);

  // Helper function to check for response options
  const checkAndLogResponseOptions = useCallback((state: string, stateData: any) => {
    const responseOptions = stateData.meta?.responseOptions || [];
    if (responseOptions.length > 0) {
      console.log(`Response options for state ${state}:`, responseOptions);
    } else {
      console.warn(`No response options found for state ${state}`);
    }
  }, []);

  // Add specific event listener for direct state transition force
  useEffect(() => {
    const handleForceStateTransition = (e: Event) => {
      const event = e as CustomEvent;
      if (event.detail?.targetState) {
        const targetState = event.detail.targetState;
        console.log(`Forcing transition to ${targetState} state`);
        
        // Access the target state data directly from state machine
        const targetStateData = stateMachine?.states?.[targetState];
        
        if (targetStateData) {
          console.log(`Found ${targetState} state data:`, targetStateData);
          toast({
            title: "Zustand geändert",
            description: `Wechsel zum Zustand: ${targetState}`,
          });
          
          // Try to find an appropriate response that leads to the target state
          const transitions = Object.entries(stateMachine?.states?.[currentState]?.on || {});
          console.log(`Available transitions from ${currentState}:`, transitions);
          
          // Find transition that leads to target state
          const transition = transitions.find(([_, nextState]) => nextState === targetState);
          if (transition) {
            const [responseOption] = transition;
            console.log(`Found transition to ${targetState} via response: ${responseOption}`);
            
            setTimeout(() => {
              const success = processSelection(responseOption);
              if (success) {
                console.log(`Successfully transitioned to ${targetState} using response: ${responseOption}`);
              } else {
                console.warn(`Failed to transition to ${targetState} using response: ${responseOption}`);
                tryDefaultTransition(targetState);
              }
            }, 100);
          } else {
            // No direct transition found, try using DEFAULT
            tryDefaultTransition(targetState);
          }
        } else {
          console.error(`Could not find ${targetState} state data in state machine`);
          toast({
            title: "Fehler",
            description: `Konnte Zielzustand ${targetState} nicht finden.`,
            variant: "destructive"
          });
        }
      }
    };

    // Helper function to try DEFAULT transition
    const tryDefaultTransition = (targetState: string) => {
      console.log(`Trying DEFAULT transition to reach ${targetState}`);
      const success = processSelection("DEFAULT");
      
      if (success) {
        console.log(`Successfully transitioned using DEFAULT`);
        // Check if we reached our target
        if (currentState === targetState) {
          console.log(`Reached target state ${targetState}`);
        } else {
          console.log(`DEFAULT transition went to ${currentState}, not ${targetState}`);
          // Force a direct state change in complex cases
          if (targetState === 'coverage_check' && currentState === 'fuzzy_matches') {
            setTimeout(() => {
              processSelection("Jana Brunner");
            }, 100);
          }
        }
      } else {
        console.error(`Failed to transition using DEFAULT, current state remains ${currentState}`);
      }
    };

    window.addEventListener('force-state-transition', handleForceStateTransition as EventListener);
    
    return () => {
      window.removeEventListener('force-state-transition', handleForceStateTransition as EventListener);
    };
  }, [stateMachine, toast, processSelection, currentState]);

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
          
          // If not already in coverage_check, try to trigger the transition
          if (currentState !== 'coverage_check') {
            setTimeout(() => {
              // Try direct selection first
              const success = processSelection("Jana Brunner");
              if (!success) {
                console.log("Direct selection failed, trying to force state transition");
                const forceEvent = new CustomEvent('force-state-transition', {
                  detail: { targetState: 'coverage_check' }
                });
                window.dispatchEvent(forceEvent);
              }
            }, 500);
          }
        }
      }
    };
    
    window.addEventListener('therapist-selection-complete', handleTherapistSelection as EventListener);
    
    return () => {
      window.removeEventListener('therapist-selection-complete', handleTherapistSelection as EventListener);
    };
  }, [toast, currentState, processSelection]);

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
