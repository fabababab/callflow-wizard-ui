
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
    <div className="ml-2 mt-1 w-full max-w-[85%]">
      <InlineModuleDisplay 
        moduleConfig={moduleConfig}
        onComplete={handleModuleComplete}
      />
    </div>
  );
};

export default MessageInlineModule;
