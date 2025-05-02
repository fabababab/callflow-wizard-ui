
import { ScenarioType } from '@/components/ScenarioSelector';
import { 
  physioStateMachine,
  bankDetailsStateMachine,
  verificationStateMachine,
  accountHistoryStateMachine,
  paymentReminderStateMachine,
  insurancePackageStateMachine,
  State
} from '@/data/stateMachines';

// Export the StateMachine type
export type StateMachine = Record<string, State>;

// Define the StateData type that includes all possible properties
export type StateMachineState = {
  agent?: string;
  customer?: string;
  suggestions?: string[];
  stateType?: 'info' | 'question' | 'decision' | 'verification';
  action?: string;
  systemMessage?: string;
  responseOptions?: string[];
  productOptions?: string[];
  contractOptions?: string[];
  requiresVerification?: boolean;
  nextState?: string;
  // Add any other properties needed from the State type
};

// Check if there's a state machine for the given scenario
export function hasStateMachine(scenario: ScenarioType): boolean {
  return !!getStateMachine(scenario);
}

// Load the state machine based on the scenario
export async function loadStateMachine(scenario: ScenarioType): Promise<StateMachine | null> {
  // Just return the state machine directly instead of loading it asynchronously
  return getStateMachine(scenario);
}

// Helper function to get the state machine for a scenario
function getStateMachine(scenario: ScenarioType): StateMachine | null {
  switch(scenario) {
    case 'physioTherapy':
      return physioStateMachine;
    case 'bankDetails':
      return bankDetailsStateMachine;
    case 'verification':
      return verificationStateMachine;
    case 'accountHistory':
      return accountHistoryStateMachine;
    case 'paymentReminder':
      return paymentReminderStateMachine;
    case 'insurancePackage':
      return insurancePackageStateMachine;
    default:
      return null;
  }
}

// Get the initial state of the state machine
export function getInitialState(stateMachine: StateMachine): string {
  // Most state machines start with "start", but you might want to make this more flexible
  return "start";
}

// Get data for a specific state
export function getStateData(stateMachine: StateMachine, state: string): StateMachineState | null {
  return stateMachine[state] || null;
}

// Determine the next state based on input
export function getNextState(stateMachine: StateMachine, currentState: string, selectedOption?: string): string | null {
  const state = stateMachine[currentState];
  
  if (!state) {
    return null;
  }
  
  // If selectedOption is provided, check if it matches any transition
  if (selectedOption) {
    // In a real implementation, you would have a more sophisticated way to determine
    // the next state based on the selection. This is just a simplified example.
    
    // For now, just return the default next state
    return state.nextState || null;
  }
  
  // Return the default next state if no selection
  return state.nextState || null;
}

// Get the JSON representation of a state machine
export async function getStateMachineJson(scenario: ScenarioType): Promise<string> {
  const stateMachine = getStateMachine(scenario);
  return stateMachine ? JSON.stringify(stateMachine, null, 2) : '{}';
}
