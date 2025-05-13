
import { ScenarioType } from '@/components/ScenarioSelector';

export enum StateMachineStatus {
  DEVELOPMENT = 'DEVELOPMENT',
  TESTING = 'TESTING',
  PRODUCTION = 'PRODUCTION'
}

interface StateMachineConfig {
  status: StateMachineStatus;
  available: boolean;
  description?: string;
}

// Define available state machines and their status
export const stateMachines: Record<ScenarioType, StateMachineConfig> = {
  'testscenario': {
    status: StateMachineStatus.PRODUCTION,
    available: true,
    description: 'General test scenario with various interaction paths'
  },
  'verificationFlow': {
    status: StateMachineStatus.PRODUCTION,
    available: true,
    description: 'Focused scenario for testing identity verification'
  },
  'contractManagement': {
    status: StateMachineStatus.PRODUCTION,
    available: true,
    description: 'Scenario for contract review, modification and cancellation'
  },
  'productInfo': {
    status: StateMachineStatus.PRODUCTION,
    available: true,
    description: 'Information-based scenario for product details and subscription options'
  },
  // Add the missing scenario types that are referenced in the codebase
  'verification': {
    status: StateMachineStatus.PRODUCTION,
    available: true,
    description: 'Legacy scenario for identity verification flow'
  },
  'bankDetails': {
    status: StateMachineStatus.PRODUCTION,
    available: true,
    description: 'Scenario for updating bank account information'
  },
  'accountHistory': {
    status: StateMachineStatus.PRODUCTION,
    available: true,
    description: 'Scenario for reviewing account transaction history'
  },
  'physioTherapy': {
    status: StateMachineStatus.PRODUCTION,
    available: true,
    description: 'Scenario for physiotherapy coverage inquiries'
  },
  'paymentReminder': {
    status: StateMachineStatus.PRODUCTION,
    available: true,
    description: 'Scenario for handling payment reminder disputes'
  },
  'insurancePackage': {
    status: StateMachineStatus.PRODUCTION,
    available: true,
    description: 'Scenario for updating insurance packages after major life changes'
  },
  'deutscheVersion': {
    status: StateMachineStatus.PRODUCTION,
    available: true,
    description: 'Deutsche Version mit Versicherungsanpassung nach Studienabschluss'
  }
};
