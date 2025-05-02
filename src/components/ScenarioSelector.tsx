
// This file defines the ScenarioType that's used across the application
export type ScenarioType = 'physioCoverage' | 'customerPhysioCoverage' | 'physioTherapy' | 'bankDetails' | 'verification' | 'accountHistory' | 'insurancePackage' | 'paymentReminder';

import React from 'react';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

interface ScenarioSelectorProps {
  activeScenario: ScenarioType;
  onSelectScenario: (scenario: ScenarioType) => void;
  disabled?: boolean;
}

const ScenarioSelector = ({
  activeScenario,
  onSelectScenario,
  disabled = false
}: ScenarioSelectorProps) => {
  const scenarios: ScenarioType[] = [
    'physioCoverage',
    'customerPhysioCoverage',
    'physioTherapy',
    'bankDetails',
    'verification',
    'accountHistory',
    'insurancePackage',
    'paymentReminder'
  ];

  return (
    <div className="flex flex-col space-y-1.5">
      <Label htmlFor="scenario">Scenario</Label>
      <Select
        value={activeScenario}
        onValueChange={(value) => onSelectScenario(value as ScenarioType)}
        disabled={disabled}
      >
        <SelectTrigger id="scenario" className="w-full">
          <SelectValue placeholder="Select scenario" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {scenarios.map((scenario) => (
              <SelectItem key={scenario} value={scenario}>
                {scenario.charAt(0).toUpperCase() + scenario.slice(1)}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
};

export default ScenarioSelector;
