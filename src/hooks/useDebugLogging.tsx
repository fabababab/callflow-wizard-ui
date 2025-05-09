
import { useEffect } from 'react';
import { ScenarioType } from '@/components/ScenarioSelector';

interface DebugLoggingProps {
  activeScenario: ScenarioType;
  stateData: any;
  currentState: string;
  debugLastStateChange: string;
}

export function useDebugLogging({
  activeScenario,
  stateData,
  currentState,
  debugLastStateChange
}: DebugLoggingProps) {
  // Log when active scenario changes
  useEffect(() => {
    console.log('Active scenario changed:', activeScenario);
  }, [activeScenario]);

  // Log state machine data changes
  useEffect(() => {
    if (stateData) {
      console.log('State machine data:', {
        currentState,
        stateData,
        meta: stateData.meta
      });
    }
  }, [stateData, currentState]);
  
  return { debugLastStateChange };
}
