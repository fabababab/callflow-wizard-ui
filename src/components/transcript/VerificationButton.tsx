import React from 'react';
import { Button } from '@/components/ui/button';
import { Check, ShieldCheck } from 'lucide-react';

interface VerificationButtonProps {
  requiresVerification: boolean;
  isVerified?: boolean;
  onVerify: () => void;
}

const VerificationButton: React.FC<VerificationButtonProps> = ({ 
  requiresVerification,
  isVerified,
  onVerify
}) => {
  // We no longer show this component since we're using InlineChatVerification
  // But we'll keep it for backward compatibility with other parts of the app
  return null;
};

export default VerificationButton;
