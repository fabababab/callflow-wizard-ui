
// This file defines the ScenarioType that's used across the application
export type ScenarioType = 'testscenario';

import React from 'react';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

// Define and export the scenarioCallData object that Dashboard.tsx is looking for
export const scenarioCallData: Record<ScenarioType, {
  id: number;
  customerName: string;
  phoneNumber: string;
  waitTime: string;
  callType: string;
  priority: 'high' | 'medium' | 'low';
  expertise: string;
  matchScore: number;
  caseHistory: Array<{
    type: string;
    date: string;
    description: string;
  }>;
  roboCallSummary: {
    duration: string;
    intents?: string[];
    sentiment: string;
    keyPoints: string[];
  };
}> = {
  'testscenario': {
    id: 1,
    customerName: 'Test Customer',
    phoneNumber: '+49 123 4567 890',
    waitTime: '0m 30s',
    callType: 'Test Call',
    priority: 'medium',
    expertise: 'General',
    matchScore: 95,
    caseHistory: [
      {
        type: 'New Customer',
        date: 'May 6, 2025',
        description: 'First contact with service center.'
      }
    ],
    roboCallSummary: {
      duration: '1m 00s',
      sentiment: 'Neutral',
      keyPoints: ['Customer has a general inquiry', 'Testing the system functionality']
    }
  }
};

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
    'testscenario'
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
