
import { ScenarioType } from '@/components/ScenarioSelector';

// This simple object tracks which state machine scenarios are available
export const stateMachines: Record<ScenarioType, boolean> = {
  testscenario: true,
  verification: false,
  bankDetails: false,
  accountHistory: false,
  physioTherapy: false,
  paymentReminder: false,
  insurancePackage: false
};
