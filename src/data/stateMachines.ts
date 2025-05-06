
import { ScenarioType } from '@/components/ScenarioSelector';

// Map of available state machines
// Key is scenario name, value is boolean indicating if it's available
export const stateMachines: Record<string, boolean> = {
  testscenario: true,
  scenario2: true,
  physioCoverage: true,
  customerPhysioCoverage: true,
  verification: true,
  bankDetails: true,
  paymentReminder: true,
  insurancePackage: true,
  accountHistory: true,
  physioTherapy: true
};
