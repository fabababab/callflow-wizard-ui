
import { SensitiveField } from '@/data/scenarioData';
import { AISuggestion } from './AISuggestion';
import { ModuleConfig } from '@/types/modules';

export type MessageSender = 'agent' | 'customer' | 'system';

export interface Message {
  id: string;
  text: string;
  sender: MessageSender;
  timestamp: Date | string;
  suggestions?: AISuggestion[];
  responseOptions?: string[];
  sensitiveData?: SensitiveField[];
  isAccepted?: boolean;
  isRejected?: boolean;
  systemType?: 'info' | 'warning' | 'error' | 'success';
  numberInput?: {
    userValue: string | number;
    systemValue: string | number;
    matched: boolean;
  };
  requiresVerification?: boolean;
  isVerified?: boolean;
  productInfo?: {
    name: string;
    videoUrl: string;
    description: string;
    details: string[];
  };
  cancellation?: {
    type: string;
    contracts: Array<{
      id: string;
      name: string;
      startDate: string;
      monthly: string;
    }>;
    requiresVerification: boolean;
  };
  inlineModule?: ModuleConfig;
}

// Export MessageType as an alias for Message for backward compatibility
export type MessageType = Message;
