import { ScenarioType } from '@/components/ScenarioSelector';
import { stateMachines, StateMachineStatus } from '@/data/stateMachines';
import { SensitiveField } from '@/data/scenarioData';
import { ModuleConfig } from '@/types/modules';

// Re-export the enum so it can be used in DecisionTreeVisualizer
export { StateMachineStatus };

// Define the state machine types
export interface StateMachineState {
  stateType?: string;
  meta?: {
    agentText?: string;
    suggestions?: string[];
    systemMessage?: string;
    action?: string;
    responseOptions?: string[];
    customerText?: string;
    sensitiveFields?: SensitiveField[]; 
    module?: ModuleConfig;
    preventAutoContinue?: boolean; // New flag to control auto-continuation
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
  status?: StateMachineStatus;
  preventAutoContinue?: boolean; // Global setting to prevent auto-continuation
  states: {
    [key: string]: StateMachineState;
  };
}

// Map ScenarioType to actual filename
const scenarioFileMap: Record<ScenarioType, string> = {
  'studiumabschlussCase': 'studiumabschluss-case',
  'leistungsabdeckungPhysio': 'leistungsabdeckung-physio',
  'mahnungTrotzZahlung': 'mahnung-trotz-zahlung'
};

// Get list of all available state machines
export async function getAvailableStateMachines(): Promise<ScenarioType[]> {
  const availableScenarios: ScenarioType[] = [];
  
  // Filter state machines that are available
  for (const [key, value] of Object.entries(stateMachines)) {
    if (value.available === true) {
      availableScenarios.push(key as ScenarioType);
    }
  }
  
  return availableScenarios;
}

// Get the status of a specific state machine
export function getStateMachineStatus(scenario: ScenarioType): StateMachineStatus | null {
  if (!stateMachines.hasOwnProperty(scenario)) {
    return null;
  }
  return stateMachines[scenario].status;
}

// Check if a state machine exists for the given scenario
export function hasStateMachine(scenario: ScenarioType): boolean {
  return stateMachines.hasOwnProperty(scenario) && stateMachines[scenario].available;
}

// Load the state machine for the given scenario
export async function loadStateMachine(scenario: ScenarioType): Promise<StateMachine | null> {
  if (!scenario || !hasStateMachine(scenario)) {
    return null;
  }

  try {
    // Use the mapping to get the correct filename
    const filename = scenarioFileMap[scenario] || scenario;
    
    // Use dynamic import with the correct filename
    const module = await import(`../data/stateMachines/${filename}.json`);
    const machine = module.default;
    
    // Add status if not already present
    if (!machine.status) {
      machine.status = getStateMachineStatus(scenario);
    }
    
    // Set preventAutoContinue flag for leistungsabdeckung-physio scenario
    if (scenario === 'leistungsabdeckungPhysio' && !machine.hasOwnProperty('preventAutoContinue')) {
      machine.preventAutoContinue = true;
    }
    
    return machine;
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
    
    // Use the mapping to get the correct filename
    const filename = scenarioFileMap[scenario] || scenario;
    
    // Use dynamic import with the correct filename
    const module = await import(`../data/stateMachines/${filename}.json`);
    const machine = module.default;
    
    // Add status if not already present
    if (!machine.status) {
      machine.status = getStateMachineStatus(scenario);
    }
    
    return JSON.stringify(machine, null, 2);
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
