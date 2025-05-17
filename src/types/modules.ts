
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
  INFORMATION_TABLE = 'INFORMATION_TABLE',
  CHOICE_LIST = 'CHOICE_LIST',
  SENSITIVE_DATA_VERIFICATION = 'SENSITIVE_DATA_VERIFICATION',
}

// Interface for module configuration
export interface ModuleConfig {
  id: string;
  type: ModuleType;
  title: string;
  data?: any;
  sourceState?: string; // Added to track which state the module comes from
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
  isInline?: boolean; // Added to support inline display mode
}

// Interface specifically for sensitive data verification
export interface SensitiveDataVerificationProps extends ModuleProps {
  data: {
    fields: Array<{
      id: string;
      label: string;
      type: string;
      value: string;
      system: string;
      required: boolean;
      source?: string;
    }>;
    isInline?: boolean;
  };
}
