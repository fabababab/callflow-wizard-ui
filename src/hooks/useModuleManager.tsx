
import { useState, useEffect, useRef } from 'react';
import { ModuleConfig, ModuleType } from '@/types/modules';
import { StateMachine, StateMachineState } from '@/utils/stateMachineLoader';

export function useModuleManager(
  stateMachine: StateMachine | null,
  currentState: string | undefined,
  stateData: StateMachineState | null
) {
  const [activeModule, setActiveModule] = useState<ModuleConfig | null>(null);
  const [moduleHistory, setModuleHistory] = useState<ModuleConfig[]>([]);
  const processedModuleIds = useRef<Set<string>>(new Set());
  
  // Handle custom module trigger events
  useEffect(() => {
    const handleModuleTrigger = (event: Event) => {
      const customEvent = event as CustomEvent;
      if (customEvent.detail && customEvent.detail.module) {
        const moduleConfig = customEvent.detail.module as ModuleConfig;
        
        // Check if we've already processed this module
        if (!processedModuleIds.current.has(moduleConfig.id)) {
          setActiveModule(moduleConfig);
          
          // Add to processed modules
          processedModuleIds.current.add(moduleConfig.id);
          
          // Add to history
          setModuleHistory(prev => {
            if (!prev.find(m => m.id === moduleConfig.id)) {
              return [...prev, moduleConfig];
            }
            return prev;
          });
        } else {
          console.log(`Module ${moduleConfig.id} already shown, skipping`);
        }
      }
    };
    
    window.addEventListener('module-trigger', handleModuleTrigger);
    
    return () => {
      window.removeEventListener('module-trigger', handleModuleTrigger);
    };
  }, []);
  
  // Check for module triggers when state changes
  useEffect(() => {
    if (!stateMachine || !currentState || !stateData) {
      return;
    }

    // Check if current state has module trigger in meta
    if (stateData.meta?.module) {
      const moduleConfig = stateData.meta.module as ModuleConfig;
      
      // Only process if not already shown (prevent duplicate modules)
      if (!processedModuleIds.current.has(moduleConfig.id)) {
        // Skip verification modules as they're shown inline
        if (moduleConfig.type !== ModuleType.VERIFICATION) {
          setActiveModule(moduleConfig);
        }
        
        // Add to processed modules to prevent showing again
        processedModuleIds.current.add(moduleConfig.id);
        
        // Add to history
        setModuleHistory(prev => {
          if (!prev.find(m => m.id === moduleConfig.id)) {
            return [...prev, moduleConfig];
          }
          return prev;
        });
      } else {
        console.log(`Module ${moduleConfig.id} already shown, skipping`);
      }
    } else {
      // No module trigger in this state
      // Don't clear active module here to avoid modules disappearing
    }
  }, [currentState, stateData, stateMachine]);

  // Reset module tracking when scenario changes
  const resetModules = () => {
    setActiveModule(null);
    processedModuleIds.current.clear();
  };

  // Function to close the active module
  const closeModule = () => {
    setActiveModule(null);
  };

  // Function to complete a module with result
  const completeModule = (result: any) => {
    if (activeModule) {
      // Dispatch event for module completion that state machine can listen to
      const event = new CustomEvent('module-completed', {
        detail: { moduleId: activeModule.id, result }
      });
      window.dispatchEvent(event);
      setActiveModule(null);
    }
  };

  return {
    activeModule,
    moduleHistory,
    closeModule,
    completeModule,
    resetModules
  };
}
