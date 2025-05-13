
import React from 'react';
import { ModuleType } from '@/types/modules';
import { cn } from '@/lib/utils';

interface StateNodeProps {
  state: string;
  x: number;
  y: number;
  nodeSize: { width: number; height: number };
  isCurrentState: boolean;
  hasSensitiveData: boolean;
  moduleType: ModuleType | null;
  onClick?: (state: string) => void;
  isPanning: boolean;
  isSelected?: boolean;
}

const StateNode: React.FC<StateNodeProps> = ({
  state,
  x,
  y,
  nodeSize,
  isCurrentState,
  hasSensitiveData,
  moduleType,
  onClick,
  isPanning,
  isSelected = false
}) => {
  
  const handleClick = (e: React.MouseEvent) => {
    if (!isPanning && onClick) {
      onClick(state);
      e.stopPropagation();
    }
  };
  
  // Get border color based on module type
  const getBorderColor = (): string => {
    if (isSelected) return '#ec4899'; // Pink color for selected state
    if (hasSensitiveData) return '#eab308';
    
    if (moduleType) {
      switch(moduleType) {
        case ModuleType.VERIFICATION: return '#3b82f6';
        case ModuleType.INFORMATION: return '#22c55e';
        case ModuleType.CONTRACT: return '#8b5cf6';
        case ModuleType.NACHBEARBEITUNG: return '#f59e0b';
        case ModuleType.FRANCHISE: return '#f59e0b';
        case ModuleType.INSURANCE_MODEL: return '#f59e0b';
        default: return '#6b7280';
      }
    }
    
    return '#d1d5db';
  };
  
  const getIconPath = (): string => {
    if (!moduleType) return '';
    
    const iconSize = 16;
    const iconX = x + nodeSize.width - 40;
    const iconY = y + 10;
    
    switch(moduleType) {
      case ModuleType.VERIFICATION:
        return `M${iconX},${iconY} l${iconSize/2},${iconSize/4} l${iconSize/2},-${iconSize/4} v${iconSize*0.7} 
          a${iconSize/2},${iconSize/2} 0 0 1 -${iconSize/2},${iconSize/3} a${iconSize/2},${iconSize/2} 0 0 1 -${iconSize/2},-${iconSize/3} v-${iconSize*0.7} z`;
      case ModuleType.INFORMATION:
        return `M${iconX + iconSize/2},${iconY + iconSize/2} m-${iconSize/2},0 a${iconSize/2},${iconSize/2} 0 1,1 ${iconSize},0 a${iconSize/2},${iconSize/2} 0 1,1 -${iconSize},0 
          M${iconX + iconSize/2},${iconY + iconSize/4} v${iconSize/10} M${iconX + iconSize/2},${iconY + iconSize/2} v${iconSize/3}`;
      case ModuleType.CONTRACT:
        return `M${iconX},${iconY} h${iconSize} v${iconSize} h-${iconSize} z M${iconX + iconSize/4},${iconY + iconSize/3} h${iconSize/2} M${iconX + iconSize/4},${iconY + iconSize/2} h${iconSize/2} M${iconX + iconSize/4},${iconY + iconSize*2/3} h${iconSize/2}`;
      case ModuleType.NACHBEARBEITUNG:
        return `M${iconX + iconSize/4},${iconY} h${iconSize/2} v${iconSize/6} h-${iconSize/2} z M${iconX},${iconY + iconSize/6} h${iconSize} v${iconSize*5/6} h-${iconSize} z M${iconX + iconSize/4},${iconY + iconSize/2} h${iconSize/2} M${iconX + iconSize/4},${iconY + iconSize*2/3} h${iconSize/2}`;
      case ModuleType.FRANCHISE:
        return `M${iconX + iconSize/2},${iconY} v${iconSize} M${iconX + iconSize/4},${iconY + iconSize/3} h${iconSize/2} M${iconX + iconSize/4},${iconY + iconSize*2/3} h${iconSize/2}`;
      case ModuleType.INSURANCE_MODEL:
        return `M${iconX},${iconY} l${iconSize/2},${iconSize/4} l${iconSize/2},-${iconSize/4} v${iconSize*0.7} 
          a${iconSize/2},${iconSize/2} 0 0 1 -${iconSize/2},${iconSize/3} a${iconSize/2},${iconSize/2} 0 0 1 -${iconSize/2},-${iconSize/3} v-${iconSize*0.7} z`;
      default:
        return `M${iconX},${iconY} h${iconSize} v${iconSize} h-${iconSize} z`;
    }
  };
  
  const getShieldIconPath = (): string => {
    if (!hasSensitiveData) return '';
    
    const iconSize = 16;
    const iconX = x + nodeSize.width - 20;
    const iconY = y + 10;
    
    return `M${iconX},${iconY} l${iconSize/2},${iconSize/4} l${iconSize/2},-${iconSize/4} v${iconSize*0.7} 
      a${iconSize/2},${iconSize/2} 0 0 1 -${iconSize/2},${iconSize/3} a${iconSize/2},${iconSize/2} 0 0 1 -${iconSize/2},-${iconSize/3} v-${iconSize*0.7} z`;
  };
  
  const getIconFill = (): string => {
    if (!moduleType) return '#6b7280';
    
    switch(moduleType) {
      case ModuleType.VERIFICATION: return '#3b82f6';
      case ModuleType.INFORMATION: return '#22c55e';
      case ModuleType.CONTRACT: return '#8b5cf6';
      case ModuleType.NACHBEARBEITUNG: return '#f59e0b';
      case ModuleType.FRANCHISE: return '#f59e0b';
      case ModuleType.INSURANCE_MODEL: return '#f59e0b';
      default: return '#6b7280';
    }
  };
  
  // Truncate state name if too long
  const displayStateName = (name: string) => {
    if (name.length > 20) {
      return name.substring(0, 18) + '...';
    }
    return name;
  };
  
  const cursor = isPanning ? 'grab' : 'pointer';
  const borderColor = getBorderColor();
  const strokeWidth = isSelected ? 4 : (hasSensitiveData ? 3 : (moduleType ? 2 : 1));
  
  return (
    <g>
      {/* Selection glow effect for selected state */}
      {isSelected && (
        <rect
          x={x - 2}
          y={y - 2}
          width={nodeSize.width + 4}
          height={nodeSize.height + 4}
          rx={10}
          ry={10}
          fill="none"
          stroke="#ec4899"
          strokeWidth={1}
          opacity={0.5}
          filter="url(#glow)"
        />
      )}
      
      {/* Node Rectangle */}
      <rect
        x={x}
        y={y}
        width={nodeSize.width}
        height={nodeSize.height}
        rx={8}
        ry={8}
        fill={isCurrentState ? '#2563eb' : '#f3f4f6'}
        stroke={borderColor}
        strokeWidth={strokeWidth}
        cursor={cursor}
        onClick={handleClick}
      />
      
      {/* Node Label */}
      <text
        x={x + nodeSize.width / 2}
        y={y + nodeSize.height / 2 + 5}
        textAnchor="middle"
        fontSize={14}
        fontFamily="sans-serif"
        fill={isCurrentState ? 'white' : '#1f2937'}
        cursor={cursor}
        onClick={handleClick}
      >
        {displayStateName(state)}
      </text>
      
      {/* Module Type Icon */}
      {moduleType && (
        <path
          d={getIconPath()}
          fill="none"
          stroke={getIconFill()}
          strokeWidth={1.5}
          cursor={cursor}
        />
      )}
      
      {/* Sensitive Data Shield Icon */}
      {hasSensitiveData && (
        <path
          d={getShieldIconPath()}
          fill="#eab308"
          stroke="#854d0e"
          strokeWidth={1}
          cursor={cursor}
        />
      )}
    </g>
  );
};

export default StateNode;
