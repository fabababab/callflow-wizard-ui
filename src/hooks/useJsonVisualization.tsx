
import { useState } from 'react';
import { getStateMachineJson, loadStateMachine, StateMachine } from '@/utils/stateMachineLoader';
import { ScenarioType } from '@/components/ScenarioSelector';
import { useToast } from '@/hooks/use-toast';

export function useJsonVisualization(activeScenario: ScenarioType) {
  const [jsonDialogOpen, setJsonDialogOpen] = useState(false);
  const [jsonContent, setJsonContent] = useState("");
  const [isLoadingJson, setIsLoadingJson] = useState(false);
  const [dialogViewMode, setDialogViewMode] = useState<"json" | "visualization">("json");
  const [loadedStateMachine, setLoadedStateMachine] = useState<StateMachine | null>(null);
  const [selectedState, setSelectedState] = useState<string | undefined>(undefined);
  const { toast } = useToast();

  // Function to load and show JSON dialog
  const handleViewJson = async () => {
    if (!activeScenario) return;
    
    setIsLoadingJson(true);
    try {
      // Load the state machine for visualization
      const machine = await loadStateMachine(activeScenario);
      setLoadedStateMachine(machine);
      
      // Get current state JSON or full state machine
      const json = selectedState ? 
        JSON.stringify(machine.states[selectedState], null, 2) :
        await getStateMachineJson(activeScenario);
      
      setJsonContent(json);
      setJsonDialogOpen(true);
    } catch (error) {
      console.error("Failed to load JSON:", error);
      setJsonContent(JSON.stringify({ error: "Failed to load state machine JSON" }, null, 2));
      toast({
        title: "Error Loading JSON",
        description: "Failed to load state machine visualization",
        variant: "destructive",
        duration: 3000
      });
    } finally {
      setIsLoadingJson(false);
    }
  };

  // Handle state selection from the visualizer
  const handleStateSelection = (state: string) => {
    console.log(`State selected: ${state}`);
    setSelectedState(state);
    
    // Update JSON content to show the selected state
    if (loadedStateMachine && loadedStateMachine.states[state]) {
      setJsonContent(JSON.stringify(loadedStateMachine.states[state], null, 2));
    }
  };

  // Toggle view mode between JSON and visualization
  const handleViewModeToggle = (mode: "json" | "visualization") => {
    setDialogViewMode(mode);
  };

  return {
    jsonDialogOpen,
    setJsonDialogOpen,
    jsonContent,
    isLoadingJson,
    dialogViewMode,
    loadedStateMachine,
    selectedState,
    handleViewJson,
    handleStateSelection,
    handleViewModeToggle
  };
}
