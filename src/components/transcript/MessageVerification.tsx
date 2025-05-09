
import React, { useEffect } from 'react';
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
  // Auto verify after component mounts
  useEffect(() => {
    if (!isVerified) {
      // Add a small delay to make it look natural
      const timer = setTimeout(() => {
        onVerify(messageId);
      }, 1500);
      
      return () => clearTimeout(timer);
    }
  }, [messageId, isVerified, onVerify]);
  
  const handleInlineVerify = (verified: boolean, data?: FormValues) => {
    console.log(`Inline verification for message ${messageId}:`, { verified, data });
    if (verified) {
      onVerify(messageId);
    }
  };

  return (
    <InlineChatVerification 
      onVerify={handleInlineVerify}
      isVerifying={false}
      isVerified={isVerified}
    />
  );
};

export default MessageVerification;
