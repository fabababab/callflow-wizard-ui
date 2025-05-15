
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { StateMachine } from '@/utils/stateMachineLoader';
import { ScenarioType } from '@/components/ScenarioSelector';
import DialogViewControls from '../test-scenario/DialogViewControls';
import StateVisualization from '../test-scenario/StateVisualization';
import { SensitiveField } from '@/data/scenarioData';
import ModulesPreview from '../test-scenario/ModulesPreview';

interface SelectedStateDetails {
  id: string;
  data: any;
  sensitiveFields?: SensitiveField[];
}

interface JsonVisualizationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dialogViewMode: "json" | "visualization" | "modules";
  handleViewModeToggle: (mode: "json" | "visualization" | "modules") => void;
  jsonContent: string;
  loadedStateMachine: StateMachine | null;
  currentState: string;
  activeScenario: ScenarioType;
  selectedState: SelectedStateDetails | null;
  onStateClick: (state: string) => void;
  onJumpToState?: (stateId: string) => void;
  onSensitiveFieldClick: (field: SensitiveField) => void;
}

const JsonVisualizationDialog: React.FC<JsonVisualizationDialogProps> = ({
  open,
  onOpenChange,
  dialogViewMode,
  handleViewModeToggle,
  jsonContent,
  loadedStateMachine,
  currentState,
  activeScenario,
  selectedState,
  onStateClick,
  onJumpToState,
  onSensitiveFieldClick
}) => {
  // Function to get the appropriate title and description based on the view mode
  const getDialogHeaderContent = () => {
    switch (dialogViewMode) {
      case "json":
        return {
          title: `${activeScenario} State Machine`,
          description: "Complete JSON representation of the state machine flow"
        };
      case "visualization":
        return {
          title: `${activeScenario} State Machine`,
          description: "Visual representation of the state machine flow"
        };
      case "modules":
        return {
          title: `${activeScenario} Interactive Modules`,
          description: "Preview of all interactive modules in the state machine"
        };
      default:
        return {
          title: `${activeScenario} State Machine`,
          description: ""
        };
    }
  };

  const headerContent = getDialogHeaderContent();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[90vw] max-h-[90vh] fixed left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%] bg-background">
        <DialogHeader className="flex flex-row items-center justify-between">
          <div>
            <DialogTitle>
              {headerContent.title}
            </DialogTitle>
            <DialogDescription>
              {headerContent.description}
            </DialogDescription>
          </div>
          <DialogViewControls 
            dialogViewMode={dialogViewMode}
            handleViewModeToggle={handleViewModeToggle}
          />
        </DialogHeader>
        
        <div className="overflow-auto max-h-[70vh] mt-4">
          {dialogViewMode === "json" && (
            <pre className="bg-slate-100 p-4 rounded-md text-xs overflow-x-auto">
              {jsonContent}
            </pre>
          )}
          
          {dialogViewMode === "visualization" && (
            <StateVisualization 
              loadedStateMachine={loadedStateMachine}
              currentState={currentState}
              onStateClick={onStateClick}
              selectedStateDetails={selectedState}
              onSensitiveFieldClick={onSensitiveFieldClick}
              onJumpToState={onJumpToState}
            />
          )}
          
          {dialogViewMode === "modules" && (
            <ModulesPreview 
              loadedStateMachine={loadedStateMachine}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default JsonVisualizationDialog;
