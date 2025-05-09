
import React, { useEffect } from 'react';
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
    console.log(`Verification triggered for message ${messageId}, verified: ${verified}`);
    if (verified && onVerifySystemCheck) {
      onVerifySystemCheck(messageId);
    }
  };

  // Calculate if we need to show inline verification
  const showInlineVerification = requiresVerification && !isVerified && sender === 'customer';
  
  // Debug log to check verification state
  useEffect(() => {
    if (requiresVerification) {
      console.log(`MessageContent: Message ${messageId} verification status - requiresVerification: ${requiresVerification}, isVerified: ${isVerified}, showInlineVerification: ${showInlineVerification}, sender: ${sender}`);
    }
  }, [requiresVerification, isVerified, messageId, showInlineVerification, sender]);

  return (
    <div className="space-y-2 w-full">
      <div className="text-sm whitespace-pre-wrap">{text}</div>
      
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
        <div className="mt-2 w-full" data-testid="inline-verification">
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
    </div>
  );
};

export default MessageContent;
