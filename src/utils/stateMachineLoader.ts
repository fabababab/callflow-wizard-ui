
import { ScenarioType } from '@/components/ScenarioSelector';
import { stateMachines } from '@/data/stateMachines';

// Define the state machine types
export interface StateMachineState {
  stateType?: string;
  meta?: {
    agentText?: string;
    suggestions?: string[];
    systemMessage?: string;
    action?: string;
    responseOptions?: string[];
  };
  on?: Record<string, string>;
  nextState?: string;
  text?: string;
  action?: string;
  requiresVerification?: boolean;
  suggestions?: string[];
  responseOptions?: string[];
}

export interface StateMachine {
  id?: string;
  initialState?: string;
  initial?: string;
  states: {
    [key: string]: StateMachineState;
  };
}

// Check if a state machine exists for the given scenario
export function hasStateMachine(scenario: ScenarioType): boolean {
  return stateMachines.hasOwnProperty(scenario);
}

// Load the state machine for the given scenario
export async function loadStateMachine(scenario: ScenarioType): Promise<StateMachine | null> {
  if (!scenario || !hasStateMachine(scenario)) {
    return null;
  }

  try {
    // Use dynamic import instead of require
    const module = await import(`../data/stateMachines/${scenario}.json`);
    return module.default;
  } catch (error) {
    console.error(`Error loading state machine:`, error);
    return null;
  }
}

// Get JSON representation of the state machine (for debugging)
export async function getStateMachineJson(scenario: ScenarioType): Promise<string> {
  try {
    if (!scenario || !hasStateMachine(scenario)) {
      return JSON.stringify({ error: 'No state machine found for this scenario' }, null, 2);
    }
    
    // Use dynamic import instead of require
    const module = await import(`../data/stateMachines/${scenario}.json`);
    return JSON.stringify(module.default, null, 2);
  } catch (error) {
    console.error(`Error loading state machine JSON:`, error);
    return JSON.stringify({ error: `Failed to load: ${error}` }, null, 2);
  }
}

// Get the initial state of the machine
export function getInitialState(machine: StateMachine): string {
  return machine.initialState || machine.initial || 'start';
}

// Get state data for a specific state
export function getStateData(machine: StateMachine, state: string): StateMachineState | null {
  if (!machine || !machine.states || !machine.states[state]) {
    return null;
  }
  return machine.states[state];
}

// Determine the next state based on user selection
export function getNextState(
  machine: StateMachine,
  currentState: string,
  selection?: string
): string | null {
  const stateData = getStateData(machine, currentState);
  
  if (!stateData) {
    return null;
  }
  
  // Check if we have on transitions
  if (stateData.on) {
    // If selection matches a specific transition, use it
    if (selection && stateData.on[selection]) {
      return stateData.on[selection];
    }
    
    // Try DEFAULT transition
    if (stateData.on['DEFAULT']) {
      return stateData.on['DEFAULT'];
    }
  }
  
  // Fallback to nextState for older format
  return stateData.nextState || null;
}
