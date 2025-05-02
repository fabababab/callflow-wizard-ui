import React, { useState, useEffect } from 'react';
import { 
  HeadphonesIcon, 
  Phone, 
  Clock, 
  User,
  ArrowRight, 
  AlertCircle, 
  MessageSquare, 
  Star, 
  CheckCircle, 
  History, 
  FileText,
  UserCircle,
  CornerDownLeft,
  ChevronDown,
  FileJson
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { SidebarProvider } from '@/components/ui/sidebar';
import { useToast } from '@/hooks/use-toast';
import { useNavigate, useLocation } from 'react-router-dom';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import SidebarTrigger from '@/components/SidebarTrigger';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import ScenarioSelector, { ScenarioType, scenarioCallData } from '@/components/ScenarioSelector';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { getStateMachineJson } from '@/utils/stateMachineLoader';
import { stateMachines } from '@/data/stateMachines';

const Dashboard = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [acceptedCallId, setAcceptedCallId] = useState<number | null>(null);
  const [expandedPreCallId, setExpandedPreCallId] = useState<number | null>(null);
  const [rightSidebarOpen, setRightSidebarOpen] = useState(true);
  const [messages, setMessages] = useState<Array<{
    id: number;
    text: string;
    sender: 'agent' | 'customer';
    timestamp: string;
  }>>([]);
  const [inputValue, setInputValue] = useState('');
  const [callActive, setCallActive] = useState(false);
  const [callStartTime, setCallStartTime] = useState<Date | null>(null);
  const [elapsedTime, setElapsedTime] = useState('00:00');
  const messagesEndRef = React.useRef<HTMLDivElement>(null);
  const [activeScenario, setActiveScenario] = useState<ScenarioType>(null);
  const [isJsonDialogOpen, setIsJsonDialogOpen] = useState(false);
  const [jsonContent, setJsonContent] = useState<string>("");
  const [isLoadingJson, setIsLoadingJson] = useState(false);

  // Check if a scenario was passed via navigation
  useEffect(() => {
    if (location.state?.scenario) {
      setActiveScenario(location.state.scenario);
    }
  }, [location.state]);

  const queueStats = {
    activeAgents: 12,
    waitingCalls: 18,
    averageWaitTime: '3m 45s',
    serviceLevelToday: 82
  };

  // Get the appropriate incoming call based on the active scenario
  // This now always returns the correct call for the active scenario
  const incomingCall = activeScenario && scenarioCallData[activeScenario] 
    ? scenarioCallData[activeScenario] 
    : {
        id: 1,
        customerName: 'Default Customer',
        phoneNumber: '+49 123 987 6543',
        waitTime: '1m 30s',
        callType: 'Support Call',
        priority: 'medium' as const,
        expertise: 'General Inquiry',
        matchScore: 80,
        caseHistory: [],
        roboCallSummary: {
          duration: '0m 0s',
          intents: [],
          sentiment: 'Neutral',
          keyPoints: []
        }
      };

  // Generate scenario-specific pre-call conversations
  const getPreCalls = () => {
    if (!activeScenario) {
      return [
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
    }

    switch (activeScenario) {
      case 'verification':
        return [
          {
            id: 1,
            timestamp: '14:32:15',
            agent: 'RoboVoice',
            content: "Hello, I need to verify my identity. I received an email saying someone tried to log into my account from a different country.",
            response: "I understand your concern. For security purposes, I'll need to verify your identity. Could you confirm when you last logged into your account?",
            customerName: incomingCall.customerName,
            callType: incomingCall.callType
          },
          {
            id: 2,
            timestamp: '14:33:20',
            agent: 'RoboVoice',
            content: "I logged in yesterday evening from my home computer, but I definitely wasn't abroad.",
            response: "Thank you for confirming. To proceed with verification, I'll need some additional information. Can you confirm your date of birth and the last four digits of your account number?",
            customerName: incomingCall.customerName,
            callType: incomingCall.callType
          }
        ];
      case 'bankDetails':
        return [
          {
            id: 1,
            timestamp: '14:32:15',
            agent: 'RoboVoice',
            content: "Hi there, I need to update my bank details as I've switched to a new bank.",
            response: "I'd be happy to help you update your bank information. For security purposes, I'll need to verify your identity first before making any changes.",
            customerName: incomingCall.customerName,
            callType: incomingCall.callType
          },
          {
            id: 2,
            timestamp: '14:33:20',
            agent: 'RoboVoice',
            content: "I understand. What information do you need from me for verification?",
            response: "I'll need your full name, date of birth, and the current account information we have on file. After verification, I can help you update to your new bank details.",
            customerName: incomingCall.customerName,
            callType: incomingCall.callType
          }
        ];
      case 'accountHistory':
        return [
          {
            id: 1,
            timestamp: '14:32:15',
            agent: 'RoboVoice',
            content: "Hello, I'm calling because I noticed some unusual charges on my account statement and I'd like to review my account history.",
            response: "I understand your concern about the unusual charges. I'd be happy to help you review your account history. Could you specify which time period you're interested in?",
            customerName: incomingCall.customerName,
            callType: incomingCall.callType
          },
          {
            id: 2,
            timestamp: '14:33:20',
            agent: 'RoboVoice',
            content: "I'd like to look at the past three months, specifically any transactions over €50.",
            response: "Thank you for that information. Before I provide your account history, I need to verify your identity for security purposes. Can you please confirm your full name and date of birth?",
            customerName: incomingCall.customerName,
            callType: incomingCall.callType
          }
        ];
      case 'physioTherapy':
        return [
          {
            id: 1,
            timestamp: '14:32:15',
            agent: 'RoboVoice',
            content: "Guten Tag, ich habe eine Frage zur Leistungsabdeckung für Physiotherapie. Mein Arzt hat mir 10 Behandlungen verschrieben.",
            response: "Guten Tag. Ich helfe Ihnen gerne bei Ihrer Frage zur Physiotherapie-Abdeckung. Können Sie mir bitte Ihre Versicherungsnummer und die genaue Verschreibung mitteilen?",
            customerName: incomingCall.customerName,
            callType: incomingCall.callType
          },
          {
            id: 2,
            timestamp: '14:33:20',
            agent: 'RoboVoice',
            content: "Meine Versicherungsnummer ist DE12345678 und die Verschreibung ist für Physiotherapie wegen Rückenschmerzen, 10 Einheiten.",
            response: "Vielen Dank für diese Informationen. Bei Ihrem Tarif sind grundsätzlich physiotherapeutische Behandlungen abgedeckt, aber ich muss die genauen Details zu Ihrem speziellen Fall prüfen.",
            customerName: incomingCall.customerName,
            callType: incomingCall.callType
          }
        ];
      case 'paymentReminder':
        return [
          {
            id: 1,
            timestamp: '14:32:15',
            agent: 'RoboVoice',
            content: "Hallo, ich habe heute eine Mahnung erhalten, obwohl ich die Rechnung bereits letzte Woche bezahlt habe.",
            response: "Das tut mir leid zu hören. Ich verstehe Ihre Bedenken. Können Sie mir bitte Ihre Kundennummer und das Datum Ihrer Zahlung mitteilen?",
            customerName: incomingCall.customerName,
            callType: incomingCall.callType
          },
          {
            id: 2,
            timestamp: '14:33:20',
            agent: 'RoboVoice',
            content: "Meine Kundennummer ist 987654321 und ich habe am 25. April überwiesen. Ich habe sogar einen Zahlungsbeleg.",
            response: "Vielen Dank für diese Information. Es kann manchmal zu Verzögerungen bei der Verarbeitung von Zahlungen kommen. Ich werde das für Sie überprüfen und klären.",
            customerName: incomingCall.customerName,
            callType: incomingCall.callType
          }
        ];
      case 'insurancePackage':
        return [
          {
            id: 1,
            timestamp: '14:32:15',
            agent: 'RoboVoice',
            content: "Guten Tag, ich schließe nächsten Monat mein Studium ab und muss meine Studentenversicherung auf ein reguläres Paket umstellen.",
            response: "Herzlichen Glückwunsch zum baldigen Studienabschluss! Ich helfe Ihnen gerne bei der Umstellung Ihrer Versicherung. Können Sie mir Ihre aktuelle Versicherungsnummer mitteilen?",
            customerName: incomingCall.customerName,
            callType: incomingCall.callType
          },
          {
            id: 2,
            timestamp: '14:33:20',
            agent: 'RoboVoice',
            content: "Danke! Meine Versicherungsnummer ist ST-7654321. Ich suche nach einem Paket mit guter Zahnversicherung und bin bald Vollzeit beschäftigt.",
            response: "Vielen Dank für diese Informationen. Wir bieten verschiedene Pakete für Berufseinsteiger an, die auf Ihre Bedürfnisse zugeschnitten sind. Ich werde Ihnen gerne die Optionen erklären.",
            customerName: incomingCall.customerName,
            callType: incomingCall.callType
          }
        ];
      default:
        return [
          {
            id: 1,
            timestamp: '14:32:15',
            agent: 'RoboVoice',
            content: "Hello, I'm having an issue with my account.",
            response: "I understand. Could you please provide more details about the issue you're experiencing?",
            customerName: incomingCall.customerName,
            callType: incomingCall.callType
          }
        ];
    }
  };

  const preCalls = getPreCalls();

  // We'll now use a single incoming call based on the active scenario
  // instead of maintaining a separate list with duplicates
  const incomingCalls = [incomingCall];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    
    if (callActive && callStartTime) {
      interval = setInterval(() => {
        const now = new Date();
        const diff = now.getTime() - callStartTime.getTime();
        const minutes = Math.floor(diff / 60000);
        const seconds = Math.floor((diff % 60000) / 1000);
        setElapsedTime(`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
      }, 1000);
    }
    
    return () => clearInterval(interval);
  }, [callActive, callStartTime]);

  const handleAcceptCall = (callId: number) => {
    setAcceptedCallId(callId);
    setCallActive(true);
    setCallStartTime(new Date());
    
    toast({
      title: "Call Accepted",
      description: `You are now connected with ${incomingCall.customerName}`,
    });

    // Generate initial messages based on the active scenario
    setTimeout(() => {
      const initialGreeting = getScenarioInitialMessage();
      
      const initialMessage = {
        id: 1,
        text: initialGreeting,
        sender: 'agent' as const,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages([initialMessage]);

      setTimeout(() => {
        const customerResponse = {
          id: 2,
          text: getScenarioCustomerResponse(),
          sender: 'customer' as const,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages(prev => [...prev, customerResponse]);
      }, 2000);
    }, 1000);
  };

  // Get scenario-specific initial message - simplified to use incomingCall directly
  const getScenarioInitialMessage = () => {
    switch(activeScenario) {
      case 'verification':
        return `Hello ${incomingCall.customerName}, thank you for calling about the security alert. I understand you're concerned about the login attempt from an unfamiliar location. Let me help you verify your identity and secure your account.`;
      case 'bankDetails':
        return `Hello ${incomingCall.customerName}, thank you for calling about updating your bank details. I'll be happy to help you make this change securely. First, I'll need to verify some information with you.`;
      case 'accountHistory':
        return `Hello ${incomingCall.customerName}, thank you for calling about your account history. I understand you've noticed some unusual charges. I'll help you review your recent transactions and resolve any discrepancies.`;
      case 'physioTherapy':
        return `Guten Tag ${incomingCall.customerName}, danke für Ihren Anruf bezüglich der Physiotherapie-Abdeckung. Ich verstehe, dass Sie Fragen zu Ihrer Verschreibung haben. Ich werde Ihnen gerne alle Details zu Ihrer Versicherungsabdeckung erklären.`;
      case 'paymentReminder':
        return `Guten Tag ${incomingCall.customerName}, danke für Ihren Anruf bezüglich der Mahnung. Ich verstehe, dass Sie bereits eine Zahlung geleistet haben und trotzdem eine Mahnung erhalten haben. Ich werde das umgehend für Sie klären.`;
      case 'insurancePackage':
        return `Guten Tag ${incomingCall.customerName}, herzlichen Glückwunsch zum baldigen Studienabschluss! Ich helfe Ihnen gerne bei der Umstellung Ihrer Versicherung auf ein passendes Paket für Ihre neue Lebenssituation.`;
      default:
        return `Hello ${incomingCall.customerName}, thank you for calling customer support. How can I assist you today?`;
    }
  };

  // Get scenario-specific customer response
  const getScenarioCustomerResponse = () => {
    switch(activeScenario) {
      case 'verification':
        return "Yes, I'm very concerned. I received an email alert about a login attempt from another country. I want to make sure my account is secure and no one has accessed my personal information.";
      case 'bankDetails':
        return "Thank you. I recently changed banks and need to update my direct debit information for my monthly payments. I have all my new bank details ready.";
      case 'accountHistory':
        return "Thanks for your help. There are three transactions from last month that I don't recognize. They're all small amounts, but I want to make sure no one has unauthorized access to my account.";
      case 'physioTherapy':
        return "Danke. Mein Hauptanliegen ist, ob alle 10 verschriebenen Behandlungen von meiner Versicherung übernommen werden. Mein Physiotherapeut sagte mir, dass manche Versicherungen nur 6 Behandlungen abdecken.";
      case 'paymentReminder':
        return "Ich habe definitiv am 25. April bezahlt und habe sogar eine Bestätigung von meiner Bank. Trotzdem habe ich gestern eine Mahnung mit Mahngebühren erhalten. Das ist sehr ärgerlich.";
      case 'insurancePackage':
        return "Danke. Ich beginne am 1. Juli meinen neuen Job und brauche bis dahin ein neues Versicherungspaket. Besonders wichtig ist mir eine gute Zahnversicherung und eventuell eine Zusatzversicherung für Brillen.";
      default:
        return "I've been having issues with my service recently and need some help resolving them.";
    }
  };

  const handleEndCall = () => {
    setCallActive(false);
    setCallStartTime(null);
    setElapsedTime('00:00');
    setAcceptedCallId(null);
    setMessages([]);
    toast({
      title: "Call Ended",
      description: "Call has been successfully completed",
    });
  };

  const handleSendMessage = () => {
    if (inputValue.trim()) {
      const newMessage = {
        id: messages.length + 1,
        text: inputValue,
        sender: 'agent' as const,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, newMessage]);
      setInputValue('');

      // Generate scenario-specific responses
      setTimeout(() => {
        const responses = getScenarioResponses();
        const responseIndex = Math.min(Math.floor(messages.length / 2), responses.length - 1);
        
        const customerResponse = {
          id: messages.length + 2,
          text: responses[responseIndex],
          sender: 'customer' as const,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages(prev => [...prev, customerResponse]);
      }, 2000);
    }
  };

  // Get scenario-specific customer responses
  const getScenarioResponses = () => {
    switch(activeScenario) {
      case 'verification':
        return [
          "Yes, I can confirm my date of birth is May 12, 1985.",
          "The last four digits of my account are 7890.",
          "I have received no other suspicious emails or notifications.",
          "Should I change my password as a precaution?",
          "Thank you for your help with this."
        ];
      case 'bankDetails':
        return [
          "My name is Max Hoffman, born June 3, 1982.",
          "My current bank is Commerzbank, account ending in 4321.",
          "My new bank is Deutsche Bank, and I have the IBAN ready.",
          "When will the change take effect for my next payment?",
          "Thank you for updating my information."
        ];
      case 'accountHistory':
        return [
          "The transactions were on March 15, 18, and 22.",
          "They were all between €15-25 from an online merchant called 'DigiStore'.",
          "I've never shopped at this store before.",
          "Should I request a new card as a precaution?",
          "Thank you for flagging these as suspicious."
        ];
      case 'physioTherapy':
        return [
          "Meine Versicherungsnummer ist DE12345678.",
          "Die Behandlungen sind für chronische Rückenschmerzen nach einem Bandscheibenvorfall.",
          "Mein Arzt sagt, dass alle 10 Behandlungen medizinisch notwendig sind.",
          "Muss ich eine Vorabgenehmigung einholen?",
          "Vielen Dank für die Informationen."
        ];
      case 'paymentReminder':
        return [
          "Die Rechnungsnummer ist INV-29384.",
          "Ich habe per Überweisung bezahlt, nicht per Lastschrift.",
          "Werden die Mahngebühren storniert, wenn es sich um einen Fehler handelt?",
          "Kann ich Ihnen den Zahlungsbeleg zusenden?",
          "Danke für Ihre Hilfe in dieser Angelegenheit."
        ];
      case 'insurancePackage':
        return [
          "Ich werde als Softwareentwickler arbeiten, hauptsächlich im Büro.",
          "Ich brauche definitiv eine gute Zahnversicherung und Brillenversicherung.",
          "Wie viel würde ein umfassendes Paket kosten?",
          "Gibt es Rabatte für Neukunden oder Berufseinsteiger?",
          "Vielen Dank für die ausführliche Beratung."
        ];
      default:
        return [
          "I've already tried restarting the router multiple times.",
          "Yes, it happens more frequently during video calls.",
          "The issue started yesterday evening.",
          "No other devices are having this problem.",
          "Thank you for your help with this."
        ];
    }
  };

  const handleSelectScenario = (scenario: ScenarioType) => {
    setActiveScenario(scenario);
    // Reset call state when scenario changes
    setAcceptedCallId(null);
    setCallActive(false);
    setMessages([]);
    setElapsedTime('00:00');
    
    // Show a toast to indicate the scenario change
    if (scenario) {
      toast({
        title: "Scenario Changed",
        description: `Now working with ${scenario} scenario`,
      });
    }
  };

  // Function to open the JSON dialog
  const handleViewJson = async () => {
    if (!activeScenario) return;
    
    setIsLoadingJson(true);
    try {
      const json = await getStateMachineJson(activeScenario);
      setJsonContent(json);
      setIsJsonDialogOpen(true);
    } catch (error) {
      console.error("Failed to load JSON:", error);
      setJsonContent("Error loading state machine JSON");
      toast({
        title: "Error",
        description: "Failed to load state machine JSON",
        variant: "destructive"
      });
    } finally {
      setIsLoadingJson(false);
    }
  };

  const renderActiveCall = () => (
    <Card className="border-green-500 border-2">
      <CardHeader className="bg-green-50">
        <div className="flex justify-between items-center">
          <CardTitle>Active Call - {incomingCall.customerName}</CardTitle>
          <div className="flex items-center gap-2">
            <Badge className="bg-green-500">Live</Badge>
            {/* Add state machine JSON button only if this scenario has a state machine */}
            {activeScenario && stateMachines[activeScenario as string] && (
              <Button
                size="icon"
                variant="outline"
                className="h-8 w-8"
                title="View State Machine JSON"
                onClick={handleViewJson}
                disabled={isLoadingJson}
              >
                <FileJson size={16} />
              </Button>
            )}
          </div>
        </div>
        <CardDescription>
          {incomingCall.callType} • {incomingCall.phoneNumber}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="mb-6">
          <Collapsible>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="w-full flex justify-between items-center p-3">
                <span className="font-medium">Pre-Call History</span>
                <ChevronDown size={16} />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-3">
              {preCalls.map(preCall => (
                <div key={preCall.id} className="p-3 border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <UserCircle size={18} />
                    <span className="font-medium">{preCall.agent}</span>
                    <span className="text-sm text-muted-foreground">{preCall.timestamp}</span>
                  </div>
                  <p className="text-sm">{preCall.content}</p>
                  <p className="text-sm text-muted-foreground mt-2">{preCall.response}</p>
                </div>
              ))}
            </CollapsibleContent>
          </Collapsible>
        </div>

        <div className="space-y-4 max-h-[400px] overflow-y-auto mb-4">
          {messages.map((message) => (
            <div 
              key={message.id}
              className={`flex ${message.sender === 'agent' ? 'justify-end' : 'justify-start'} items-start gap-2`}
            >
              {message.sender === 'customer' && (
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary/10">
                    {incomingCall.customerName.charAt(0)}
                  </AvatarFallback>
                </Avatar>
              )}
              <div className={`max-w-[80%] ${message.sender === 'agent' ? 'text-right' : ''}`}>
                <div
                  className={`px-4 py-2 rounded-lg text-sm ${
                    message.sender === 'agent'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  }`}
                >
                  {message.text}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {message.timestamp}
                </div>
              </div>
              {message.sender === 'agent' && (
                <Avatar className="h-8 w-8">
                  <AvatarFallback>A</AvatarFallback>
                </Avatar>
              )}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <div className="flex items-center gap-2 pt-4 border-t">
          <Input
            placeholder="Type your message..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSendMessage();
              }
            }}
          />
          <Button onClick={handleSendMessage} disabled={!inputValue.trim()}>
            <CornerDownLeft size={18} />
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <SidebarProvider>
      <div className="flex flex-col h-screen w-full">
        <Header />
        <div className="flex flex-1 overflow-hidden">
          <Sidebar />
          <main className="flex-1 p-6 overflow-auto bg-callflow-background">
            <div className="space-y-6">
              {/* Queue stats section */}
              <div>
                <h1 className="text-2xl font-bold tracking-tight">Current Queue</h1>
                <p className="text-muted-foreground">
                  Manage incoming calls and call queue
                </p>
              </div>

              {/* Scenario selector */}
              <ScenarioSelector 
                activeScenario={activeScenario} 
                onSelectScenario={handleSelectScenario} 
              />

              {/* Stats cards */}
              <div className="grid gap-4 md:grid-cols-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Active Agents
                    </CardTitle>
                    <HeadphonesIcon className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{queueStats.activeAgents}</div>
                    <p className="text-xs text-callflow-success">
                      All agents online
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Waiting Calls
                    </CardTitle>
                    <Phone className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{queueStats.waitingCalls}</div>
                    <p className="text-xs text-callflow-accent">
                      3 high priority
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Average Wait Time
                    </CardTitle>
                    <Clock className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{queueStats.averageWaitTime}</div>
                    <p className="text-xs text-callflow-accent">
                      +45s from target
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Service Level Today
                    </CardTitle>
                    <AlertCircle className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{queueStats.serviceLevelToday}%</div>
                    <Progress value={queueStats.serviceLevelToday} className="h-2" />
                  </CardContent>
                </Card>
              </div>

              {/* Dashboard section */}
              <div>
                <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
                <p className="text-muted-foreground">
                  Welcome to the CallFlow Wizard dashboard.
                </p>
              </div>

              {/* Main section */}
              <div className="grid gap-4">
                {/* Active call section - now takes full width */}
                <div className="col-span-1">
                  {!acceptedCallId ? (
                    <Card className="overflow-hidden">
                      <CardHeader>
                        <CardTitle>Priority Call</CardTitle>
                        <CardDescription>
                          Recommended for {activeScenario ? `scenario: ${activeScenario}` : 'your expertise and availability'}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="flex items-start gap-6 p-4 bg-accent/5 rounded-lg">
                          <div className="bg-callflow-primary/10 w-16 h-16 rounded-full flex items-center justify-center text-callflow-primary shrink-0">
                            <User size={32} />
                          </div>
                          <div className="space-y-4 flex-1">
                            <div>
                              <h3 className="text-xl font-semibold">{incomingCall.customerName}</h3>
                              <div className="flex items-center gap-2 text-muted-foreground">
                                <Phone size={16} />
                                <span>{incomingCall.phoneNumber}</span>
                                <span>•</span>
                                <span>{incomingCall.callType}</span>
                              </div>
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                              <div className="space-y-2">
                                <h4 className="font-medium flex items-center gap-2">
                                  <History size={16} />
                                  Case History
                                </h4>
                                <div className="space-y-2">
                                  {incomingCall.caseHistory && incomingCall.caseHistory.map((case_, index) => (
                                    <div key={index} className="text-sm p-2 bg-background rounded-md">
                                      <div className="flex justify-between">
                                        <span className="font-medium">{case_.type}</span>
                                        <span className="text-muted-foreground">{case_.date}</span>
                                      </div>
                                      <p className="text-muted-foreground mt-1">{case_.description}</p>
                                    </div>
                                  ))}
                                  {(!incomingCall.caseHistory || incomingCall.caseHistory.length === 0) && (
                                    <div className="text-sm p-2 bg-background/50 text-center rounded-md">
                                      No case history available
                                    </div>
                                  )}
                                </div>
                              </div>

                              <div className="space-y-2">
                                <h4 className="font-medium flex items-center gap-2">
                                  <FileText size={16} />
                                  Robo-Call Summary
                                </h4>
                                <div className="space-y-2 text-sm">
                                  <div className="p-2 bg-background rounded-md">
                                    <div className="flex justify-between items-center mb-2">
                                      <span className="font-medium">Duration</span>
                                      <span>{incomingCall.roboCallSummary?.duration || "0m 0s"}</span>
                                    </div>
                                    <div className="space-y-1">
                                      <p className="font-medium">Key Points:</p>
                                      <ul className="list-disc list-inside text-muted-foreground">
                                        {incomingCall.roboCallSummary?.keyPoints && 
                                         incomingCall.roboCallSummary.keyPoints.length > 0 ? (
                                          incomingCall.roboCallSummary.keyPoints.map((point, index) => (
                                            <li key={index}>{point}</li>
                                          ))
                                        ) : (
                                          <li>No key points available</li>
                                        )}
                                      </ul>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between border-t pt-4">
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-1">
                              <Clock size={16} className="text-muted-foreground" />
                              <span>Waiting: {incomingCall.waitTime}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Star size={16} className="text-yellow-500" />
                              <span>{incomingCall.matchScore}% match</span>
                            </div>
                            <Badge 
                              variant="outline" 
                              className="bg-destructive/10 text-destructive border-destructive/20"
                            >
                              {incomingCall.priority === 'high' ? 'High' : incomingCall.priority === 'medium' ? 'Medium' : 'Low'} priority
                            </Badge>
                          </div>
                          <Button 
                            size="lg" 
                            className="gap-2"
                            onClick={() => handleAcceptCall(incomingCall.id)}
                          >
                            Accept Call <ArrowRight size={16} />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ) : (
                    renderActiveCall()
                  )}
                </div>
              </div>

              {/* Recent activity and performance section */}
              <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                {/* Recent Activity card */}
                <Card className="col-span-1">
                  <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                    <CardDescription>
                      Your recent call handling
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          <div className="bg-blue-100 p-2 rounded-full">
                            <Phone size={14} className="text-blue-500" />
                          </div>
                          <div>
                            <p className="text-sm font-medium">Thomas Weber</p>
                            <p className="text-xs text-muted-foreground">Technical Support</p>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => navigate('/call-history')}>
                          View
                        </Button>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          <div className="bg-green-100 p-2 rounded-full">
                            <Phone size={14} className="text-green-500" />
                          </div>
                          <div>
                            <p className="text-sm font-medium">Julia Fischer</p>
                            <p className="text-xs text-muted-foreground">Billing</p>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => navigate('/call-history')}>
                          View
                        </Button>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          <div className="bg-purple-100 p-2 rounded-full">
                            <Phone size={14} className="text-purple-500" />
                          </div>
                          <div>
                            <p className="text-sm font-medium">Leon Schneider</p>
                            <p className="text-xs text-muted-foreground">General Inquiry</p>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => navigate('/call-history')}>
                          View
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" className="w-full" onClick={() => navigate('/call-history')}>
                      View All Activity
                    </Button>
                  </CardFooter>
                </Card>
                
                {/* Performance card */}
                <Card className="col-span-1">
                  <CardHeader>
                    <CardTitle>Your Performance</CardTitle>
                    <CardDescription>
                      Last 7 days metrics
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between mb-2">
                          <span className="text-sm">Customer Satisfaction</span>
                          <span className="text-sm font-medium">92%</span>
                        </div>
                        <Progress value={92} className="h-2" />
                      </div>
                      
                      <div>
                        <div className="flex justify-between mb-2">
                          <span className="text-sm">First Call Resolution</span>
                          <span className="text-sm font-medium">85%</span>
                        </div>
                        <Progress value={85} className="h-2" />
                      </div>
                      
                      <div>
                        <div className="flex justify-between mb-2">
                          <span className="text-sm">Average Handle Time</span>
                          <span className="text-sm font-medium">4m 23s</span>
                        </div>
                        <Progress value={78} className="h-2" />
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" className="w-full" onClick={() => navigate('/stats')}>
                      View Detailed Stats
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            </div>
          </main>
        </div>
      </div>
      {/* Dialog to display the JSON state machine */}
      <Dialog open={isJsonDialogOpen} onOpenChange={setIsJsonDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>State Machine for {activeScenario}</DialogTitle>
          </DialogHeader>
          <div className="overflow-auto max-h-[60vh]">
            <pre className="bg-slate-100 p-4 rounded-md text-xs overflow-x-auto">
              {jsonContent}
            </pre>
          </div>
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  );
};

export default Dashboard;
