
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
  const isInlineDisplay = data?.isInline === true;
  
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
    ? "w-full border border-amber-200 shadow-sm my-4"
    : "w-full max-w-md border border-amber-200 shadow-md";
  
  return (
    <Card className={cardClassName}>
      <CardHeader className="bg-amber-50 border-b border-amber-100">
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-amber-600" />
          <CardTitle className="text-amber-900">{title || 'Identity Verification'}</CardTitle>
        </div>
        <CardDescription>
          Please verify the following information to continue
        </CardDescription>
      </CardHeader>
      
      <CardContent className="pt-6 space-y-4">
        {verificationStatus === 'success' && (
          <div className="bg-green-50 p-3 rounded-md flex items-center gap-2 text-green-700 mb-4">
            <CheckCircle className="h-5 w-5" />
            <span>Verification successful</span>
          </div>
        )}
        
        {verificationStatus === 'failed' && (
          <div className="bg-red-50 p-3 rounded-md flex items-center gap-2 text-red-700 mb-4">
            <AlertCircle className="h-5 w-5" />
            <span>Verification failed. Please check your information and try again.</span>
          </div>
        )}
        
        {verificationFields.map(field => (
          <div key={field.id} className="space-y-2">
            <div className="flex justify-between">
              <Label htmlFor={field.id}>{field.label}</Label>
              {field.verified !== undefined && (
                <Badge variant={field.verified ? "default" : "destructive"}>
                  {field.verified ? "Verified" : "Failed"}
                </Badge>
              )}
            </div>
            <Input
              id={field.id}
              type={field.type}
              value={field.value || ''}
              onChange={(e) => handleInputChange(field.id, e.target.value)}
              className={field.verified === false ? "border-red-300" : ""}
            />
          </div>
        ))}
      </CardContent>
      
      <CardFooter className="flex justify-between bg-gray-50 border-t">
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={handleVerify}>
          Verify
        </Button>
      </CardFooter>
    </Card>
  );
};

export default VerificationModule;
