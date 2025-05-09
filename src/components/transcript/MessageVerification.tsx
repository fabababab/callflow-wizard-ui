
import React, { useState } from 'react';
import InlineChatVerification from './InlineChatVerification';
import { FormValues } from '../identity-validation/FormFields';

interface MessageVerificationProps {
  messageId: string;
  isVerified?: boolean;
  onVerify: (messageId: string) => void;
}

const MessageVerification: React.FC<MessageVerificationProps> = ({
  messageId,
  isVerified,
  onVerify
}) => {
  const [isVerifying, setIsVerifying] = useState(false);
  
  const handleInlineVerify = (verified: boolean, data?: FormValues) => {
    console.log(`Inline verification for message ${messageId}:`, { verified, data });
    setIsVerifying(false);
    if (verified) {
      onVerify(messageId);
    }
  };

  return (
    <InlineChatVerification 
      onVerify={handleInlineVerify}
      isVerifying={isVerifying}
      isVerified={isVerified}
    />
  );
};

export default MessageVerification;
