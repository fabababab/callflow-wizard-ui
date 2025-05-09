
import React, { useState } from 'react';
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
  const isInlineDisplay = data?.isInline === true || true; // Default to inline display
  
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
    
    if (onComplete) {
      onComplete({
        verified: allVerified,
        fields: verificationFields.map(f => ({
          id: f.id,
          value: f.value,
          verified: f.expectedValue ? f.value === f.expectedValue : true
        }))
      });
    }
  };
  
  // Use different styling for inline vs modal display
  const cardClassName = isInlineDisplay
    ? "w-full border border-amber-200 shadow-sm my-4 bg-white"
    : "w-full max-w-md border border-amber-200 shadow-md";
  
  return (
    <Card className={cardClassName}>
      <CardHeader className="bg-amber-50 border-b border-amber-100 py-3">
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-amber-600" />
          <CardTitle className="text-amber-900 text-base">{title || 'Identity Verification'}</CardTitle>
        </div>
        <CardDescription className="text-xs">
          Please verify the following information to continue
        </CardDescription>
      </CardHeader>
      
      <CardContent className="pt-4 space-y-3">
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
        
        {verificationFields.map(field => (
          <div key={field.id} className="space-y-1.5">
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
              className={field.verified === false ? "border-red-300 text-sm h-8" : "text-sm h-8"}
            />
          </div>
        ))}
      </CardContent>
      
      <CardFooter className="flex justify-between bg-gray-50 border-t py-2">
        <Button 
          variant="outline" 
          size="sm"
          onClick={onClose}
          className="text-xs"
        >
          Cancel
        </Button>
        <Button 
          size="sm"
          onClick={handleVerify}
          className="text-xs"
        >
          Verify
        </Button>
      </CardFooter>
    </Card>
  );
};

export default VerificationModule;
