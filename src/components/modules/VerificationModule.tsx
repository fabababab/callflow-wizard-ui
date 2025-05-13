
import React from 'react';
import { ModuleProps } from '@/types/modules';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield } from 'lucide-react';
import VerificationFields from './verification/VerificationFields';
import VerificationStatus from './verification/VerificationStatus';
import { useVerificationModule } from './verification/useVerificationModule';

const VerificationModule = ({
  id, 
  title, 
  data, 
  onClose, 
  onComplete 
}: ModuleProps) => {
  const fields = data?.fields || [];
  const isInlineDisplay = data?.isInline === true;
  
  const {
    verificationFields,
    verificationStatus,
    isInlineDisplay: isInline,
    processingRef,
    handleInputChange,
    handleVerify
  } = useVerificationModule({
    id,
    fields,
    isInline: isInlineDisplay,
    onComplete
  });
  
  // Use different styling for inline vs modal display
  const cardClassName = isInlineDisplay
    ? "w-full ml-auto border-l-4 border-amber-300 border-r border-t border-b border-amber-200 shadow-sm rounded-md bg-amber-50/60 transition-all duration-300"
    : "w-full max-w-md border border-amber-200 shadow-md transition-all duration-300";
  
  return (
    <Card className={cardClassName} data-testid={`verification-module-${id}`}>
      <CardHeader className={`${isInlineDisplay ? "bg-transparent py-2 pb-0" : "bg-amber-50 border-b border-amber-100 py-3"}`}>
        <div className="flex items-center gap-2">
          <Shield className={`${isInlineDisplay ? "h-4 w-4" : "h-5 w-5"} text-amber-500`} />
          <CardTitle className={`${isInlineDisplay ? "text-amber-700 text-sm" : "text-amber-900 text-base"}`}>
            {title || 'Identity Verification'}
          </CardTitle>
        </div>
        <CardDescription className={`text-xs ${isInlineDisplay ? "text-amber-600/70" : ""}`}>
          Please verify the following information to continue
        </CardDescription>
      </CardHeader>
      
      <CardContent className={`${isInlineDisplay ? "pt-2" : "pt-4"} space-y-3`}>
        <VerificationStatus status={verificationStatus} />
        
        <VerificationFields 
          fields={verificationFields}
          isInlineDisplay={isInlineDisplay}
          isProcessing={Boolean(processingRef.current)}
          onInputChange={handleInputChange}
        />
      </CardContent>
      
      <CardFooter className={`flex justify-between ${isInlineDisplay ? "py-2 bg-transparent border-t border-amber-100/50" : "bg-amber-50 border-t py-2"}`}>
        {!isInlineDisplay && (
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => {
              if (!processingRef.current && onClose) onClose();
            }}
            className="text-xs"
            disabled={Boolean(processingRef.current)}
          >
            Cancel
          </Button>
        )}
        
        {/* Show verify button when status is pending */}
        {verificationStatus === 'pending' && (
          <Button 
            size="sm"
            onClick={handleVerify}
            className={`text-xs ${isInlineDisplay ? "bg-amber-500 hover:bg-amber-600 text-white ml-auto" : ""}`}
            disabled={Boolean(processingRef.current)}
          >
            Verify Identity
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

VerificationModule.displayName = 'VerificationModule';

export default VerificationModule;
