
import React, { useEffect, useRef } from 'react';
import { StateMachine, StateMachineStatus } from '@/utils/stateMachineLoader';
import { Shield, AlertTriangle, CheckCircle } from 'lucide-react';
import { Badge } from './ui/badge';

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
  
  useEffect(() => {
    if (!stateMachine || !svgRef.current) return;
    
    const svg = svgRef.current;
    svg.innerHTML = '';
    
    const states = Object.keys(stateMachine.states);
    const initialState = stateMachine.initial || stateMachine.initialState || 'start';
    const statePositions: { [key: string]: { x: number, y: number } } = {};
    const nodeSize = { width: 150, height: 40 };
    const levelHeight = 80;
    
    // Function to create nodes
    const createNode = (state: string, level: number, position: number, totalInLevel: number): SVGGElement => {
      const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      
      // Calculate node position
      const spacing = 200;
      const levelWidth = totalInLevel * spacing;
      const startX = Math.max(0, (1200 - levelWidth) / 2);
      const x = startX + position * spacing;
      const y = level * levelHeight + 50;
      
      statePositions[state] = { x: x + nodeSize.width / 2, y: y + nodeSize.height / 2 };
      
      const hasSensitiveData = stateMachine.states[state]?.meta?.sensitiveFields && 
                              stateMachine.states[state]?.meta?.sensitiveFields?.length > 0;
      
      // Setup rectangle
      rect.setAttribute('x', x.toString());
      rect.setAttribute('y', y.toString());
      rect.setAttribute('width', nodeSize.width.toString());
      rect.setAttribute('height', nodeSize.height.toString());
      rect.setAttribute('rx', '8');
      rect.setAttribute('ry', '8');
      rect.setAttribute('fill', state === currentState ? '#2563eb' : '#f3f4f6');
      rect.setAttribute('stroke', hasSensitiveData ? '#eab308' : '#d1d5db');
      rect.setAttribute('stroke-width', hasSensitiveData ? '3' : '1');
      rect.setAttribute('cursor', 'pointer');
      rect.onclick = () => onStateClick && onStateClick(state);
      
      // Setup text
      text.setAttribute('x', (x + nodeSize.width / 2).toString());
      text.setAttribute('y', (y + nodeSize.height / 2 + 5).toString());
      text.setAttribute('text-anchor', 'middle');
      text.setAttribute('font-size', '14');
      text.setAttribute('font-family', 'sans-serif');
      text.setAttribute('fill', state === currentState ? 'white' : '#1f2937');
      text.setAttribute('cursor', 'pointer');
      text.textContent = state;
      text.onclick = () => onStateClick && onStateClick(state);
      
      g.appendChild(rect);
      g.appendChild(text);
      
      // Add a shield icon for states with sensitive data
      if (hasSensitiveData) {
        const shieldIcon = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        
        const iconSize = 16;
        const iconX = x + nodeSize.width - 20;
        const iconY = y + 10;
        
        // Shield icon path data (simplified version of Shield icon)
        shieldIcon.setAttribute('d', `M${iconX},${iconY} l${iconSize/2},${iconSize/4} l${iconSize/2},-${iconSize/4} v${iconSize*0.7} 
          a${iconSize/2},${iconSize/2} 0 0 1 -${iconSize/2},${iconSize/3} a${iconSize/2},${iconSize/2} 0 0 1 -${iconSize/2},-${iconSize/3} v-${iconSize*0.7} z`);
        shieldIcon.setAttribute('fill', '#eab308');
        shieldIcon.setAttribute('stroke', '#854d0e');
        shieldIcon.setAttribute('stroke-width', '1');
        shieldIcon.setAttribute('cursor', 'pointer');
        
        g.appendChild(shieldIcon);
      }
      
      return g;
    };
    
    // Function to create edges
    const createEdge = (fromState: string, toState: string, label: string): SVGGElement => {
      const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      
      const from = statePositions[fromState];
      const to = statePositions[toState];
      
      if (from && to) {
        // Calculate path
        const dx = to.x - from.x;
        const dy = to.y - from.y;
        const angle = Math.atan2(dy, dx);
        
        const fromX = from.x + Math.cos(angle) * nodeSize.width / 2;
        const fromY = from.y + Math.sin(angle) * nodeSize.height / 2;
        const toX = to.x - Math.cos(angle) * nodeSize.width / 2;
        const toY = to.y - Math.sin(angle) * nodeSize.height / 2;
        
        const path = `M${fromX},${fromY} Q${(fromX + toX) / 2 + Math.sin(angle) * 30},${(fromY + toY) / 2 - Math.cos(angle) * 30} ${toX},${toY}`;
        
        line.setAttribute('d', path);
        line.setAttribute('stroke', '#9ca3af');
        line.setAttribute('stroke-width', '1.5');
        line.setAttribute('fill', 'none');
        line.setAttribute('marker-end', 'url(#arrowhead)');
        
        g.appendChild(line);
        
        // Add a small label for the edge
        if (label && label !== 'DEFAULT') {
          const textEl = document.createElementNS('http://www.w3.org/2000/svg', 'text');
          const midX = (fromX + toX) / 2 + Math.sin(angle) * 15;
          const midY = (fromY + toY) / 2 - Math.cos(angle) * 15;
          
          textEl.setAttribute('x', midX.toString());
          textEl.setAttribute('y', midY.toString());
          textEl.setAttribute('text-anchor', 'middle');
          textEl.setAttribute('font-size', '10');
          textEl.setAttribute('font-family', 'sans-serif');
          textEl.setAttribute('fill', '#6b7280');
          textEl.textContent = typeof label === 'string' && label.length > 15 ? label.substring(0, 15) + '...' : label;
          
          g.appendChild(textEl);
        }
      }
      
      return g;
    };
    
    // First pass: build level info
    const levelInfo: { [level: number]: string[] } = {};
    const stateLevel: { [state: string]: number } = {};
    
    // Start with initial state
    stateLevel[initialState] = 0;
    levelInfo[0] = [initialState];
    
    // Build level information
    let allProcessed = false;
    let maxLevel = 0;
    
    while (!allProcessed) {
      allProcessed = true;
      
      for (const state of states) {
        if (stateLevel[state] === undefined) {
          const stateData = stateMachine.states[state];
          let incoming = false;
          
          for (const sourceState of states) {
            if (stateLevel[sourceState] !== undefined) {
              const sourceStateData = stateMachine.states[sourceState];
              
              // Check if there's a transition from sourceState to state
              if (sourceStateData.on) {
                for (const [trigger, targetState] of Object.entries(sourceStateData.on)) {
                  if (targetState === state) {
                    stateLevel[state] = stateLevel[sourceState] + 1;
                    maxLevel = Math.max(maxLevel, stateLevel[state]);
                    
                    if (!levelInfo[stateLevel[state]]) {
                      levelInfo[stateLevel[state]] = [];
                    }
                    
                    levelInfo[stateLevel[state]].push(state);
                    incoming = true;
                    break;
                  }
                }
              }
              
              if (incoming) break;
            }
          }
          
          if (!incoming) {
            allProcessed = false;
          }
        }
      }
      
      // If we've gone through all states and some still don't have levels, place them at level 1
      if (!allProcessed) {
        for (const state of states) {
          if (stateLevel[state] === undefined) {
            stateLevel[state] = 1;
            if (!levelInfo[1]) levelInfo[1] = [];
            levelInfo[1].push(state);
          }
        }
        allProcessed = true;
      }
    }
    
    // Set SVG size based on content
    const numLevels = Object.keys(levelInfo).length;
    const maxStatesInLevel = Math.max(...Object.values(levelInfo).map(states => states.length));
    
    const svgWidth = Math.max(1200, maxStatesInLevel * 200);
    const svgHeight = Math.max(600, numLevels * levelHeight + 100);
    
    svg.setAttribute('viewBox', `0 0 ${svgWidth} ${svgHeight}`);
    svg.setAttribute('width', '100%');
    svg.setAttribute('height', '100%');
    
    // Create marker for arrows
    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    const marker = document.createElementNS('http://www.w3.org/2000/svg', 'marker');
    const markerPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    
    marker.setAttribute('id', 'arrowhead');
    marker.setAttribute('markerWidth', '10');
    marker.setAttribute('markerHeight', '7');
    marker.setAttribute('refX', '10');
    marker.setAttribute('refY', '3.5');
    marker.setAttribute('orient', 'auto');
    
    markerPath.setAttribute('d', 'M0,0 L10,3.5 L0,7 Z');
    markerPath.setAttribute('fill', '#9ca3af');
    
    marker.appendChild(markerPath);
    defs.appendChild(marker);
    svg.appendChild(defs);
    
    // Create nodes
    for (const [levelStr, levelStates] of Object.entries(levelInfo)) {
      const level = parseInt(levelStr);
      
      levelStates.forEach((state, index) => {
        const node = createNode(state, level, index, levelStates.length);
        svg.appendChild(node);
      });
    }
    
    // Create edges
    for (const state of states) {
      const stateData = stateMachine.states[state];
      
      if (stateData.on) {
        for (const [trigger, targetState] of Object.entries(stateData.on)) {
          const edge = createEdge(state, targetState, trigger);
          svg.appendChild(edge);
        }
      }
    }
    
  }, [stateMachine, currentState, onStateClick]);

  // Convert status to appropriate style and icon
  const getStatusBadge = (status?: StateMachineStatus) => {
    switch(status) {
      case 'stable':
        return (
          <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300 flex items-center gap-1">
            <CheckCircle className="h-3 w-3" />
            Stable
          </Badge>
        );
      case 'beta':
        return (
          <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300 flex items-center gap-1">
            <AlertTriangle className="h-3 w-3" />
            Beta
          </Badge>
        );
      case 'in-development':
        return (
          <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-300 flex items-center gap-1">
            <AlertTriangle className="h-3 w-3" />
            In Development
          </Badge>
        );
      default:
        return null;
    }
  };
  
  return (
    <div className="decision-tree-visualizer w-full overflow-auto">
      {stateMachine?.status && (
        <div className="mb-4">
          {getStatusBadge(stateMachine.status)}
        </div>
      )}
      
      {!stateMachine ? (
        <div className="flex items-center justify-center h-64 text-gray-400">
          No state machine data available
        </div>
      ) : (
        <svg
          ref={svgRef}
          className="w-full h-[500px]"
          xmlns="http://www.w3.org/2000/svg"
        ></svg>
      )}
      
      <div className="mt-4 flex items-center gap-2 text-sm text-gray-500 border-t pt-4">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-[#f3f4f6] border border-[#d1d5db] rounded-sm"></div>
          <span>Regular State</span>
        </div>
        
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-[#2563eb] border border-[#2563eb] rounded-sm"></div>
          <span>Current State</span>
        </div>
        
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-[#f3f4f6] border-2 border-[#eab308] rounded-sm"></div>
          <Shield className="h-3 w-3 text-yellow-500" />
          <span>Contains Sensitive Data</span>
        </div>
      </div>
    </div>
  );
};

export default DecisionTreeVisualizer;
