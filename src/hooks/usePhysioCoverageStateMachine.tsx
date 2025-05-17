
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
      } else if (currentState === 'end_call') {
        toast({
          title: "Gespräch abgeschlossen",
          description: "Das Gespräch wurde erfolgreich beendet.",
        });
      }
    }
  }, [currentState, stateData, lastStateChange, toast]);

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
