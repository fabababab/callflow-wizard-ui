
import React, { memo, useRef, useEffect, useState } from 'react';
import { ModuleConfig, ModuleType } from '@/types/modules';
import InlineModuleDisplay from './InlineModuleDisplay';
import { useToast } from '@/hooks/use-toast';
import { Shield, Calculator, FileText, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
  const { toast } = useToast();
  
  // Get appropriate icon based on module type
  const getModuleIcon = () => {
    switch(moduleConfig.type) {
      case ModuleType.VERIFICATION:
        return <Shield className="h-4 w-4 text-amber-600" />;
      case ModuleType.INFORMATION:
        return <Info className="h-4 w-4 text-amber-600" />;
      case ModuleType.CONTRACT:
        return <FileText className="h-4 w-4 text-amber-600" />;
      default:
        return <Info className="h-4 w-4 text-amber-600" />;
    }
  };
  
  useEffect(() => {
    // Notify about the inline module being displayed with appropriate message based on type
    let description = "Please complete this interactive module";
    
    if (moduleConfig.type === ModuleType.VERIFICATION) {
      description = "Please verify the customer information";
    } else if (moduleConfig.type === ModuleType.CONTRACT) {
      description = "View and manage contract details";
    } else if (moduleConfig.type === ModuleType.INFORMATION) {
      description = "Important customer information available";
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
    
    // Show completion toast
    toast({
      title: "Module Completed",
      description: `${moduleConfig.title} has been completed successfully`,
      duration: 2000
    });
    
    onModuleComplete(result);
  };

  // Module header color based on type - make everything amber/yellow
  const getHeaderClass = () => {
    return "bg-amber-50 border-amber-200";
  };
  
  return (
    <div className="ml-auto mt-2 w-full max-w-[85%] transition-all duration-300">
      <div className={`rounded-lg overflow-hidden border border-amber-200 shadow-sm ${getHeaderClass()}`}>
        <div className="p-2 border-b border-amber-200 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            {getModuleIcon()}
            <span className="font-medium text-sm text-amber-700">{moduleConfig.title}</span>
          </div>
          {completed && (
            <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
              Completed
            </span>
          )}
        </div>
        
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
      </div>
    </div>
  );
};

// Use memo to prevent unnecessary re-renders
export default memo(MessageInlineModule);
