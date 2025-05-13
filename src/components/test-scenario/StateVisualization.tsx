
import React, { useState, useEffect } from 'react';
import { StateMachine } from '@/utils/stateMachineLoader';
import DecisionTreeVisualizer from '@/components/DecisionTreeVisualizer';
import StateDetailsPanel from './StateDetailsPanel';
import { SensitiveField } from '@/data/scenarioData';
import { Button } from '@/components/ui/button';
import { Minus, Plus, RotateCw } from 'lucide-react';
import { 
  ResizablePanelGroup, 
  ResizablePanel, 
  ResizableHandle 
} from '@/components/ui/resizable';

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
  // Default zoom level changed to 200% (2x)
  const [zoomLevel, setZoomLevel] = useState<number>(200);
  const [centerOnCurrentState, setCenterOnCurrentState] = useState<boolean>(true);
  
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
  
  // Reset zoom and centering
  const handleResetView = () => {
    setZoomLevel(200); // Reset to default 200%
    setCenterOnCurrentState(true);
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
    <div className="bg-white rounded-md flex flex-col h-full overflow-hidden">
      <ResizablePanelGroup direction="horizontal" className="h-full">
        {/* Left side: Decision Tree Visualization with zoom controls - now narrower */}
        <ResizablePanel defaultSize={50} minSize={30}>
          <div className="p-4 flex flex-col h-full">
            {/* Zoom controls */}
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
                isPanning={true}
              />
            </div>
          </div>
        </ResizablePanel>
        
        <ResizableHandle withHandle />
        
        {/* Right side: State Details Panel with equal width */}
        <ResizablePanel defaultSize={50} minSize={30}>
          <div className="p-4 flex flex-col overflow-hidden h-full">
            <div className="overflow-auto h-full">
              <StateDetailsPanel 
                selectedStateDetails={selectedStateDetails}
                onSensitiveFieldClick={onSensitiveFieldClick}
                onJumpToState={onJumpToState}
              />
            </div>
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
};

export default StateVisualization;
