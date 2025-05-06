
import { ScenarioType } from '@/components/ScenarioSelector';

// This simple object tracks which state machine scenarios are available
export const stateMachines: Record<ScenarioType, boolean> = {
  testscenario: true,
  verification: true,
  bankDetails: true,
  accountHistory: true,
  physioTherapy: true,
  paymentReminder: true,
  insurancePackage: true
};
