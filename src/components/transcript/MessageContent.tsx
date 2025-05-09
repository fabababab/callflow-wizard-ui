
import React from 'react';
import NumberInputDisplay from './NumberInputDisplay';
import SensitiveDataSection from './SensitiveDataSection';
import { SensitiveField, ValidationStatus } from '@/data/scenarioData';
import { MessageSender } from './MessageTypes';
import InlineChatVerification from './InlineChatVerification';

interface MessageContentProps {
  text: string;
  sender: MessageSender;
  numberInput?: {
    userValue: string | number;
    systemValue: string | number;
    matched: boolean;
  };
  requiresVerification?: boolean;
  isVerified?: boolean;
  messageId: string;
  sensitiveData?: SensitiveField[];
  onValidateSensitiveData?: (messageId: string, fieldId: string, status: ValidationStatus, notes?: string) => void;
  onVerifySystemCheck?: (messageId: string) => void;
}

const MessageContent: React.FC<MessageContentProps> = ({
  text,
  sender,
  numberInput,
  requiresVerification,
  isVerified,
  messageId,
  sensitiveData,
  onValidateSensitiveData,
  onVerifySystemCheck
}) => {
  // Handler for validating sensitive data
  const handleValidate = (fieldId: string, status: ValidationStatus, notes?: string) => {
    console.log(`Validating field ${fieldId} with status ${status}`);
    if (onValidateSensitiveData) {
      onValidateSensitiveData(messageId, fieldId, status, notes);
    }
  };

  // Handler for verification
  const handleVerify = (verified: boolean) => {
    if (verified && onVerifySystemCheck) {
      onVerifySystemCheck(messageId);
    }
  };

  const showInlineVerification = requiresVerification && !isVerified && sender === 'customer';

  return (
    <>
      <p className="text-sm whitespace-pre-wrap">{text}</p>
      
      {/* Display number matching visualization */}
      {numberInput && (
        <NumberInputDisplay 
          userValue={numberInput.userValue}
          systemValue={numberInput.systemValue}
          matched={numberInput.matched}
        />
      )}
      
      {/* Show inline verification directly in the message content */}
      {showInlineVerification && onVerifySystemCheck && (
        <div className="mt-2">
          <InlineChatVerification 
            onVerify={handleVerify}
            isVerifying={false}
            isVerified={isVerified}
          />
        </div>
      )}
      
      {/* Display sensitive data validation fields if present */}
      {sensitiveData && sensitiveData.length > 0 && sender === 'customer' && (
        <SensitiveDataSection 
          sensitiveData={sensitiveData}
          onValidate={handleValidate}
        />
      )}
    </>
  );
};

export default MessageContent;
