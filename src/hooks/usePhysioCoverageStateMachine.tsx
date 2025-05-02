
import { useState, useCallback, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

// Define the state machine types
type PhysioState = {
  meta?: {
    agentText?: string;
    suggestions?: string[];
    systemMessage?: string;
  };
  on?: Record<string, string>;
};

type PhysioStateMachine = {
  id: string;
  initial: string;
  states: Record<string, PhysioState>;
};

export function usePhysioCoverageStateMachine() {
  const [stateMachine, setStateMachine] = useState<PhysioStateMachine | null>(null);
  const [currentState, setCurrentState] = useState<string>('start');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Load the state machine
  useEffect(() => {
    async function loadMachine() {
      setIsLoading(true);
      try {
        const response = await fetch('/src/data/stateMachines/physioCoverage.json');
        const data: PhysioStateMachine = await response.json();
        setStateMachine(data);
        setCurrentState(data.initial);
        setIsLoading(false);
      } catch (err) {
        console.error('Error loading state machine:', err);
        setError('Failed to load the physio coverage state machine');
        setIsLoading(false);
      }
    }

    loadMachine();
  }, []);

  // Get current state data
  const getCurrentStateData = useCallback(() => {
    if (!stateMachine || !stateMachine.states[currentState]) {
      return null;
    }
    return stateMachine.states[currentState];
  }, [stateMachine, currentState]);

  // Process an event
  const processEvent = useCallback((event: string) => {
    if (!stateMachine || !stateMachine.states[currentState]) {
      return false;
    }

    const nextState = stateMachine.states[currentState].on?.[event];
    if (!nextState) {
      console.warn(`No transition found for event "${event}" in state "${currentState}"`);
      return false;
    }

    toast({
      title: "State changed",
      description: `Moved from ${currentState} to ${nextState}`,
    });

    setCurrentState(nextState);
    return true;
  }, [stateMachine, currentState, toast]);

  // Start the conversation
  const startConversation = useCallback(() => {
    if (!stateMachine) return;
    
    processEvent('START_CALL');
  }, [stateMachine, processEvent]);

  // Reset the conversation
  const resetConversation = useCallback(() => {
    if (!stateMachine) return;
    
    setCurrentState(stateMachine.initial);
  }, [stateMachine]);

  // Get agent text for the current state
  const getAgentText = useCallback(() => {
    const stateData = getCurrentStateData();
    return stateData?.meta?.agentText || '';
  }, [getCurrentStateData]);

  // Get suggestions for the current state
  const getSuggestions = useCallback(() => {
    const stateData = getCurrentStateData();
    return stateData?.meta?.suggestions || [];
  }, [getCurrentStateData]);

  // Get system message for the current state
  const getSystemMessage = useCallback(() => {
    const stateData = getCurrentStateData();
    return stateData?.meta?.systemMessage || null;
  }, [getCurrentStateData]);

  // Check if the current state is final
  const isFinalState = useCallback(() => {
    if (!stateMachine || !stateMachine.states[currentState]) {
      return false;
    }
    return !stateMachine.states[currentState].on || Object.keys(stateMachine.states[currentState].on || {}).length === 0;
  }, [stateMachine, currentState]);

  // Simulate provider lookup
  const simulateProviderLookup = useCallback(() => {
    if (currentState === 'lookup_provider') {
      // Simulate an asynchronous operation
      setTimeout(() => {
        // 80% chance of finding the provider
        const found = Math.random() < 0.8;
        processEvent(found ? 'PROVIDER_FOUND' : 'PROVIDER_NOT_FOUND');
      }, 1500);
    }
  }, [currentState, processEvent]);

  // Check for special states that need simulation
  useEffect(() => {
    if (currentState === 'lookup_provider') {
      simulateProviderLookup();
    }
  }, [currentState, simulateProviderLookup]);

  return {
    currentState,
    isLoading,
    error,
    getAgentText,
    getSuggestions,
    getSystemMessage,
    processEvent,
    startConversation,
    resetConversation,
    isFinalState
  };
}
