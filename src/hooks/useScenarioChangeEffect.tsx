
import { useState, useEffect } from 'react';
import { ScenarioType } from '@/components/ScenarioSelector';

interface ScenarioChangeEffectProps {
  activeScenario: ScenarioType;
  resetConversationState: (clearMessages: boolean) => void;
}

export function useScenarioChangeEffect({
  activeScenario,
  resetConversationState
}: ScenarioChangeEffectProps) {
  const [hasInitializedConversation, setHasInitializedConversation] = useState(false);

  // Prevent full reset on scenario change - just reset conversation state, not messages
  useEffect(() => {
    console.log("Scenario changed to:", activeScenario);
    // Only reset conversation tracking state, not messages
    resetConversationState(false);
    setHasInitializedConversation(false);
  }, [activeScenario, resetConversationState]);

  return { hasInitializedConversation, setHasInitializedConversation };
}
