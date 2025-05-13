
import React, { useState, useEffect } from 'react';
import { StateMachine } from '@/utils/stateMachineLoader';
import DecisionTreeVisualizer from '@/components/DecisionTreeVisualizer';
import StateDetailsPanel from './StateDetailsPanel';
import { SensitiveField } from '@/data/scenarioData';
import { Button } from '@/components/ui/button';
import { Minus, Plus, RotateCw, MoveHorizontal } from 'lucide-react';

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
  // Default zoom level is now 400% (4x)
  const [zoomLevel, setZoomLevel] = useState<number>(400);
  const [centerOnCurrentState, setCenterOnCurrentState] = useState<boolean>(true);
  const [isPanning, setIsPanning] = useState<boolean>(false);
  
  // Handle zoom in
  const handleZoomIn = () => {
    if (zoomLevel < 600) {
      setZoomLevel(prev => Math.min(prev + 50, 600));
    }
  };
  
  // Handle zoom out
  const handleZoomOut = () => {
    if (zoomLevel > 100) {
      setZoomLevel(prev => Math.max(prev - 50, 100));
    }
  };
  
  // Toggle panning mode
  const togglePanningMode = () => {
    setIsPanning(!isPanning);
  };
  
  // Reset zoom and centering
  const handleResetView = () => {
    setZoomLevel(400); // Reset to default 400%
    setCenterOnCurrentState(true);
    setIsPanning(false);
  };
  
  // Auto-center on state changes
  useEffect(() => {
    if (currentState || selectedStateDetails?.id) {
      setCenterOnCurrentState(true);
    }
  }, [currentState, selectedStateDetails]);
  
  // Determine which state to center on
  const stateToCenter = centerOnCurrentState ? 
    (selectedStateDetails?.id || currentState) : null;
    
  return (
    <div className="bg-white rounded-md flex flex-col md:flex-row h-full overflow-hidden">
      {/* Left side: Decision Tree Visualization with zoom controls */}
      <div className="md:w-3/5 p-4 border-r flex flex-col">
        {/* Zoom and pan controls */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleZoomOut}
              disabled={zoomLevel <= 100}
              className="h-8 w-8 p-0"
            >
              <Minus className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium">{zoomLevel}%</span>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleZoomIn}
              disabled={zoomLevel >= 600}
              className="h-8 w-8 p-0"
            >
              <Plus className="h-4 w-4" />
            </Button>
            
            {/* Pan button */}
            <Button
              variant={isPanning ? "default" : "outline"}
              size="sm"
              onClick={togglePanningMode}
              className={`h-8 flex items-center gap-1 ml-2 ${isPanning ? 'bg-blue-600' : ''}`}
            >
              <MoveHorizontal className="h-4 w-4" />
              <span className="hidden sm:inline">Pan</span>
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
        <div className="flex-1 overflow-auto relative">
          <DecisionTreeVisualizer 
            stateMachine={loadedStateMachine} 
            currentState={currentState} 
            onStateClick={onStateClick}
            zoomLevel={zoomLevel}
            centerOnState={stateToCenter}
            onCenter={() => setCenterOnCurrentState(false)}
            isPanning={isPanning}
          />
        </div>
      </div>
      
      {/* Right side: State Details Panel with fixed height and scrolling */}
      <div className="md:w-2/5 p-4 flex flex-col overflow-hidden">
        <div className="overflow-auto h-full">
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
