
import { useState, useEffect, useRef } from 'react';
import { ScenarioType } from '@/components/ScenarioSelector';
import { loadStateMachine, StateMachine } from '@/utils/stateMachineLoader';
import { toast } from '@/hooks/use-toast';
import { SensitiveField } from '@/data/scenarioData';

// Interface to track selected state details for the modal
interface SelectedStateDetails {
  id: string;
  data: any;
  sensitiveFields?: SensitiveField[];
}

export function useScenarioState(initialScenario: ScenarioType = "studiumabschlussCase") {
  const [showJsonDialog, setShowJsonDialog] = useState(false);
  const [selectedStateMachine, setSelectedStateMachine] = useState<ScenarioType>(initialScenario);
  const [loadedStateMachine, setLoadedStateMachine] = useState<StateMachine | null>(null);
  const [jsonContent, setJsonContent] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [dialogViewMode, setDialogViewMode] = useState<"json" | "visualization">("json");
  
  // State for selected state details and sensitive fields
  const [selectedStateDetails, setSelectedStateDetails] = useState<SelectedStateDetails | null>(null);
  const [showSensitiveFieldDetails, setShowSensitiveFieldDetails] = useState<SensitiveField | null>(null);

  // Load state machine when selected scenario changes
  useEffect(() => {
    async function fetchStateMachine() {
      if (selectedStateMachine) {
        setIsLoading(true);
        try {
          console.log('Loading state machine for scenario:', selectedStateMachine);

          const machine = await loadStateMachine(selectedStateMachine);
          
          if (!machine) {
            throw new Error('Failed to load state machine - received null or undefined');
          }
          if (!machine.states || Object.keys(machine.states).length === 0) {
            throw new Error('State machine has no states defined');
          }
          
          setLoadedStateMachine(machine);
          setJsonContent(JSON.stringify(machine, null, 2));
        } catch (error) {
          console.error("Failed to load state machine:", error);
          toast({
            title: "Error Loading Scenario",
            description: error instanceof Error ? error.message : "Failed to load the test scenario",
            variant: "destructive",
            duration: 5000
          });
        } finally {
          setIsLoading(false);
        }
      }
    }
    fetchStateMachine();
  }, [selectedStateMachine]);

  // Listen for scenario change events
  useEffect(() => {
    const handleScenarioChange = (event: CustomEvent) => {
      const newScenario = event.detail.scenario as ScenarioType;
      if (newScenario && newScenario !== selectedStateMachine) {
        console.log('Scenario changed to:', newScenario);
        setSelectedStateMachine(newScenario);
      }
    };
    
    window.addEventListener('scenario-change', handleScenarioChange as EventListener);
    
    return () => {
      window.removeEventListener('scenario-change', handleScenarioChange as EventListener);
    };
  }, [selectedStateMachine]);

  // Listen for JSON visualization toggle events
  useEffect(() => {
    const handleToggleJsonVisualization = (event: Event) => {
      const customEvent = event as CustomEvent;
      if (customEvent.detail && customEvent.detail.hasOwnProperty('visible')) {
        setShowJsonDialog(customEvent.detail.visible);
      }
    };
    
    window.addEventListener('toggle-json-visualization', handleToggleJsonVisualization as EventListener);
    
    return () => {
      window.removeEventListener('toggle-json-visualization', handleToggleJsonVisualization as EventListener);
    };
  }, []);

  // Handle state selection from the visualizer
  const handleStateSelection = (state: string) => {
    console.log(`State selected in TestScenario: ${state}`);

    if (loadedStateMachine && loadedStateMachine.states[state]) {
      setJsonContent(JSON.stringify(loadedStateMachine.states[state], null, 2));

      // Store the selected state details including any sensitive fields
      const stateData = loadedStateMachine.states[state];
      const sensitiveFields = stateData.meta?.sensitiveFields;
      
      setSelectedStateDetails({
        id: state,
        data: stateData,
        sensitiveFields: sensitiveFields
      });

      // Update dialog view mode to show the visualization with this state
      setDialogViewMode("visualization");
    }
  };

  // Handle clicking on a sensitive field to show details
  const handleSensitiveFieldClick = (field: SensitiveField) => {
    setShowSensitiveFieldDetails(field);
    console.log("Showing sensitive field details:", field);
  };

  // Close sensitive field details modal
  const handleCloseSensitiveDetails = () => {
    setShowSensitiveFieldDetails(null);
  };

  // Toggle view mode between JSON and visualization
  const handleViewModeToggle = (mode: "json" | "visualization") => {
    setDialogViewMode(mode);
  };

  return {
    showJsonDialog,
    setShowJsonDialog,
    selectedStateMachine,
    loadedStateMachine,
    jsonContent,
    isLoading,
    dialogViewMode,
    selectedStateDetails,
    showSensitiveFieldDetails,
    handleStateSelection,
    handleSensitiveFieldClick,
    handleCloseSensitiveDetails,
    handleViewModeToggle
  };
}
