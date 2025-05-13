
// Primary transcript hook - now a thin wrapper around more focused hooks
import { ScenarioType } from '@/components/ScenarioSelector';
import { useTranscriptCore } from '@/hooks/useTranscriptCore';

export function useTranscript(activeScenario: ScenarioType) {
  // Use the core transcript hook that composes all the other hooks
  const transcriptCore = useTranscriptCore(activeScenario);
  
  // Return all the functionality from the core hook
  return transcriptCore;
}
