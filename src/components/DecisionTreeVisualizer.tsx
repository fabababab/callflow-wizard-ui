import React, { useEffect, useRef, useState } from 'react';
import { StateMachine } from '@/utils/stateMachineLoader';
import { Search, ZoomIn, ZoomOut, MousePointer, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface DecisionTreeVisualizerProps {
  stateMachine: StateMachine | null;
  currentState?: string;
  onStateClick?: (state: string) => void;
}

const DecisionTreeVisualizer: React.FC<DecisionTreeVisualizerProps> = ({ 
  stateMachine, 
  currentState,
  onStateClick
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [selectedState, setSelectedState] = useState<string | null>(null);
  const [stateInfo, setStateInfo] = useState<{
    nextStates: {state: string, trigger: string}[];
    text?: string;
    systemMessage?: string;
  } | null>(null);
  
  const handleZoomIn = () => {
    setScale(prev => Math.min(prev + 0.1, 3));
  };
  
  const handleZoomOut = () => {
    setScale(prev => Math.max(prev - 0.1, 0.3));
  };
  
  const handleReset = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };
  
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 0) { // Left click only
      setIsDragging(true);
      setDragStart({ 
        x: e.clientX - position.x, 
        y: e.clientY - position.y 
      });
    }
  };
  
  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setPosition({ 
        x: e.clientX - dragStart.x, 
        y: e.clientY - dragStart.y 
      });
    }
  };
  
  const handleMouseUp = () => {
    setIsDragging(false);
  };
  
  const handleMouseLeave = () => {
    setIsDragging(false);
  };
  
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const scaleFactor = e.deltaY > 0 ? 0.9 : 1.1;
    const newScale = Math.max(0.3, Math.min(3, scale * scaleFactor));
    
    // Calculate cursor position relative to the SVG
    const rect = svgRef.current?.getBoundingClientRect();
    if (rect) {
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      // Adjust position to zoom toward cursor point
      setPosition(prev => ({
        x: prev.x - (x - prev.x) * (scaleFactor - 1),
        y: prev.y - (y - prev.y) * (scaleFactor - 1)
      }));
    }
    
    setScale(newScale);
  };
  
  // Get state transitions
  const getStateTransitions = (state: string) => {
    if (!stateMachine) return [];
    
    const stateData = stateMachine.states[state];
    const nextStates: {state: string, trigger: string}[] = [];
    
    if (stateData.on) {
      Object.entries(stateData.on).forEach(([trigger, nextState]) => {
        if (nextState && stateMachine.states[nextState]) {
          nextStates.push({ state: nextState, trigger });
        }
      });
    } else if (stateData.nextState && stateMachine.states[stateData.nextState]) {
      nextStates.push({ state: stateData.nextState, trigger: 'auto' });
    }
    
    return nextStates;
  };
  
  // Handle node click to show state details
  const handleStateClick = (state: string) => {
    setSelectedState(state);
    
    // Get state data
    if (!stateMachine) return;
    const stateData = stateMachine.states[state];
    const nextStates = getStateTransitions(state);
    
    setStateInfo({
      nextStates,
      text: stateData.meta?.agentText || stateData.text,
      systemMessage: stateData.meta?.systemMessage
    });
    
    // Call external handler if provided
    if (onStateClick) {
      onStateClick(state);
    }
  };
  
  // Handle transition click to navigate to next state
  const handleTransitionClick = (nextState: string) => {
    if (onStateClick) {
      onStateClick(nextState);
    }
    setSelectedState(nextState);
  };
  
  useEffect(() => {
    if (!stateMachine || !svgRef.current) return;
    
    // Clear previous visualization
    while (svgRef.current.firstChild) {
      svgRef.current.removeChild(svgRef.current.firstChild);
    }
    
    const svg = svgRef.current;
    const states = Object.keys(stateMachine.states);
    const nodeSize = 120;
    const nodeHeight = 60;
    const horizontalSpacing = 180;
    const verticalSpacing = 100;
    
    // Create a map of states to their children
    const stateToChildren = new Map<string, {state: string, trigger: string}[]>();
    states.forEach(state => {
      const nextStates = getStateTransitions(state);
      if (nextStates.length > 0) {
        stateToChildren.set(state, nextStates);
      }
    });
    
    // Calculate initial state
    const initialState = stateMachine.initialState || stateMachine.initial || 'start';
    
    // Calculate levels for each state (BFS)
    const levels = new Map<string, number>();
    const queue: [string, number][] = [[initialState, 0]];
    const visited = new Set<string>();
    
    while (queue.length > 0) {
      const [state, level] = queue.shift()!;
      
      if (visited.has(state)) continue;
      visited.add(state);
      
      levels.set(state, level);
      
      const transitions = stateToChildren.get(state) || [];
      transitions.forEach(({state: childState}) => {
        if (!visited.has(childState)) {
          queue.push([childState, level + 1]);
        }
      });
    }
    
    // Count states per level for horizontal positioning
    const statesPerLevel = new Map<number, string[]>();
    levels.forEach((level, state) => {
      if (!statesPerLevel.has(level)) {
        statesPerLevel.set(level, []);
      }
      statesPerLevel.get(level)?.push(state);
    });
    
    // Calculate positions for each state
    const positions = new Map<string, { x: number, y: number }>();
    statesPerLevel.forEach((states, level) => {
      const levelWidth = states.length * nodeSize;
      const startX = (1000 - levelWidth) / 2; // Using 1000 as default width
      
      states.forEach((state, index) => {
        positions.set(state, {
          x: startX + index * horizontalSpacing,
          y: level * verticalSpacing + 50
        });
      });
    });
    
    // Draw edges first (so they're behind nodes)
    states.forEach(state => {
      const transitions = stateToChildren.get(state) || [];
      
      transitions.forEach(({state: nextState, trigger}) => {
        if (positions.has(state) && positions.has(nextState)) {
          const startPos = positions.get(state)!;
          const endPos = positions.get(nextState)!;
          
          const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
          group.setAttribute('class', 'transition');
          group.setAttribute('data-from', state);
          group.setAttribute('data-to', nextState);
          group.setAttribute('data-trigger', trigger);
          
          // Create a curved path
          const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
          const pathD = `M ${startPos.x + nodeSize/2} ${startPos.y + nodeHeight}
                       C ${startPos.x + nodeSize/2} ${(startPos.y + endPos.y) / 2},
                         ${endPos.x + nodeSize/2} ${(startPos.y + endPos.y) / 2},
                         ${endPos.x + nodeSize/2} ${endPos.y}`;
          
          path.setAttribute('d', pathD);
          path.setAttribute('stroke', '#888');
          path.setAttribute('stroke-width', '2');
          path.setAttribute('fill', 'none');
          path.setAttribute('marker-end', 'url(#arrowhead)');
          
          // Add transition label
          if (trigger && trigger !== 'auto' && trigger !== 'DEFAULT') {
            const pathLength = path.getTotalLength ? path.getTotalLength() : 100;
            const midPoint = path.getPointAtLength ? path.getPointAtLength(pathLength / 2) : { x: (startPos.x + endPos.x) / 2, y: (startPos.y + endPos.y) / 2 };
            
            const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            text.setAttribute('x', `${midPoint.x}`);
            text.setAttribute('y', `${midPoint.y - 10}`);
            text.setAttribute('text-anchor', 'middle');
            text.setAttribute('font-size', '11');
            text.setAttribute('fill', '#666');
            text.setAttribute('pointer-events', 'none');
            
            // Truncate long labels
            const displayText = trigger.length > 20 ? trigger.substring(0, 17) + '...' : trigger;
            text.textContent = displayText;
            
            // Add background rect for better readability
            const bgRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            const textWidth = displayText.length * 6; // Approximate width
            bgRect.setAttribute('x', `${midPoint.x - textWidth/2 - 4}`);
            bgRect.setAttribute('y', `${midPoint.y - 22}`);
            bgRect.setAttribute('width', `${textWidth + 8}`);
            bgRect.setAttribute('height', '16');
            bgRect.setAttribute('fill', 'white');
            bgRect.setAttribute('opacity', '0.8');
            bgRect.setAttribute('rx', '2');
            
            group.appendChild(bgRect);
            group.appendChild(text);
          }
          
          group.appendChild(path);
          svg.appendChild(group);
        }
      });
    });
    
    // Create arrowhead marker
    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    const marker = document.createElementNS('http://www.w3.org/2000/svg', 'marker');
    marker.setAttribute('id', 'arrowhead');
    marker.setAttribute('markerWidth', '10');
    marker.setAttribute('markerHeight', '7');
    marker.setAttribute('refX', '9');
    marker.setAttribute('refY', '3.5');
    marker.setAttribute('orient', 'auto');
    
    const polygon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
    polygon.setAttribute('points', '0 0, 10 3.5, 0 7');
    polygon.setAttribute('fill', '#888');
    
    marker.appendChild(polygon);
    defs.appendChild(marker);
    svg.appendChild(defs);
    
    // Draw nodes
    states.forEach(state => {
      if (positions.has(state)) {
        const pos = positions.get(state)!;
        
        // Create group for node
        const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        g.setAttribute('class', 'state-node');
        g.setAttribute('data-state', state);
        g.setAttribute('cursor', 'pointer');
        
        g.addEventListener('click', () => {
          handleStateClick(state);
        });
        
        // Create node rect
        const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        rect.setAttribute('x', `${pos.x}`);
        rect.setAttribute('y', `${pos.y}`);
        rect.setAttribute('width', `${nodeSize}`);
        rect.setAttribute('height', `${nodeHeight}`);
        rect.setAttribute('rx', '8');
        rect.setAttribute('ry', '8');
        
        // Check if this is the current state
        if (state === currentState) {
          rect.setAttribute('fill', '#d1fae5'); // Light green for current state
          rect.setAttribute('stroke', '#10b981'); // Green border
          rect.setAttribute('stroke-width', '2');
        } else if (state === initialState) {
          rect.setAttribute('fill', '#e0f2fe'); // Light blue for initial state
          rect.setAttribute('stroke', '#60a5fa'); // Blue border
          rect.setAttribute('stroke-width', '2');
        } else if (state === selectedState) {
          rect.setAttribute('fill', '#fef3c7'); // Light yellow for selected state
          rect.setAttribute('stroke', '#f59e0b'); // Amber border
          rect.setAttribute('stroke-width', '2');
        } else {
          rect.setAttribute('fill', '#f3f4f6'); // Light gray for other states
          rect.setAttribute('stroke', '#d1d5db'); // Gray border
          rect.setAttribute('stroke-width', '1');
        }
        
        // Create state name text
        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', `${pos.x + nodeSize/2}`);
        text.setAttribute('y', `${pos.y + nodeHeight/2}`);
        text.setAttribute('text-anchor', 'middle');
        text.setAttribute('dominant-baseline', 'middle');
        text.setAttribute('font-size', '12');
        text.setAttribute('font-family', 'sans-serif');
        text.setAttribute('fill', '#333');
        text.setAttribute('pointer-events', 'none');
        
        // If state name is too long, truncate it
        let displayText = state;
        if (displayText.length > 15) {
          displayText = displayText.substring(0, 12) + '...';
        }
        
        text.textContent = displayText;
        
        // Add tooltip title
        const title = document.createElementNS('http://www.w3.org/2000/svg', 'title');
        title.textContent = state;
        text.appendChild(title);
        
        g.appendChild(rect);
        g.appendChild(text);
        svg.appendChild(g);
      }
    });
    
  }, [stateMachine, currentState, selectedState, onStateClick]);
  
  // Update selected state when current state changes
  useEffect(() => {
    if (currentState) {
      setSelectedState(currentState);
      
      // Get state data for the current state
      if (stateMachine) {
        const stateData = stateMachine.states[currentState];
        const nextStates = getStateTransitions(currentState);
        
        setStateInfo({
          nextStates,
          text: stateData.meta?.agentText || stateData.text,
          systemMessage: stateData.meta?.systemMessage
        });
      }
    }
  }, [currentState, stateMachine]);
  
  if (!stateMachine) {
    return <div className="flex items-center justify-center h-full p-8 text-muted-foreground">No state machine loaded</div>;
  }

  return (
    <div className="flex flex-col gap-2 h-full">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          <Button variant="outline" size="icon" onClick={handleZoomIn} title="Zoom In">
            <ZoomIn size={18} />
          </Button>
          <Button variant="outline" size="icon" onClick={handleZoomOut} title="Zoom Out">
            <ZoomOut size={18} />
          </Button>
          <Button variant="outline" size="icon" onClick={handleReset} title="Reset View">
            <RefreshCw size={18} />
          </Button>
        </div>
        <div className="text-sm text-muted-foreground">
          {selectedState ? `Selected: ${selectedState}` : 'Click any state to view details'}
        </div>
      </div>
      
      <div 
        ref={containerRef}
        className="relative overflow-hidden border rounded-md bg-white h-[500px]"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onWheel={handleWheel}
      >
        <svg 
          ref={svgRef} 
          className="absolute w-full h-full cursor-grab"
          style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
            transformOrigin: '0 0'
          }}
          viewBox="0 0 1000 800" 
          preserveAspectRatio="xMidYMid meet"
        >
          {/* SVG content will be generated in useEffect */}
        </svg>
      </div>
      
      {/* State details panel */}
      {selectedState && stateInfo && (
        <Card className="mt-4">
          <CardContent className="pt-4">
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium">Current State: <span className="font-bold">{selectedState}</span></h3>
              </div>
              
              {stateInfo.text && (
                <div className="p-3 rounded-md bg-gray-50">
                  <h4 className="text-xs font-medium mb-1 text-gray-500">Agent Text</h4>
                  <p className="text-sm">{stateInfo.text}</p>
                </div>
              )}
              
              {stateInfo.systemMessage && (
                <div className="p-3 rounded-md bg-blue-50">
                  <h4 className="text-xs font-medium mb-1 text-blue-500">System Message</h4>
                  <p className="text-sm">{stateInfo.systemMessage}</p>
                </div>
              )}
              
              {stateInfo.nextStates.length > 0 && (
                <div>
                  <h4 className="text-xs font-medium mb-2 text-gray-500">Available Transitions</h4>
                  <div className="flex flex-wrap gap-2">
                    {stateInfo.nextStates.map(({state, trigger}, index) => (
                      <Popover key={index}>
                        <PopoverTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="text-xs"
                          >
                            <Search className="w-3 h-3 mr-1" />
                            {state}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-80 p-3">
                          <div className="space-y-2">
                            <h4 className="font-medium">Transition Details</h4>
                            <div className="text-sm">
                              <p>From: <span className="font-medium">{selectedState}</span></p>
                              <p>To: <span className="font-medium">{state}</span></p>
                              <p>Trigger: <span className="font-medium">{trigger}</span></p>
                            </div>
                            <Button 
                              size="sm" 
                              onClick={() => handleTransitionClick(state)}
                              className="mt-2 w-full"
                            >
                              Navigate to this state
                            </Button>
                          </div>
                        </PopoverContent>
                      </Popover>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default DecisionTreeVisualizer;
