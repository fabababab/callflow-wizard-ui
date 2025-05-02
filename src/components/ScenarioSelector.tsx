
// This file defines the ScenarioType that's used across the application
export type ScenarioType = 'physioCoverage' | 'customerPhysioCoverage' | 'physioTherapy' | 'bankDetails' | 'verification' | 'accountHistory' | 'insurancePackage' | 'paymentReminder';

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
  'physioCoverage': {
    id: 1,
    customerName: 'Michael Schmidt',
    phoneNumber: '+49 176 8765 4321',
    waitTime: '1m 25s',
    callType: 'Insurance Query',
    priority: 'medium',
    expertise: 'Health Insurance',
    matchScore: 93,
    caseHistory: [
      {
        type: 'Previous Call',
        date: 'April 5, 2023',
        description: 'Inquired about physiotherapy coverage limits.'
      }
    ],
    roboCallSummary: {
      duration: '1m 45s',
      intents: ['Coverage Inquiry', 'Policy Details'],
      sentiment: 'Neutral',
      keyPoints: ['Customer wants to know if physiotherapy is covered', 'Has doctor prescription for treatment']
    }
  },
  'customerPhysioCoverage': {
    id: 2,
    customerName: 'Sabine Wagner',
    phoneNumber: '+49 151 2345 6789',
    waitTime: '2m 10s',
    callType: 'Coverage Question',
    priority: 'high',
    expertise: 'Health Claims',
    matchScore: 87,
    caseHistory: [
      {
        type: 'Claim Submission',
        date: 'March 15, 2023',
        description: 'Submitted physiotherapy reimbursement claim.'
      },
      {
        type: 'Claim Status',
        date: 'April 2, 2023',
        description: 'Called to check on claim status.'
      }
    ],
    roboCallSummary: {
      duration: '2m 30s',
      sentiment: 'Concerned',
      keyPoints: ['Customer asking about rejected physio claim', 'Has questions about coverage limits']
    }
  },
  'physioTherapy': {
    id: 3,
    customerName: 'Thomas Becker',
    phoneNumber: '+49 170 1122 3344',
    waitTime: '0m 45s',
    callType: 'Therapy Coverage',
    priority: 'medium',
    expertise: 'Health Benefits',
    matchScore: 95,
    caseHistory: [],
    roboCallSummary: {
      duration: '1m 15s',
      sentiment: 'Neutral',
      keyPoints: ['New prescription for physiotherapy', 'Asking about coverage before starting treatment']
    }
  },
  'bankDetails': {
    id: 4,
    customerName: 'Max Hoffman',
    phoneNumber: '+49 160 7890 1234',
    waitTime: '1m 50s',
    callType: 'Account Update',
    priority: 'medium',
    expertise: 'Customer Administration',
    matchScore: 88,
    caseHistory: [
      {
        type: 'Bank Change',
        date: 'May 1, 2023',
        description: 'Customer notified about changing banks.'
      }
    ],
    roboCallSummary: {
      duration: '1m 30s',
      sentiment: 'Neutral',
      keyPoints: ['Customer has new bank account', 'Needs to update direct debit details']
    }
  },
  'verification': {
    id: 5,
    customerName: 'Anna Müller',
    phoneNumber: '+49 172 5566 7788',
    waitTime: '0m 30s',
    callType: 'Security Alert',
    priority: 'high',
    expertise: 'Account Security',
    matchScore: 91,
    caseHistory: [],
    roboCallSummary: {
      duration: '1m 05s',
      sentiment: 'Concerned',
      keyPoints: ['Received security alert email', 'Suspicious login attempt from foreign location']
    }
  },
  'accountHistory': {
    id: 6,
    customerName: 'Markus Weber',
    phoneNumber: '+49 157 9988 7766',
    waitTime: '3m 15s',
    callType: 'Account Review',
    priority: 'medium',
    expertise: 'Financial Records',
    matchScore: 82,
    caseHistory: [
      {
        type: 'Statement Request',
        date: 'April 25, 2023',
        description: 'Requested last quarter statements.'
      }
    ],
    roboCallSummary: {
      duration: '2m 00s',
      sentiment: 'Confused',
      keyPoints: ['Unknown transactions on account', 'Concerned about possible fraud']
    }
  },
  'insurancePackage': {
    id: 7,
    customerName: 'Julia Fischer',
    phoneNumber: '+49 159 4433 2211',
    waitTime: '2m 20s',
    callType: 'Plan Change',
    priority: 'low',
    expertise: 'Insurance Plans',
    matchScore: 85,
    caseHistory: [
      {
        type: 'Student Plan',
        date: 'January 10, 2023',
        description: 'Discussed graduation and plan change options.'
      }
    ],
    roboCallSummary: {
      duration: '1m 50s',
      sentiment: 'Positive',
      keyPoints: ['Finishing studies next month', 'Needs regular insurance plan', 'Interested in dental coverage']
    }
  },
  'paymentReminder': {
    id: 8,
    customerName: 'Peter Schneider',
    phoneNumber: '+49 155 2233 4455',
    waitTime: '1m 15s',
    callType: 'Billing Inquiry',
    priority: 'high',
    expertise: 'Payments',
    matchScore: 89,
    caseHistory: [
      {
        type: 'Payment Confirmation',
        date: 'April 25, 2023',
        description: 'Confirmed payment was sent.'
      }
    ],
    roboCallSummary: {
      duration: '1m 45s',
      sentiment: 'Frustrated',
      keyPoints: ['Received payment reminder', 'Claims payment was already made', 'Has payment confirmation']
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
