
import React, { memo, useRef, useEffect, useState } from 'react';
import { ModuleConfig } from '@/types/modules';
import InlineModuleDisplay from './InlineModuleDisplay';
import { useToast } from '@/hooks/use-toast';
import ModuleHeader from './ModuleHeader';
import ModuleConfigDetails from './ModuleConfigDetails';
import CollapsibleDetails from './CollapsibleDetails';
import { dispatchModuleEvents } from '@/utils/moduleEvents';
import { getCompletionToastMessage, getModuleInitialToast } from './module-utils/moduleEventHandlers';

interface MessageInlineModuleProps {
  moduleConfig: ModuleConfig;
  onModuleComplete: (result: any) => void;
}

const MessageInlineModule: React.FC<MessageInlineModuleProps> = ({
  moduleConfig,
  onModuleComplete
}) => {
  const completedRef = useRef(false);
  const [completed, setCompleted] = useState(false);
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const { toast } = useToast();
  
  useEffect(() => {
    // Notify about the inline module being displayed
    const { title, description } = getModuleInitialToast(moduleConfig);
    
    toast({
      title: title,
      description,
      duration: 3000
    });
    
    // Log that the module was displayed for debugging
    console.log(`Inline module ${moduleConfig.id} (${moduleConfig.type}) displayed in transcript`);
  }, [moduleConfig, toast]);
  
  const handleModuleComplete = (result: any) => {
    // Prevent duplicate completions
    if (completedRef.current) {
      console.log(`Module ${moduleConfig.id} already completed, skipping duplicate completion`);
      return;
    }
    
    completedRef.current = true;
    setCompleted(true);
    
    console.log(`Module ${moduleConfig.id} completed with result:`, result);
    
    // Dispatch events based on module type with the module ID and type
    dispatchModuleEvents(moduleConfig.id, moduleConfig.type, result);
    
    // Show completion toast with appropriate message
    const { title, description } = getCompletionToastMessage(moduleConfig.type, result);
    
    toast({
      title: title,
      description: description,
      duration: 2000
    });
    
    // Notify parent component
    onModuleComplete(result);
  };

  // Module header color based on type
  const getHeaderClass = () => {
    if (moduleConfig.type === "INFORMATION_TABLE") {
      return "bg-amber-50 border-amber-200";
    } else if (moduleConfig.type === "INSURANCE_MODEL") {
      return "bg-blue-50 border-blue-200";
    }
    return "bg-amber-50 border-amber-200";
  };
  
  return (
    <div className="ml-auto mt-2 w-full max-w-[85%] transition-all duration-300">
      <div className={`rounded-lg overflow-hidden border ${moduleConfig.type === "INSURANCE_MODEL" ? 'border-blue-200' : 'border-amber-200'} shadow-sm ${getHeaderClass()}`}>
        <ModuleHeader 
          moduleConfig={moduleConfig}
          completed={completed}
        />
        
        <InlineModuleDisplay 
          moduleConfig={{
            ...moduleConfig,
            data: {
              ...moduleConfig.data,
              isInline: true // Ensure inline display is enabled
            }
          }}
          onComplete={handleModuleComplete}
          key={moduleConfig.id} // Add a stable key to prevent unnecessary re-renders
        />
        
        {/* Collapsible Configuration Details Section */}
        <CollapsibleDetails
          label="Configuration Details"
          open={isConfigOpen}
          onOpenChange={setIsConfigOpen}
        >
          <ModuleConfigDetails moduleConfig={moduleConfig} />
        </CollapsibleDetails>
      </div>
    </div>
  );
};

// Use memo to prevent unnecessary re-renders
export default memo(MessageInlineModule);
