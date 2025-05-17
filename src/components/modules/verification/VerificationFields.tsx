
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, X } from 'lucide-react';

export interface VerificationField {
  id: string;
  label: string;
  type: string;
  value: string;
  expectedValue?: string;
  required: boolean;
  verified?: boolean;
}

interface VerificationFieldsProps {
  fields: VerificationField[];
  isInlineDisplay: boolean;
  isReadOnly: boolean;
  onInputChange: (fieldId: string, value: string) => void;
}

const VerificationFields: React.FC<VerificationFieldsProps> = ({
  fields,
  isInlineDisplay,
  isReadOnly,
  onInputChange
}) => {
  return (
    <div className={isInlineDisplay ? "grid grid-cols-1 md:grid-cols-2 gap-3" : "space-y-3"}>
      {fields.map(field => (
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
          <Input
            id={field.id}
            type={field.type}
            value={field.value || ''}
            onChange={(e) => onInputChange(field.id, e.target.value)}
            className={`text-xs h-7 ${isInlineDisplay ? "border-amber-200 bg-amber-50/30" : ""}`}
            readOnly={isInlineDisplay || isReadOnly}
          />
        </div>
      ))}
    </div>
  );
};

export default VerificationFields;
