
import { ScenarioType } from "@/components/ScenarioSelector";

// Map of available state machines
// This determines which state machines can be loaded
export const stateMachines: Record<ScenarioType, boolean> = {
  testscenario: true,
  scenario2: true,
  verification: true,
  bankDetails: true,
  accountHistory: true,
  physioTherapy: true,
  paymentReminder: true,
  insurancePackage: true,
  empty: true // Add the new empty scenario
};
