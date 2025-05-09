import React from 'react';
import { ModuleConfig } from '@/types/modules';
import moduleRegistry from './ModuleRegistry';

interface ModuleContainerProps {
  moduleConfig: ModuleConfig | null;
  onClose: () => void;
  onComplete: (result: any) => void;
  currentState?: string;
  stateData?: any;
}

const ModuleContainer: React.FC<ModuleContainerProps> = ({ 
  moduleConfig,
  onClose,
  onComplete,
  currentState,
  stateData
}) => {
  if (!moduleConfig) return null;
  
  const moduleRegistryItem = moduleRegistry[moduleConfig.type];
  
  if (!moduleRegistryItem) {
    console.error(`Module type "${moduleConfig.type}" not found in registry`);
    return null;
  }
  
  const ModuleComponent = moduleRegistryItem.component;
  
  // Check if this module should be displayed inline (not in a modal)
  const isInlineDisplay = moduleConfig.data?.isInline === true;
  
  console.log(`Rendering module ${moduleConfig.id} - isInline: ${isInlineDisplay}`);
  
  // If it's inline, just render the component without modal wrapper
  if (isInlineDisplay) {
    return (
      <div className="w-full mx-auto">
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
};

export default ModuleContainer;
