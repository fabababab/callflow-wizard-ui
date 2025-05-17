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

export type MessageSender = 'agent' | 'customer' | 'system';
export type SystemMessageType = 'info' | 'warning' | 'error' | 'success';
export type MessageId = string;

export interface Suggestion {
  id: string;
  text: string;
}

export interface Message {
  id: MessageId;
  text: string;
  sender: MessageSender;
  timestamp: Date;
  systemType?: SystemMessageType;
  suggestions?: Suggestion[];
  numberInput?: boolean;
  requiresVerification?: boolean;
  isVerified?: boolean;
  sensitiveData?: any[];
  responseOptions?: string[];
  inlineModule?: any;
  stateId?: string; // Added to track which state this message came from
}
