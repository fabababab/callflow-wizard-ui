
import React from 'react';
import { StateMachine } from '@/utils/stateMachineLoader';
import DecisionTreeVisualizer from '@/components/DecisionTreeVisualizer';
import StateDetailsPanel from './StateDetailsPanel';
import { SensitiveField } from '@/data/scenarioData';

interface SelectedStateDetails {
  id: string;
  data: any;
  sensitiveFields?: SensitiveField[];
}

interface StateVisualizationProps {
  loadedStateMachine: StateMachine | null;
  currentState: string;
  onStateClick: (state: string) => void;
  selectedStateDetails: SelectedStateDetails | null;
  onSensitiveFieldClick: (field: SensitiveField) => void;
  onJumpToState?: (stateId: string) => void;
}

const StateVisualization: React.FC<StateVisualizationProps> = ({
  loadedStateMachine,
  currentState,
  onStateClick,
  selectedStateDetails,
  onSensitiveFieldClick,
  onJumpToState
}) => {
  return (
    <div className="bg-white rounded-md flex flex-col md:flex-row">
      {/* Left side: Decision Tree Visualization */}
      <div className="md:w-3/5 p-4 border-r">
        <DecisionTreeVisualizer 
          stateMachine={loadedStateMachine} 
          currentState={currentState} 
          onStateClick={onStateClick} 
        />
      </div>
      
      {/* Right side: State Details Panel */}
      <div className="md:w-2/5 p-4 overflow-auto max-h-[600px]">
        <StateDetailsPanel 
          selectedStateDetails={selectedStateDetails}
          onSensitiveFieldClick={onSensitiveFieldClick}
          onJumpToState={onJumpToState}
        />
      </div>
    </div>
  );
};

export default StateVisualization;
