import React, { useRef, useEffect, useState } from 'react';
import { Mic, CornerDownLeft, PhoneCall, PhoneOff, User, Clock, ArrowRight, Star, UserCircle, MessageSquare, ChevronDown, ChevronUp, CheckCircle, X } from 'lucide-react';
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
}

interface TranscriptPanelProps {
  activeScenario: ScenarioType;
}

const TranscriptPanel: React.FC<TranscriptPanelProps> = ({ activeScenario }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [aiSuggestions, setAiSuggestions] = useState<AISuggestion[]>([]);
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
  
  // Physiotherapy scenario state machine
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
      action: "prüfeGeburtsdatum"
    },
    authentifizierung_plz: {
      agent: "Danke. Ihre PLZ bei uns?",
      customer: "8004 Zürich.",
      nextState: "authentifizierung_erfolg",
      stateType: "verification",
      action: "prüfeKundenkonto"
    },
    authentifizierung_erfolg: {
      agent: "Alles klar, Herr Keller, ich habe Ihr Profil gefunden. Haben Sie die Versichertennummer?",
      customer: "756.1234.5678.90.",
      nextState: "waehle_leistungserbringer",
      stateType: "verification"
    },
    waehle_leistungserbringer: {
      agent: "Welchen Physiotherapeuten möchten Sie?",
      customer: "Jana Brunner, Praxis 8004 Zürich.",
      nextState: "pruefe_therapeut",
      stateType: "question"
    },
    pruefe_therapeut: {
      agent: "Einen Augenblick bitte...",
      nextState: "therapeut_anerkannt",
      stateType: "info",
      action: "prüfeLeistungserbringer"
    },
    therapeut_anerkannt: {
      agent: "Frau Brunner ist anerkannte Leistungserbringerin.",
      nextState: "verordnung_abfragen",
      stateType: "info"
    },
    verordnung_abfragen: {
      agent: "Für Kostendeckung brauchen Sie eine gültige ärztliche Verordnung. Möchten Sie Details?",
      suggestions: ["Ja, bitte", "Nein, danke"],
      stateType: "decision"
    },
    details_verordnung: {
      agent: "Die Grundversicherung deckt 9 Sitzungen, Folge-Verordnung möglich. Therapie muss innerhalb 5 Wochen starten.",
      nextState: "abschluss",
      stateType: "info"
    },
    abschluss: {
      agent: "Okay. Kann ich sonst noch etwas für Sie tun?",
      customer: "Nein.",
      nextState: "ende",
      stateType: "question"
    },
    ende: {
      agent: "Gute Besserung und auf Wiederhören!",
      stateType: "info"
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
  }, [messages, aiSuggestions]);

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
      setAiSuggestions([]);
      
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
    let suggestion: AISuggestion | null = null;
    
    switch(scenario) {
      case 'verification':
        if (afterMessageId === 2) {
          suggestion = {
            id: Date.now(),
            text: "Bitte fragen Sie nach Kundennummer und Geburtsdatum für die Verifizierung.",
            type: 'action'
          };
        } else if (afterMessageId === 4) {
          suggestion = {
            id: Date.now(),
            text: "Kunde verifiziert - Sie können zusätzlich Two-Factor Authentication anbieten.",
            type: 'info'
          };
        } else if (afterMessageId > 5) {
          suggestion = {
            id: Date.now(),
            text: "Ich habe Ihr Konto gesichert und ein neues Passwort eingerichtet. Sie erhalten in Kürze eine E-Mail mit einem Link zur Passwortänderung. Bitte aktivieren Sie auch die Zwei-Faktor-Authentifizierung für zusätzliche Sicherheit.",
            type: 'response'
          };
        }
        break;
      case 'bankDetails':
        if (afterMessageId === 2) {
          suggestion = {
            id: Date.now(),
            text: "Bitte verifizieren Sie den Kunden bevor Sie Bankdaten ändern.",
            type: 'action'
          };
        } else if (afterMessageId === 4) {
          suggestion = {
            id: Date.now(),
            text: "Kunde verwendet seit 5 Jahren Lastschriftverfahren.",
            type: 'info'
          };
        } else if (afterMessageId > 5) {
          suggestion = {
            id: Date.now(),
            text: "Vielen Dank für die Bestätigung. Ich habe Ihre Bankverbindung aktualisiert. Die Änderung wird ab dem nächsten Abrechnungszyklus wirksam. Sie erhalten eine Bestätigungs-E-Mail mit allen Details.",
            type: 'response'
          };
        }
        break;
      case 'physioTherapy':
        if (activeScenario === 'physioTherapy') {
          // If we're in the physio scenario, use the state machine for suggestions
          const currentState = physioStateMachine[currentPhysioState];
          
          if (currentState) {
            if (currentState.stateType === 'verification') {
              suggestion = {
                id: Date.now(),
                text: `Bitte verifizieren Sie: ${currentState.action || 'Kundendaten'}`,
                type: 'action'
              };
            } else if (currentState.stateType === 'decision') {
              suggestion = {
                id: Date.now(),
                text: currentState.agent || "Wie möchten Sie fortfahren?",
                type: 'response'
              };
            } else if (currentState.stateType === 'info') {
              suggestion = {
                id: Date.now(),
                text: `Info: ${currentState.agent || 'Keine Information verfügbar'}`,
                type: 'info'
              };
            } else {
              // Generate a context-appropriate response based on current state
              suggestion = {
                id: Date.now(),
                text: currentState.agent || "Wie kann ich Ihnen weiterhelfen?",
                type: 'response'
              };
            }
            
            // Add quick-reply suggestions if available
            if (currentState.suggestions && currentState.suggestions.length > 0) {
              // Create multiple suggestions for choice options
              currentState.suggestions.forEach(option => {
                const choiceSuggestion: AISuggestion = {
                  id: Date.now() + Math.random(),
                  text: option,
                  type: 'response'
                };
                setAiSuggestions(prev => [...prev, choiceSuggestion]);
              });
            }
          } else {
            // Fallback if state not found
            suggestion = {
              id: Date.now(),
              text: "Wie kann ich Ihnen mit Ihrer Physiotherapie-Anfrage helfen?",
              type: 'response'
            };
          }
        } else {
          // Fallback for old physio treatment suggestions
          if (afterMessageId === 2) {
            suggestion = {
              id: Date.now(),
              text: "Tarif des Kunden: PremiumPlus mit 100% Erstattung für verschriebene Physiotherapie.",
              type: 'info'
            };
          } else if (afterMessageId === 4) {
            suggestion = {
              id: Date.now(),
              text: "Bitte prüfen Sie die Verschreibung und ob eine Vorabgenehmigung nötig ist.",
              type: 'action'
            };
          } else if (afterMessageId > 5) {
            suggestion = {
              id: Date.now(),
              text: "Ich kann bestätigen, dass Ihre Versicherung alle 10 Physiotherapie-Sitzungen zu 100% abdeckt, da sie ärztlich verschrieben wurden. Sie müssen keine Vorabgenehmigung einholen. Reichen Sie einfach die Rechnung zusammen mit der Verschreibung ein.",
              type: 'response'
            };
          }
        }
        break;
      case 'paymentReminder':
        if (afterMessageId === 2) {
          suggestion = {
            id: Date.now(),
            text: "Zahlungseingang vom 25. April wurde im System vermerkt, aber noch nicht verarbeitet.",
            type: 'info'
          };
        } else if (afterMessageId === 4) {
          suggestion = {
            id: Date.now(),
            text: "Bitte prüfen Sie die Zahlungsreferenz und stornieren Sie die Mahngebühren.",
            type: 'action'
          };
        } else if (afterMessageId > 5) {
          suggestion = {
            id: Date.now(),
            text: "Ich habe den Zahlungseingang bestätigt und die Mahnung sowie alle Mahngebühren storniert. Sie erhalten innerhalb der nächsten 24 Stunden eine Bestätigung per E-Mail. Ich entschuldige mich für die Unannehmlichkeiten.",
            type: 'response'
          };
        }
        break;
      case 'insurancePackage':
        if (afterMessageId === 2) {
          suggestion = {
            id: Date.now(),
            text: "Empfohlenes Paket: StartPlus mit erweitertem Zahnschutz und Sehhilfen-Option.",
            type: 'info'
          };
        } else if (afterMessageId === 4) {
          suggestion = {
            id: Date.now(),
            text: "Informieren Sie über 15% Neukundenrabatt für Berufseinsteiger im ersten Jahr.",
            type: 'action'
          };
        } else if (afterMessageId > 5) {
          suggestion = {
            id: Date.now(),
            text: "Unser StartPlus-Paket mit erweitertem Zahnschutz und Brillenoption kostet 89€ monatlich. Als Berufseinsteiger erhalten Sie im ersten Jahr einen Rabatt von 15%. Ich kann Ihnen detaillierte Informationen per E-Mail zusenden und einen persönlichen Beratungstermin anbieten.",
            type: 'response'
          };
        }
        break;
      default:
        if (afterMessageId === 2) {
          suggestion = {
            id: Date.now(),
            text: "Kundenhistorie zeigt mehrere technische Probleme in den letzten 30 Tagen.",
            type: 'info'
          };
        } else if (afterMessageId === 4) {
          suggestion = {
            id: Date.now(),
            text: "Empfehlung: Router-Firmware aktualisieren und Bandbreiten-Test durchführen.",
            type: 'action'
          };
        } else if (afterMessageId > 5) {
          suggestion = {
            id: Date.now(),
            text: "Basierend auf unserer Diagnose scheint das Problem mit Ihrer Netzwerkausrüstung zusammenzuhängen. Ich empfehle ein Firmware-Update für Ihren Router und die Durchführung eines Bandbreiten-Tests. Ich kann Ihnen einen Techniker schicken, der das Problem weiter untersuchen kann.",
            type: 'response'
          };
        }
    }
    
    if (suggestion) {
      setAiSuggestions(prev => [...prev, suggestion as AISuggestion]);
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
          const nextStateName = currentState.nextState;
          setCurrentPhysioState(nextStateName);
          
          // Special handling for verordnung_abfragen decision point
          if (currentPhysioState === 'verordnung_abfragen') {
            // Check if the message contains an answer to the question
            if (inputValue.toLowerCase().includes('ja') || 
                inputValue.toLowerCase().includes('details')) {
              setCurrentPhysioState('details_verordnung');
            } else {
              setCurrentPhysioState('abschluss');
            }
          }
          
          // Simulate customer response after a short delay
          setTimeout(() => {
            const nextState = physioStateMachine[nextStateName];
            
            if (nextState && nextState.customer) {
              const customerResponse = {
                id: messages.length + 2,
                text: nextState.customer,
                sender: 'customer',
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              };
              setMessages(prev => [...prev, customerResponse]);
              
              // Generate new suggestion based on the next state
              setTimeout(() => {
                generateAiSuggestion(activeScenario, messages.length + 2);
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
  
  const handleAcceptSuggestion = (suggestionId: number) => {
    setAiSuggestions(prev => 
      prev.map(suggestion => 
        suggestion.id === suggestionId 
          ? { ...suggestion, accepted: true, rejected: false }
          : suggestion
      )
    );
    
    // If it's a response suggestion, automatically fill the input with it
    const suggestion = aiSuggestions.find(s => s.id === suggestionId);
    if (suggestion && suggestion.type === 'response') {
      setInputValue(suggestion.text);
    }
    
    // If this is a decision in the physio scenario and we're at the decision point
    if (activeScenario === 'physioTherapy' && currentPhysioState === 'verordnung_abfragen' && suggestion) {
      // Set next state based on the suggestion text
      if (suggestion.text === 'Ja, bitte') {
        setCurrentPhysioState('details_verordnung');
      } else if (suggestion.text === 'Nein, danke') {
        setCurrentPhysioState('abschluss');
      }
    }
    
    toast({
      title: "Suggestion accepted",
      description: "The AI suggestion has been applied.",
    });
  };
  
  const handleRejectSuggestion = (suggestionId: number) => {
    setAiSuggestions(prev => 
      prev.map(suggestion => 
        suggestion.id === suggestionId 
          ? { ...suggestion, rejected: true, accepted: false }
          : suggestion
      )
    );
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
      setAiSuggestions([]);
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
    });
    
    // Add initial agent greeting after a brief delay
    setTimeout(() => {
      const initialMessage: Message = {
        id: 1,
        text: `Hallo ${call?.customerName}, vielen Dank für Ihren Anruf bei unserem Kundenservice. I understand you need help with ${call?.expertise}. Wie kann ich Ihnen heute helfen?`,
        sender: 'agent',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages([initialMessage]);
    }, 1000);
  };

  const toggleHistoryCollapse = () => {
    setHistoryCollapsed(!historyCollapsed);
  };

  const renderIncomingCalls = () => (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground mb-2">Waiting calls recommended for you based on expertise match</p>
      {incomingCalls.map(call => (
        <div 
          key={call.id} 
          className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent/5 transition-colors"
        >
          <div className="flex items-center gap-4">
            <div className="bg-callflow-primary/10 w-10 h-10 rounded-full flex items-center justify-center text-callflow-primary">
              <User size={20} />
            </div>
            <div>
              <h3 className="font-medium">{call.customerName}</h3>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>{call.phoneNumber}</span>
                <span>•</span>
                <span>{call.callType}</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="flex items-center gap-1">
                <Clock size={14} className="text-muted-foreground" />
                <span className="text-sm">{call.waitTime}</span>
              </div>
              <div className="flex items-center gap-1">
                <Star size={14} className="text-yellow-500" />
                <span className="text-sm">{call.matchScore}% match</span>
              </div>
            </div>
            <Badge 
              variant="outline" 
              className={
                `text-xs font-normal ${
                  call.priority === 'high'
                    ? 'bg-destructive/10 text-destructive border-destructive/20'
                    : call.priority === 'medium'
                    ? 'bg-callflow-accent/10 text-callflow-accent border-callflow-accent/20'
                    : 'bg-callflow-muted-text/10 text-callflow-muted-text border-callflow-muted-text/20'
                }`
              }
            >
              {call.priority} priority
            </Badge>
            <Button 
              size="sm" 
              className="gap-2"
              onClick={() => handleAcceptCall(call.id)}
            >
              Accept <ArrowRight size={14} />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );

  const renderAiSuggestion = (suggestion: AISuggestion) => {
    if (suggestion.rejected) return null;
    
    return (
      <div 
        key={`suggestion-${suggestion.id}`}
        className={`w-full max-w-md mx-auto my-2 p-3 rounded-lg ${
          suggestion.type === 'info' 
            ? 'bg-blue-50 border-l-4 border-blue-500' 
            : suggestion.type === 'action'
            ? 'bg-amber-50 border-l-4 border-amber-500'
            : 'bg-purple-50 border-l-4 border-purple-500'
        } ${suggestion.accepted ? 'opacity-60' : ''}`}
      >
        <div className="flex justify-between items-start gap-2">
          <div className="flex items-center gap-2 text-xs font-medium uppercase text-gray-500 mb-1">
            <MessageSquare size={14} className={
              suggestion.type === 'info' ? 'text-blue-500' : 
              suggestion.type === 'action' ? 'text-amber-500' : 'text-purple-500'
            } />
            AI {suggestion.type}
          </div>
          {!suggestion.accepted && (
            <div className="flex gap-1">
              <Button 
                size="sm" 
                variant="ghost" 
                className="h-6 w-6 p-0 rounded-full text-green-600" 
                onClick={() => handleAcceptSuggestion(suggestion.id)}
              >
                <CheckCircle size={14} />
              </Button>
              <Button 
                size="sm" 
                variant="ghost" 
                className="h-6 w-6 p-0 rounded-full text-red-600" 
                onClick={() => handleRejectSuggestion(suggestion.id)}
              >
                <X size={14} />
              </Button>
            </div>
          )}
        </div>
        <p className="text-sm">{suggestion.text}</p>
        {suggestion.type === 'response' && !suggestion.accepted && (
          <Button 
            size="sm" 
            variant="ghost" 
            className="text-xs mt-1 h-7" 
            onClick={() => handleAcceptSuggestion(suggestion.id)}
          >
            Use this response
          </Button>
        )}
      </div>
    );
  };

  const renderCallInterface = () => (
    <div className="flex flex-col h-full">
      <Collapsible 
        open={!historyCollapsed}
        className="mb-4 border rounded-lg overflow-hidden"
      >
        <CollapsibleTrigger asChild>
          <Button 
            variant="ghost" 
            onClick={toggleHistoryCollapse}
            className="w-full flex justify-between items-center p-3 rounded-none border-b"
          >
            <div className="flex items-center gap-2">
              <UserCircle size={18} />
              <span className="font-medium">
                Previous Conversation History
              </span>
            </div>
            {historyCollapsed ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>Customer reported network issues during video calls</span>
                <ChevronDown size={16} />
              </div>
            ) : (
              <ChevronUp size={16} />
            )}
          </Button>
        </CollapsibleTrigger>

        <CollapsibleContent className="p-4 bg-muted/10">
          <div className="space-y-4">
            {preCalls.map((preCall) => (
              <div key={`precall-${preCall.id}`} className="space-y-3">
                <div className="chat-message customer-message flex items-start space-x-2 mb-2">
                  <Avatar className="h-8 w-8 mt-1">
                    <AvatarFallback className="bg-callflow-accent/20 text-callflow-accent">
                      {preCall.customerName.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">{preCall.customerName}</span>
                      <span className="text-xs text-muted-foreground">{preCall.timestamp}</span>
                    </div>
                    <div className="bg-muted/30 px-4 py-2 rounded-lg text-sm mt-1">
                      {preCall.content}
                    </div>
                  </div>
                </div>
                
                <div className="chat-message agent-message flex items-start space-x-2 mb-2 justify-end">
                  <div className="flex flex-col items-end">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">{preCall.timestamp}</span>
                      <span className="font-medium text-sm">{preCall.agent}</span>
                    </div>
                    <div className="bg-callflow-primary/10 text-callflow-primary px-4 py-2 rounded-lg text-sm mt-1">
                      {preCall.response}
                    </div>
                  </div>
                  <Avatar className="h-8 w-8 mt-1">
                    <AvatarFallback className="bg-callflow-primary/20 text-callflow-primary">
                      {preCall.agent.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                </div>
              </div>
            ))}
          </div>
        </CollapsibleContent>
      </Collapsible>

      <div className="flex-1 overflow-y-auto mb-4">
        <div className="flex flex-col">
          <div className="px-4 py-2 mb-4 bg-green-100 text-green-700 text-sm font-medium rounded-lg inline-block">
            Sie sind jetzt mit {incomingCalls.find(call => call.id === acceptedCallId)?.customerName} verbunden
          </div>
          
          {messages.map((message, index) => (
            <React.Fragment key={`message-group-${message.id}`}>
              <div 
                className={`chat-message flex items-start ${message.sender === 'agent' ? 'justify-end' : ''} mb-2`}
              >
                {message.sender === 'customer' && (
                  <Avatar className="h-8 w-8 mt-1 mr-2">
                    <AvatarFallback className="bg-callflow-accent/20 text-callflow-accent">
                      {acceptedCallId ? incomingCalls.find(call => call.id === acceptedCallId)?.customerName.charAt(0) : 'C'}
                    </AvatarFallback>
                  </Avatar>
                )}
                <div className={`max-w-3/4 ${message.sender === 'agent' ? 'text-right' : ''}`}>
                  <div className={`px-4 py-2 rounded-lg text-sm inline-block ${
                    message.sender === 'agent' 
                      ? 'bg-callflow-primary/10 text-callflow-primary' 
                      : 'bg-muted/30'
                  }`}>
                    {message.text}
                  </div>
                  <div className="text-xs opacity-70 mt-1">{message.timestamp}</div>
                </div>
                {message.sender === 'agent' && (
                  <Avatar className="h-8 w-8 mt-1 ml-2">
                    <AvatarFallback className="bg-callflow-primary/20 text-callflow-primary">A</AvatarFallback>
                  </Avatar>
                )}
              </div>
              
              {/* Show AI suggestions after customer messages */}
              {message.sender === 'customer' && 
               aiSuggestions.find(s => s.id % 10 === message.id % 10) && (
                <div className="ml-12 mb-4">
                  {aiSuggestions
                    .filter(s => s.id % 10 === message.id % 10)
                    .map(suggestion => renderAiSuggestion(suggestion))}
                </div>
              )}
            </React.Fragment>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>
      
      <div className="border-t pt-4">
        {isRecording && (
          <div className="text-sm mb-2 text-callflow-danger flex items-center">
            <span className="recording-dot"></span>
            Recording...
          </div>
        )}
        <div className="flex items-center gap-2">
          <Button 
            type="button" 
            size="icon" 
            variant={isRecording ? "destructive" : "outline"} 
            onClick={toggleRecording}
            disabled={!callActive}
          >
            <Mic size={18} />
          </Button>
          <Input 
            placeholder={callActive ? "Type your message..." : "Start a call to begin"}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && callActive) {
                handleSendMessage();
              }
            }}
            disabled={!callActive}
          />
          <Button 
            type="button" 
            size="icon" 
            onClick={handleSendMessage} 
            disabled={!callActive || !inputValue.trim()}
          >
            <CornerDownLeft size={18} />
          </Button>
        </div>
      </div>
    </div>
  );
  
  return (
    <Card className="rounded-lg flex flex-col h-full">
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <CardTitle className="text-lg">Call Center</CardTitle>
        <div className="flex items-center gap-2">
          {callActive && (
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
              {elapsedTime}
            </Badge>
          )}
          {!callActive && (
            <Button 
              variant="default" 
              size="sm" 
              onClick={handleCall}
              className="gap-1"
            >
              <PhoneCall size={16} />
              Simulate Call
            </Button>
          )}
          {callActive && (
            <Button 
              variant="destructive" 
              size="sm" 
              onClick={handleCall}
              className="gap-1"
            >
              <PhoneOff size={16} />
              End Call
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col">
        {!callActive && !acceptedCallId ? (
          renderIncomingCalls()
        ) : (
          renderCallInterface()
        )}
      </CardContent>
    </Card>
  );
};

export default TranscriptPanel;
