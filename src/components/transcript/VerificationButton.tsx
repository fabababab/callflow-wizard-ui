
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
  if (isVerified) {
    return (
      <div className="mt-2 flex items-center gap-1 text-green-700 bg-green-50 px-3 py-2 rounded-md border border-green-200">
        <Check className="h-4 w-4" />
        <span className="text-sm">Verified</span>
      </div>
    );
  }

  if (requiresVerification) {
    return (
      <div className="mt-2 p-3 rounded-md bg-amber-50 border border-amber-200">
        <p className="text-sm text-amber-700 mb-2">This information requires verification to continue</p>
        <Button 
          size="sm" 
          variant="outline" 
          onClick={onVerify}
          className="bg-green-50 hover:bg-green-100 text-green-700 border-green-200 flex items-center gap-1"
        >
          <ShieldCheck size={14} />
          Verify and Continue
        </Button>
      </div>
    );
  }

  return null;
};

export default VerificationButton;
