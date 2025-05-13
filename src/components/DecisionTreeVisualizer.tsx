
import React, { useEffect, useRef, useState } from 'react';
import { StateMachine, StateMachineStatus } from '@/utils/stateMachineLoader';
import { ModuleType } from '@/types/modules';
import StatusBadge from './decision-tree/StatusBadge';
import TreeLegend from './decision-tree/TreeLegend';
import StateNode from './decision-tree/StateNode';
import StateEdge from './decision-tree/StateEdge';
import { calculateStateLevels, calculateStatePositions, calculateViewBox } from './decision-tree/TreeUtils';

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
    
    // Configuration for node layout
    const nodeSize = { width: 150, height: 40 };
    const levelHeight = 80;
    
    // Calculate levels and state positions
    const { levelInfo } = calculateStateLevels(stateMachine);
    const positions = calculateStatePositions(levelInfo, nodeSize, levelHeight);
    
    // Store positions for later use
    setStatePositions(positions);
    
    // Calculate and set viewBox dimensions
    const newViewBox = calculateViewBox(positions, zoomLevel, centerOnState);
    setViewBox(newViewBox);
    
    // Clear the SVG to prevent duplications
    const svg = svgRef.current;
    svg.innerHTML = '';
    
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
    
    // Render state nodes
    Object.entries(stateMachine.states).forEach(([stateId, stateData]) => {
      if (positions[stateId]) {
        const pos = positions[stateId];
        const x = pos.x - nodeSize.width / 2; // Convert center pos to top-left
        const y = pos.y - nodeSize.height / 2;
        
        // Determine state properties
        const hasSensitiveData = stateData.meta?.sensitiveFields && 
                                stateData.meta.sensitiveFields.length > 0;
        const moduleType = stateData.meta?.module?.type || null;
        
        // Create node element
        const nodeElement = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        
        // Use React to render the node component to HTML string
        const nodeComponent = (
          <StateNode
            state={stateId}
            x={x}
            y={y}
            nodeSize={nodeSize}
            isCurrentState={stateId === currentState}
            hasSensitiveData={hasSensitiveData}
            moduleType={moduleType}
            onClick={onStateClick}
            isPanning={isPanning}
          />
        );
        
        // Apply the component's HTML to the SVG group
        const tempDiv = document.createElement('div');
        // This is a simplified approach - in a real React component you'd use createPortal
        // We're using this approach since we need to work with native SVG DOM for performance
        tempDiv.innerHTML = `<svg>${(nodeComponent as any).props.children.map((child: any) => 
          typeof child === 'object' ? 
            `<${child.type} ${Object.entries(child.props).map(([k, v]) => 
              typeof v !== 'function' && k !== 'children' ? `${k}="${v}"` : ''
            ).join(' ')}>${child.props.children || ''}</${child.type}>` : 
            child
        ).join('')}</svg>`;
        
        const svg = tempDiv.querySelector('svg');
        if (svg) {
          Array.from(svg.childNodes).forEach(node => {
            nodeElement.appendChild(node.cloneNode(true));
          });
        }
        
        // Add click handler
        if (onStateClick && !isPanning) {
          nodeElement.onclick = () => onStateClick(stateId);
        }
        
        svg.appendChild(nodeElement);
      }
    });
    
    // Render edges between states
    Object.entries(stateMachine.states).forEach(([fromState, stateData]) => {
      if (stateData.on) {
        Object.entries(stateData.on).forEach(([trigger, toState]) => {
          const fromPos = positions[fromState];
          const toPos = positions[toState];
          
          if (fromPos && toPos) {
            // Calculate edge endpoints
            const dx = toPos.x - fromPos.x;
            const dy = toPos.y - fromPos.y;
            const angle = Math.atan2(dy, dx);
            
            const fromX = fromPos.x + Math.cos(angle) * nodeSize.width / 2;
            const fromY = fromPos.y + Math.sin(angle) * nodeSize.height / 2;
            const toX = toPos.x - Math.cos(angle) * nodeSize.width / 2;
            const toY = toPos.y - Math.sin(angle) * nodeSize.height / 2;
            
            // Create edge element
            const edgeElement = document.createElementNS('http://www.w3.org/2000/svg', 'g');
            
            // Use React to render the edge component to HTML string
            const edgeComponent = (
              <StateEdge
                fromX={fromX}
                fromY={fromY}
                toX={toX}
                toY={toY}
                label={trigger}
              />
            );
            
            // Apply the component's HTML to the SVG group
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = `<svg>${(edgeComponent as any).props.children.map((child: any) => 
              typeof child === 'object' ? 
                `<${child.type} ${Object.entries(child.props).map(([k, v]) => 
                  typeof v !== 'function' && k !== 'children' ? `${k}="${v}"` : ''
                ).join(' ')}>${child.props.children || ''}</${child.type}>` : 
                child
            ).join('')}</svg>`;
            
            const svgContent = tempDiv.querySelector('svg');
            if (svgContent) {
              Array.from(svgContent.childNodes).forEach(node => {
                edgeElement.appendChild(node.cloneNode(true));
              });
            }
            
            svg.appendChild(edgeElement);
          }
        });
      }
    });
    
    // Set the SVG viewBox
    svg.setAttribute('viewBox', `${newViewBox.x} ${newViewBox.y} ${newViewBox.width} ${newViewBox.height}`);
    
    // Notify parent that centering has been applied
    if (centerOnState) {
      onCenter && onCenter();
    }
  }, [stateMachine, currentState, onStateClick, zoomLevel, centerOnState, isPanning]);
  
  // Update viewBox when it changes (for panning)
  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    
    svg.setAttribute('viewBox', `${viewBox.x} ${viewBox.y} ${viewBox.width} ${viewBox.height}`);
  }, [viewBox]);
  
  return (
    <div 
      className={`decision-tree-visualizer w-full overflow-auto ${isPanning ? 'cursor-grab' : ''}`}
    >
      {stateMachine?.status && (
        <div className="mb-4">
          <StatusBadge status={stateMachine.status} />
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
      
      <TreeLegend />
    </div>
  );
};

export default DecisionTreeVisualizer;
