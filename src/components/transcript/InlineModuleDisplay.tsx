
import React from 'react';
import { ModuleConfig } from '@/types/modules';
import ModuleContainer from '../modules/ModuleContainer';

interface InlineModuleDisplayProps {
  moduleConfig: ModuleConfig;
  onComplete: (result: any) => void;
}

const InlineModuleDisplay: React.FC<InlineModuleDisplayProps> = ({
  moduleConfig,
  onComplete
}) => {
  return (
    <div className="w-full">
      <ModuleContainer
        moduleConfig={{
          ...moduleConfig,
          data: {
            ...moduleConfig.data,
            isInline: true // Force inline mode for all modules here
          }
        }}
        onClose={() => onComplete({ completed: false })}
        onComplete={onComplete}
        isInline={true} // Explicitly set inline mode
      />
    </div>
  );
};

export default InlineModuleDisplay;
