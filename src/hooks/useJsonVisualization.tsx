
import { useState, useEffect, useCallback } from 'react';
import { ScenarioType } from '@/components/ScenarioSelector';
import { loadStateMachine, StateMachine } from '@/utils/stateMachineLoader';
import { SensitiveField } from '@/data/scenarioData';
import { useToast } from '@/hooks/use-toast';

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
  const { toast } = useToast();

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
  
  // Handle sensitive field click
  const handleSensitiveFieldClick = useCallback((field: SensitiveField) => {
    // This would typically open a dialog or panel with sensitive field details
    toast({
      title: "Sensitive Field Selected",
      description: `Selected field: ${field.name}`,
      duration: 3000
    });
  }, [toast]);
  
  // Handle jumping to a specific state
  const handleJumpToState = useCallback((stateId: string) => {
    if (!loadedStateMachine || !loadedStateMachine.states[stateId]) {
      toast({
        title: "State not found",
        description: `Could not find state: ${stateId}`,
        duration: 3000
      });
      return;
    }
    
    // Trigger a custom event that the state machine can listen to
    const event = new CustomEvent('jump-to-state', {
      detail: { stateId }
    });
    window.dispatchEvent(event);
    
    // Close the dialog
    setJsonDialogOpen(false);
    
    toast({
      title: "Navigating to State",
      description: `Loaded state: ${stateId}`,
      duration: 2000
    });
  }, [loadedStateMachine, toast]);

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
    handleSensitiveFieldClick,
    handleViewJson,
    handleJumpToState
  };
}
