
import { useCallback } from 'react';
import { ScenarioType } from '@/components/ScenarioSelector';
import { useTranscriptCore } from '@/hooks/useTranscriptCore';

/**
 * Custom hook for managing transcript in the Dashboard
 * This ensures independent state between Dashboard and TestScenario
 */
export function useDashboardTranscript(activeScenario: ScenarioType) {
  // Use the core transcript hook with the dashboard instance identifier
  const transcriptCore = useTranscriptCore(activeScenario);
  
  // Return all functionality from the transcript core
  return {
    ...transcriptCore,
    // Add any Dashboard-specific overrides here if needed
  };
}
