import React from 'react';
import { Shield } from 'lucide-react';
import ValidationField from './ValidationField';
import { SensitiveField, ValidationStatus } from '@/data/scenarioData';

interface SensitiveDataSectionProps {
  sensitiveData: SensitiveField[];
  onValidate: (fieldId: string, status: ValidationStatus, notes?: string) => void;
}

const SensitiveDataSection: React.FC<SensitiveDataSectionProps> = ({ sensitiveData, onValidate }) => {
  if (!sensitiveData || sensitiveData.length === 0) {
    return null;
  }

  // Group fields by type to avoid duplication in the UI
  const groupedFields: { [key: string]: SensitiveField } = {};
  sensitiveData.forEach(field => {
    // Only keep the first occurrence of each field type to avoid duplication
    if (!groupedFields[field.type]) {
      groupedFields[field.type] = field;
    }
  });

  const uniqueFields = Object.values(groupedFields);

  return (
    <div className="mt-3 pt-2 border-t border-gray-300/20">
      <div className="text-xs font-medium flex items-center gap-1 mb-2">
        <Shield size={12} />
        <span>Sensitive Data Detected</span>
      </div>
      <div className="space-y-2">
        {uniqueFields.map((field) => (
          <ValidationField 
            key={field.id} 
            field={field} 
            onValidate={(status, notes) => onValidate(field.id, status, notes)} 
          />
        ))}
      </div>
    </div>
  );
};

export default SensitiveDataSection;
