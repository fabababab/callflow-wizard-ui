
import React, { memo, useRef, useEffect } from 'react';
import { ModuleConfig, ModuleType } from '@/types/modules';
import InlineModuleDisplay from './InlineModuleDisplay';
import { useToast } from '@/hooks/use-toast';

interface MessageInlineModuleProps {
  moduleConfig: ModuleConfig;
  onModuleComplete: (result: any) => void;
}

const MessageInlineModule: React.FC<MessageInlineModuleProps> = ({
  moduleConfig,
  onModuleComplete
}) => {
  const completedRef = useRef(false);
  const { toast } = useToast();
  
  useEffect(() => {
    // Notify about the inline module being displayed (for non-verification types)
    if (moduleConfig.type !== ModuleType.VERIFICATION) {
      toast({
        title: `${moduleConfig.title}`,
        description: "Please complete this interactive module",
        duration: 3000
      });
    }
  }, [moduleConfig, toast]);
  
  const handleModuleComplete = (result: any) => {
    // Prevent duplicate completions
    if (completedRef.current) return;
    completedRef.current = true;
    
    console.log(`Module ${moduleConfig.id} completed with result:`, result);
    
    // Dispatch a generic module completion event
    const event = new CustomEvent('module-complete', {
      detail: { 
        moduleId: moduleConfig.id,
        moduleType: moduleConfig.type,
        result
      }
    });
    window.dispatchEvent(event);
    
    // For verification modules, also dispatch the specific verification event
    if (moduleConfig.type === ModuleType.VERIFICATION && result.verified === true) {
      const verificationEvent = new CustomEvent('verification-successful', {
        detail: { 
          moduleId: moduleConfig.id,
          success: true
        }
      });
      window.dispatchEvent(verificationEvent);
    }
    
    // For other module types, dispatch their specific events
    if (moduleConfig.type === ModuleType.CONTRACT) {
      const contractEvent = new CustomEvent('contract-module-complete', {
        detail: { 
          moduleId: moduleConfig.id,
          result
        }
      });
      window.dispatchEvent(contractEvent);
    }
    
    if (moduleConfig.type === ModuleType.INFORMATION) {
      const infoEvent = new CustomEvent('information-module-complete', {
        detail: { 
          moduleId: moduleConfig.id,
          result
        }
      });
      window.dispatchEvent(infoEvent);
    }
    
    if (moduleConfig.type === ModuleType.NACHBEARBEITUNG) {
      const nachbearbeitungEvent = new CustomEvent('nachbearbeitung-complete', {
        detail: { 
          moduleId: moduleConfig.id,
          result
        }
      });
      window.dispatchEvent(nachbearbeitungEvent);
    }
    
    onModuleComplete(result);
  };
  
  return (
    <div className="ml-auto mt-2 w-full max-w-[85%] transition-all duration-300">
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
