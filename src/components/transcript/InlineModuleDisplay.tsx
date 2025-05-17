
import React, { useEffect } from 'react';
import { ModuleConfig } from '@/types/modules';
import ModuleContainer from '../modules/ModuleContainer';
import { handleModuleEvents } from './module-utils/moduleEventHandlers';

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

  const handleModuleComplete = (result: any) => {
    console.log(`Module ${moduleConfig.id} completed with result:`, result);
    
    // Dispatch module events
    handleModuleEvents(moduleConfig, result);
    
    // Call the onComplete callback
    onComplete(result);
  };

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
        onComplete={handleModuleComplete}
        isInline={true} // Explicitly set inline mode
      />
    </div>
  );
};

export default InlineModuleDisplay;
