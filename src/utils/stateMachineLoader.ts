
import { ScenarioType } from '@/components/ScenarioSelector';

export interface StateMachineState {
  type: 'info' | 'question' | 'decision' | 'verification' | 'action';
  agent?: string;
  customer?: string;
  systemMessage?: string;
  action?: string;
  suggestions?: string[];
  responseOptions?: string[];
  transitions: {
    [option: string]: string;
    default?: string;
  };
}

export interface StateMachine {
  states: {
    [stateName: string]: StateMachineState;
  };
  initialState: string;
}

// Cache for loaded state machines
const stateMachineCache: Record<string, StateMachine> = {};

// Function to load a state machine for a given scenario
export async function loadStateMachine(scenario: ScenarioType): Promise<StateMachine | null> {
  if (!scenario) return null;
  
  // Return from cache if already loaded
  if (stateMachineCache[scenario]) {
    return stateMachineCache[scenario];
  }
  
  try {
    // Load the JSON file dynamically
    const module = await import(`../data/stateMachines/${scenario}.json`);
    const stateMachine = module.default || module;
    
    // Cache it for future use
    stateMachineCache[scenario] = stateMachine;
    
    return stateMachine;
  } catch (error) {
    console.error(`Failed to load state machine for scenario ${scenario}:`, error);
    return null;
  }
}

// Get the initial state for a scenario
export function getInitialState(machine: StateMachine | null): string {
  return machine?.initialState || 'start';
}

// Get the next state based on the current state and selected option
export function getNextState(
  machine: StateMachine | null,
  currentState: string,
  selectedOption?: string
): string | null {
  if (!machine || !machine.states[currentState]) {
    return null;
  }
  
  const stateData = machine.states[currentState];
  
  // If we have a specific transition for this option, use it
  if (selectedOption && stateData.transitions[selectedOption]) {
    return stateData.transitions[selectedOption];
  }
  
  // Otherwise use the default transition
  if (stateData.transitions.default) {
    return stateData.transitions.default;
  }
  
  return null;
}

// Helper to check if a state has transitions left (if not, it's an end state)
export function hasTransitions(machine: StateMachine | null, state: string): boolean {
  if (!machine || !machine.states[state]) {
    return false;
  }
  
  const transitions = machine.states[state].transitions;
  return Object.keys(transitions).length > 0;
}

// Get the current state data
export function getStateData(
  machine: StateMachine | null, 
  state: string
): StateMachineState | null {
  if (!machine || !machine.states[state]) {
    return null;
  }
  
  return machine.states[state];
}

// Get the raw JSON string for a state machine
export async function getStateMachineJson(scenario: ScenarioType): Promise<string> {
  if (!scenario) return "No scenario selected";
  
  try {
    const machine = await loadStateMachine(scenario);
    return JSON.stringify(machine, null, 2); // Pretty print with 2 spaces
  } catch (error) {
    console.error(`Failed to get state machine JSON for scenario ${scenario}:`, error);
    return `Error loading state machine for ${scenario}`;
  }
}

// Helper to check if a state machine exists for a scenario
export function hasStateMachine(scenario: ScenarioType): boolean {
  if (!scenario) return false;
  try {
    // Check if the file exists by doing a sync require
    require(`../data/stateMachines/${scenario}.json`);
    return true;
  } catch (error) {
    return false;
  }
}
