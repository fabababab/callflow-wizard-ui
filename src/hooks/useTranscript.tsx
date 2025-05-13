// Primary transcript hook - now a thin wrapper around more focused hooks
import { ScenarioType } from '@/components/ScenarioSelector';
import { useTranscriptCore } from '@/hooks/useTranscriptCore';
import { StateMachine as StateMachineType } from '@/utils/stateMachineLoader';

export function useTranscript(stateMachineInstance: StateMachineType | null) {
  // Use the core transcript hook that composes all the other hooks
  const transcriptCore = useTranscriptCore(stateMachineInstance);
  
  // Return all the functionality from the core hook
  return {
    ...transcriptCore
  };
}
