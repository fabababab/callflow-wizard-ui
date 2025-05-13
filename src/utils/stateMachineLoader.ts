
import { ScenarioType } from "@/components/ScenarioSelector";
import testScenarioData from "@/data/stateMachines/testscenario.json";

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
}

// Type definition for a state machine
export interface StateMachine {
  id: string;
  initial: string;
  states: Record<string, StateMachineState>;
}

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
