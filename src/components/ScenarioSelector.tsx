import React from 'react';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

// This file defines the ScenarioType that's used across the application
export type ScenarioType = 
  'testscenario' |
  'verificationFlow' |
  'contractManagement' |
  'productInfo' |
  'verification' |
  'bankDetails' |
  'accountHistory' |
  'physioTherapy' |
  'paymentReminder' |
  'insurancePackage' |
  'deutscheVersion';

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
  'bankDetails': {
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
  'accountHistory': {
    id: 4,
    customerName: 'Thomas Müller',
    phoneNumber: '+49 160 7654 3210',
    waitTime: '0m 25s',
    callType: 'Account History',
    priority: 'low',
    expertise: 'Products',
    matchScore: 88,
    caseHistory: [
      {
        type: 'Information Request',
        date: 'May 9, 2025',
        description: 'Customer seeking account transaction history.'
      }
    ],
    roboCallSummary: {
      duration: '0m 50s',
      sentiment: 'Interested',
      keyPoints: ['Customer asking about account history', 'Noticed unusual transactions']
    }
  },
  'physioTherapy': {
    id: 5,
    customerName: 'Anna Fischer',
    phoneNumber: '+49 170 1234 5678',
    waitTime: '0m 35s',
    callType: 'Physiotherapy Coverage',
    priority: 'medium',
    expertise: 'Health Insurance',
    matchScore: 90,
    caseHistory: [
      {
        type: 'Coverage Inquiry',
        date: 'May 7, 2025',
        description: 'Customer inquiring about physiotherapy treatment coverage.'
      }
    ],
    roboCallSummary: {
      duration: '1m 05s',
      sentiment: 'Concerned',
      keyPoints: ['Customer needs clarification on coverage', 'Has doctor prescription for treatments']
    }
  },
  'paymentReminder': {
    id: 6,
    customerName: 'Max Becker',
    phoneNumber: '+49 151 9876 5432',
    waitTime: '0m 20s',
    callType: 'Payment Dispute',
    priority: 'high',
    expertise: 'Billing',
    matchScore: 94,
    caseHistory: [
      {
        type: 'Billing Issue',
        date: 'May 8, 2025',
        description: 'Customer disputes payment reminder after payment was made.'
      }
    ],
    roboCallSummary: {
      duration: '0m 45s',
      sentiment: 'Frustrated',
      keyPoints: ['Customer has payment confirmation', 'Received reminder despite payment']
    }
  },
  'insurancePackage': {
    id: 7,
    customerName: 'Sophie Wagner',
    phoneNumber: '+49 177 8765 4321',
    waitTime: '0m 40s',
    callType: 'Package Change',
    priority: 'medium',
    expertise: 'Insurance Plans',
    matchScore: 91,
    caseHistory: [
      {
        type: 'Plan Update',
        date: 'May 9, 2025',
        description: 'Customer graduating and needs to update student insurance plan.'
      }
    ],
    roboCallSummary: {
      duration: '1m 10s',
      sentiment: 'Positive',
      keyPoints: ['Customer graduating from studies', 'Looking for appropriate insurance package']
    }
  },
  'verificationFlow': {
    id: 8,
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
    id: 9,
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
    id: 10,
    customerName: 'Thomas Müller',
    phoneNumber: '+49 160 7654 3210',
    waitTime: '0m 25s',
    callType: 'Product Information',
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
  },
  'deutscheVersion': {
    id: 11,
    customerName: 'Markus Weber',
    phoneNumber: '+41 78 123 4567',
    waitTime: '0m 20s',
    callType: 'Versicherungsanpassung',
    priority: 'medium',
    expertise: 'Versicherung',
    matchScore: 94,
    caseHistory: [
      {
        type: 'Vertragsänderung',
        date: 'Mai 12, 2025',
        description: 'Kunde hat Studium abgeschlossen und fragt nach Anpassungen.'
      }
    ],
    roboCallSummary: {
      duration: '1m 30s',
      sentiment: 'Neutral',
      keyPoints: ['Studium abgeschlossen', 'Frage nach Versicherungsanpassungen', 'Überprüfung der Franchise']
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
  // Update the scenarios array to include all available scenarios
  const scenarios: ScenarioType[] = [
    'testscenario',
    'verificationFlow',
    'contractManagement',
    'productInfo',
    'deutscheVersion'
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
                 scenario === 'deutscheVersion' ? 'Deutsche Version' :
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
