
import React from 'react';
import { FileText, LayoutDashboard, Info, Shield, AlertTriangle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import DecisionTreeVisualizer from '@/components/DecisionTreeVisualizer';
import { Badge } from '@/components/ui/badge';
import { StateMachine } from '@/utils/stateMachineLoader';
import { ScenarioType } from '@/components/ScenarioSelector';

interface JsonVisualizationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dialogViewMode: "json" | "visualization";
  handleViewModeToggle: (mode: "json" | "visualization") => void;
  jsonContent: string;
  loadedStateMachine: StateMachine | null;
  currentState?: string;
  activeScenario: ScenarioType;
  selectedState?: string;
  onStateClick: (state: string) => void;
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
  onStateClick
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>
            State Machine for {activeScenario}
            {currentState && (
              <span className="ml-2 text-sm font-normal text-muted-foreground">
                (Current state: {currentState})
              </span>
            )}
          </DialogTitle>
          <DialogDescription>
            {dialogViewMode === "json" 
              ? "Complete JSON representation of the state machine flow" 
              : "Visual representation of the state machine flow"}
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex items-center justify-center space-x-2 mb-4">
          <Button 
            variant={dialogViewMode === "json" ? "secondary" : "outline"} 
            size="sm"
            onClick={() => handleViewModeToggle("json")}
            className="flex items-center gap-2"
          >
            <FileText size={16} />
            JSON View
          </Button>
          <Button 
            variant={dialogViewMode === "visualization" ? "secondary" : "outline"} 
            size="sm"
            onClick={() => handleViewModeToggle("visualization")}
            className="flex items-center gap-2"
          >
            <LayoutDashboard size={16} />
            Visualization
          </Button>
        </div>
        
        <div className="overflow-auto max-h-[60vh]">
          {dialogViewMode === "json" ? (
            <pre className="bg-slate-100 p-4 rounded-md text-xs overflow-x-auto">
              {jsonContent}
            </pre>
          ) : (
            <div className="bg-white p-4 rounded-md">
              <DecisionTreeVisualizer 
                stateMachine={loadedStateMachine} 
                currentState={selectedState || currentState}
                onStateClick={onStateClick}
              />
              
              {/* Display Selected State Details */}
              {selectedState && loadedStateMachine?.states[selectedState] && (
                <div className="mt-6 border-t pt-4">
                  <h3 className="text-lg font-semibold mb-2">State: {selectedState}</h3>
                  
                  {loadedStateMachine.states[selectedState].meta?.systemMessage && (
                    <div className="mb-3 p-2 rounded bg-blue-50 border border-blue-200">
                      <div className="flex items-center gap-1 text-blue-700 text-sm font-medium mb-1">
                        <Shield size={16} />
                        <span>System Message</span>
                      </div>
                      <p className="text-sm">{loadedStateMachine.states[selectedState].meta?.systemMessage}</p>
                    </div>
                  )}
                  
                  {loadedStateMachine.states[selectedState].meta?.customerText && (
                    <div className="mb-3 p-2 rounded bg-amber-50 border border-amber-200">
                      <div className="flex items-center gap-1 text-amber-700 text-sm font-medium mb-1">
                        <AlertTriangle size={16} />
                        <span>Customer Text</span>
                      </div>
                      <p className="text-sm">{loadedStateMachine.states[selectedState].meta?.customerText}</p>
                    </div>
                  )}
                  
                  {loadedStateMachine.states[selectedState].meta?.agentText && (
                    <div className="mb-3 p-2 rounded bg-emerald-50 border border-emerald-200">
                      <div className="flex items-center gap-1 text-emerald-700 text-sm font-medium mb-1">
                        <Info size={16} />
                        <span>Agent Text</span>
                      </div>
                      <p className="text-sm">{loadedStateMachine.states[selectedState].meta?.agentText}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default JsonVisualizationDialog;
