
// Primary transcript hook - now a thin wrapper around more focused hooks
import { ScenarioType } from '@/components/ScenarioSelector';
import { useTranscriptCore } from '@/hooks/useTranscriptCore';

interface UseTranscriptProps {
  source?: 'dashboard' | 'testscenario';
}

export function useTranscript(activeScenario: ScenarioType, props?: UseTranscriptProps) {
  // Use the core transcript hook that composes all the other hooks
  const transcriptCore = useTranscriptCore(activeScenario, {
    source: props?.source || 'testscenario'
  });
  
  // Return all the functionality from the core hook
  return transcriptCore;
}
