
import React from 'react';
import { StateMachine } from '@/utils/stateMachineLoader';
import { ScenarioType } from '@/components/ScenarioSelector';

interface TranscriptPanelProps {
  activeScenario: ScenarioType;
  jsonVisualization: any;
}

const TranscriptPanel: React.FC<TranscriptPanelProps> = ({ 
  activeScenario,
  jsonVisualization
}) => {
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
      </div>
      
      <div className="flex-1 overflow-y-auto p-4">
        <div className="border rounded-md p-4 bg-white">
          <p>Scenario content will be displayed here based on state machine transitions.</p>
          <button 
            onClick={() => jsonVisualization.toggleJsonDialog()} 
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            View JSON Structure
          </button>
        </div>
      </div>
    </div>
  );
};

export default TranscriptPanel;
