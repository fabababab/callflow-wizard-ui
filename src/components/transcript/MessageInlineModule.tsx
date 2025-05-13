
import React, { memo, useRef, useEffect } from 'react';
import { ModuleConfig, ModuleType } from '@/types/modules';
import InlineModuleDisplay from './InlineModuleDisplay';

interface MessageInlineModuleProps {
  moduleConfig: ModuleConfig;
  onModuleComplete: (result: any) => void;
}

const MessageInlineModule: React.FC<MessageInlineModuleProps> = ({
  moduleConfig,
  onModuleComplete
}) => {
  const completedRef = useRef(false);
  
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
    
    onModuleComplete(result);
  };
  
  // Listen for verification success events
  useEffect(() => {
    const handleVerificationSuccess = (event: Event) => {
      const customEvent = event as CustomEvent;
      if (customEvent.detail && customEvent.detail.moduleId === moduleConfig.id) {
        console.log(`Received verification success event for module ${moduleConfig.id}`);
        // Will be handled by the regular complete flow
      }
    };
    
    window.addEventListener('verification-successful', handleVerificationSuccess);
    
    return () => {
      window.removeEventListener('verification-successful', handleVerificationSuccess);
    };
  }, [moduleConfig.id]);
  
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
