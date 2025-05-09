
// Hook for handling call acceptance
import { useCallback } from 'react';
import { ScenarioType } from '@/components/ScenarioSelector';
import { useToast } from '@/hooks/use-toast';

interface CallAcceptanceProps {
  activeScenario: ScenarioType;
  callState: any;
  toast: ReturnType<typeof useToast>;
}

export function useCallAcceptance({
  activeScenario,
  callState,
  toast
}: CallAcceptanceProps) {
  // Function to handle accepting a call
  const handleAcceptCall = useCallback(() => {
    if (!activeScenario) {
      toast.toast({
        title: "No Scenario Selected",
        description: "Please select a scenario first.",
        variant: "destructive",
        duration: 3000
      });
      return;
    }

    console.log('Accepting call for scenario:', activeScenario);
    callState.setCallActive(true); // Use direct setter from callState
  }, [activeScenario, callState, toast]);

  return {
    handleAcceptCall
  };
}
