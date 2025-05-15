
import React, { memo, useRef, useEffect, useState } from 'react';
import { ModuleConfig, ModuleType } from '@/types/modules';
import InlineModuleDisplay from './InlineModuleDisplay';
import { useToast } from '@/hooks/use-toast';
import { Shield, Calculator, FileText, Info, ChevronDown, ChevronUp, BarChart, Table } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

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
  
  // Get appropriate icon based on module type
  const getModuleIcon = () => {
    switch(moduleConfig.type) {
      case ModuleType.VERIFICATION:
        return <Shield className="h-4 w-4 text-amber-600" />;
      case ModuleType.INFORMATION:
        return <Info className="h-4 w-4 text-amber-600" />;
      case ModuleType.CONTRACT:
        return <FileText className="h-4 w-4 text-amber-600" />;
      case ModuleType.FRANCHISE:
        return <BarChart className="h-4 w-4 text-amber-600" />;
      case ModuleType.INFORMATION_TABLE:
        return <Table className="h-4 w-4 text-amber-600" />;
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
    
    if (moduleConfig.type === ModuleType.INFORMATION || moduleConfig.type === ModuleType.INFORMATION_TABLE) {
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

    if (moduleConfig.type === ModuleType.FRANCHISE) {
      const franchiseEvent = new CustomEvent('franchise-complete', {
        detail: { 
          moduleId: moduleConfig.id,
          result
        }
      });
      window.dispatchEvent(franchiseEvent);
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
  
  // Format configuration data for display
  const formatConfigValue = (value: any): string => {
    if (value === null || value === undefined) return 'Not set';
    if (typeof value === 'object') return JSON.stringify(value, null, 2);
    return String(value);
  };
  
  // Format array or nested objects for better display
  const formatComplexValue = (value: any) => {
    if (Array.isArray(value)) {
      return (
        <div className="mt-1 text-xs">
          {value.map((item, i) => (
            <div key={i} className="p-1 mb-1 bg-amber-50/50 rounded border border-amber-100">
              {typeof item === 'object' ? (
                Object.entries(item).map(([key, val]) => (
                  <div key={key} className="grid grid-cols-[30%,70%] gap-1 mb-1">
                    <div className="font-medium text-amber-700">{key}:</div>
                    <div className="text-gray-700 break-all">
                      {typeof val === 'object' ? JSON.stringify(val) : String(val)}
                    </div>
                  </div>
                ))
              ) : (
                String(item)
              )}
            </div>
          ))}
        </div>
      );
    } else if (typeof value === 'object' && value !== null) {
      return (
        <div className="mt-1 text-xs space-y-1">
          {Object.entries(value).map(([key, val]) => (
            <div key={key} className="grid grid-cols-[30%,70%] gap-1">
              <div className="font-medium text-amber-700">{key}:</div>
              <div className="text-gray-700 break-all">
                {typeof val === 'object' ? (
                  <pre className="whitespace-pre-wrap text-[10px] bg-white p-1 rounded border border-amber-100">
                    {JSON.stringify(val, null, 2)}
                  </pre>
                ) : (
                  String(val)
                )}
              </div>
            </div>
          ))}
        </div>
      );
    }
    return String(value);
  };
  
  // Render configuration details in a readable format
  const renderConfigDetails = () => {
    if (!moduleConfig.data) return <p className="text-xs text-gray-500">No configuration data available</p>;
    
    // Extract keys but filter out any keys we don't want to show
    const keysToExclude = ['isInline'];
    const configKeys = Object.keys(moduleConfig.data).filter(key => !keysToExclude.includes(key));
    
    if (configKeys.length === 0) return <p className="text-xs text-gray-500">No configuration data available</p>;
    
    return (
      <div className="text-xs space-y-1 bg-amber-50/50 p-2 rounded-md">
        {configKeys.map(key => (
          <div key={key} className="mb-2 pb-2 border-b border-amber-100 last:border-0">
            <div className="font-medium text-amber-700 mb-1">{key}:</div>
            <div className="text-gray-700 break-words pl-2">
              {typeof moduleConfig.data[key] === 'object' ? (
                formatComplexValue(moduleConfig.data[key])
              ) : (
                formatConfigValue(moduleConfig.data[key])
              )}
            </div>
          </div>
        ))}
        <div className="grid grid-cols-[1fr,2fr] gap-2">
          <div className="font-medium text-amber-700">moduleType:</div>
          <div className="text-gray-700">{moduleConfig.type}</div>
        </div>
        <div className="grid grid-cols-[1fr,2fr] gap-2">
          <div className="font-medium text-amber-700">moduleId:</div>
          <div className="text-gray-700">{moduleConfig.id}</div>
        </div>
      </div>
    );
  };
  
  return (
    <div className="ml-auto mt-2 w-full max-w-[85%] transition-all duration-300">
      <div className={`rounded-lg overflow-hidden border border-amber-200 shadow-sm ${getHeaderClass()}`}>
        <div className="p-2 border-b border-amber-200 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            {getModuleIcon()}
            <span className="font-medium text-sm text-amber-700">{moduleConfig.title}</span>
          </div>
          <div className="flex items-center gap-1">
            {completed && (
              <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
                Completed
              </span>
            )}
          </div>
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
        
        {/* Collapsible Configuration Details Section - Always visible now */}
        <Collapsible 
          open={isConfigOpen} 
          onOpenChange={setIsConfigOpen}
          className="border-t border-amber-200"
        >
          <CollapsibleTrigger asChild>
            <Button 
              variant="ghost" 
              size="sm" 
              className="w-full flex items-center justify-between p-2 h-auto text-xs text-amber-700 hover:bg-amber-100/50"
            >
              <span>Configuration Details</span>
              {isConfigOpen ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="p-2 bg-white/50">
            {renderConfigDetails()}
          </CollapsibleContent>
        </Collapsible>
      </div>
    </div>
  );
};

// Use memo to prevent unnecessary re-renders
export default memo(MessageInlineModule);
