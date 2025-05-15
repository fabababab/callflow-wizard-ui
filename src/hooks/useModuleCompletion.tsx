
import { useCallback } from 'react';

interface ModuleCompletionProps {
  completeModule: (result: any) => void;
}

export function useModuleCompletion({ completeModule }: ModuleCompletionProps) {
  const handleModuleComplete = useCallback((result: any) => {
    console.log('Module completed with result:', result);
    completeModule(result);
  }, [completeModule]);

  const handleInlineModuleComplete = useCallback((messageId: string, moduleId: string, result: any) => {
    console.log(`Inline module ${moduleId} completed in message ${messageId} with result:`, result);
  }, []);

  return {
    handleModuleComplete,
    handleInlineModuleComplete
  };
}
