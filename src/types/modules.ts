
import { StateMachineState } from "@/utils/stateMachineLoader";

export interface ModuleConfig {
  id: string;
  title: string;
  type: ModuleType;
  triggerStates?: string[];
  data?: any;
}

export enum ModuleType {
  VERIFICATION = "verification",
  CONTRACT = "contract",
  INFORMATION = "information",
  NACHBEARBEITUNG = "nachbearbeitung"
}

export interface ModuleProps {
  id: string;
  title: string;
  data?: any;
  onClose?: () => void;
  onComplete?: (result: any) => void;
  currentState?: string;
  stateData?: StateMachineState;
}

export interface ModuleRegistryItem {
  type: ModuleType;
  component: React.ComponentType<ModuleProps>;
}
