
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { StateMachine } from '@/utils/stateMachineLoader';
import { ScenarioType } from '@/components/ScenarioSelector';
import DialogViewControls from '../test-scenario/DialogViewControls';
import StateVisualization from '../test-scenario/StateVisualization';
import { SensitiveField } from '@/data/scenarioData';

interface SelectedStateDetails {
  id: string;
  data: any;
  sensitiveFields?: SensitiveField[];
}

interface JsonVisualizationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dialogViewMode: "json" | "visualization";
  handleViewModeToggle: (mode: "json" | "visualization") => void;
  jsonContent: string;
  loadedStateMachine: StateMachine | null;
  currentState: string;
  activeScenario: ScenarioType;
  selectedState: SelectedStateDetails | null;
  onStateClick: (state: string) => void;
  onJumpToState?: (stateId: string) => void;
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
  onJumpToState
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[90vw] max-h-[90vh] fixed left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%] bg-background">
        <DialogHeader className="flex flex-row items-center justify-between">
          <div>
            <DialogTitle>
              {activeScenario} State Machine
            </DialogTitle>
            <DialogDescription>
              {dialogViewMode === "json" ? 
                "Complete JSON representation of the state machine flow" : 
                "Visual representation of the state machine flow"}
            </DialogDescription>
          </div>
          <DialogViewControls 
            dialogViewMode={dialogViewMode}
            handleViewModeToggle={handleViewModeToggle}
          />
        </DialogHeader>
        
        <div className="overflow-auto max-h-[70vh] mt-4">
          {dialogViewMode === "json" ? (
            <pre className="bg-slate-100 p-4 rounded-md text-xs overflow-x-auto">
              {jsonContent}
            </pre>
          ) : (
            <StateVisualization 
              loadedStateMachine={loadedStateMachine}
              currentState={currentState}
              onStateClick={onStateClick}
              selectedStateDetails={selectedState}
              onSensitiveFieldClick={() => {}} // This will be handled at a higher level
              onJumpToState={onJumpToState}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default JsonVisualizationDialog;
