
import React from 'react';

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
  // Deprecated - this component is kept for backward compatibility
  // Verification now happens inline with MessageVerification component
  return null;
};

export default VerificationButton;
