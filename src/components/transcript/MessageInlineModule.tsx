
import React from 'react';
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
    <div className="ml-4 mt-2 w-full max-w-md">
      <InlineModuleDisplay 
        moduleConfig={moduleConfig}
        onComplete={handleModuleComplete}
      />
    </div>
  );
};

export default MessageInlineModule;
