
import React, { useState, useEffect, useRef, memo } from 'react';
import { ModuleProps } from '@/types/modules';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, CheckCircle, AlertCircle, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

interface VerificationField {
  id: string;
  label: string;
  type: string;
  value: string;
  system?: string;
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
      // Pre-populate with system value if available
      value: field.system || field.expectedValue || field.value,
      verified: undefined // Initially set to undefined (not verified)
    }))
  );
  const [verificationStatus, setVerificationStatus] = useState<'pending' | 'success' | 'failed'>('success');
  const isInlineDisplay = data?.isInline === true;
  const completeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const processingRef = useRef(false);
  const hasShownToastRef = useRef(false);
  const hasDispatchedEventRef = useRef(false);
  const { toast } = useToast();
  
  // Clear timeouts on unmount
  useEffect(() => {
    return () => {
      if (completeTimeoutRef.current) {
        clearTimeout(completeTimeoutRef.current);
      }
    };
  }, []);
  
  const handleInputChange = (fieldId: string, value: string) => {
    if (processingRef.current) return;
    
    setVerificationFields(prev => 
      prev.map(field => 
        field.id === fieldId 
          ? { ...field, value, verified: undefined } 
          : field
      )
    );
  };
  
  // Auto validate on mount
  useEffect(() => {
    if (!processingRef.current) {
      processingRef.current = true;
      
      // Set verification status to success immediately
      setVerificationStatus('success');
      
      // Update all fields verification status to true
      setVerificationFields(prev => 
        prev.map(field => ({
          ...field,
          verified: true
        }))
      );
      
      // Complete the verification after a short delay
      completeTimeoutRef.current = setTimeout(() => {
        if (onComplete && !hasDispatchedEventRef.current) {
          console.log(`VerificationModule ${id} completed with automatic success`);
          onComplete({
            verified: true,
            fields: verificationFields.map(f => ({
              id: f.id,
              value: f.value,
              verified: true
            }))
          });
          
          // Mark that we've dispatched the event to prevent duplicates
          hasDispatchedEventRef.current = true;
          
          // Dispatch a custom event to trigger state transition after verification
          const event = new CustomEvent('verification-complete', {
            detail: { 
              success: true, 
              moduleId: id,
              triggerNextState: 'customer_issue',
              message: "Können sie mir bitte ihr Geburtsdatum und Postleitzahl nennen?",
              responseOptions: ["Vielen Dank. Wie kann ich Ihnen weiterhelfen?"]
            }
          });
          window.dispatchEvent(event);
        }
      }, 1000);
    }
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
          Please verify the following information to continue
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
            <span>Verification failed. Please check your information.</span>
          </div>
        )}
        
        {/* For inline display, use a grid layout for fields */}
        <div className={isInlineDisplay ? "grid grid-cols-1 md:grid-cols-2 gap-3" : "space-y-3"}>
          {verificationFields.map(field => (
            <div key={field.id} className="space-y-1">
              <div className="flex justify-between">
                <Label htmlFor={field.id} className="text-xs">{field.label}</Label>
                {field.verified === true && (
                  <Badge variant="default" className="text-xs py-0 h-5">
                    <CheckCircle size={12} className="mr-1" />
                    Verified
                  </Badge>
                )}
                {field.verified === false && (
                  <Badge variant="destructive" className="text-xs py-0 h-5">
                    <X size={12} className="mr-1" />
                    Invalid
                  </Badge>
                )}
              </div>
              <div className="relative">
                <Input
                  id={field.id}
                  type={field.type}
                  value={field.value || ''}
                  onChange={(e) => handleInputChange(field.id, e.target.value)}
                  className={`text-xs h-7 ${isInlineDisplay ? "border-amber-200 bg-amber-50/30" : ""}`}
                  readOnly={isInlineDisplay || processingRef.current} // Make fields readonly for inline display
                />
                {field.system && (
                  <div className="mt-1 text-xs text-blue-600">
                    System value: {field.system}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
      
      <CardFooter className={`flex justify-between ${isInlineDisplay ? "py-2 bg-transparent border-t border-amber-100/50" : "bg-gray-50 border-t py-2"}`}>
        {/* Buttons have been removed as requested */}
      </CardFooter>
    </Card>
  );
});

VerificationModule.displayName = 'VerificationModule';

export default VerificationModule;
