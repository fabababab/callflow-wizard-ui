
import React, { memo } from 'react';
import { ModuleConfig } from '@/types/modules';
import moduleRegistry from './ModuleRegistry';

interface ModuleContainerProps {
  moduleConfig: ModuleConfig | null;
  onClose: () => void;
  onComplete: (result: any) => void;
  currentState?: string;
  stateData?: any;
  isInline?: boolean; // Added explicit prop for inline display
}

const ModuleContainer: React.FC<ModuleContainerProps> = memo(({ 
  moduleConfig,
  onClose,
  onComplete,
  currentState,
  stateData,
  isInline = false // Default to modal display
}) => {
  if (!moduleConfig) return null;
  
  const ModuleComponent = moduleRegistry[moduleConfig.type];
  
  if (!ModuleComponent) {
    console.error(`Module type "${moduleConfig.type}" not found in registry`);
    return null;
  }
  
  // Check if this module should be displayed inline (not in a modal)
  // Either from explicit prop or from module config
  const shouldDisplayInline = isInline || moduleConfig.data?.isInline === true;
  
  console.log(`Rendering module ${moduleConfig.id} - isInline: ${shouldDisplayInline}`);
  
  // If it's inline, just render the component without modal wrapper
  if (shouldDisplayInline) {
    return (
      <div className="w-full mx-auto">
        <ModuleComponent
          id={moduleConfig.id}
          title={moduleConfig.title}
          data={{
            ...moduleConfig.data,
            isInline: true // Force inline mode in the component
          }}
          onClose={onClose}
          onComplete={onComplete}
          currentState={currentState}
          stateData={stateData}
        />
      </div>
    );
  }
  
  // Otherwise render with modal wrapper
  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="w-full max-w-lg mx-auto animate-in fade-in zoom-in duration-300">
        <ModuleComponent
          id={moduleConfig.id}
          title={moduleConfig.title}
          data={moduleConfig.data}
          onClose={onClose}
          onComplete={onComplete}
          currentState={currentState}
          stateData={stateData}
        />
      </div>
    </div>
  );
});

ModuleContainer.displayName = 'ModuleContainer';

export default ModuleContainer;
