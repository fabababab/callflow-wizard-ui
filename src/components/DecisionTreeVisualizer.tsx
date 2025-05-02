
import React, { useEffect, useRef } from 'react';
import { StateMachine } from '@/utils/stateMachineLoader';

interface DecisionTreeVisualizerProps {
  stateMachine: StateMachine | null;
  currentState?: string;
}

const DecisionTreeVisualizer: React.FC<DecisionTreeVisualizerProps> = ({ 
  stateMachine, 
  currentState 
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  
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
    const stateToChildren = new Map<string, string[]>();
    states.forEach(state => {
      const stateData = stateMachine.states[state];
      
      // Handle both formats (on and nextState)
      if (stateData.on) {
        const transitions = Object.values(stateData.on);
        transitions.forEach(nextState => {
          if (!stateToChildren.has(state)) {
            stateToChildren.set(state, []);
          }
          if (nextState && states.includes(nextState) && !stateToChildren.get(state)?.includes(nextState)) {
            stateToChildren.get(state)?.push(nextState);
          }
        });
      } else if (stateData.nextState) {
        if (!stateToChildren.has(state)) {
          stateToChildren.set(state, []);
        }
        if (stateData.nextState && states.includes(stateData.nextState)) {
          stateToChildren.get(state)?.push(stateData.nextState);
        }
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
      
      const children = stateToChildren.get(state) || [];
      children.forEach(child => {
        if (!visited.has(child)) {
          queue.push([child, level + 1]);
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
      const startX = (svg.clientWidth - levelWidth) / 2;
      
      states.forEach((state, index) => {
        positions.set(state, {
          x: startX + index * horizontalSpacing,
          y: level * verticalSpacing + 50
        });
      });
    });
    
    // Draw edges first (so they're behind nodes)
    states.forEach(state => {
      const stateData = stateMachine.states[state];
      let nextStates: string[] = [];
      
      // Handle both formats (on and nextState)
      if (stateData.on) {
        nextStates = Object.values(stateData.on).filter(s => s && states.includes(s));
      } else if (stateData.nextState) {
        nextStates = [stateData.nextState];
      }
      
      nextStates.forEach(nextState => {
        if (positions.has(state) && positions.has(nextState)) {
          const startPos = positions.get(state)!;
          const endPos = positions.get(nextState)!;
          
          const line = document.createElementNS('http://www.w3.org/2000/svg', 'path');
          
          // Create a curved path
          const path = `M ${startPos.x + nodeSize/2} ${startPos.y + nodeHeight}
                       C ${startPos.x + nodeSize/2} ${(startPos.y + endPos.y) / 2},
                         ${endPos.x + nodeSize/2} ${(startPos.y + endPos.y) / 2},
                         ${endPos.x + nodeSize/2} ${endPos.y}`;
          
          line.setAttribute('d', path);
          line.setAttribute('stroke', '#888');
          line.setAttribute('stroke-width', '2');
          line.setAttribute('fill', 'none');
          line.setAttribute('marker-end', 'url(#arrowhead)');
          svg.appendChild(line);
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
    
  }, [stateMachine, currentState]);
  
  if (!stateMachine) {
    return <div className="flex items-center justify-center h-full p-8 text-muted-foreground">No state machine loaded</div>;
  }

  return (
    <div className="overflow-auto border rounded-md bg-white h-[500px]">
      <svg 
        ref={svgRef} 
        className="w-full h-full" 
        viewBox="0 0 1000 800" 
        preserveAspectRatio="xMidYMid meet"
      >
        {/* SVG content will be generated in useEffect */}
      </svg>
    </div>
  );
};

export default DecisionTreeVisualizer;
