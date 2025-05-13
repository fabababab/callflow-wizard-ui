
import React from 'react';

interface StateEdgeProps {
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
  label: string;
}

const StateEdge: React.FC<StateEdgeProps> = ({ fromX, fromY, toX, toY, label }) => {
  // Calculate a quadratic bezier curve path
  const dx = toX - fromX;
  const dy = toY - fromY;
  const angle = Math.atan2(dy, dx);
  
  // Control point offset to create a curved path
  const path = `M${fromX},${fromY} Q${(fromX + toX) / 2 + Math.sin(angle) * 30},${(fromY + toY) / 2 - Math.cos(angle) * 30} ${toX},${toY}`;
  
  // Format label if it's too long
  const displayLabel = typeof label === 'string' && label.length > 15 
    ? label.substring(0, 15) + '...' 
    : label;
  
  // Position the label in the middle of the curve
  const midX = (fromX + toX) / 2 + Math.sin(angle) * 15;
  const midY = (fromY + toY) / 2 - Math.cos(angle) * 15;
  
  return (
    <g>
      <path
        d={path}
        stroke="#9ca3af"
        strokeWidth="1.5"
        fill="none"
        markerEnd="url(#arrowhead)"
      />
      {label && label !== 'DEFAULT' && (
        <text
          x={midX}
          y={midY}
          textAnchor="middle"
          fontSize={10}
          fontFamily="sans-serif"
          fill="#6b7280"
        >
          {displayLabel}
        </text>
      )}
    </g>
  );
};

export default StateEdge;
