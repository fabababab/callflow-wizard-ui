
import React, { useState, useEffect, useRef, memo } from 'react';
import { ModuleProps } from '@/types/modules';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, CheckCircle, AlertCircle, XCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

interface VerificationField {
  id: string;
  label: string;
  type: string;
  value: string;
  expectedValue?: string;
  required: boolean;
  verified?: boolean;
}

const VerificationModule: React.FC<ModuleProps> = memo(({ 
  id, 
  title, 
  data, 
  onClose, 
  onComplete 
}) => {
  const fields = data?.fields || [];
  const [verificationFields, setVerificationFields] = useState<VerificationField[]>(
    fields.map(field => ({
      ...field,
      // Initially set value to expected value if provided
      value: field.expectedValue || field.value,
      verified: false
    }))
  );
  const [verificationStatus, setVerificationStatus] = useState<'pending' | 'success' | 'failed'>('pending');
  const isInlineDisplay = data?.isInline === true;
  const completeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const processingRef = useRef(false);
  const { toast } = useToast();
  
  const handleInputChange = (fieldId: string, value: string) => {
    if (processingRef.current) return;
    
    setVerificationFields(prev => 
      prev.map(field => 
        field.id === fieldId 
          ? { ...field, value } 
          : field
      )
    );
  };
  
  const handleValidVerification = () => {
    if (processingRef.current) return;
    processingRef.current = true;
    
    console.log("Processing valid verification");
    setVerificationStatus('success');
    
    // Mark all fields as verified
    setVerificationFields(prev => 
      prev.map(field => ({ ...field, verified: true }))
    );
    
    // Add a slight delay to show the success state before completing
    completeTimeoutRef.current = setTimeout(() => {
      if (onComplete) {
        console.log(`VerificationModule ${id} completed with success`);
        onComplete({
          verified: true,
          fields: verificationFields.map(f => ({
            id: f.id,
            value: f.value,
            verified: true
          }))
        });
        
        // Dispatch event for state transition
        const event = new CustomEvent('verification-complete', {
          detail: { success: true, moduleId: id }
        });
        window.dispatchEvent(event);
      }
      
      // Reset processing state
      setTimeout(() => {
        processingRef.current = false;
      }, 500);
    }, 1000);
  };
  
  const handleInvalidVerification = () => {
    if (processingRef.current) return;
    processingRef.current = true;
    
    console.log("Processing invalid verification");
    setVerificationStatus('failed');
    
    // Mark all fields as not verified
    setVerificationFields(prev => 
      prev.map(field => ({ ...field, verified: false }))
    );
    
    // Add a slight delay to show the failed state before completing
    completeTimeoutRef.current = setTimeout(() => {
      if (onComplete) {
        console.log(`VerificationModule ${id} completed with failure`);
        onComplete({
          verified: false,
          fields: verificationFields.map(f => ({
            id: f.id,
            value: f.value,
            verified: false
          }))
        });
        
        // Dispatch event for state transition - still move forward
        const event = new CustomEvent('verification-complete', {
          detail: { success: false, moduleId: id }
        });
        window.dispatchEvent(event);
      }
      
      // Reset processing state
      setTimeout(() => {
        processingRef.current = false;
      }, 500);
    }, 1000);
  };
  
  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (completeTimeoutRef.current) {
        clearTimeout(completeTimeoutRef.current);
      }
    };
  }, []);
  
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
          Bitte überprüfen Sie die Kundeninformation
        </CardDescription>
      </CardHeader>
      
      <CardContent className={`${isInlineDisplay ? "pt-2" : "pt-4"} space-y-3`}>
        {verificationStatus === 'success' && (
          <div className="bg-green-50 p-2 rounded-md flex items-center gap-2 text-green-700 text-sm mb-3 transition-opacity duration-300">
            <CheckCircle className="h-4 w-4" />
            <span>Verification successful</span>
          </div>
        )}
        
        {verificationStatus === 'failed' && (
          <div className="bg-red-50 p-2 rounded-md flex items-center gap-2 text-red-700 text-sm mb-3 transition-opacity duration-300">
            <AlertCircle className="h-4 w-4" />
            <span>Verification failed</span>
          </div>
        )}
        
        {/* Fields display */}
        <div className={isInlineDisplay ? "grid grid-cols-1 md:grid-cols-2 gap-3" : "space-y-3"}>
          {verificationFields.map(field => (
            <div key={field.id} className="space-y-1">
              <div className="flex justify-between">
                <Label htmlFor={field.id} className="text-xs">{field.label}</Label>
                {field.verified !== undefined && verificationStatus === 'success' && (
                  <Badge variant="default" className="text-xs py-0 h-5">
                    <CheckCircle size={12} className="mr-1" />
                    Verified
                  </Badge>
                )}
              </div>
              <Input
                id={field.id}
                type={field.type}
                value={field.value || ''}
                onChange={(e) => handleInputChange(field.id, e.target.value)}
                className={`text-xs h-7 ${isInlineDisplay ? "border-amber-200 bg-amber-50/30" : ""}`}
              />
            </div>
          ))}
        </div>
      </CardContent>
      
      <CardFooter className={`flex justify-end gap-2 ${isInlineDisplay ? "py-2 bg-transparent border-t border-amber-100/50" : "bg-gray-50 border-t py-2"}`}>
        {/* Explicit Valid and Invalid buttons - both should activate the next state */}
        <Button 
          size="sm"
          onClick={handleInvalidVerification}
          className="text-xs bg-red-500 hover:bg-red-600 text-white"
          disabled={processingRef.current}
        >
          <XCircle size={14} className="mr-1" />
          Invalid
        </Button>
        
        <Button 
          size="sm"
          onClick={handleValidVerification}
          className="text-xs bg-green-500 hover:bg-green-600 text-white"
          disabled={processingRef.current}
        >
          <CheckCircle size={14} className="mr-1" />
          Valid
        </Button>
      </CardFooter>
    </Card>
  );
});

VerificationModule.displayName = 'VerificationModule';

export default VerificationModule;
