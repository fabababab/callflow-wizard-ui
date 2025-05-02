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

const StateMachineSelector = ({ 
  activeStateMachine, 
  onSelectStateMachine, 
  disabled = false 
}: StateMachineSelectorProps) => {
  // Get all available state machines from the stateMachines object
  const availableStateMachines = Object.keys(stateMachines) as ScenarioType[];

  return (
    <div className="flex flex-col space-y-1.5">
      <Label htmlFor="stateMachine">State Machine</Label>
      <Select
        value={activeStateMachine}
        onValueChange={(value) => onSelectStateMachine(value as ScenarioType)}
        disabled={disabled}
      >
        <SelectTrigger id="stateMachine" className="w-full">
          <SelectValue placeholder="Select state machine" />
        </SelectTrigger>
        <SelectContent>
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
};

export default StateMachineSelector;
