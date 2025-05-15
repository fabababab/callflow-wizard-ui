
import React, { memo, useRef, useEffect, useState } from 'react';
import { ModuleConfig, ModuleType } from '@/types/modules';
import InlineModuleDisplay from './InlineModuleDisplay';
import { useToast } from '@/hooks/use-toast';
import ModuleIcon from './ModuleIcon';
import ModuleHeader from './ModuleHeader';
import ModuleConfigDetails from './ModuleConfigDetails';
import CollapsibleDetails from './CollapsibleDetails';

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
    // Notify about the inline module being displayed with appropriate message based on type
    let description = "Please complete this interactive module";
    
    if (moduleConfig.type === ModuleType.VERIFICATION) {
      description = "Please verify the customer information";
    } else if (moduleConfig.type === ModuleType.CONTRACT) {
      description = "View and manage contract details";
    } else if (moduleConfig.type === ModuleType.INFORMATION) {
      description = "Important customer information available";
    } else if (moduleConfig.type === ModuleType.FRANCHISE) {
      description = "Franchise options and premium information";
    } else if (moduleConfig.type === ModuleType.INFORMATION_TABLE) {
      description = "Please review the franchise table information";
    }
    
    toast({
      title: `${moduleConfig.title}`,
      description,
      duration: 3000
    });
  }, [moduleConfig, toast]);
  
  const handleModuleComplete = (result: any) => {
    // Prevent duplicate completions
    if (completedRef.current) return;
    completedRef.current = true;
    setCompleted(true);
    
    console.log(`Module ${moduleConfig.id} completed with result:`, result);
    
    // Dispatch events based on module type
    dispatchModuleEvents(result);
    
    // Show completion toast
    toast({
      title: "Module Completed",
      description: `${moduleConfig.title} has been completed successfully`,
      duration: 2000
    });
    
    onModuleComplete(result);
  };

  // Dispatch events based on module type
  const dispatchModuleEvents = (result: any) => {
    // Dispatch a generic module completion event
    const event = new CustomEvent('module-complete', {
      detail: { 
        moduleId: moduleConfig.id,
        moduleType: moduleConfig.type,
        result
      }
    });
    window.dispatchEvent(event);
    
    // For verification modules
    if (moduleConfig.type === ModuleType.VERIFICATION && result.verified === true) {
      const verificationEvent = new CustomEvent('verification-successful', {
        detail: { 
          moduleId: moduleConfig.id,
          success: true
        }
      });
      window.dispatchEvent(verificationEvent);
    }
    
    // For contract modules
    if (moduleConfig.type === ModuleType.CONTRACT) {
      const contractEvent = new CustomEvent('contract-module-complete', {
        detail: { 
          moduleId: moduleConfig.id,
          result
        }
      });
      window.dispatchEvent(contractEvent);
    }
    
    // For information modules
    if (moduleConfig.type === ModuleType.INFORMATION || moduleConfig.type === ModuleType.INFORMATION_TABLE) {
      const infoEvent = new CustomEvent('information-module-complete', {
        detail: { 
          moduleId: moduleConfig.id,
          result
        }
      });
      window.dispatchEvent(infoEvent);
    }
    
    // For nachbearbeitung modules
    if (moduleConfig.type === ModuleType.NACHBEARBEITUNG) {
      const nachbearbeitungEvent = new CustomEvent('nachbearbeitung-complete', {
        detail: { 
          moduleId: moduleConfig.id,
          result
        }
      });
      window.dispatchEvent(nachbearbeitungEvent);
    }

    // For franchise modules
    if (moduleConfig.type === ModuleType.FRANCHISE) {
      const franchiseEvent = new CustomEvent('franchise-complete', {
        detail: { 
          moduleId: moduleConfig.id,
          result
        }
      });
      window.dispatchEvent(franchiseEvent);
    }
  };

  // Module header color based on type - make everything amber/yellow
  const getHeaderClass = () => {
    return "bg-amber-50 border-amber-200";
  };
  
  return (
    <div className="ml-auto mt-2 w-full max-w-[85%] transition-all duration-300">
      <div className={`rounded-lg overflow-hidden border border-amber-200 shadow-sm ${getHeaderClass()}`}>
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
