
import React from 'react';
import { MessageSender } from './MessageTypes';
import { SensitiveField, ValidationStatus } from '@/data/scenarioData';
import { ModuleConfig } from '@/types/modules';
import AISuggestions, { AISuggestion } from './AISuggestion';
import MessageHeader from './MessageHeader';
import NumberInputDisplay from './NumberInputDisplay';
import VerificationButton from './VerificationButton';
import SensitiveDataSection from './SensitiveDataSection';
import ResponseOptions from './ResponseOptions';
import InlineModuleDisplay from './InlineModuleDisplay';

export type Message = {
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
};

interface MessageProps {
  message: Message;
  onAcceptSuggestion: (suggestionId: string, messageId: string) => void;
  onRejectSuggestion: (suggestionId: string, messageId: string) => void;
  onSelectResponse?: (response: string) => void;
  onValidateSensitiveData?: (messageId: string, fieldId: string, status: ValidationStatus, notes?: string) => void;
  onVerifySystemCheck?: (messageId: string) => void;
  isAgentMode?: boolean;
  onModuleComplete?: (moduleId: string, result: any) => void;
}

const Message: React.FC<MessageProps> = ({ 
  message, 
  onAcceptSuggestion,
  onRejectSuggestion,
  onSelectResponse,
  onValidateSensitiveData,
  onVerifySystemCheck,
  isAgentMode = true,
  onModuleComplete
}) => {
  const hasSuggestions = message.suggestions && message.suggestions.length > 0;
  const hasResponseOptions = message.responseOptions && message.responseOptions.length > 0;
  const hasNumberInput = message.numberInput !== undefined;
  const requiresVerification = message.requiresVerification && !message.isVerified;
  const hasInlineModule = message.inlineModule !== undefined;
  
  // Handler for validating sensitive data
  const handleValidate = (fieldId: string, status: ValidationStatus, notes?: string) => {
    console.log(`Validating field ${fieldId} with status ${status}`);
    if (onValidateSensitiveData) {
      onValidateSensitiveData(message.id, fieldId, status, notes);
    }
  };

  // Handler for verifying system check
  const handleVerify = () => {
    console.log(`Verifying message ${message.id}`);
    if (onVerifySystemCheck) {
      onVerifySystemCheck(message.id);
    }
  };

  // Handler for module completion
  const handleModuleComplete = (result: any) => {
    console.log(`Module completed for message ${message.id}`, result);
    if (onModuleComplete && message.inlineModule) {
      onModuleComplete(message.inlineModule.id, result);
    }
  };
  
  // Handler for response selection
  const handleSelectResponse = (response: string) => {
    console.log(`Selected response: ${response}`);
    if (onSelectResponse) {
      onSelectResponse(response);
    }
  };
  
  return (
    <div className={`flex ${message.sender === 'agent' ? 'justify-end' : 'justify-start'} mb-4`}>
      <div
        className={`rounded-lg max-w-[85%] p-3 shadow-sm 
          ${message.sender === 'agent'
            ? 'bg-primary text-primary-foreground ml-auto'
            : message.sender === 'customer' 
            ? 'bg-secondary text-secondary-foreground mr-auto' 
            : 'bg-muted text-center italic text-sm w-full'}`}
      >
        <MessageHeader sender={message.sender} timestamp={message.timestamp} />
        
        <p className="text-sm whitespace-pre-wrap">{message.text}</p>
        
        {/* Display number matching visualization */}
        {hasNumberInput && message.numberInput && (
          <NumberInputDisplay 
            userValue={message.numberInput.userValue}
            systemValue={message.numberInput.systemValue}
            matched={message.numberInput.matched}
          />
        )}

        {/* Display verification button or verified state */}
        <VerificationButton 
          requiresVerification={!!requiresVerification} 
          isVerified={message.isVerified}
          onVerify={handleVerify}
        />
        
        {/* Display sensitive data validation fields if present */}
        {message.sensitiveData && message.sender === 'customer' && (
          <SensitiveDataSection 
            sensitiveData={message.sensitiveData}
            onValidate={handleValidate}
          />
        )}
        
        {/* Display response options if any are provided */}
        {hasResponseOptions && isAgentMode && message.responseOptions && (
          <ResponseOptions
            options={message.responseOptions}
            onSelectResponse={handleSelectResponse}
          />
        )}
        
        {/* Display AI suggestions if any are provided */}
        {hasSuggestions && isAgentMode && (
          <div className="mt-3 pt-2 border-t border-gray-300/20">
            <AISuggestions 
              suggestions={message.suggestions || []} 
              messageId={message.id}
              onAccept={onAcceptSuggestion}
              onReject={onRejectSuggestion}
            />
          </div>
        )}
      </div>

      {/* Display inline module if present */}
      {hasInlineModule && message.inlineModule && (
        <InlineModuleDisplay 
          moduleConfig={message.inlineModule}
          onComplete={handleModuleComplete}
        />
      )}
    </div>
  );
};

export default Message;
