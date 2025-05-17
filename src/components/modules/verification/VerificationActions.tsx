
import React from 'react';
import { Button } from '@/components/ui/button';
import { CheckCircle, X } from 'lucide-react';

interface VerificationActionsProps {
  verificationStatus: 'pending' | 'success' | 'failed';
  isInlineDisplay: boolean;
  isProcessing: boolean;
  onClose?: () => void;
  onValidate: (isValid: boolean) => void;
}

const VerificationActions: React.FC<VerificationActionsProps> = ({
  verificationStatus,
  isInlineDisplay,
  isProcessing,
  onClose,
  onValidate
}) => {
  return (
    <div className={`flex justify-between ${isInlineDisplay ? "py-2 bg-transparent border-t border-amber-100/50" : "bg-gray-50 border-t py-2"}`}>
      {!isInlineDisplay && (
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => {
            if (!isProcessing && onClose) onClose();
          }}
          className="text-xs"
          disabled={isProcessing}
        >
          Cancel
        </Button>
      )}
      
      {/* Only show validation buttons when status is pending */}
      {verificationStatus === 'pending' && (
        <div className={`flex gap-2 ${isInlineDisplay ? "ml-auto" : ""}`}>
          <Button 
            variant="destructive"
            size="sm"
            onClick={() => onValidate(false)}
            className="text-xs"
            disabled={isProcessing}
          >
            <X size={14} className="mr-1" />
            Invalid
          </Button>
          <Button 
            variant="default"
            size="sm"
            onClick={() => onValidate(true)}
            className="text-xs"
            disabled={isProcessing}
          >
            <CheckCircle size={14} className="mr-1" />
            Valid
          </Button>
        </div>
      )}
    </div>
  );
};

export default VerificationActions;
