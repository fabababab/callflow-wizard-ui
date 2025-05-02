
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
          className="bg-background shadow-lg z-50"
          position="popper"
          sideOffset={4}
        >
          <SelectGroup>
            {availableStateMachines.map((stateMachine) => (
              <SelectItem key={stateMachine} value={stateMachine}>
                {stateMachine.charAt(0).toUpperCase() + stateMachine.slice(1)}
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
