
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CheckCircle } from 'lucide-react';

export interface VerificationFieldProps {
  id: string;
  label: string;
  type: string;
  value: string;
  expectedValue?: string;
  required: boolean;
  verified?: boolean;
  onChange: (fieldId: string, value: string) => void;
  isReadOnly: boolean;
}

const VerificationField: React.FC<VerificationFieldProps> = ({
  id,
  label,
  type,
  value,
  verified,
  onChange,
  isReadOnly
}) => {
  return (
    <div className="space-y-1">
      <div className="flex justify-between">
        <Label htmlFor={id} className="text-xs">{label}</Label>
        {verified !== undefined && (
          <Badge variant="default" className="text-xs py-0 h-5">
            <CheckCircle size={12} className="mr-1" />
            Verified
          </Badge>
        )}
      </div>
      <Input
        id={id}
        type={type}
        value={value || ''}
        onChange={(e) => onChange(id, e.target.value)}
        className="text-xs h-7" 
        readOnly={isReadOnly}
      />
    </div>
  );
};

export default VerificationField;
