
import React, { memo, useState, useEffect, useRef } from 'react';
import { ModuleConfig } from '@/types/modules';

interface InlineModuleDisplayProps {
  moduleConfig: ModuleConfig;
  onComplete: (result: any) => void;
}

const InlineModuleDisplay: React.FC<InlineModuleDisplayProps> = ({ 
  moduleConfig, 
  onComplete 
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const completedRef = useRef(false);
  const moduleIdRef = useRef(moduleConfig.id);
  
  // Handle component loading with a slight delay to prevent flickering
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 50);
    
    return () => {
      clearTimeout(timer);
    };
  }, []);
  
  // Handle completion to prevent multiple completion events
  const handleComplete = (result: any) => {
    if (completedRef.current) return;
    completedRef.current = true;
    
    console.log(`InlineModuleDisplay: Module ${moduleConfig.id} completed with result:`, result);
    onComplete(result);
  };
  
  // Handle module closing without completion
  const handleClose = () => {
    if (completedRef.current) return;
    completedRef.current = true;
    
    console.log("Inline module closed without completion");
    onComplete({ cancelled: true });
  };
  
  // Import the component dynamically to avoid circular dependencies
  const ModuleComponent = React.lazy(() => import('../modules/ModuleContainer'));
  
  if (!isLoaded) {
    return <div className="p-3 text-center text-xs text-amber-700">Loading verification module...</div>;
  }

  return (
    <div 
      className="w-full ml-auto rounded-md overflow-hidden transition-opacity duration-300" 
      data-testid="inline-module-display"
    >
      <React.Suspense fallback={<div className="p-3 text-center text-xs text-amber-700">Loading verification module...</div>}>
        <ModuleComponent
          moduleConfig={{
            ...moduleConfig,
            data: { ...(moduleConfig.data || {}), isInline: true }
          }}
          onClose={handleClose}
          onComplete={handleComplete}
          key={`module-${moduleIdRef.current}`} // Use a stable ref for the key
        />
      </React.Suspense>
    </div>
  );
};

// Use memo to prevent unnecessary re-renders
export default memo(InlineModuleDisplay);
