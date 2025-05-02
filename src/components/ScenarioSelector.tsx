
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CreditCard, Shield, FileText, Phone, Calendar, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export type ScenarioType = 
  | 'verification' 
  | 'bankDetails' 
  | 'accountHistory' 
  | 'physioTherapy'
  | 'paymentReminder'
  | 'insurancePackage'
  | null;

// Define the scenario data for each call type
export const scenarioCallData = {
  verification: {
    id: 1,
    customerName: 'Emma Wagner',
    phoneNumber: '+49 123 987 6543',
    waitTime: '3m 12s',
    callType: 'Identity Verification',
    priority: 'high',
    expertise: 'Account Security',
    matchScore: 95,
    caseHistory: [
      {
        date: '2025-04-10',
        type: 'Account Access',
        status: 'Resolved',
        description: 'Password reset request'
      },
      {
        date: '2025-03-15',
        type: 'Login Issue',
        status: 'Resolved',
        description: 'Two-factor authentication setup'
      }
    ],
    roboCallSummary: {
      duration: '2m 45s',
      intents: ['Identity Verification', 'Account Access'],
      sentiment: 'Concerned',
      keyPoints: [
        'Customer needs to verify identity after suspicious login attempt',
        'Customer wants to ensure account is secure',
        'Last login was from an unknown location'
      ]
    }
  },
  bankDetails: {
    id: 1,
    customerName: 'Max Hoffman',
    phoneNumber: '+49 176 2345 6789',
    waitTime: '2m 35s',
    callType: 'Bank Details Update',
    priority: 'medium',
    expertise: 'Account Management',
    matchScore: 88,
    caseHistory: [
      {
        date: '2025-03-20',
        type: 'Billing Update',
        status: 'Resolved',
        description: 'Address change request'
      },
      {
        date: '2024-12-05',
        type: 'Payment Issue',
        status: 'Resolved',
        description: 'Direct debit setup'
      }
    ],
    roboCallSummary: {
      duration: '1m 55s',
      intents: ['Bank Details Change', 'Payment Method Update'],
      sentiment: 'Neutral',
      keyPoints: [
        'Customer recently changed banks',
        'Needs to update direct debit information',
        'Wants confirmation that payments will transfer correctly'
      ]
    }
  },
  accountHistory: {
    id: 1,
    customerName: 'Laura Becker',
    phoneNumber: '+49 157 8765 4321',
    waitTime: '1m 47s',
    callType: 'Account History Review',
    priority: 'medium',
    expertise: 'Account Audit',
    matchScore: 82,
    caseHistory: [
      {
        date: '2025-01-15',
        type: 'Statement Request',
        status: 'Resolved',
        description: 'Annual statement requested'
      },
      {
        date: '2024-11-22',
        type: 'Payment Discrepancy',
        status: 'Resolved',
        description: 'Payment amount correction'
      }
    ],
    roboCallSummary: {
      duration: '2m 10s',
      intents: ['Account History', 'Payment Verification'],
      sentiment: 'Confused',
      keyPoints: [
        'Customer concerned about unexpected charges',
        'Needs clarification on recent transactions',
        'Wants to review payment history from last quarter'
      ]
    }
  },
  physioTherapy: {
    id: 1,
    customerName: 'Thomas Müller',
    phoneNumber: '+49 160 9876 5432',
    waitTime: '4m 08s',
    callType: 'Leistungsabdeckung Physiobehandlung',
    priority: 'high',
    expertise: 'Health Insurance Benefits',
    matchScore: 94,
    caseHistory: [
      {
        date: '2025-04-02',
        type: 'Claim Submission',
        status: 'Pending',
        description: 'Physiotherapy invoice submitted'
      },
      {
        date: '2024-12-10',
        type: 'Coverage Inquiry',
        status: 'Resolved',
        description: 'Health insurance benefits explanation'
      }
    ],
    roboCallSummary: {
      duration: '3m 25s',
      intents: ['Coverage Verification', 'Claim Status'],
      sentiment: 'Concerned',
      keyPoints: [
        'Received prescription for 10 physiotherapy sessions',
        'Unsure if all treatments are covered by insurance',
        'Wants to know maximum reimbursement amount',
        'Previous claim was partially rejected'
      ]
    }
  },
  paymentReminder: {
    id: 1,
    customerName: 'Sophia Klein',
    phoneNumber: '+49 151 2345 6789',
    waitTime: '2m 52s',
    callType: 'Mahnung trotz Zahlung',
    priority: 'high',
    expertise: 'Billing Disputes',
    matchScore: 91,
    caseHistory: [
      {
        date: '2025-03-30',
        type: 'Payment Confirmation',
        status: 'Pending',
        description: 'Payment receipt submitted'
      },
      {
        date: '2025-03-15',
        type: 'Invoice Inquiry',
        status: 'Resolved',
        description: 'Quarterly billing statement explanation'
      }
    ],
    roboCallSummary: {
      duration: '2m 18s',
      intents: ['Payment Dispute', 'Billing Error'],
      sentiment: 'Frustrated',
      keyPoints: [
        'Received payment reminder despite making payment on time',
        'Has bank transfer confirmation from last week',
        'Second notice received yesterday with late fees',
        'Concerned about credit rating impact'
      ]
    }
  },
  insurancePackage: {
    id: 1,
    customerName: 'Jonas Schwarz',
    phoneNumber: '+49 172 8765 4321',
    waitTime: '1m 35s',
    callType: 'Neues Versicherungspacket (Studiumsabschluss)',
    priority: 'medium',
    expertise: 'Insurance Packages',
    matchScore: 87,
    caseHistory: [
      {
        date: '2025-04-15',
        type: 'Coverage Update',
        status: 'In Progress',
        description: 'Student insurance expiration'
      },
      {
        date: '2024-08-22',
        type: 'Plan Change',
        status: 'Resolved',
        description: 'Student health insurance enrollment'
      }
    ],
    roboCallSummary: {
      duration: '3m 05s',
      intents: ['Insurance Update', 'New Package Information'],
      sentiment: 'Neutral',
      keyPoints: [
        'Graduating from university next month',
        'Current student insurance package expiring',
        'Looking for appropriate coverage for full-time employment',
        'Interested in additional dental and vision coverage options'
      ]
    }
  }
};

interface ScenarioSelectorProps {
  onSelectScenario: (scenario: ScenarioType) => void;
  activeScenario: ScenarioType;
}

const ScenarioSelector: React.FC<ScenarioSelectorProps> = ({ 
  onSelectScenario, 
  activeScenario 
}) => {
  const { toast } = useToast();

  const handleSelectScenario = (scenario: ScenarioType) => {
    onSelectScenario(scenario);
    
    const scenarioNames = {
      'verification': 'Identity Verification',
      'bankDetails': 'Change Bank Details',
      'accountHistory': 'Account History Review',
      'physioTherapy': 'Leistungsabdeckung Physiobehandlung',
      'paymentReminder': 'Mahnung trotz Zahlung',
      'insurancePackage': 'Neues Versicherungspacket (Studiumsabschluss)'
    };
    
    toast({
      title: `Scenario Selected`,
      description: `${scenarioNames[scenario as keyof typeof scenarioNames]} scenario activated`,
    });
  };

  return (
    <Card className="rounded-lg mb-6">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Call Scenarios</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-2">
          <Button 
            variant={activeScenario === 'verification' ? 'default' : 'outline'} 
            className="flex flex-col items-center justify-center h-20 p-2"
            onClick={() => handleSelectScenario('verification')}
          >
            <Shield className="h-6 w-6 mb-1" />
            <span className="text-xs text-center">Identity Verification</span>
          </Button>
          
          <Button 
            variant={activeScenario === 'bankDetails' ? 'default' : 'outline'} 
            className="flex flex-col items-center justify-center h-20 p-2"
            onClick={() => handleSelectScenario('bankDetails')}
          >
            <CreditCard className="h-6 w-6 mb-1" />
            <span className="text-xs text-center">Change Bank Details</span>
          </Button>
          
          <Button 
            variant={activeScenario === 'accountHistory' ? 'default' : 'outline'} 
            className="flex flex-col items-center justify-center h-20 p-2"
            onClick={() => handleSelectScenario('accountHistory')}
          >
            <FileText className="h-6 w-6 mb-1" />
            <span className="text-xs text-center">Account History</span>
          </Button>

          <Button 
            variant={activeScenario === 'physioTherapy' ? 'default' : 'outline'} 
            className="flex flex-col items-center justify-center h-20 p-2"
            onClick={() => handleSelectScenario('physioTherapy')}
          >
            <Calendar className="h-6 w-6 mb-1" />
            <span className="text-xs text-center">Physiobehandlung</span>
          </Button>
          
          <Button 
            variant={activeScenario === 'paymentReminder' ? 'default' : 'outline'} 
            className="flex flex-col items-center justify-center h-20 p-2"
            onClick={() => handleSelectScenario('paymentReminder')}
          >
            <AlertCircle className="h-6 w-6 mb-1" />
            <span className="text-xs text-center">Mahnung</span>
          </Button>
          
          <Button 
            variant={activeScenario === 'insurancePackage' ? 'default' : 'outline'} 
            className="flex flex-col items-center justify-center h-20 p-2"
            onClick={() => handleSelectScenario('insurancePackage')}
          >
            <Phone className="h-6 w-6 mb-1" />
            <span className="text-xs text-center">Versicherungspacket</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ScenarioSelector;
