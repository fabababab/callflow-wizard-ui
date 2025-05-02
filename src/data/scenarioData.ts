
import { nanoid } from 'nanoid';

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
