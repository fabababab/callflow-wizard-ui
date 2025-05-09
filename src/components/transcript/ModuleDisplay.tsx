
import React from 'react';
import ModuleContainer from '@/components/modules/ModuleContainer';
import { ModuleConfig } from '@/types/modules';

interface ModuleDisplayProps {
  activeModule: ModuleConfig | null;
  currentState?: string;
  stateData?: any;
  onModuleComplete: (result: any) => void;
  completeModule: (result: any) => void;
}

const ModuleDisplay: React.FC<ModuleDisplayProps> = ({
  activeModule,
  currentState,
  stateData,
  onModuleComplete,
  completeModule
}) => {
  if (!activeModule) return null;
  
  return (
    <div className="mt-4 border rounded-lg overflow-hidden">
      <ModuleContainer
        moduleConfig={activeModule}
        onClose={() => completeModule({ cancelled: true })}
        onComplete={onModuleComplete}
        currentState={currentState}
        stateData={stateData}
      />
    </div>
  );
};

export default ModuleDisplay;
