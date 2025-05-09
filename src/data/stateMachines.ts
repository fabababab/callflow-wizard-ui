
import { ScenarioType } from "@/components/ScenarioSelector";

// Define the status type for state machine stability
export type StateMachineStatus = 'stable' | 'beta' | 'in-development';

// Map of available state machines with their status
export const stateMachines: Record<ScenarioType, { available: boolean, status: StateMachineStatus }> = {
  testscenario: { available: true, status: 'stable' },
  scenario2: { available: true, status: 'stable' },
  verification: { available: true, status: 'beta' },
  bankDetails: { available: true, status: 'beta' },
  accountHistory: { available: true, status: 'in-development' },
  physioTherapy: { available: true, status: 'beta' },
  paymentReminder: { available: true, status: 'in-development' },
  insurancePackage: { available: true, status: 'in-development' },
  basicTutorial: { available: true, status: 'stable' },
  customerSupport: { available: true, status: 'beta' },
  accountVerification: { available: true, status: 'in-development' }
};
