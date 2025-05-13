
import React from 'react';
import VerificationField, { VerificationFieldProps } from './VerificationField';

export interface VerificationFieldData {
  id: string;
  label: string;
  type: string;
  value: string;
  expectedValue?: string;
  required: boolean;
  verified?: boolean;
}

interface VerificationFieldsProps {
  fields: VerificationFieldData[];
  isInlineDisplay: boolean;
  isProcessing: boolean;
  onInputChange: (fieldId: string, value: string) => void;
}

const VerificationFields: React.FC<VerificationFieldsProps> = ({
  fields,
  isInlineDisplay,
  isProcessing,
  onInputChange
}) => {
  return (
    <div className={isInlineDisplay ? "grid grid-cols-1 md:grid-cols-2 gap-3" : "space-y-3"}>
      {fields.map(field => (
        <VerificationField
          key={field.id}
          id={field.id}
          label={field.label}
          type={field.type}
          value={field.value}
          expectedValue={field.expectedValue}
          required={field.required}
          verified={field.verified}
          onChange={onInputChange}
          isReadOnly={isInlineDisplay || isProcessing}
        />
      ))}
    </div>
  );
};

export default VerificationFields;
