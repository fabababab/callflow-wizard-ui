
import React, { useEffect, memo, useState } from 'react';
import { CheckCircle } from 'lucide-react';
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

const MessageContent: React.FC<MessageContentProps> = memo(({
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
  // Local state to track verification status
  const [localVerified, setLocalVerified] = useState(isVerified);
  
  // Update local state when props change
  useEffect(() => {
    if (isVerified) {
      setLocalVerified(true);
    }
  }, [isVerified]);

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
    if (verified) {
      setLocalVerified(true);
      if (onVerifySystemCheck) {
        onVerifySystemCheck(messageId);
      }
    }
  };

  // Calculate if we need to show inline verification
  const showInlineVerification = requiresVerification && !localVerified && sender === 'customer';

  return (
    <div className="space-y-2 w-full transition-all duration-300">
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
        <div className="mt-2 w-full transition-all duration-300" data-testid="inline-verification">
          <InlineChatVerification 
            onVerify={handleVerify}
            isVerifying={false}
            isVerified={localVerified}
          />
        </div>
      )}
      
      {/* Display success verification badge if verified */}
      {localVerified && requiresVerification && sender === 'customer' && (
        <div className="mt-2 p-2 bg-green-50 border-l-4 border-green-400 rounded-md transition-all duration-300">
          <div className="flex items-center gap-1.5 text-green-700">
            <CheckCircle size={14} />
            <span className="text-xs font-medium">Identity Verified</span>
          </div>
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
});

MessageContent.displayName = 'MessageContent';

export default MessageContent;
