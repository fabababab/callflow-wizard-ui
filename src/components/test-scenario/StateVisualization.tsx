
import React, { useState, useEffect } from 'react';
import { StateMachine } from '@/utils/stateMachineLoader';
import DecisionTreeVisualizer from '@/components/DecisionTreeVisualizer';
import StateDetailsPanel from './StateDetailsPanel';
import { SensitiveField } from '@/data/scenarioData';
import { Button } from '@/components/ui/button';
import { Minus, Plus, RotateCw } from 'lucide-react';

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
  // Add zoom control
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [centerOnCurrentState, setCenterOnCurrentState] = useState<boolean>(true);
  
  // Handle zoom in
  const handleZoomIn = () => {
    if (zoomLevel < 200) {
      setZoomLevel(prev => Math.min(prev + 25, 200));
    }
  };
  
  // Handle zoom out
  const handleZoomOut = () => {
    if (zoomLevel > 50) {
      setZoomLevel(prev => Math.max(prev - 25, 50));
    }
  };
  
  // Reset zoom and centering
  const handleResetView = () => {
    setZoomLevel(100);
    setCenterOnCurrentState(true);
  };
  
  useEffect(() => {
    // Reset view when switching to a new state machine or current state changes
    if (currentState) {
      setCenterOnCurrentState(true);
    }
  }, [loadedStateMachine, currentState]);
  
  return (
    <div className="bg-white rounded-md flex flex-col md:flex-row h-full overflow-hidden">
      {/* Left side: Decision Tree Visualization with zoom controls */}
      <div className="md:w-3/5 p-4 border-r flex flex-col">
        {/* Zoom controls */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleZoomOut}
              disabled={zoomLevel <= 50}
              className="h-8 w-8 p-0"
            >
              <Minus className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium">{zoomLevel}%</span>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleZoomIn}
              disabled={zoomLevel >= 200}
              className="h-8 w-8 p-0"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleResetView}
            className="h-8 flex items-center gap-1"
          >
            <RotateCw className="h-3 w-3" />
            <span>Reset View</span>
          </Button>
        </div>
        
        {/* Decision Tree visualization with zoom and centering */}
        <div className="flex-1 overflow-auto">
          <DecisionTreeVisualizer 
            stateMachine={loadedStateMachine} 
            currentState={currentState} 
            onStateClick={onStateClick}
            zoomLevel={zoomLevel}
            centerOnState={centerOnCurrentState ? currentState : null}
            onCenter={() => setCenterOnCurrentState(false)}
          />
        </div>
      </div>
      
      {/* Right side: State Details Panel with fixed height and scrolling */}
      <div className="md:w-2/5 p-4 flex flex-col overflow-hidden">
        <div className="overflow-auto" style={{ maxHeight: '100%' }}>
          <StateDetailsPanel 
            selectedStateDetails={selectedStateDetails}
            onSensitiveFieldClick={onSensitiveFieldClick}
            onJumpToState={onJumpToState}
          />
        </div>
      </div>
    </div>
  );
};

export default StateVisualization;
