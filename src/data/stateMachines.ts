
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
  }
};
