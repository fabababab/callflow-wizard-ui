
import { useState, useCallback, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { ScenarioType } from '@/components/ScenarioSelector';
import { 
  loadStateMachine, 
  getInitialState, 
  getNextState, 
  getStateData, 
  StateMachine, 
  StateMachineState,
  StateData
} from '@/utils/stateMachineLoader';

export function useStateMachine(activeScenario: ScenarioType) {
  const [currentState, setCurrentState] = useState<string>('start');
  const [stateMachine, setStateMachine] = useState<StateMachine | null>(null);
  const [stateData, setStateData] = useState<StateMachineState | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Load state machine when scenario changes
  useEffect(() => {
    async function loadMachine() {
      if (!activeScenario) {
        setStateMachine(null);
        setCurrentState('start');
        setStateData(null);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const machine = await loadStateMachine(activeScenario);
        setStateMachine(machine);
        
        if (machine) {
          const initialState = getInitialState(machine);
          setCurrentState(initialState);
          setStateData(getStateData(machine, initialState));
          console.log(`Loaded state machine for scenario: ${activeScenario}`, machine);
        } else {
          console.log(`No state machine found for scenario: ${activeScenario}`);
          setError(`Failed to load state machine for ${activeScenario}`);
        }
      } catch (err) {
        console.error(`Error loading state machine:`, err);
        setError(`Error loading state machine: ${err}`);
      } finally {
        setIsLoading(false);
      }
    }

    loadMachine();
  }, [activeScenario]);

  // Update state data whenever current state changes
  useEffect(() => {
    if (stateMachine && currentState) {
      const data = getStateData(stateMachine, currentState);
      setStateData(data);
    }
  }, [currentState, stateMachine]);

  // Transition to a new state
  const transitionToState = useCallback((newState: string) => {
    if (!stateMachine || !stateMachine.states[newState]) {
      console.error(`Cannot transition to invalid state: ${newState}`);
      return false;
    }

    toast({
      title: "State changed",
      description: `Moved from ${currentState} to ${newState}`,
    });

    setCurrentState(newState);
    return true;
  }, [currentState, stateMachine, toast]);

  // Process option selection
  const processSelection = useCallback((selectedOption: string): boolean => {
    if (!stateMachine || !currentState) {
      return false;
    }

    const nextState = getNextState(stateMachine, currentState, selectedOption);
    
    if (!nextState) {
      // No valid transition found
      console.log(`No transition found for option: ${selectedOption}`);
      return false;
    }

    return transitionToState(nextState);
  }, [stateMachine, currentState, transitionToState]);

  // Process default transition
  const processDefaultTransition = useCallback((): boolean => {
    if (!stateMachine || !currentState) {
      return false;
    }

    const nextState = getNextState(stateMachine, currentState);
    
    if (!nextState) {
      // No valid transition found
      console.log(`No default transition found from state: ${currentState}`);
      return false;
    }

    return transitionToState(nextState);
  }, [stateMachine, currentState, transitionToState]);

  // Reset the state machine to initial state
  const resetStateMachine = useCallback(() => {
    if (stateMachine) {
      const initialState = getInitialState(stateMachine);
      setCurrentState(initialState);
      setStateData(getStateData(stateMachine, initialState));
    }
  }, [stateMachine]);

  return {
    currentState,
    stateData,
    stateMachine,
    isLoading,
    error,
    transitionToState,
    processSelection,
    processDefaultTransition,
    resetStateMachine
  };
}
