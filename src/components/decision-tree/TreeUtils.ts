
import { StateMachine } from '@/utils/stateMachineLoader';

// Type definition for state positions
export type StatePositions = { [key: string]: { x: number, y: number } };

// Type definition for level information
export type LevelInfo = { [level: number]: string[] };

// Calculate levels for states in the state machine
export function calculateStateLevels(
  stateMachine: StateMachine
): { levelInfo: LevelInfo; stateLevel: { [state: string]: number }; maxLevel: number } {
  const states = Object.keys(stateMachine.states);
  const initialState = stateMachine.initial || stateMachine.initialState || 'start';
  
  // Store level info and state levels
  const levelInfo: LevelInfo = {};
  const stateLevel: { [state: string]: number } = {};
  
  // Start with initial state
  stateLevel[initialState] = 0;
  levelInfo[0] = [initialState];
  
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
  
  return { levelInfo, stateLevel, maxLevel };
}

// Calculate positions for each state based on level info
export function calculateStatePositions(
  levelInfo: LevelInfo,
  nodeSize: { width: number; height: number },
  levelHeight: number
): StatePositions {
  const positions: StatePositions = {};
  
  for (const [levelStr, levelStates] of Object.entries(levelInfo)) {
    const level = parseInt(levelStr);
    const totalInLevel = levelStates.length;
    
    levelStates.forEach((state, index) => {
      const spacing = 200;
      const levelWidth = totalInLevel * spacing;
      const startX = Math.max(0, (1200 - levelWidth) / 2);
      const x = startX + index * spacing;
      const y = level * levelHeight + 50;
      
      positions[state] = {
        x: x + nodeSize.width / 2,
        y: y + nodeSize.height / 2
      };
    });
  }
  
  return positions;
}

// Calculate the viewbox dimensions based on state positions
export function calculateViewBox(
  statePositions: StatePositions,
  zoomLevel: number,
  centerState: string | null = null,
): { x: number; y: number; width: number; height: number } {
  const svgWidth = 1200;
  const svgHeight = 600;
  
  const scaleFactor = zoomLevel / 100;
  const viewBoxWidth = svgWidth / scaleFactor;
  const viewBoxHeight = svgHeight / scaleFactor;
  
  // Center on specific state if requested
  if (centerState && statePositions[centerState]) {
    const pos = statePositions[centerState];
    const viewBoxX = pos.x - viewBoxWidth / 2;
    const viewBoxY = pos.y - viewBoxHeight / 2;
    
    console.log(`Centering on state ${centerState} at position:`, pos);
    
    return { x: viewBoxX, y: viewBoxY, width: viewBoxWidth, height: viewBoxHeight };
  }
  
  // If no specific state to center on, and no positions defined, return default viewBox
  if (Object.keys(statePositions).length === 0) {
    console.log("No state positions found, using default viewBox");
    return { x: 0, y: 0, width: viewBoxWidth, height: viewBoxHeight };
  }
  
  // Default case: Find the center of all nodes and center the view there
  const allX = Object.values(statePositions).map(p => p.x);
  const allY = Object.values(statePositions).map(p => p.y);
  
  const minX = Math.min(...allX);
  const maxX = Math.max(...allX);
  const minY = Math.min(...allY);
  const maxY = Math.max(...allY);
  
  const centerX = (minX + maxX) / 2;
  const centerY = (minY + maxY) / 2;
  
  const viewBoxX = centerX - viewBoxWidth / 2;
  const viewBoxY = centerY - viewBoxHeight / 2;
  
  console.log("Using center of all nodes for viewBox:", { centerX, centerY, viewBoxX, viewBoxY });
  
  return { x: viewBoxX, y: viewBoxY, width: viewBoxWidth, height: viewBoxHeight };
}
