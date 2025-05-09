
import React from 'react';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';

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
  if (isVerified) {
    return (
      <div className="mt-2 flex items-center gap-1 text-green-700">
        <Check className="h-4 w-4" />
        <span className="text-xs">Verified</span>
      </div>
    );
  }

  if (requiresVerification) {
    return (
      <div className="mt-2 p-2 rounded bg-yellow-50 border border-yellow-200">
        <p className="text-sm text-yellow-700 mb-1">This requires manual verification to continue</p>
        <Button 
          size="sm" 
          variant="outline" 
          onClick={onVerify}
          className="bg-green-50 hover:bg-green-100 text-green-700 border-green-200"
        >
          Verify and Continue
        </Button>
      </div>
    );
  }

  return null;
};

export default VerificationButton;
