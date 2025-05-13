
import { useState } from "react";
import { ScenarioType } from "@/components/ScenarioSelector";
import { StateMachine } from "@/utils/stateMachineLoader";
import { SensitiveField } from "@/components/test-scenario/SensitiveFieldDetailsDialog";

interface SelectedStateDetails {
  id: string;
  data: any;
  sensitiveFields?: SensitiveField[];
}

export function useJsonVisualization(scenarioType: ScenarioType) {
  const [showJsonDialog, setShowJsonDialog] = useState(false);
  const [dialogViewMode, setDialogViewMode] = useState<"json" | "visualization">("json");
  const [selectedState, setSelectedState] = useState<SelectedStateDetails | null>(null);
  const [jsonContent, setJsonContent] = useState<string>("");

  // Function to toggle the JSON dialog visibility
  const toggleJsonDialog = () => {
    setShowJsonDialog(!showJsonDialog);
  };

  // Function to toggle between JSON and visualization view modes
  const handleViewModeToggle = (mode: "json" | "visualization") => {
    setDialogViewMode(mode);
  };

  // Function to handle state selection
  const handleStateSelection = (state: string, stateMachine: StateMachine | null) => {
    if (stateMachine && stateMachine.states && stateMachine.states[state]) {
      setSelectedState({
        id: state,
        data: stateMachine.states[state],
        sensitiveFields: stateMachine.states[state].meta?.sensitiveFields
      });
    }
  };

  // Function to set JSON content
  const setJsonContentFromStateMachine = (stateMachine: StateMachine | null) => {
    if (stateMachine) {
      setJsonContent(JSON.stringify(stateMachine, null, 2));
    }
  };

  return {
    showJsonDialog,
    setShowJsonDialog,
    dialogViewMode,
    handleViewModeToggle,
    selectedState,
    setSelectedState: handleStateSelection,
    jsonContent,
    setJsonContent: setJsonContentFromStateMachine,
    toggleJsonDialog
  };
}
