
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useStateMachine } from '@/hooks/useStateMachine';

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
    resetStateMachine
  } = useStateMachine('testscenario');

  // Set the loading and error states based on the state machine loading/error
  useEffect(() => {
    setIsLoading(machineLoading);
    if (machineError) {
      setError(machineError);
      toast({
        title: "Error",
        description: machineError,
        variant: "destructive"
      });
    }
  }, [machineLoading, machineError, toast]);

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
