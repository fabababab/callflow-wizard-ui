
// This file defines the ScenarioType that's used across the application
export type ScenarioType = 'testscenario' | 'verification' | 'bankDetails' | 'accountHistory' | 'physioTherapy' | 'paymentReminder' | 'insurancePackage';

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
  'verification': {
    id: 2,
    customerName: 'Michael Schmidt',
    phoneNumber: '+49 157 3344 5566',
    waitTime: '1m 45s',
    callType: 'Identity Verification',
    priority: 'high',
    expertise: 'Security',
    matchScore: 92,
    caseHistory: [
      {
        type: 'Security Alert',
        date: 'May 5, 2025',
        description: 'Unauthorized login attempt detected.'
      }
    ],
    roboCallSummary: {
      duration: '2m 15s',
      sentiment: 'Concerned',
      keyPoints: ['Customer received security alert', 'Concerned about account security']
    }
  },
  'bankDetails': {
    id: 3,
    customerName: 'Max Hoffmann',
    phoneNumber: '+49 176 2233 4455',
    waitTime: '2m 10s',
    callType: 'Bank Details Update',
    priority: 'medium',
    expertise: 'Account Management',
    matchScore: 88,
    caseHistory: [
      {
        type: 'Account Update',
        date: 'May 4, 2025',
        description: 'Previous attempt to update bank information.'
      }
    ],
    roboCallSummary: {
      duration: '1m 30s',
      sentiment: 'Neutral',
      keyPoints: ['Customer needs to update bank details', 'Has new banking information ready']
    }
  },
  'accountHistory': {
    id: 4,
    customerName: 'Julia Weber',
    phoneNumber: '+49 151 6677 8899',
    waitTime: '0m 55s',
    callType: 'Account Review',
    priority: 'low',
    expertise: 'Billing',
    matchScore: 85,
    caseHistory: [
      {
        type: 'Billing Inquiry',
        date: 'May 3, 2025',
        description: 'Previous questions about account charges.'
      }
    ],
    roboCallSummary: {
      duration: '3m 00s',
      sentiment: 'Concerned',
      keyPoints: ['Customer noticed unusual charges', 'Requesting account history review']
    }
  },
  'physioTherapy': {
    id: 5,
    customerName: 'Anna Müller',
    phoneNumber: '+49 162 9988 7766',
    waitTime: '1m 20s',
    callType: 'Coverage Inquiry',
    priority: 'medium',
    expertise: 'Insurance Benefits',
    matchScore: 90,
    caseHistory: [
      {
        type: 'Medical Coverage',
        date: 'May 2, 2025',
        description: 'Previous inquiry about medical coverage.'
      }
    ],
    roboCallSummary: {
      duration: '2m 45s',
      sentiment: 'Neutral',
      keyPoints: ['Customer has prescription for physiotherapy', 'Inquiring about coverage limits']
    }
  },
  'paymentReminder': {
    id: 6,
    customerName: 'Thomas König',
    phoneNumber: '+49 170 5544 3322',
    waitTime: '1m 05s',
    callType: 'Billing Issue',
    priority: 'high',
    expertise: 'Accounting',
    matchScore: 94,
    caseHistory: [
      {
        type: 'Payment Issue',
        date: 'May 1, 2025',
        description: 'Previous payment dispute.'
      }
    ],
    roboCallSummary: {
      duration: '1m 50s',
      sentiment: 'Frustrated',
      keyPoints: ['Customer received payment reminder', 'Claims payment was already made']
    }
  },
  'insurancePackage': {
    id: 7,
    customerName: 'Lisa Fischer',
    phoneNumber: '+49 177 1122 3344',
    waitTime: '0m 40s',
    callType: 'Package Update',
    priority: 'medium',
    expertise: 'Insurance Plans',
    matchScore: 87,
    caseHistory: [
      {
        type: 'Plan Inquiry',
        date: 'April 30, 2025',
        description: 'Previous inquiry about insurance packages.'
      }
    ],
    roboCallSummary: {
      duration: '2m 30s',
      sentiment: 'Positive',
      keyPoints: ['Customer completing studies soon', 'Needs to update insurance package']
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
    'testscenario',
    'verification',
    'bankDetails',
    'accountHistory',
    'physioTherapy',
    'paymentReminder',
    'insurancePackage'
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
