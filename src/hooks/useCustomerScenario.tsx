
import { useState, useCallback, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { nanoid } from 'nanoid';

// Define the state machine types
type CustomerStateData = {
  meta?: {
    customerText?: string;
    agentOptions?: string[];
    systemMessage?: string;
  };
  on?: Record<string, string>;
};

type CustomerStateMachine = {
  id: string;
  initial: string;
  states: Record<string, CustomerStateData>;
};

export function useCustomerScenario() {
  const [stateMachine, setStateMachine] = useState<CustomerStateMachine | null>(null);
  const [currentState, setCurrentState] = useState<string>('start');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Load the state machine
  useEffect(() => {
    async function loadMachine() {
      setIsLoading(true);
      try {
        const response = await fetch('/src/data/stateMachines/customerPhysioCoverage.json');
        const data: CustomerStateMachine = await response.json();
        setStateMachine(data);
        setCurrentState(data.initial);
        setIsLoading(false);
      } catch (err) {
        console.error('Error loading customer state machine:', err);
        setError('Failed to load the customer scenario state machine');
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

  // Process an agent response
  const processAgentResponse = useCallback((response: string) => {
    if (!stateMachine || !stateMachine.states[currentState]) {
      return false;
    }

    const nextState = stateMachine.states[currentState].on?.[response];
    if (!nextState) {
      console.warn(`No transition found for response "${response}" in state "${currentState}"`);
      return false;
    }

    toast({
      title: "State changed",
      description: `Moved from ${currentState} to ${nextState}`,
    });

    setCurrentState(nextState);
    return true;
  }, [stateMachine, currentState, toast]);

  // Process a special event
  const processSpecialEvent = useCallback((event: string) => {
    if (!stateMachine || !stateMachine.states[currentState]) {
      return false;
    }
    
    // Special case for provider lookup simulation
    if (currentState === 'agent_lookup') {
      // Simulate an asynchronous operation
      setTimeout(() => {
        // 80% chance of finding the provider
        const found = Math.random() < 0.8;
        processAgentResponse(found ? 'PROVIDER_FOUND' : 'PROVIDER_NOT_FOUND');
      }, 1500);
      return true;
    }
    
    return false;
  }, [currentState, processAgentResponse, stateMachine]);

  // Start the conversation
  const startConversation = useCallback(() => {
    if (!stateMachine) return;
    
    processAgentResponse('START_CALL');
  }, [stateMachine, processAgentResponse]);

  // Reset the conversation
  const resetConversation = useCallback(() => {
    if (!stateMachine) return;
    
    setCurrentState(stateMachine.initial);
  }, [stateMachine]);

  // Get customer text for the current state
  const getCustomerText = useCallback(() => {
    const stateData = getCurrentStateData();
    return stateData?.meta?.customerText || '';
  }, [getCurrentStateData]);

  // Get agent options for the current state
  const getAgentOptions = useCallback(() => {
    const stateData = getCurrentStateData();
    return stateData?.meta?.agentOptions || [];
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

  // Check for special states that need simulation
  useEffect(() => {
    if (currentState === 'agent_lookup') {
      processSpecialEvent('LOOKUP_PROVIDER');
    }
  }, [currentState, processSpecialEvent]);

  return {
    currentState,
    isLoading,
    error,
    getCustomerText,
    getAgentOptions,
    getSystemMessage,
    processAgentResponse,
    startConversation,
    resetConversation,
    isFinalState
  };
}
