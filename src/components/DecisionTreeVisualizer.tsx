import React, { useEffect, useRef, useState } from 'react';
import { StateMachine, StateMachineStatus } from '@/utils/stateMachineLoader';
import { Shield, AlertTriangle, CheckCircle, Info, FileText, ClipboardList, BookText } from 'lucide-react';
import { Badge } from './ui/badge';
import { ModuleType } from '@/types/modules';

interface DecisionTreeVisualizerProps {
  stateMachine: StateMachine | null;
  currentState?: string;
  onStateClick?: (state: string) => void;
  zoomLevel?: number;
  centerOnState?: string | null;
  onCenter?: () => void;
  isPanning?: boolean;
}

const DecisionTreeVisualizer: React.FC<DecisionTreeVisualizerProps> = ({
  stateMachine,
  currentState,
  onStateClick,
  zoomLevel = 400, // Default to 400% zoom
  centerOnState = null,
  onCenter,
  isPanning = false
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [statePositions, setStatePositions] = useState<{ [key: string]: { x: number, y: number } }>({});
  const [viewBox, setViewBox] = useState<{ x: number, y: number, width: number, height: number }>({ x: 0, y: 0, width: 0, height: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number, y: number }>({ x: 0, y: 0 });
  
  // Setup panning event handlers
  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    
    const handleMouseDown = (e: MouseEvent) => {
      if (!isPanning) return;
      setIsDragging(true);
      setDragStart({ x: e.clientX, y: e.clientY });
    };
    
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || !isPanning) return;
      
      const dx = (e.clientX - dragStart.x) * (viewBox.width / svg.clientWidth);
      const dy = (e.clientY - dragStart.y) * (viewBox.height / svg.clientHeight);
      
      setViewBox(prev => ({
        ...prev,
        x: prev.x - dx,
        y: prev.y - dy
      }));
      
      setDragStart({ x: e.clientX, y: e.clientY });
    };
    
    const handleMouseUp = () => {
      setIsDragging(false);
    };
    
    // Cursor change based on panning mode
    if (isPanning) {
      svg.style.cursor = 'grab';
    } else {
      svg.style.cursor = 'default';
    }
    
    // Add event listeners
    svg.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    
    return () => {
      svg.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isPanning, isDragging, dragStart, viewBox]);
  
  useEffect(() => {
    if (!stateMachine || !svgRef.current) return;
    
    const svg = svgRef.current;
    svg.innerHTML = '';
    
    const states = Object.keys(stateMachine.states);
    const initialState = stateMachine.initial || stateMachine.initialState || 'start';
    const nodeSize = { width: 150, height: 40 };
    const levelHeight = 80;
    const newStatePositions: { [key: string]: { x: number, y: number } } = {};
    
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
      
      newStatePositions[state] = { x: x + nodeSize.width / 2, y: y + nodeSize.height / 2 };
      
      const hasSensitiveData = stateMachine.states[state]?.meta?.sensitiveFields && 
                              stateMachine.states[state]?.meta?.sensitiveFields?.length > 0;
      
      const hasModule = stateMachine.states[state]?.meta?.module;
      const moduleType = hasModule ? stateMachine.states[state]?.meta?.module?.type : null;
      
      // Setup rectangle
      rect.setAttribute('x', x.toString());
      rect.setAttribute('y', y.toString());
      rect.setAttribute('width', nodeSize.width.toString());
      rect.setAttribute('height', nodeSize.height.toString());
      rect.setAttribute('rx', '8');
      rect.setAttribute('ry', '8');
      rect.setAttribute('fill', state === currentState ? '#2563eb' : '#f3f4f6');
      
      // Border color changes based on properties
      if (hasSensitiveData) {
        rect.setAttribute('stroke', '#eab308');
        rect.setAttribute('stroke-width', '3');
      } else if (hasModule) {
        // Different border colors for different module types
        switch(moduleType) {
          case ModuleType.VERIFICATION:
            rect.setAttribute('stroke', '#3b82f6');
            break;
          case ModuleType.INFORMATION:
            rect.setAttribute('stroke', '#22c55e');
            break;
          case ModuleType.CONTRACT:
            rect.setAttribute('stroke', '#8b5cf6');
            break;
          case ModuleType.NACHBEARBEITUNG:
            rect.setAttribute('stroke', '#f59e0b');
            break;
          case ModuleType.FRANCHISE:
            rect.setAttribute('stroke', '#f59e0b');
            break;
          case ModuleType.INSURANCE_MODEL:
            rect.setAttribute('stroke', '#f59e0b');
            break;
          default:
            rect.setAttribute('stroke', '#6b7280');
        }
        rect.setAttribute('stroke-width', '2');
      } else {
        rect.setAttribute('stroke', '#d1d5db');
        rect.setAttribute('stroke-width', '1');
      }
      
      rect.setAttribute('cursor', isPanning ? 'grab' : 'pointer');
      if (!isPanning) {
        rect.onclick = () => onStateClick && onStateClick(state);
      }
      
      // Setup text
      text.setAttribute('x', (x + nodeSize.width / 2).toString());
      text.setAttribute('y', (y + nodeSize.height / 2 + 5).toString());
      text.setAttribute('text-anchor', 'middle');
      text.setAttribute('font-size', '14');
      text.setAttribute('font-family', 'sans-serif');
      text.setAttribute('fill', state === currentState ? 'white' : '#1f2937');
      text.setAttribute('cursor', isPanning ? 'grab' : 'pointer');
      text.textContent = state;
      if (!isPanning) {
        text.onclick = () => onStateClick && onStateClick(state);
      }
      
      g.appendChild(rect);
      g.appendChild(text);
      
      // Add icons based on state properties
      
      // If state has a module, add a module type icon
      if (hasModule) {
        const moduleIcon = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        const iconSize = 16;
        const iconX = x + nodeSize.width - 40;
        const iconY = y + 10;
        
        let iconPath = '';
        let iconFill = '#6b7280';
        
        // Different icons and colors for different module types
        switch(moduleType) {
          case ModuleType.VERIFICATION:
            // Shield icon path
            iconPath = `M${iconX},${iconY} l${iconSize/2},${iconSize/4} l${iconSize/2},-${iconSize/4} v${iconSize*0.7} 
              a${iconSize/2},${iconSize/2} 0 0 1 -${iconSize/2},${iconSize/3} a${iconSize/2},${iconSize/2} 0 0 1 -${iconSize/2},-${iconSize/3} v-${iconSize*0.7} z`;
            iconFill = '#3b82f6';
            break;
          case ModuleType.INFORMATION:
            // Info icon path (circle with i)
            iconPath = `M${iconX + iconSize/2},${iconY + iconSize/2} m-${iconSize/2},0 a${iconSize/2},${iconSize/2} 0 1,1 ${iconSize},0 a${iconSize/2},${iconSize/2} 0 1,1 -${iconSize},0 
              M${iconX + iconSize/2},${iconY + iconSize/4} v${iconSize/10} M${iconX + iconSize/2},${iconY + iconSize/2} v${iconSize/3}`;
            iconFill = '#22c55e';
            break;
          case ModuleType.CONTRACT:
            // Document icon path
            iconPath = `M${iconX},${iconY} h${iconSize} v${iconSize} h-${iconSize} z M${iconX + iconSize/4},${iconY + iconSize/3} h${iconSize/2} M${iconX + iconSize/4},${iconY + iconSize/2} h${iconSize/2} M${iconX + iconSize/4},${iconY + iconSize*2/3} h${iconSize/2}`;
            iconFill = '#8b5cf6';
            break;
          case ModuleType.NACHBEARBEITUNG:
            // Clipboard icon path
            iconPath = `M${iconX + iconSize/4},${iconY} h${iconSize/2} v${iconSize/6} h-${iconSize/2} z M${iconX},${iconY + iconSize/6} h${iconSize} v${iconSize*5/6} h-${iconSize} z M${iconX + iconSize/4},${iconY + iconSize/2} h${iconSize/2} M${iconX + iconSize/4},${iconY + iconSize*2/3} h${iconSize/2}`;
            iconFill = '#f59e0b';
            break;
          case ModuleType.FRANCHISE:
            // Money icon path (simplified dollar sign)
            iconPath = `M${iconX + iconSize/2},${iconY} v${iconSize} M${iconX + iconSize/4},${iconY + iconSize/3} h${iconSize/2} M${iconX + iconSize/4},${iconY + iconSize*2/3} h${iconSize/2}`;
            iconFill = '#f59e0b';
            break;
          case ModuleType.INSURANCE_MODEL:
            // Insurance/shield icon
            iconPath = `M${iconX},${iconY} l${iconSize/2},${iconSize/4} l${iconSize/2},-${iconSize/4} v${iconSize*0.7} 
              a${iconSize/2},${iconSize/2} 0 0 1 -${iconSize/2},${iconSize/3} a${iconSize/2},${iconSize/2} 0 0 1 -${iconSize/2},-${iconSize/3} v-${iconSize*0.7} z`;
            iconFill = '#f59e0b';
            break;
          default:
            // Generic module icon
            iconPath = `M${iconX},${iconY} h${iconSize} v${iconSize} h-${iconSize} z`;
            iconFill = '#6b7280';
        }
        
        moduleIcon.setAttribute('d', iconPath);
        moduleIcon.setAttribute('fill', 'none');
        moduleIcon.setAttribute('stroke', iconFill);
        moduleIcon.setAttribute('stroke-width', '1.5');
        moduleIcon.setAttribute('cursor', 'pointer');
        
        g.appendChild(moduleIcon);
      }
      
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
      
      const from = newStatePositions[fromState];
      const to = newStatePositions[toState];
      
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
    
    // Apply zoom level to SVG viewBox
    const scaleFactor = zoomLevel / 100;
    const viewBoxWidth = svgWidth / scaleFactor;
    const viewBoxHeight = svgHeight / scaleFactor;
    
    // Calculate viewBox center based on zoom level and possibly center on a specific state
    let viewBoxX = 0;
    let viewBoxY = 0;
    
    const centerX = viewBoxWidth / 2;
    const centerY = viewBoxHeight / 2;
    
    // Center on specific state if requested
    if (centerOnState && newStatePositions[centerOnState]) {
      const pos = newStatePositions[centerOnState];
      viewBoxX = pos.x - centerX;
      viewBoxY = pos.y - centerY;
      
      // Notify parent that we've centered (only do this once)
      onCenter && onCenter();
    }
    
    // Set the viewBox with the calculated values
    const newViewBox = { x: viewBoxX, y: viewBoxY, width: viewBoxWidth, height: viewBoxHeight };
    setViewBox(newViewBox);
    
    // Set the initial viewBox
    svg.setAttribute('width', '100%');
    svg.setAttribute('height', '100%');
    svg.setAttribute('viewBox', `${newViewBox.x} ${newViewBox.y} ${newViewBox.width} ${newViewBox.height}`);
    
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
    
    // Store state positions for later use
    setStatePositions(newStatePositions);
    
  }, [stateMachine, currentState, onStateClick, zoomLevel, centerOnState, onCenter, isPanning]);
  
  // Update viewBox when it changes (for panning)
  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    
    svg.setAttribute('viewBox', `${viewBox.x} ${viewBox.y} ${viewBox.width} ${viewBox.height}`);
  }, [viewBox]);
  
  // Convert status to appropriate style and icon
  const getStatusBadge = (status?: StateMachineStatus) => {
    if (status === StateMachineStatus.PRODUCTION) {
      return (
        <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300 flex items-center gap-1">
          <CheckCircle className="h-3 w-3" />
          Stable
        </Badge>
      );
    } else if (status === StateMachineStatus.TESTING) {
      return (
        <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300 flex items-center gap-1">
          <AlertTriangle className="h-3 w-3" />
          Beta
        </Badge>
      );
    } else if (status === StateMachineStatus.DEVELOPMENT) {
      return (
        <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-300 flex items-center gap-1">
          <AlertTriangle className="h-3 w-3" />
          In Development
        </Badge>
      );
    }
    return null;
  };
  
  return (
    <div 
      className={`decision-tree-visualizer w-full overflow-auto ${isPanning ? 'cursor-grab' : ''}`} 
      ref={containerRef}
    >
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
      
      <div className="mt-4 flex flex-wrap items-center gap-2 text-sm text-gray-500 border-t pt-4">
        <div className="flex items-center gap-1 mr-2">
          <div className="w-3 h-3 bg-[#f3f4f6] border border-[#d1d5db] rounded-sm"></div>
          <span>Regular State</span>
        </div>
        
        <div className="flex items-center gap-1 mr-2">
          <div className="w-3 h-3 bg-[#2563eb] border border-[#2563eb] rounded-sm"></div>
          <span>Current State</span>
        </div>
        
        <div className="flex items-center gap-1 mr-2">
          <div className="w-3 h-3 bg-[#f3f4f6] border-2 border-[#eab308] rounded-sm"></div>
          <Shield className="h-3 w-3 text-yellow-500" />
          <span>Sensitive Data</span>
        </div>
        
        <div className="flex items-center gap-1 mr-2">
          <div className="w-3 h-3 bg-[#f3f4f6] border-2 border-[#3b82f6] rounded-sm"></div>
          <Shield className="h-3 w-3 text-blue-500" />
          <span>Verification</span>
        </div>
        
        <div className="flex items-center gap-1 mr-2">
          <div className="w-3 h-3 bg-[#f3f4f6] border-2 border-[#22c55e] rounded-sm"></div>
          <Info className="h-3 w-3 text-green-500" />
          <span>Information</span>
        </div>
        
        <div className="flex items-center gap-1 mr-2">
          <div className="w-3 h-3 bg-[#f3f4f6] border-2 border-[#8b5cf6] rounded-sm"></div>
          <FileText className="h-3 w-3 text-purple-500" />
          <span>Contract</span>
        </div>
        
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-[#f3f4f6] border-2 border-[#f59e0b] rounded-sm"></div>
          <ClipboardList className="h-3 w-3 text-amber-500" />
          <span>Module</span>
        </div>
      </div>
    </div>
  );
};

export default DecisionTreeVisualizer;
