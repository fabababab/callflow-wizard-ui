import React, { useRef, useEffect, useState } from 'react';
import { Mic, CornerDownLeft, PhoneCall, PhoneOff, User, Clock, ArrowRight, Star, UserCircle, MessageSquare, ChevronDown, ChevronUp, CheckCircle as Check, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { ScenarioType } from './ScenarioSelector';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

type Message = {
  id: number;
  text: string;
  sender: 'agent' | 'customer';
  timestamp: string;
  suggestions?: AISuggestion[];
};

type AISuggestion = {
  id: number;
  text: string;
  type: 'info' | 'action' | 'response';
  accepted?: boolean;
  rejected?: boolean;
};

type IncomingCall = {
  id: number;
  customerName: string;
  phoneNumber: string;
  waitTime: string;
  callType: string;
  priority: 'high' | 'medium' | 'low';
  expertise: string;
  matchScore: number;
}

type PreCall = {
  id: number;
  timestamp: string;
  agent: string;
  content: string;
  response: string;
  customerName: string;
  callType: string;
}

// Type definition for PhysioState in the state machine
type PhysioState = {
  agent?: string;
  customer?: string;
  suggestions?: string[];
  nextState?: string;
  stateType?: 'question' | 'info' | 'decision' | 'verification';
  action?: string;
  systemMessage?: string;
}

interface TranscriptPanelProps {
  activeScenario: ScenarioType;
}

const TranscriptPanel: React.FC<TranscriptPanelProps> = ({ activeScenario }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [callActive, setCallActive] = useState(false);
  const [callStartTime, setCallStartTime] = useState<Date | null>(null);
  const [elapsedTime, setElapsedTime] = useState('00:00');
  const [acceptedCallId, setAcceptedCallId] = useState<number | null>(null);
  const [historyCollapsed, setHistoryCollapsed] = useState(true);
  const [currentPhysioState, setCurrentPhysioState] = useState<string>('start');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  
  // Enhanced Physiotherapy scenario state machine
  const physioStateMachine: Record<string, PhysioState> = {
    start: {
      agent: "Grüezi, mein Name ist Lisa Meier, wie darf ich Ihnen helfen?",
      customer: "Ich möchte wissen, ob die Physiotherapie bei Knieproblemen gedeckt ist...",
      nextState: "authentifizierung",
      stateType: "info"
    },
    authentifizierung: {
      agent: "Darf ich Sie kurz identifizieren? Nennen Sie mir bitte Ihr Geburtsdatum.",
      customer: "14. Mai 1985.",
      nextState: "authentifizierung_plz",
      stateType: "verification",
      action: "prüfeGeburtsdatum",
      systemMessage: "Bitte verifizieren Sie das Geburtsdatum",
    },
    authentifizierung_plz: {
      agent: "Danke. Ihre PLZ bei uns?",
      customer: "8004 Zürich.",
      nextState: "authentifizierung_erfolg",
      stateType: "verification",
      action: "prüfeKundenkonto",
      systemMessage: "Bitte verifizieren Sie die Postleitzahl",
    },
    authentifizierung_failed: {
      agent: "Es tut mir leid, aber ich konnte Ihre Daten nicht in unserem System finden. Könnten Sie bitte nochmals Ihre Versicherungsnummer angeben?",
      customer: "Oh, vielleicht habe ich mich vertan. Meine Versicherungsnummer ist CH-7890-1234.",
      nextState: "authentifizierung_erfolg", // For demo purposes, we'll assume the second attempt works
      stateType: "verification",
      systemMessage: "Kunde konnte nicht identifiziert werden. Bitte fragen Sie nach alternativen Identifikationsdaten.",
    },
    authentifizierung_erfolg: {
      agent: "Alles klar, Herr Keller, ich habe Ihr Profil gefunden. Haben Sie die Versichertennummer?",
      customer: "756.1234.5678.90.",
      nextState: "waehle_leistungserbringer",
      stateType: "verification",
      systemMessage: "Kunde erfolgreich identifiziert. Versicherungsstatus: Premium mit voller Physiotherapie-Abdeckung.",
    },
    waehle_leistungserbringer: {
      agent: "Welchen Physiotherapeuten möchten Sie?",
      customer: "Jana Brunner, Praxis 8004 Zürich.",
      nextState: "pruefe_therapeut",
      stateType: "question",
      systemMessage: "Prüfe Leistungserbringer im System",
    },
    pruefe_therapeut: {
      agent: "Einen Augenblick bitte...",
      nextState: "therapeut_anerkannt",
      stateType: "info",
      action: "prüfeLeistungserbringer",
      systemMessage: "Therapeut Jana Brunner gefunden. Status: Anerkannte Leistungserbringerin."
    },
    therapeut_nicht_anerkannt: {
      agent: "Es tut mir leid, aber Frau Brunner ist keine anerkannte Leistungserbringerin in unserem Netzwerk. Möchten Sie einen anderen Therapeuten wählen oder soll ich Ihnen anerkannte Therapeuten in Ihrer Nähe nennen?",
      suggestions: ["Anderen Therapeuten wählen", "Anerkannte Therapeuten zeigen"],
      stateType: "decision",
      nextState: "therapeuten_vorschlagen",
      systemMessage: "Therapeut nicht anerkannt. Bitte bieten Sie Alternativen an.",
    },
    therapeuten_vorschlagen: {
      agent: "In 8004 Zürich haben wir folgende anerkannte Physiotherapeuten: Dr. Müller (Bahnhofstrasse 10), Praxis Gesundheit (Langstrasse 25) und Physio Plus (Stauffacherstrasse 52).",
      nextState: "waehle_leistungserbringer",
      stateType: "info",
      systemMessage: "Zeige anerkannte Leistungserbringer in PLZ 8004."
    },
    therapeut_anerkannt: {
      agent: "Frau Brunner ist anerkannte Leistungserbringerin.",
      nextState: "verordnung_abfragen",
      stateType: "info",
      systemMessage: "Therapeut anerkannt. Fahren Sie mit Verordnungsdetails fort."
    },
    verordnung_abfragen: {
      agent: "Für Kostendeckung brauchen Sie eine gültige ärztliche Verordnung. Möchten Sie Details?",
      suggestions: ["Ja, bitte", "Nein, danke"],
      stateType: "decision",
      systemMessage: "Fragen Sie, ob der Kunde Details zur Verordnung benötigt."
    },
    details_verordnung: {
      agent: "Die Grundversicherung deckt 9 Sitzungen, Folge-Verordnung möglich. Therapie muss innerhalb 5 Wochen starten.",
      nextState: "abschluss",
      stateType: "info",
      systemMessage: "Ihr Tariftyp Premium+ gewährt zusätzliche 3 Sitzungen, also insgesamt 12 Sitzungen pro Verordnung."
    },
    abschluss: {
      agent: "Okay. Kann ich sonst noch etwas für Sie tun?",
      customer: "Nein.",
      nextState: "ende",
      stateType: "question",
      systemMessage: "Der Kunde scheint zufrieden zu sein. Fragen Sie, ob es weitere Anliegen gibt."
    },
    ende: {
      agent: "Gute Besserung und auf Wiederhören!",
      stateType: "info",
      systemMessage: "Gespräch kann beendet werden. Kein weiterer Handlungsbedarf."
    }
  };
  
  // Sample incoming calls data
  const incomingCalls: IncomingCall[] = [
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
  const preCalls: PreCall[] = [
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
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Timer for call duration
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

  // Reset messages when scenario changes
  useEffect(() => {
    if (callActive && activeScenario) {
      // Reset message history
      setMessages([]);
      
      // Reset physio state if we're in that scenario
      if (activeScenario === 'physioTherapy') {
        setCurrentPhysioState('start');
      }
      
      // Add initial agent greeting
      setTimeout(() => {
        const initialMessage: Message = {
          id: 1,
          text: "Hallo, vielen Dank für Ihren Anruf bei unserem Kundenservice. Wie kann ich Ihnen heute helfen?",
          sender: 'agent',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages([initialMessage]);
        
        // Add scenario-specific customer response
        setTimeout(() => {
          let customerResponse = "";
          let customerName = "Michael Schmidt";
          
          switch (activeScenario) {
            case 'verification':
              customerResponse = "Hallo, hier spricht Michael Schmidt. Ich muss meine Kontodaten verifizieren.";
              break;
            case 'bankDetails':
              customerResponse = "Hallo, ich möchte meine Bankdaten für mein Konto aktualisieren.";
              break;
            case 'accountHistory':
              customerResponse = "Hallo, ich möchte meine letzten Kontoaktivitäten überprüfen.";
              break;
            case 'physioTherapy':
              if (physioStateMachine.start.customer) {
                customerResponse = physioStateMachine.start.customer;
                
                // For physio scenario, immediately generate system suggestion
                const systemMsg = physioStateMachine.start.systemMessage;
                const agentNextResponse = physioStateMachine.authentifizierung?.agent || "";
                
                const suggestion: AISuggestion[] = [
                  {
                    id: Date.now(),
                    text: systemMsg || "Starten Sie mit der Kundenverifizierung",
                    type: 'info'
                  },
                  {
                    id: Date.now() + 1,
                    text: agentNextResponse,
                    type: 'response'
                  }
                ];
                
                const customerMessage: Message = {
                  id: 2,
                  text: customerResponse,
                  sender: 'customer',
                  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                  suggestions: suggestion
                };
                
                setMessages(prev => [...prev, customerMessage]);
                return; // Skip the general customer message below
              } else {
                customerResponse = "Guten Tag, ich habe eine Frage zur Kostenübernahme für meine Physiotherapie bei Knieproblemen. Werden die Kosten von meiner Versicherung übernommen?";
              }
              break;
            case 'paymentReminder':
              customerResponse = "Hallo, ich habe eine Mahnung erhalten, obwohl ich den Betrag bereits überwiesen habe. Das verstehe ich nicht.";
              break;
            case 'insurancePackage':
              customerResponse = "Guten Tag, ich habe gerade mein Studium abgeschlossen und brauche ein neues Versicherungspaket für Berufstätige.";
              break;
            default:
              customerResponse = "Hallo, ich habe einige Fragen zu meinem Konto.";
          }
          
          const customerMessage: Message = {
            id: 2,
            text: customerResponse,
            sender: 'customer',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          };
          
          setMessages(prev => [...prev, customerMessage]);

          // Generate first AI suggestion based on scenario
          generateAiSuggestion(activeScenario, 2);
        }, 1500);
      }, 1000);
    }
  }, [activeScenario, callActive]);

  // Generate AI suggestions based on context
  const generateAiSuggestion = (scenario: ScenarioType, afterMessageId: number) => {
    let suggestions: AISuggestion[] = [];
    
    if (scenario === 'physioTherapy') {
      // If we're in the physio scenario, use the state machine for suggestions
      const currentState = physioStateMachine[currentPhysioState];
      
      if (currentState) {
        if (currentState.systemMessage) {
          suggestions.push({
            id: Date.now(),
            text: currentState.systemMessage,
            type: 'info'
          });
        }
        
        if (currentState.agent && currentState !== physioStateMachine.start) {
          suggestions.push({
            id: Date.now() + 1,
            text: currentState.agent,
            type: 'response'
          });
        }
        
        // Add quick-reply suggestions if available
        if (currentState.suggestions && currentState.suggestions.length > 0) {
          currentState.suggestions.forEach((option, index) => {
            suggestions.push({
              id: Date.now() + 2 + index,
              text: option,
              type: 'response'
            });
          });
        }
      }
    } else {
      // Process other scenarios
      switch(scenario) {
        case 'verification':
          if (afterMessageId === 2) {
            suggestions = [{
              id: Date.now(),
              text: "Bitte fragen Sie nach Kundennummer und Geburtsdatum für die Verifizierung.",
              type: 'action'
            }];
          } else if (afterMessageId === 4) {
            suggestions = [{
              id: Date.now(),
              text: "Kunde verifiziert - Sie können zusätzlich Two-Factor Authentication anbieten.",
              type: 'info'
            }];
          } else if (afterMessageId > 5) {
            suggestions = [{
              id: Date.now(),
              text: "Ich habe Ihr Konto gesichert und ein neues Passwort eingerichtet. Sie erhalten in Kürze eine E-Mail mit einem Link zur Passwortänderung. Bitte aktivieren Sie auch die Zwei-Faktor-Authentifizierung für zusätzliche Sicherheit.",
              type: 'response'
            }];
          }
          break;
        case 'bankDetails':
          if (afterMessageId === 2) {
            suggestions = [{
              id: Date.now(),
              text: "Bitte verifizieren Sie den Kunden bevor Sie Bankdaten ändern.",
              type: 'action'
            }];
          } else if (afterMessageId === 4) {
            suggestions = [{
              id: Date.now(),
              text: "Kunde verwendet seit 5 Jahren Lastschriftverfahren.",
              type: 'info'
            }];
          } else if (afterMessageId > 5) {
            suggestions = [{
              id: Date.now(),
              text: "Vielen Dank für die Bestätigung. Ich habe Ihre Bankverbindung aktualisiert. Die Änderung wird ab dem nächsten Abrechnungszyklus wirksam. Sie erhalten eine Bestätigungs-E-Mail mit allen Details.",
              type: 'response'
            }];
          }
          break;
        case 'accountHistory': 
          if (afterMessageId === 2) {
            suggestions = [{
              id: Date.now(),
              text: "Fragen Sie nach dem Zeitraum und den betroffenen Transaktionen.",
              type: 'action'
            }];
          } else if (afterMessageId === 4) {
            suggestions = [{
              id: Date.now(),
              text: "Kunde hat in den letzten 6 Monaten keine verdächtigen Aktivitäten gemeldet.",
              type: 'info'
            }];
          } else if (afterMessageId > 5) {
            suggestions = [{
              id: Date.now(),
              text: "Ich habe die verdächtigen Transaktionen markiert und eine Untersuchung eingeleitet. Sie erhalten innerhalb von 48 Stunden eine Rückmeldung von unserem Sicherheitsteam. Als Vorsichtsmaßnahme habe ich Ihre Karte gesperrt und eine neue Karte bestellt.",
              type: 'response'
            }];
          }
          break;
        case 'paymentReminder':
          if (afterMessageId === 2) {
            suggestions = [{
              id: Date.now(),
              text: "Zahlungseingang vom 25. April wurde im System vermerkt, aber noch nicht verarbeitet.",
              type: 'info'
            }];
          } else if (afterMessageId === 4) {
            suggestions = [{
              id: Date.now(),
              text: "Bitte prüfen Sie die Zahlungsreferenz und stornieren Sie die Mahngebühren.",
              type: 'action'
            }];
          } else if (afterMessageId > 5) {
            suggestions = [{
              id: Date.now(),
              text: "Ich habe den Zahlungseingang bestätigt und die Mahnung sowie alle Mahngebühren storniert. Sie erhalten innerhalb der nächsten 24 Stunden eine Bestätigung per E-Mail. Ich entschuldige mich für die Unannehmlichkeiten.",
              type: 'response'
            }];
          }
          break;
        case 'insurancePackage':
          if (afterMessageId === 2) {
            suggestions = [{
              id: Date.now(),
              text: "Empfohlenes Paket: StartPlus mit erweitertem Zahnschutz und Sehhilfen-Option.",
              type: 'info'
            }];
          } else if (afterMessageId === 4) {
            suggestions = [{
              id: Date.now(),
              text: "Informieren Sie über 15% Neukundenrabatt für Berufseinsteiger im ersten Jahr.",
              type: 'action'
            }];
          } else if (afterMessageId > 5) {
            suggestions = [{
              id: Date.now(),
              text: "Unser StartPlus-Paket mit erweitertem Zahnschutz und Brillenoption kostet 89€ monatlich. Als Berufseinsteiger erhalten Sie im ersten Jahr einen Rabatt von 15%. Ich kann Ihnen detaillierte Informationen per E-Mail zusenden und einen persönlichen Beratungstermin anbieten.",
              type: 'response'
            }];
          }
          break;
        default:
          if (afterMessageId === 2) {
            suggestions = [{
              id: Date.now(),
              text: "Kundenhistorie zeigt mehrere technische Probleme in den letzten 30 Tagen.",
              type: 'info'
            }];
          } else if (afterMessageId === 4) {
            suggestions = [{
              id: Date.now(),
              text: "Empfehlung: Router-Firmware aktualisieren und Bandbreiten-Test durchführen.",
              type: 'action'
            }];
          } else if (afterMessageId > 5) {
            suggestions = [{
              id: Date.now(),
              text: "Basierend auf unserer Diagnose scheint das Problem mit Ihrer Netzwerkausrüstung zusammenzuhängen. Ich empfehle ein Firmware-Update für Ihren Router und die Durchführung eines Bandbreiten-Tests. Ich kann Ihnen einen Techniker schicken, der das Problem weiter untersuchen kann.",
              type: 'response'
            }];
          }
      }
    }
    
    if (suggestions.length > 0) {
      // Add suggestions to the last message
      const updatedMessages = [...messages];
      const lastMessageIndex = updatedMessages.length - 1;
      
      if (lastMessageIndex >= 0) {
        updatedMessages[lastMessageIndex] = {
          ...updatedMessages[lastMessageIndex],
          suggestions: suggestions
        };
        
        setMessages(updatedMessages);
      }
    }
  };

  // Trigger contact suggestion based on keywords in the transcript
  useEffect(() => {
    if (callActive && messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.sender === 'customer') {
        const keywords = ['my name is', 'this is', 'speaking', 'michael', 'schmidt'];
        const text = lastMessage.text.toLowerCase();
        const hasKeyword = keywords.some(keyword => text.includes(keyword.toLowerCase()));
        
        if (hasKeyword && !document.getElementById('contact-identified')) {
          // Simulate that system identified the contact
          const event = new CustomEvent('contact-identified', {
            detail: { name: 'Michael Schmidt', confidence: 0.89 }
          });
          window.dispatchEvent(event);
          
          toast({
            title: "Contact Identified",
            description: "Michael Schmidt identified with 89% confidence",
          });
        }
      }
    }
  }, [messages, callActive, toast]);
  
  const handleSendMessage = () => {
    if (inputValue.trim()) {
      const newMessage: Message = {
        id: messages.length + 1,
        text: inputValue,
        sender: 'agent',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages([...messages, newMessage]);
      setInputValue('');
      
      // If in physio therapy scenario, progress through state machine
      if (activeScenario === 'physioTherapy') {
        const currentState = physioStateMachine[currentPhysioState];
        
        if (currentState && currentState.nextState) {
          // Move to next state
          let nextStateName = currentState.nextState;
          
          // Special handling for verordnung_abfragen decision point
          if (currentPhysioState === 'verordnung_abfragen') {
            // Check if the message contains an answer to the question
            if (inputValue.toLowerCase().includes('ja') || 
                inputValue.toLowerCase().includes('details')) {
              nextStateName = 'details_verordnung';
            } else {
              nextStateName = 'abschluss';
            }
          }
          
          // Randomly simulate auth failure for demo purposes (20% chance)
          if (currentPhysioState === 'authentifizierung_plz' && Math.random() < 0.2) {
            nextStateName = 'authentifizierung_failed';
          }
          
          setCurrentPhysioState(nextStateName);
          
          // Simulate customer response after a short delay
          setTimeout(() => {
            const nextState = physioStateMachine[nextStateName];
            
            if (nextState && nextState.customer) {
              const customerResponse: Message = {
                id: messages.length + 2,
                text: nextState.customer,
                sender: 'customer',
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              };
              
              setMessages(prev => [...prev, customerResponse]);
              
              // Generate new suggestion based on the next state
              setTimeout(() => {
                generateAiSuggestion('physioTherapy', messages.length + 2);
              }, 500);
            }
          }, 1500);
        }
      } else {
        // Simulate customer response after a short delay (original logic)
        if (messages.length % 2 === 0 || messages.length === 0) {
          setTimeout(() => {
            let customerResponse = "";
            
            // Scenario-specific responses
            if (activeScenario === 'bankDetails') {
              const bankResponses = [
                "Ja, ich möchte meine Bank von Deutsche Bank zu Commerzbank ändern.",
                "Meine neue IBAN ist DE89370400440532013001.",
                "Ja, das ist richtig. Ich habe kürzlich die Bank gewechselt.",
                "Vielen Dank für die Aktualisierung meiner Daten."
              ];
              customerResponse = bankResponses[Math.min(Math.floor(messages.length / 2), bankResponses.length - 1)];
            } else if (activeScenario === 'verification') {
              const verificationResponses = [
                "Ja, das stimmt. Mein Name ist Michael Schmidt.",
                "Ich wurde am 15. März 1985 geboren.",
                "Meine Adresse ist Hauptstraße 123, Berlin.",
                "Die letzten vier Ziffern meines Kontos sind 4321."
              ];
              customerResponse = verificationResponses[Math.min(Math.floor(messages.length / 2), verificationResponses.length - 1)];
            } else if (activeScenario === 'physioTherapy') {
              const physioResponses = [
                "Mein Arzt hat mir 10 Sitzungen Physiotherapie verschrieben wegen Rückenschmerzen.",
                "Ja, ich habe die ärztliche Überweisung hier vorliegen.",
                "Die Behandlung kostet 45€ pro Sitzung.",
                "Verstehe ich das richtig, dass ich 10% der Kosten selbst tragen muss?",
                "Vielen Dank für die Information."
              ];
              customerResponse = physioResponses[Math.min(Math.floor(messages.length / 2), physioResponses.length - 1)];
            } else if (activeScenario === 'paymentReminder') {
              const reminderResponses = [
                "Ich habe den Betrag von 250€ bereits am 15. April überwiesen.",
                "Die Überweisung erfolgte von meinem Girokonto bei der Sparkasse.",
                "Die Referenznummer auf der Rechnung war KD-789456.",
                "Können Sie bitte prüfen, ob die Zahlung eingegangen ist?",
                "Alles klar, ich warte auf Ihre Rückmeldung. Vielen Dank."
              ];
              customerResponse = reminderResponses[Math.min(Math.floor(messages.length / 2), reminderResponses.length - 1)];
            } else if (activeScenario === 'insurancePackage') {
              const insuranceResponses = [
                "Ich war bisher in der studentischen Krankenversicherung, aber jetzt beginne ich meinen ersten Job.",
                "Mein Gehalt wird etwa 48.000€ brutto im Jahr sein.",
                "Ich interessiere mich für einen umfassenden Schutz mit Zusatzleistungen für Zahnbehandlung und Brille.",
                "Gibt es spezielle Angebote für Berufseinsteiger?",
                "Diese Option klingt interessant. Können Sie mir weitere Details zusenden?"
              ];
              customerResponse = insuranceResponses[Math.min(Math.floor(messages.length / 2), insuranceResponses.length - 1)];
            } else {
              // Default or account history responses
              const defaultResponses = [
                "Ich möchte gerne wissen, was meine letzten Transaktionen waren.",
                "Ja, insbesondere die letzten drei Monate.",
                "Ich erkenne eine Transaktion von letzter Woche nicht.",
                "Es war eine Zahlung an Online Shop GmbH für 79,99 €.",
                "Vielen Dank für Ihre Hilfe."
              ];
              customerResponse = defaultResponses[Math.min(Math.floor(messages.length / 2), defaultResponses.length - 1)];
            }
            
            const customerMessage: Message = {
              id: messages.length + 2,
              text: customerResponse,
              sender: 'customer',
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };
            
            setMessages(prev => [...prev, customerMessage]);
            
            // Generate new AI suggestion based on the conversation
            generateAiSuggestion(activeScenario, messages.length + 2);
          }, 1500);
        }
      }
    }
  };
  
  const handleAcceptSuggestion = (suggestionId: number, parentMessageId: number) => {
    // Find the suggestion
    const parentMessage = messages.find(m => m.id === parentMessageId);
    if (!parentMessage || !parentMessage.suggestions) return;
    
    const suggestion = parentMessage.suggestions.find(s => s.id === suggestionId);
    if (!suggestion) return;
    
    // Mark the suggestion as accepted
    const updatedMessages = messages.map(message => {
      if (message.id === parentMessageId && message.suggestions) {
        return {
          ...message,
          suggestions: message.suggestions.map(s => 
            s.id === suggestionId 
              ? { ...s, accepted: true, rejected: false }
              : s
          )
        };
      }
      return message;
    });
    
    setMessages(updatedMessages);
    
    // If it's a response suggestion, fill the input field
    if (suggestion.type === 'response') {
      setInputValue(suggestion.text);
    }
    
    toast({
      title: "Suggestion accepted",
      description: "The AI suggestion has been applied.",
    });
  };
  
  const handleRejectSuggestion = (suggestionId: number, parentMessageId: number) => {
    // Mark the suggestion as rejected
    const updatedMessages = messages.map(message => {
      if (message.id === parentMessageId && message.suggestions) {
        return {
          ...message,
          suggestions: message.suggestions.map(s => 
            s.id === suggestionId 
              ? { ...s, rejected: true, accepted: false }
              : s
          )
        };
      }
      return message;
    });
    
    setMessages(updatedMessages);
  };
  
  const toggleRecording = () => {
    setIsRecording(!isRecording);
  };
  
  const handleCall = () => {
    if (!callActive) {
      // Start call
      setCallActive(true);
      setCallStartTime(new Date());
      toast({
        title: "Incoming Call",
        description: "Call from +49 123 456 7890",
      });
      
      // Reset physio state if applicable
      if (activeScenario === 'physioTherapy') {
        setCurrentPhysioState('start');
      }
      
      // Add initial agent greeting after a brief delay
      setTimeout(() => {
        const initialMessage: Message = {
          id: 1,
          text: "Hallo, vielen Dank für Ihren Anruf bei unserem Kundenservice. Wie kann ich Ihnen heute helfen?",
          sender: 'agent',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages([initialMessage]);
      }, 1000);
    } else {
      // End call
      setCallActive(false);
      setCallStartTime(null);
      setElapsedTime('00:00');
      setAcceptedCallId(null);
      setHistoryCollapsed(true);
      setMessages([]);
      setCurrentPhysioState('start');
      toast({
        title: "Call Ended",
        description: `Call duration: ${elapsedTime}`,
      });
    }
  };

  const handleAcceptCall = (callId: number) => {
    setAcceptedCallId(callId);
    setCallActive(true);
    setCallStartTime(new Date());
    setHistoryCollapsed(true);
    
    // Reset physio state if applicable
    if (activeScenario === 'physioTherapy') {
      setCurrentPhysioState('start');
    }
    
    const call = incomingCalls.find(call => call.id === callId);
    
    toast({
      title: "Call Accepted",
      description: `You are now connected with ${call?.customerName}`,
