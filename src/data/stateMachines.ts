
import { ScenarioType } from '@/components/ScenarioSelector';

// This simple object tracks which state machine scenarios are available
export const stateMachines: Record<ScenarioType, boolean> = {
  physioCoverage: true,
  customerPhysioCoverage: true,
  physioTherapy: true,
  bankDetails: true,
  verification: true,
  accountHistory: true,
  insurancePackage: true,
  paymentReminder: true,
};
