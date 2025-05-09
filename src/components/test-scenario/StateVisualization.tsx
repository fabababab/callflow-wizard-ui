
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
}

const StateVisualization: React.FC<StateVisualizationProps> = ({
  loadedStateMachine,
  currentState,
  onStateClick,
  selectedStateDetails,
  onSensitiveFieldClick
}) => {
  return (
    <div className="bg-white p-4 rounded-md">
      <DecisionTreeVisualizer 
        stateMachine={loadedStateMachine} 
        currentState={currentState} 
        onStateClick={onStateClick} 
      />
      
      <StateDetailsPanel 
        selectedStateDetails={selectedStateDetails}
        onSensitiveFieldClick={onSensitiveFieldClick}
      />
    </div>
  );
};

export default StateVisualization;
