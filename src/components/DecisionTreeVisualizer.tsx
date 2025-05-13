
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
  const [selectedState, setSelectedState] = useState<string | null>(null);
  
  // Update selected state when centerOnState changes
  useEffect(() => {
    if (centerOnState) {
      setSelectedState(centerOnState);
    }
  }, [centerOnState]);
  
  // Handle state click and selection
  const handleStateClick = (state: string) => {
    setSelectedState(state);
    if (onStateClick) {
      onStateClick(state);
    }
  };
  
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
  
  // Recalculate and update the tree visualization when stateMachine, currentState, or zoom changes
  useEffect(() => {
    if (!stateMachine || !svgRef.current) return;
    
    try {
      // Configuration for node layout - increased node size
      const nodeSize = { width: 180, height: 50 }; // Increased from 150x40
      const levelHeight = 100; // Increased from 80
      
      // Calculate levels and state positions
      const { levelInfo } = calculateStateLevels(stateMachine);
      const positions = calculateStatePositions(levelInfo, nodeSize, levelHeight);
      
      // Store positions for later use
      setStatePositions(positions);
      
      // Calculate and set viewBox dimensions
      // Use either the explicitly provided centerOnState or default to currentState
      const stateToCenter = centerOnState || currentState;
      const newViewBox = calculateViewBox(positions, zoomLevel, stateToCenter);
      setViewBox(newViewBox);
      
      // Clear the SVG to prevent duplications
      const svg = svgRef.current;
      if (!svg) return;
      
      // Remove all child elements except defs
      while (svg.firstChild) {
        svg.removeChild(svg.firstChild);
      }
      
      // Create defs for markers and filters
      const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
      
      // Create arrow marker
      const marker = document.createElementNS('http://www.w3.org/2000/svg', 'marker');
      marker.setAttribute('id', 'arrowhead');
      marker.setAttribute('markerWidth', '10');
      marker.setAttribute('markerHeight', '7');
      marker.setAttribute('refX', '10');
      marker.setAttribute('refY', '3.5');
      marker.setAttribute('orient', 'auto');
      
      const markerPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      markerPath.setAttribute('d', 'M0,0 L10,3.5 L0,7 Z');
      markerPath.setAttribute('fill', '#9ca3af');
      
      marker.appendChild(markerPath);
      
      // Create glow filter for selected state
      const filter = document.createElementNS('http://www.w3.org/2000/svg', 'filter');
      filter.setAttribute('id', 'glow');
      filter.setAttribute('x', '-20%');
      filter.setAttribute('y', '-20%');
      filter.setAttribute('width', '140%');
      filter.setAttribute('height', '140%');
      
      const feGaussianBlur = document.createElementNS('http://www.w3.org/2000/svg', 'feGaussianBlur');
      feGaussianBlur.setAttribute('stdDeviation', '3');
      feGaussianBlur.setAttribute('result', 'blur');
      
      filter.appendChild(feGaussianBlur);
      defs.appendChild(marker);
      defs.appendChild(filter);
      svg.appendChild(defs);
      
      // First render all edges, to make sure they appear behind the nodes
      if (stateMachine && stateMachine.states) {
        Object.entries(stateMachine.states).forEach(([fromState, stateData]) => {
          if (stateData.on) {
            Object.entries(stateData.on).forEach(([trigger, toState]) => {
              // Skip rendering if positions aren't available
              if (!positions[fromState] || !positions[toState]) return;
              
              const fromPos = positions[fromState];
              const toPos = positions[toState];
              
              // Calculate edge endpoints
              const dx = toPos.x - fromPos.x;
              const dy = toPos.y - fromPos.y;
              const angle = Math.atan2(dy, dx);
              
              const fromX = fromPos.x + Math.cos(angle) * nodeSize.width / 2;
              const fromY = fromPos.y + Math.sin(angle) * nodeSize.height / 2;
              const toX = toPos.x - Math.cos(angle) * nodeSize.width / 2;
              const toY = toPos.y - Math.sin(angle) * nodeSize.height / 2;
              
              try {
                // Create edge group
                const edgeGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
                
                // Create bezier curve path
                const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                const midX = (fromX + toX) / 2 + Math.sin(angle) * 30;
                const midY = (fromY + toY) / 2 - Math.cos(angle) * 30;
                const pathData = `M${fromX},${fromY} Q${midX},${midY} ${toX},${toY}`;
                
                path.setAttribute('d', pathData);
                path.setAttribute('stroke', '#9ca3af');
                path.setAttribute('stroke-width', '1.5');
                path.setAttribute('fill', 'none');
                path.setAttribute('marker-end', 'url(#arrowhead)');
                
                edgeGroup.appendChild(path);
                svg.appendChild(edgeGroup);
              } catch (error) {
                console.error('Error rendering edge:', error);
              }
            });
          }
        });
      }
      
      // Then render all nodes on top of the edges
      Object.entries(stateMachine.states).forEach(([stateId, stateData]) => {
        if (positions[stateId]) {
          const pos = positions[stateId];
          const x = pos.x - nodeSize.width / 2; // Convert center pos to top-left
          const y = pos.y - nodeSize.height / 2;
          
          // Determine state properties
          const hasSensitiveData = stateData.meta?.sensitiveFields && 
                                stateData.meta.sensitiveFields.length > 0;
          const moduleType = stateData.meta?.module?.type || null;
          const isCurrentStateNode = stateId === currentState;
          const isSelectedNode = stateId === selectedState;
          
          try {
            // Create node group
            const nodeGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
            
            // Selection glow effect for selected state
            if (isSelectedNode) {
              const selectionGlow = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
              selectionGlow.setAttribute('x', String(x - 2));
              selectionGlow.setAttribute('y', String(y - 2));
              selectionGlow.setAttribute('width', String(nodeSize.width + 4));
              selectionGlow.setAttribute('height', String(nodeSize.height + 4));
              selectionGlow.setAttribute('rx', '10');
              selectionGlow.setAttribute('ry', '10');
              selectionGlow.setAttribute('fill', 'none');
              selectionGlow.setAttribute('stroke', '#ec4899');
              selectionGlow.setAttribute('stroke-width', '1');
              selectionGlow.setAttribute('opacity', '0.5');
              selectionGlow.setAttribute('filter', 'url(#glow)');
              
              nodeGroup.appendChild(selectionGlow);
            }
            
            // Create node rectangle
            const nodeRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            nodeRect.setAttribute('x', String(x));
            nodeRect.setAttribute('y', String(y));
            nodeRect.setAttribute('width', String(nodeSize.width));
            nodeRect.setAttribute('height', String(nodeSize.height));
            nodeRect.setAttribute('rx', '8');
            nodeRect.setAttribute('ry', '8');
            nodeRect.setAttribute('fill', isCurrentStateNode ? '#2563eb' : '#f3f4f6');
            
            // Border color based on properties
            let borderColor = '#d1d5db';
            if (isSelectedNode) borderColor = '#ec4899';
            else if (hasSensitiveData) borderColor = '#eab308';
            else if (moduleType) {
              switch(moduleType) {
                case ModuleType.VERIFICATION: borderColor = '#3b82f6'; break;
                case ModuleType.INFORMATION: borderColor = '#22c55e'; break;
                case ModuleType.CONTRACT: borderColor = '#8b5cf6'; break;
                case ModuleType.NACHBEARBEITUNG: 
                case ModuleType.FRANCHISE: 
                case ModuleType.INSURANCE_MODEL: borderColor = '#f59e0b'; break;
                default: borderColor = '#6b7280';
              }
            }
            
            const strokeWidth = isSelectedNode ? 4 : (hasSensitiveData ? 3 : (moduleType ? 2 : 1));
            nodeRect.setAttribute('stroke', borderColor);
            nodeRect.setAttribute('stroke-width', String(strokeWidth));
            nodeRect.setAttribute('cursor', isPanning ? 'grab' : 'pointer');
            
            // Create node text
            const nodeText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            nodeText.setAttribute('x', String(x + nodeSize.width / 2));
            nodeText.setAttribute('y', String(y + nodeSize.height / 2 + 5));
            nodeText.setAttribute('text-anchor', 'middle');
            nodeText.setAttribute('font-size', '14');
            nodeText.setAttribute('font-family', 'sans-serif');
            nodeText.setAttribute('fill', isCurrentStateNode ? 'white' : '#1f2937');
            nodeText.setAttribute('cursor', isPanning ? 'grab' : 'pointer');
            
            // Truncate state name if too long
            let displayName = stateId;
            if (displayName.length > 20) {
              displayName = displayName.substring(0, 18) + '...';
            }
            nodeText.textContent = displayName;
            
            // Add node elements to group
            nodeGroup.appendChild(nodeRect);
            nodeGroup.appendChild(nodeText);
            
            // Add module type icon if applicable
            if (moduleType) {
              const iconSize = 16;
              const iconX = x + nodeSize.width - 40;
              const iconY = y + 10;
              
              let iconPathData = '';
              let iconFill = '#6b7280';
              
              switch(moduleType) {
                case ModuleType.VERIFICATION:
                  iconPathData = `M${iconX},${iconY} l${iconSize/2},${iconSize/4} l${iconSize/2},-${iconSize/4} v${iconSize*0.7} a${iconSize/2},${iconSize/2} 0 0 1 -${iconSize/2},${iconSize/3} a${iconSize/2},${iconSize/2} 0 0 1 -${iconSize/2},-${iconSize/3} v-${iconSize*0.7} z`;
                  iconFill = '#3b82f6';
                  break;
                case ModuleType.INFORMATION:
                  iconPathData = `M${iconX + iconSize/2},${iconY + iconSize/2} m-${iconSize/2},0 a${iconSize/2},${iconSize/2} 0 1,1 ${iconSize},0 a${iconSize/2},${iconSize/2} 0 1,1 -${iconSize},0 M${iconX + iconSize/2},${iconY + iconSize/4} v${iconSize/10} M${iconX + iconSize/2},${iconY + iconSize/2} v${iconSize/3}`;
                  iconFill = '#22c55e';
                  break;
                case ModuleType.CONTRACT:
                  iconPathData = `M${iconX},${iconY} h${iconSize} v${iconSize} h-${iconSize} z M${iconX + iconSize/4},${iconY + iconSize/3} h${iconSize/2} M${iconX + iconSize/4},${iconY + iconSize/2} h${iconSize/2} M${iconX + iconSize/4},${iconY + iconSize*2/3} h${iconSize/2}`;
                  iconFill = '#8b5cf6';
                  break;
                case ModuleType.NACHBEARBEITUNG:
                case ModuleType.FRANCHISE:
                case ModuleType.INSURANCE_MODEL:
                  iconPathData = `M${iconX},${iconY} l${iconSize/2},${iconSize/4} l${iconSize/2},-${iconSize/4} v${iconSize*0.7} a${iconSize/2},${iconSize/2} 0 0 1 -${iconSize/2},${iconSize/3} a${iconSize/2},${iconSize/2} 0 0 1 -${iconSize/2},-${iconSize/3} v-${iconSize*0.7} z`;
                  iconFill = '#f59e0b';
                  break;
              }
              
              if (iconPathData) {
                const iconPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                iconPath.setAttribute('d', iconPathData);
                iconPath.setAttribute('fill', 'none');
                iconPath.setAttribute('stroke', iconFill);
                iconPath.setAttribute('stroke-width', '1.5');
                iconPath.setAttribute('cursor', isPanning ? 'grab' : 'pointer');
                
                nodeGroup.appendChild(iconPath);
              }
            }
            
            // Add sensitive data shield icon if applicable
            if (hasSensitiveData) {
              const iconSize = 16;
              const iconX = x + nodeSize.width - 20;
              const iconY = y + 10;
              
              const shieldPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
              const shieldPathData = `M${iconX},${iconY} l${iconSize/2},${iconSize/4} l${iconSize/2},-${iconSize/4} v${iconSize*0.7} a${iconSize/2},${iconSize/2} 0 0 1 -${iconSize/2},${iconSize/3} a${iconSize/2},${iconSize/2} 0 0 1 -${iconSize/2},-${iconSize/3} v-${iconSize*0.7} z`;
              
              shieldPath.setAttribute('d', shieldPathData);
              shieldPath.setAttribute('fill', '#eab308');
              shieldPath.setAttribute('stroke', '#854d0e');
              shieldPath.setAttribute('stroke-width', '1');
              shieldPath.setAttribute('cursor', isPanning ? 'grab' : 'pointer');
              
              nodeGroup.appendChild(shieldPath);
            }
            
            // Add click handler
            if (!isPanning) {
              nodeGroup.onclick = () => handleStateClick(stateId);
            }
            
            svg.appendChild(nodeGroup);
          } catch (error) {
            console.error('Error rendering node:', error);
          }
        }
      });
      
      // Set the SVG viewBox
      svg.setAttribute('viewBox', `${newViewBox.x} ${newViewBox.y} ${newViewBox.width} ${newViewBox.height}`);
      
      // Notify parent that centering has been applied
      if (stateToCenter) {
        onCenter && onCenter();
      }
      
    } catch (error) {
      console.error('Error in tree visualization:', error);
    }
    
  }, [stateMachine, currentState, zoomLevel, centerOnState, isPanning, selectedState]);
  
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
          data-testid="decision-tree-svg"
        ></svg>
      )}
      
      <TreeLegend />
    </div>
  );
};

export default DecisionTreeVisualizer;
