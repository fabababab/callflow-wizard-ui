
import { useState, useEffect } from 'react';
import { ModuleConfig, ModuleType } from '@/types/modules';
import { StateMachine, StateMachineState } from '@/utils/stateMachineLoader';

export function useModuleManager(
  stateMachine: StateMachine | null,
  currentState: string | undefined,
  stateData: StateMachineState | null
) {
  const [activeModule, setActiveModule] = useState<ModuleConfig | null>(null);
  const [moduleHistory, setModuleHistory] = useState<ModuleConfig[]>([]);
  
  // Check for module triggers when state changes
  useEffect(() => {
    if (!stateMachine || !currentState || !stateData) {
      return;
    }

    // Check if current state has module trigger in meta
    if (stateData.meta?.module) {
      const moduleConfig = stateData.meta.module as ModuleConfig;
      
      // Set as active module
      setActiveModule(moduleConfig);
      
      // Add to history if not already there
      setModuleHistory(prev => {
        if (!prev.find(m => m.id === moduleConfig.id)) {
          return [...prev, moduleConfig];
        }
        return prev;
      });
    } else {
      // No module trigger in this state
      setActiveModule(null);
    }
  }, [currentState, stateData, stateMachine]);

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
    completeModule
  };
}
