import { ScenarioType } from "@/components/ScenarioSelector";
import testScenarioData from "@/data/stateMachines/testscenario.json";

// Define StateMachineStatus enum
export enum StateMachineStatus {
  DEVELOPMENT = 'DEVELOPMENT',
  TESTING = 'TESTING',
  PRODUCTION = 'PRODUCTION'
}

// Type definition for state machine states
export interface StateMachineState {
  meta?: {
    systemMessage?: string;
    customerText?: string;
    agentText?: string;
    responseOptions?: string[];
    suggestions?: string[];
    sensitiveFields?: any[];
    module?: any;
  };
  on?: Record<string, string>;
  nextState?: string;
  requiresVerification?: boolean;
}

// Type definition for a state machine
export interface StateMachine {
  id: string;
  initial: string;
  initialState?: string; // Adding this for backward compatibility
  states: Record<string, StateMachineState>;
  status?: StateMachineStatus;
}

/**
 * Gets the initial state from a state machine
 */
export const getInitialState = (stateMachine: StateMachine): string => {
  return stateMachine.initial || stateMachine.initialState || 'start';
};

/**
 * Gets the next state based on the current state and selection
 */
export const getNextState = (stateMachine: StateMachine, currentState: string, selection: string): string | null => {
  if (!stateMachine.states[currentState] || !stateMachine.states[currentState].on) {
    return null;
  }
  
  return stateMachine.states[currentState].on?.[selection] || null;
};

/**
 * Gets the data for a specific state
 */
export const getStateData = (stateMachine: StateMachine, stateName: string): StateMachineState | null => {
  if (!stateMachine.states[stateName]) {
    return null;
  }
  
  return stateMachine.states[stateName];
};

/**
 * Checks if a state machine exists
 */
export const hasStateMachine = (scenario: ScenarioType): boolean => {
  // For now, only check if it's the test scenario
  return scenario === 'testscenario';
};

/**
 * Gets the JSON representation of a state machine
 */
export const getStateMachineJson = (stateMachine: StateMachine): string => {
  return JSON.stringify(stateMachine, null, 2);
};

/**
 * Loads a state machine for a given scenario
 * @param scenario The scenario type to load
 * @returns The loaded state machine or null if not found
 */
export const loadStateMachine = async (scenario: ScenarioType): Promise<StateMachine | null> => {
  console.log('Loading state machine for scenario:', scenario);
  
  try {
    // For now, we only have the test scenario data
    // In the future, you can add more scenarios or load them dynamically
    if (scenario === 'testscenario') {
      return testScenarioData as StateMachine;
    }
    
    // If we don't have a specific state machine, return null
    console.warn(`No state machine found for scenario: ${scenario}`);
    return null;
  } catch (error) {
    console.error("Error loading state machine:", error);
    throw new Error(`Failed to load state machine for scenario: ${scenario}`);
  }
};
