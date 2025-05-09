
import { nanoid } from 'nanoid';

// Define sensitive data validation types
export type SensitiveDataType = 'insurance_number' | 'customer_id' | 'bank_account' | 'date_of_birth' | 'address';

export type ValidationStatus = 'pending' | 'valid' | 'invalid';

export type SensitiveField = {
  id: string;
  type: SensitiveDataType;
  value: string;
  pattern?: string;
  status: ValidationStatus;
  notes?: string;
  requiresVerification?: boolean;
};

// Define call data types
export type IncomingCall = {
  id: string;
  name: string;
  company?: string;
  reason: string;
  urgency: 'low' | 'medium' | 'high';
  waitTime: number; // in seconds
  phoneNumber: string;
  timestamp: Date;
};

export type PreCallInfo = {
  id: string;
  title: string;
  content: string;
  type: 'tip' | 'warning' | 'info';
};

// Sample incoming calls data
export const incomingCalls: IncomingCall[] = [
  {
    id: "1",
    name: "Michael Schmidt",
    company: "Privatperson",
    reason: "Leistungsabdeckung Physiobehandlung",
    urgency: "medium",
    waitTime: 42,
    phoneNumber: "+41 79 123 45 67",
    timestamp: new Date(new Date().getTime() - 42000) // 42 seconds ago
  },
  {
    id: "2",
    name: "Emma Meier",
    company: "Praxis Dr. Müller",
    reason: "Versicherungsdeckung",
    urgency: "high",
    waitTime: 128,
    phoneNumber: "+41 78 987 65 43",
    timestamp: new Date(new Date().getTime() - 128000) // 128 seconds ago
  },
  {
    id: "3",
    name: "Thomas Weber",
    reason: "Mahnung trotz Zahlung",
    urgency: "low",
    waitTime: 15,
    phoneNumber: "+41 76 555 33 22",
    timestamp: new Date(new Date().getTime() - 15000) // 15 seconds ago
  }
];

// Sample pre-call information tips
export const preCalls: PreCallInfo[] = [
  {
    id: "1",
    title: "Customer Profile",
    content: "Michael Schmidt is a 45-year-old male with a family insurance plan. He has been a customer for 6 years.",
    type: "info"
  },
  {
    id: "2",
    title: "Recent Interaction",
    content: "Customer contacted us last week about physiotherapy coverage. Verify if issue was resolved.",
    type: "warning"
  },
  {
    id: "3",
    title: "Suggested Approach",
    content: "Be prepared to explain the coverage limits for physiotherapy treatments and the reimbursement process.",
    type: "tip"
  }
];

// Sample sensitive data patterns with verification requirements
export const sensitiveDataPatterns = {
  insurance_number: {
    regex: /\b[A-Z]{2}[0-9]{8}\b/,
    description: "Insurance number (format: XX12345678)",
    exampleValue: "DE12345678",
    requiresVerification: true
  },
  customer_id: {
    regex: /\b[0-9]{9}\b/,
    description: "Customer ID (9 digits)",
    exampleValue: "987654321",
    requiresVerification: false
  },
  bank_account: {
    regex: /\b[A-Z]{2}[0-9]{2}[A-Z0-9]{4}[0-9]{7}([A-Z0-9]{0,16})?\b/i,
    description: "IBAN (International Bank Account Number)",
    exampleValue: "CH9300762011623852957",
    requiresVerification: false
  },
  date_of_birth: {
    regex: /\b(0[1-9]|[12][0-9]|3[01])\.(0[1-9]|1[0-2])\.(19|20)\d\d\b/,
    description: "Date of birth (DD.MM.YYYY)",
    exampleValue: "15.03.1985",
    requiresVerification: true
  },
  address: {
    regex: /\b[A-Za-zäöüÄÖÜß\s\d\.\-]+\s\d+,\s\d{4,5}\s[A-Za-zäöüÄÖÜß\s\.\-]+\b/,
    description: "Address (format: Street Number, ZIP City)",
    exampleValue: "Musterstrasse 123, 8000 Zürich",
    requiresVerification: true
  }
};

// Helper function to detect sensitive data in text
export const detectSensitiveData = (text: string): SensitiveField[] => {
  const results: SensitiveField[] = [];
  
  // Check each pattern against the text
  Object.entries(sensitiveDataPatterns).forEach(([type, pattern]) => {
    const matches = text.match(pattern.regex);
    if (matches) {
      matches.forEach(match => {
        results.push({
          id: nanoid(),
          type: type as SensitiveDataType,
          value: match,
          pattern: pattern.regex.toString(),
          status: 'pending',
          requiresVerification: pattern.requiresVerification
        });
      });
    }
  });
  
  return results;
};
