
// Define available module types
export enum ModuleType {
  VERIFICATION = 'VERIFICATION',
  INFORMATION = 'INFORMATION',
  NACHBEARBEITUNG = 'NACHBEARBEITUNG',
  CONTRACT = 'CONTRACT',
  CONTRACT_MANAGEMENT = 'CONTRACT_MANAGEMENT',
  QUIZ = 'QUIZ',
  FRANCHISE = 'FRANCHISE',
}

// Interface for module configuration
export interface ModuleConfig {
  id: string;
  type: ModuleType;
  title: string;
  data?: any;
}
