
import React from 'react';
import { Shield } from 'lucide-react';
import { SensitiveField, ValidationStatus } from '@/data/scenarioData';
import InlineChatVerification from './InlineChatVerification';

interface SensitiveDataSectionProps {
  sensitiveData: SensitiveField[];
  onValidate: (fieldId: string, status: ValidationStatus, notes?: string) => void;
}

const SensitiveDataSection: React.FC<SensitiveDataSectionProps> = ({ sensitiveData, onValidate }) => {
  if (!sensitiveData || sensitiveData.length === 0) {
    return null;
  }

  return (
    <div className="mt-3 pt-2 border-t border-gray-300/20">
      <div className="text-xs font-medium flex items-center gap-1 mb-2">
        <Shield size={12} />
        <span>Sensitive Data Detected</span>
      </div>
      <div className="space-y-2">
        <InlineChatVerification 
          onVerify={(verified) => {
            // When verified, validate all fields as valid
            if (verified) {
              sensitiveData.forEach(field => {
                onValidate(field.id, 'valid');
              });
            }
          }}
          isVerifying={false}
          isVerified={sensitiveData.every(field => field.status === 'valid')}
        />
      </div>
    </div>
  );
};

export default SensitiveDataSection;
