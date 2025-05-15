
// Define available module types
export enum ModuleType {
  VERIFICATION = 'VERIFICATION',
  INFORMATION = 'INFORMATION',
  NACHBEARBEITUNG = 'NACHBEARBEITUNG',
  CONTRACT = 'CONTRACT',
  CONTRACT_MANAGEMENT = 'CONTRACT_MANAGEMENT',
  QUIZ = 'QUIZ',
  FRANCHISE = 'FRANCHISE',
  INSURANCE_MODEL = 'INSURANCE_MODEL', 
}

// Interface for module configuration
export interface ModuleConfig {
  id: string;
  type: ModuleType;
  title: string;
  data?: any;
}

// Base interface for module props
export interface ModuleProps {
  id: string;
  title: string;
  data?: any;
  onClose: () => void;
  onComplete: (result: any) => void;
  currentState?: string;
  stateData?: any;
}
