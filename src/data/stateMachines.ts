
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
  'studiumabschlussCase': {
    status: StateMachineStatus.PRODUCTION,
    available: true,
    description: 'Szenario für Versicherungsanpassung nach Studienabschluss'
  },
  'leistungsabdeckungPhysio': {
    status: StateMachineStatus.PRODUCTION,
    available: true,
    description: 'Szenario für Fragen zur Abdeckung von Physiotherapie-Behandlungen (Agenten-Sicht)'
  },
  'customerPhysioCoverage': {
    status: StateMachineStatus.PRODUCTION,
    available: true,
    description: 'Szenario für Fragen zur Abdeckung von Physiotherapie-Behandlungen (Kunden-Sicht)'
  },
  'mahnungTrotzZahlung': {
    status: StateMachineStatus.PRODUCTION,
    available: true,
    description: 'Szenario für Mahnungsprobleme bei bereits erfolgter Zahlung'
  }
};
