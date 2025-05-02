
import { ScenarioType } from '@/components/ScenarioSelector';
import { IncomingCall } from '@/components/transcript/IncomingCall';
import { PreCall } from '@/components/transcript/PreCallInfo';

// Define initial messages for each scenario
export const scenarioInitialMessages: Record<string, string> = {
  verification: "Guten Tag, ich habe eine E-Mail über einen verdächtigen Login-Versuch auf meinem Konto erhalten und muss meine Identität bestätigen.",
  bankDetails: "Hallo, ich möchte meine Bankverbindung ändern, da ich zu einer neuen Bank gewechselt bin.",
  accountHistory: "Ich möchte meine Kontohistorie prüfen. Ich glaube, da stimmt etwas nicht mit den letzten Transaktionen.",
  physioTherapy: "Guten Tag, ich habe eine Verordnung für Physiotherapie und möchte wissen, ob die Behandlungen von meiner Versicherung übernommen werden.",
  paymentReminder: "Ich habe eine Mahnung erhalten, obwohl ich die Rechnung bereits letzte Woche bezahlt habe.",
  insurancePackage: "Hallo, ich schließe bald mein Studium ab und benötige ein neues Versicherungspaket. Können Sie mir dabei helfen?"
};

// Define the scenario data for each call type
export const scenarioCallData: Record<string, {
  id: number;
  customerName: string;
  phoneNumber: string;
  waitTime: string;
  callType: string;
  priority: 'high' | 'medium' | 'low';
  expertise: string;
  matchScore: number;
  caseHistory: Array<{
    date: string;
    type: string;
    status: string;
    description: string;
  }>;
  roboCallSummary: {
    duration: string;
    intents: string[];
    sentiment: string;
    keyPoints: string[];
  };
}> = {
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

// Sample incoming calls data
export const incomingCalls: IncomingCall[] = [
  {
    id: 1,
    customerName: 'Emma Wagner',
    phoneNumber: '+49 123 987 6543',
    waitTime: '3m 12s',
    callType: 'Technical Support',
    priority: 'high',
    expertise: 'Network Issues',
    matchScore: 95
  },
  {
    id: 2,
    customerName: 'Max Hoffmann',
    phoneNumber: '+49 234 876 5432',
    waitTime: '2m 35s',
    callType: 'Account Services',
    priority: 'medium',
    expertise: 'Billing',
    matchScore: 72
  },
  {
    id: 3,
    customerName: 'Sophie Becker',
    phoneNumber: '+49 345 765 4321',
    waitTime: '1m 47s',
    callType: 'Technical Support',
    priority: 'high',
    expertise: 'Software Setup',
    matchScore: 88
  }
];

// Sample pre-calls data
export const preCalls: PreCall[] = [
  {
    id: 1,
    timestamp: '14:32:15',
    agent: 'RoboVoice',
    content: "Hello, I'm having trouble with my internet connection. It keeps dropping every few minutes.",
    response: "I understand that's frustrating. Can you tell me when this issue started and if you've already tried restarting your router?",
    customerName: 'Emma Wagner',
    callType: 'Technical Support'
  },
  {
    id: 2,
    timestamp: '14:33:20',
    agent: 'RoboVoice',
    content: "It started yesterday evening. Yes, I've tried restarting the router multiple times but it doesn't help.",
    response: "Thank you for that information. Have you noticed if any specific activities cause the connection to drop more frequently?",
    customerName: 'Emma Wagner',
    callType: 'Technical Support'
  },
  {
    id: 3,
    timestamp: '14:34:45',
    agent: 'Technical Agent Maria',
    content: "It seems to happen more when I'm on video calls or streaming videos.",
    response: "That suggests it might be related to bandwidth usage. I'll make a note of this and transfer you to one of our network specialists who can help diagnose the issue further.",
    customerName: 'Emma Wagner',
    callType: 'Technical Support'
  }
];

// Helper function to get suggestion based on scenario and message
export const generateAiSuggestion = (scenario: ScenarioType, afterMessageId: number) => {
  if (!scenario) return [];

  switch(scenario) {
    case 'verification':
      if (afterMessageId === 2) {
        return [{
          id: Date.now(),
          text: "Bitte fragen Sie nach Kundennummer und Geburtsdatum für die Verifizierung.",
          type: 'action' as const
        }];
      } else if (afterMessageId === 4) {
        return [{
          id: Date.now(),
          text: "Kunde verifiziert - Sie können zusätzlich Two-Factor Authentication anbieten.",
          type: 'info' as const
        }];
      } else if (afterMessageId > 5) {
        return [{
          id: Date.now(),
          text: "Ich habe Ihr Konto gesichert und ein neues Passwort eingerichtet. Sie erhalten in Kürze eine E-Mail mit einem Link zur Passwortänderung. Bitte aktivieren Sie auch die Zwei-Faktor-Authentifizierung für zusätzliche Sicherheit.",
          type: 'response' as const
        }];
      }
      break;
    case 'bankDetails':
      if (afterMessageId === 2) {
        return [{
          id: Date.now(),
          text: "Bitte verifizieren Sie den Kunden bevor Sie Bankdaten ändern.",
          type: 'action' as const
        }];
      } else if (afterMessageId === 4) {
        return [{
          id: Date.now(),
          text: "Kunde verwendet seit 5 Jahren Lastschriftverfahren.",
          type: 'info' as const
        }];
      } else if (afterMessageId > 5) {
        return [{
          id: Date.now(),
          text: "Vielen Dank für die Bestätigung. Ich habe Ihre Bankverbindung aktualisiert. Die Änderung wird ab dem nächsten Abrechnungszyklus wirksam. Sie erhalten eine Bestätigungs-E-Mail mit allen Details.",
          type: 'response' as const
        }];
      }
      break;
    case 'accountHistory':
      if (afterMessageId === 2) {
        return [{
          id: Date.now(),
          text: "Fragen Sie nach dem Zeitraum und den betroffenen Transaktionen.",
          type: 'action' as const
        }];
      } else if (afterMessageId === 4) {
        return [{
          id: Date.now(),
          text: "Kunde hat in den letzten 6 Monaten keine verdächtigen Aktivitäten gemeldet.",
          type: 'info' as const
        }];
      } else if (afterMessageId > 5) {
        return [{
          id: Date.now(),
          text: "Ich habe die verdächtigen Transaktionen markiert und eine Untersuchung eingeleitet. Sie erhalten innerhalb von 48 Stunden eine Rückmeldung von unserem Sicherheitsteam. Als Vorsichtsmaßnahme habe ich Ihre Karte gesperrt und eine neue Karte bestellt.",
          type: 'response' as const
        }];
      }
      break;
    case 'paymentReminder':
      if (afterMessageId === 2) {
        return [{
          id: Date.now(),
          text: "Zahlungseingang vom 25. April wurde im System vermerkt, aber noch nicht verarbeitet.",
          type: 'info' as const
        }];
      } else if (afterMessageId === 4) {
        return [{
          id: Date.now(),
          text: "Bitte prüfen Sie die Zahlungsreferenz und stornieren Sie die Mahngebühren.",
          type: 'action' as const
        }];
      } else if (afterMessageId > 5) {
        return [{
          id: Date.now(),
          text: "Ich habe den Zahlungseingang bestätigt und die Mahnung sowie alle Mahngebühren storniert. Sie erhalten innerhalb der nächsten 24 Stunden eine Bestätigung per E-Mail. Ich entschuldige mich für die Unannehmlichkeiten.",
          type: 'response' as const
        }];
      }
      break;
    case 'insurancePackage':
      if (afterMessageId === 2) {
        return [{
          id: Date.now(),
          text: "Empfohlenes Paket: StartPlus mit erweitertem Zahnschutz und Sehhilfen-Option.",
          type: 'info' as const
        }];
      } else if (afterMessageId === 4) {
        return [{
          id: Date.now(),
          text: "Informieren Sie über 15% Neukundenrabatt für Berufseinsteiger im ersten Jahr.",
          type: 'action' as const
        }];
      } else if (afterMessageId > 5) {
        return [{
          id: Date.now(),
          text: "Unser StartPlus-Paket mit erweitertem Zahnschutz und Brillenoption kostet 89€ monatlich. Als Berufseinsteiger erhalten Sie im ersten Jahr einen Rabatt von 15%. Ich kann Ihnen detaillierte Informationen per E-Mail zusenden und einen persönlichen Beratungstermin anbieten.",
          type: 'response' as const
        }];
      }
      break;
    default:
      if (afterMessageId === 2) {
        return [{
          id: Date.now(),
          text: "Kundenhistorie zeigt mehrere technische Probleme in den letzten 30 Tagen.",
          type: 'info' as const
        }];
      } else if (afterMessageId === 4) {
        return [{
          id: Date.now(),
          text: "Empfehlung: Router-Firmware aktualisieren und Bandbreiten-Test durchführen.",
          type: 'action' as const
        }];
      } else if (afterMessageId > 5) {
        return [{
          id: Date.now(),
          text: "Basierend auf unserer Diagnose scheint das Problem mit Ihrer Netzwerkausrüstung zusammenzuhängen. Ich empfehle ein Firmware-Update für Ihren Router und die Durchführung eines Bandbreiten-Tests. Ich kann Ihnen einen Techniker schicken, der das Problem weiter untersuchen kann.",
          type: 'response' as const
        }];
      }
  }
  
  return [];
};
