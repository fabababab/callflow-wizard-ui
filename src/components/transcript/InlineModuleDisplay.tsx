
import React, { useEffect } from 'react';
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
  // Log when the component renders with the module configuration
  useEffect(() => {
    console.log(`InlineModuleDisplay rendering for module: ${moduleConfig.id} (${moduleConfig.type})`, moduleConfig);
  }, [moduleConfig]);

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
        onClose={() => {
          console.log(`Module ${moduleConfig.id} closed without completion`);
          onComplete({ completed: false });
        }}
        onComplete={(result) => {
          console.log(`Module ${moduleConfig.id} completed with result:`, result);
          onComplete(result);
        }}
        isInline={true} // Explicitly set inline mode
      />
    </div>
  );
};

export default InlineModuleDisplay;
