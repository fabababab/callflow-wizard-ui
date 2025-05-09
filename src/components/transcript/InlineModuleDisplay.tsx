
import React, { memo } from 'react';
import { ModuleConfig } from '@/types/modules';

interface InlineModuleDisplayProps {
  moduleConfig: ModuleConfig;
  onComplete: (result: any) => void;
}

const InlineModuleDisplay: React.FC<InlineModuleDisplayProps> = ({ moduleConfig, onComplete }) => {
  console.log(`InlineModuleDisplay rendering module ${moduleConfig.id}`);
  
  // Import the component dynamically to avoid circular dependencies
  const ModuleComponent = React.lazy(() => import('../modules/ModuleContainer'));

  return (
    <div 
      className="w-full ml-auto rounded-md overflow-hidden" 
      data-testid="inline-module-display"
    >
      <React.Suspense fallback={<div className="p-3 text-center text-xs text-amber-700">Loading verification module...</div>}>
        <ModuleComponent
          moduleConfig={{
            ...moduleConfig,
            data: { ...(moduleConfig.data || {}), isInline: true }
          }}
          onClose={() => {
            console.log("Inline module closed");
            onComplete({ cancelled: true });
          }}
          onComplete={onComplete}
        />
      </React.Suspense>
    </div>
  );
};

// Use memo to prevent unnecessary re-renders
export default memo(InlineModuleDisplay);
