
import React from 'react';
import { ModuleConfig } from '@/types/modules';
import ModuleContainer from '../modules/ModuleContainer';

interface InlineModuleDisplayProps {
  moduleConfig: ModuleConfig;
  onComplete: (result: any) => void;
}

const InlineModuleDisplay: React.FC<InlineModuleDisplayProps> = ({ moduleConfig, onComplete }) => {
  const handleModuleClose = () => {
    // Just log for now, might need additional handling
    console.log("Module closed");
  };

  return (
    <div className="w-full max-w-md mx-auto mt-2">
      <ModuleContainer
        moduleConfig={{
          ...moduleConfig,
          data: { ...(moduleConfig.data || {}), isInline: true }
        }}
        onClose={handleModuleClose}
        onComplete={onComplete}
        currentState=""
        stateData={null}
      />
    </div>
  );
};

export default InlineModuleDisplay;
