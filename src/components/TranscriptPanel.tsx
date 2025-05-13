
import React from 'react';
import { StateMachine } from '@/utils/stateMachineLoader';
import { ScenarioType } from '@/components/ScenarioSelector';
import JsonVisualizationDialog from './transcript/JsonVisualizationDialog';
import { Button } from '@/components/ui/button';
import { Eye } from 'lucide-react';

interface TranscriptPanelProps {
  activeScenario: ScenarioType | null;
  jsonVisualization?: any;
}

const TranscriptPanel: React.FC<TranscriptPanelProps> = ({ 
  activeScenario,
  jsonVisualization 
}) => {
  // If jsonVisualization is not provided, create a dummy one with the minimal functionality
  const visualization = jsonVisualization || {
    toggleJsonDialog: () => console.log("JSON dialog would open here"),
    showJsonDialog: false,
    setShowJsonDialog: () => {},
    dialogViewMode: "json",
    handleViewModeToggle: () => {},
    selectedState: null,
    jsonContent: ""
  };

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b flex justify-between items-center">
        <h2 className="text-lg font-semibold">
          {activeScenario === 'testscenario' ? 'Test Scenario' :
           activeScenario === 'verificationFlow' ? 'Identity Verification Flow' :
           activeScenario === 'contractManagement' ? 'Contract Management' :
           activeScenario === 'productInfo' ? 'Product Information' :
           activeScenario}
        </h2>
        
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => visualization.toggleJsonDialog()} 
          className="flex items-center gap-1"
        >
          <Eye size={16} />
          View Structure
        </Button>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4">
        <div className="border rounded-md p-4 bg-white">
          <p>Scenario content will be displayed here based on state machine transitions.</p>
        </div>
      </div>
      
      {visualization.showJsonDialog && (
        <JsonVisualizationDialog
          open={visualization.showJsonDialog}
          onOpenChange={visualization.setShowJsonDialog}
          dialogViewMode={visualization.dialogViewMode}
          handleViewModeToggle={visualization.handleViewModeToggle}
          jsonContent={visualization.jsonContent}
          loadedStateMachine={null} // Will be provided by the parent
          currentState=""  // Will be provided by the parent
          activeScenario={activeScenario || 'testscenario'}
          selectedState={visualization.selectedState}
          onStateClick={() => {}} // Will be provided by the parent
        />
      )}
    </div>
  );
};

export default TranscriptPanel;
