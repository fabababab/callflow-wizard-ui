
import React from 'react';
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
    <div className="w-full mx-auto mt-2" data-testid="inline-module-display">
      <React.Suspense fallback={<div className="p-4 text-center">Loading verification module...</div>}>
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

export default InlineModuleDisplay;
