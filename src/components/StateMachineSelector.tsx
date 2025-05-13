
import React from 'react';
import { ScenarioType } from '@/components/ScenarioSelector';
import { stateMachines } from '@/data/stateMachines';
import { 
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';

interface StateMachineSelectorProps {
  activeStateMachine: ScenarioType;
  onSelectStateMachine: (stateMachine: ScenarioType) => void;
  disabled?: boolean;
}

const StateMachineSelector = React.memo(({ 
  activeStateMachine, 
  onSelectStateMachine, 
  disabled = false 
}: StateMachineSelectorProps) => {
  // Get all available state machines from the stateMachines object
  const availableStateMachines = Object.keys(stateMachines) as ScenarioType[];

  const handleStateMachineChange = (value: string) => {
    // Only call the parent function if the value actually changed
    if (value !== activeStateMachine) {
      // Call the parent's onSelectStateMachine function
      onSelectStateMachine(value as ScenarioType);
    }
  };

  // Format the display name of a state machine
  const formatStateMachineName = (stateMachine: string) => {
    // Special case for the deutsche version
    if (stateMachine === 'deutscheVersion') {
      return (
        <div className="flex items-center">
          <span>Deutsche Version</span>
          <Badge variant="outline" className="ml-2 text-xs bg-blue-50">DE</Badge>
        </div>
      );
    }
    
    // Default formatting for other state machines
    return stateMachine.charAt(0).toUpperCase() + stateMachine.slice(1).replace(/([A-Z])/g, ' $1');
  };

  return (
    <div className="flex flex-col space-y-1.5">
      <Label htmlFor="stateMachine">State Machine</Label>
      <Select
        value={activeStateMachine}
        onValueChange={handleStateMachineChange}
        disabled={disabled}
      >
        <SelectTrigger id="stateMachine" className="w-full bg-background">
          <SelectValue placeholder="Select state machine" />
        </SelectTrigger>
        <SelectContent 
          className="bg-background border shadow-md z-50 w-[var(--radix-select-trigger-width)]"
          position="popper"
          sideOffset={4}
          align="end"
          avoidCollisions={true}
        >
          <SelectGroup>
            {availableStateMachines.map((stateMachine) => (
              <SelectItem key={stateMachine} value={stateMachine}>
                {formatStateMachineName(stateMachine)}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
}, (prevProps, nextProps) => {
  // Custom comparison function to prevent unnecessary rerenders
  return prevProps.activeStateMachine === nextProps.activeStateMachine && 
         prevProps.disabled === nextProps.disabled;
});

// Display name for debugging
StateMachineSelector.displayName = 'StateMachineSelector';

export default StateMachineSelector;
