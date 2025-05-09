
import { useState, useEffect } from 'react';
import { ScenarioType } from '@/components/ScenarioSelector';
import { loadStateMachine, StateMachine } from '@/utils/stateMachineLoader';
import { SensitiveField } from '@/data/scenarioData';

// Interface to track selected state details
export interface SelectedStateDetails {
  id: string;
  data: any;
  sensitiveFields?: SensitiveField[];
}

export function useJsonVisualization(activeScenario: ScenarioType) {
  const [jsonDialogOpen, setJsonDialogOpen] = useState(false);
  const [jsonContent, setJsonContent] = useState("");
  const [isLoadingJson, setIsLoadingJson] = useState(false);
  const [dialogViewMode, setDialogViewMode] = useState<"json" | "visualization">("json");
  const [loadedStateMachine, setLoadedStateMachine] = useState<StateMachine | null>(null);
  const [selectedState, setSelectedState] = useState<SelectedStateDetails | null>(null);

  // Handle view mode toggle
  const handleViewModeToggle = (mode: "json" | "visualization") => {
    setDialogViewMode(mode);
  };

  // Handle state selection from visualization
  const handleStateSelection = (state: string) => {
    if (loadedStateMachine && loadedStateMachine.states[state]) {
      setJsonContent(JSON.stringify(loadedStateMachine.states[state], null, 2));
      
      // Store the selected state details
      const stateData = loadedStateMachine.states[state];
      const sensitiveFields = stateData.meta?.sensitiveFields;
      
      setSelectedState({
        id: state,
        data: stateData,
        sensitiveFields: sensitiveFields
      });
    }
  };

  // Load state machine when changing scenarios
  useEffect(() => {
    const loadVisualizationData = async () => {
      setIsLoadingJson(true);
      try {
        const machine = await loadStateMachine(activeScenario);
        setLoadedStateMachine(machine);
        setJsonContent(JSON.stringify(machine, null, 2));
      } catch (error) {
        console.error("Failed to load JSON:", error);
        setJsonContent(JSON.stringify({ error: "Failed to load state machine" }, null, 2));
      } finally {
        setIsLoadingJson(false);
      }
    };
    
    loadVisualizationData();
  }, [activeScenario]);

  // View JSON button handler
  const handleViewJson = () => {
    setIsLoadingJson(true);
    
    // Update JSON content with latest data
    if (loadedStateMachine) {
      setJsonContent(JSON.stringify(loadedStateMachine, null, 2));
    }
    
    setJsonDialogOpen(true);
    setIsLoadingJson(false);
  };

  return {
    jsonDialogOpen,
    setJsonDialogOpen,
    jsonContent,
    isLoadingJson,
    dialogViewMode,
    handleViewModeToggle,
    loadedStateMachine,
    selectedState,
    handleStateSelection,
    handleViewJson
  };
}
