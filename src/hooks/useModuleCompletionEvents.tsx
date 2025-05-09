
import { useEffect } from 'react';

interface ModuleCompletionEventsProps {
  addSystemMessage: (message: string) => void;
}

export function useModuleCompletionEvents({ addSystemMessage }: ModuleCompletionEventsProps) {
  // Listen for module completion events
  useEffect(() => {
    const handleModuleCompletedEvent = (event: Event) => {
      const customEvent = event as CustomEvent;
      console.log('Module completed event:', customEvent.detail);
      
      // Add a system message about the module completion
      if (customEvent.detail && customEvent.detail.moduleId) {
        const resultText = customEvent.detail.result?.verified 
          ? 'successfully verified'
          : customEvent.detail.result?.action
          ? `completed action: ${customEvent.detail.result.action}`
          : customEvent.detail.result?.acknowledged
          ? 'acknowledged'
          : 'completed';
          
        addSystemMessage(`Module ${resultText}`);
      }
    };
    
    window.addEventListener('module-completed', handleModuleCompletedEvent as EventListener);
    
    return () => {
      window.removeEventListener('module-completed', handleModuleCompletedEvent as EventListener);
    };
  }, [addSystemMessage]);
}
