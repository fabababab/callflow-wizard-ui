
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
  
  return (
    <g>
      <path
        d={path}
        stroke="#9ca3af"
        strokeWidth="1.5"
        fill="none"
        markerEnd="url(#arrowhead)"
      />
      {/* Labels are now hidden by default */}
    </g>
  );
};

export default StateEdge;
