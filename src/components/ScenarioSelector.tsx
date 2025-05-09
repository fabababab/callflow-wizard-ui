
// This file defines the ScenarioType that's used across the application
export type ScenarioType = 
  'testscenario' |
  'verificationFlow' |
  'contractManagement' |
  'productInfo';

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
  },
  'verificationFlow': {
    id: 2,
    customerName: 'Michael Schmidt',
    phoneNumber: '+49 155 7890 1234',
    waitTime: '0m 45s',
    callType: 'Identity Verification',
    priority: 'high',
    expertise: 'Security',
    matchScore: 96,
    caseHistory: [
      {
        type: 'Account Access',
        date: 'May 9, 2025',
        description: 'Customer needs to verify identity to access account.'
      }
    ],
    roboCallSummary: {
      duration: '1m 15s',
      sentiment: 'Neutral',
      keyPoints: ['Customer needs to verify identity', 'Requesting access to account information']
    }
  },
  'contractManagement': {
    id: 3,
    customerName: 'Julia Weber',
    phoneNumber: '+49 176 2345 6789',
    waitTime: '1m 10s',
    callType: 'Contract Review',
    priority: 'medium',
    expertise: 'Contracts',
    matchScore: 92,
    caseHistory: [
      {
        type: 'Contract Update',
        date: 'May 8, 2025',
        description: 'Customer wants to review current contracts.'
      }
    ],
    roboCallSummary: {
      duration: '0m 55s',
      sentiment: 'Curious',
      keyPoints: ['Customer inquiring about contract options', 'Considering changes to current plan']
    }
  },
  'productInfo': {
    id: 4,
    customerName: 'Thomas Müller',
    phoneNumber: '+49 160 7654 3210',
    waitTime: '0m 25s',
    callType: 'Product Inquiry',
    priority: 'low',
    expertise: 'Products',
    matchScore: 88,
    caseHistory: [
      {
        type: 'Information Request',
        date: 'May 9, 2025',
        description: 'Customer seeking details about premium products.'
      }
    ],
    roboCallSummary: {
      duration: '0m 50s',
      sentiment: 'Interested',
      keyPoints: ['Customer asking about product features', 'Comparing different options']
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
  // Update the scenarios array to include only our focused scenarios
  const scenarios: ScenarioType[] = [
    'testscenario',
    'verificationFlow',
    'contractManagement',
    'productInfo'
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
                {scenario === 'verificationFlow' ? 'Identity Verification' :
                 scenario === 'contractManagement' ? 'Contract Management' :
                 scenario === 'productInfo' ? 'Product Information' :
                 'Test Scenario'}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
};

export default ScenarioSelector;
