
import { useCallback } from 'react';
import { ScenarioType } from '@/components/ScenarioSelector';

export function useScenarioManagement(activeScenario: ScenarioType) {
  // Function to handle scenario changes
  const handleScenarioChange = useCallback((newScenario: ScenarioType) => {
    if (activeScenario !== newScenario) {
      // Dispatch custom event for scenario change
      const event = new CustomEvent('scenario-change', {
        detail: {
          scenario: newScenario
        }
      });
      window.dispatchEvent(event);
    }
  }, [activeScenario]);

  return {
    handleScenarioChange
  };
}
