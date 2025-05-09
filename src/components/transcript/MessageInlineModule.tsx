
import React, { memo } from 'react';
import { ModuleConfig } from '@/types/modules';
import InlineModuleDisplay from './InlineModuleDisplay';

interface MessageInlineModuleProps {
  moduleConfig: ModuleConfig;
  onModuleComplete: (result: any) => void;
}

const MessageInlineModule: React.FC<MessageInlineModuleProps> = ({
  moduleConfig,
  onModuleComplete
}) => {
  const handleModuleComplete = (result: any) => {
    onModuleComplete(result);
  };
  
  return (
    <div className="ml-auto mt-2 w-full max-w-[85%]">
      <InlineModuleDisplay 
        moduleConfig={moduleConfig}
        onComplete={handleModuleComplete}
        key={moduleConfig.id} // Add a stable key to prevent unnecessary re-renders
      />
    </div>
  );
};

// Use memo to prevent unnecessary re-renders
export default memo(MessageInlineModule);
