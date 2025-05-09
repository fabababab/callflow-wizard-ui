
import React, { useState, useEffect, useRef } from 'react';
import { ModuleProps } from '@/types/modules';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, CheckCircle, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface VerificationField {
  id: string;
  label: string;
  type: string;
  value: string;
  expectedValue?: string;
  required: boolean;
  verified?: boolean;
}

const VerificationModule: React.FC<ModuleProps> = ({ 
  id, 
  title, 
  data, 
  onClose, 
  onComplete 
}) => {
  const fields = data?.fields || [];
  const [verificationFields, setVerificationFields] = useState<VerificationField[]>(fields);
  const [verificationStatus, setVerificationStatus] = useState<'pending' | 'success' | 'failed'>('pending');
  const isInlineDisplay = data?.isInline === true;
  const initialRenderRef = useRef(true);
  const completeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  useEffect(() => {
    console.log(`VerificationModule rendered - id: ${id}, isInline: ${isInlineDisplay}`);
    // Only log on first render to reduce console noise
    initialRenderRef.current = false;
    
    return () => {
      if (completeTimeoutRef.current) {
        clearTimeout(completeTimeoutRef.current);
      }
    };
  }, [id, isInlineDisplay]);
  
  const handleInputChange = (fieldId: string, value: string) => {
    setVerificationFields(prev => 
      prev.map(field => 
        field.id === fieldId 
          ? { ...field, value, verified: field.expectedValue === value } 
          : field
      )
    );
  };
  
  const handleVerify = () => {
    const allVerified = verificationFields.every(field => 
      !field.required || (field.expectedValue ? field.value === field.expectedValue : field.value)
    );
    
    setVerificationStatus(allVerified ? 'success' : 'failed');
    
    // Add a slight delay to show the success/failure state before completing
    completeTimeoutRef.current = setTimeout(() => {
      if (onComplete) {
        console.log(`VerificationModule ${id} completed with result:`, { verified: allVerified });
        onComplete({
          verified: allVerified,
          fields: verificationFields.map(f => ({
            id: f.id,
            value: f.value,
            verified: f.expectedValue ? f.value === f.expectedValue : true
          }))
        });
        
        // If verification was successful and this is inline, trigger flow continuation
        if (allVerified && isInlineDisplay) {
          console.log("Verification successful, continuing flow...");
          // Dispatch an event to continue the flow
          const event = new CustomEvent('verification-successful', {
            detail: { moduleId: id }
          });
          window.dispatchEvent(event);
        }
      }
    }, 1000);
  };
  
  // Use different styling for inline vs modal display
  const cardClassName = isInlineDisplay
    ? "w-full ml-auto border-l-4 border-amber-300 border-r border-t border-b border-amber-200 shadow-sm rounded-md bg-amber-50/60"
    : "w-full max-w-md border border-amber-200 shadow-md";
  
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
          <div className="bg-green-50 p-2 rounded-md flex items-center gap-2 text-green-700 text-sm mb-3">
            <CheckCircle className="h-4 w-4" />
            <span>Verification successful</span>
          </div>
        )}
        
        {verificationStatus === 'failed' && (
          <div className="bg-red-50 p-2 rounded-md flex items-center gap-2 text-red-700 text-sm mb-3">
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
                {field.verified !== undefined && (
                  <Badge variant={field.verified ? "default" : "destructive"} className="text-xs py-0 h-5">
                    {field.verified ? "Verified" : "Failed"}
                  </Badge>
                )}
              </div>
              <Input
                id={field.id}
                type={field.type}
                value={field.value || ''}
                onChange={(e) => handleInputChange(field.id, e.target.value)}
                className={`${field.verified === false ? "border-red-300" : ""} text-xs h-7 ${isInlineDisplay ? "border-amber-200 bg-amber-50/30" : ""}`}
                readOnly={isInlineDisplay} // Make fields readonly for inline display
              />
            </div>
          ))}
        </div>
      </CardContent>
      
      <CardFooter className={`flex justify-between ${isInlineDisplay ? "py-2 bg-transparent border-t border-amber-100/50" : "bg-gray-50 border-t py-2"}`}>
        {!isInlineDisplay && (
          <Button 
            variant="outline" 
            size="sm"
            onClick={onClose}
            className="text-xs"
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
          >
            Verify Identity
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default React.memo(VerificationModule);
