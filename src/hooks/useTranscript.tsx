import { useState, useEffect, useCallback, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Message, MessageSender } from '@/components/transcript/Message';
import { AISuggestion } from '@/components/transcript/AISuggestion';
import { ScenarioType } from '@/components/ScenarioSelector';
import { generateAiSuggestion, scenarioInitialMessages } from '@/data/scenarioData';
import { physioStateMachine, State } from '@/data/stateMachines';

export const useTranscript = (activeScenario: ScenarioType) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [callActive, setCallActive] = useState(false);
  const [callStartTime, setCallStartTime] = useState<Date | null>(null);
  const [elapsedTime, setElapsedTime] = useState('00:00');
  const [acceptedCallId, setAcceptedCallId] = useState<number | null>(null);
  const [currentPhysioState, setCurrentPhysioState] = useState<string>('start');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);
  
  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

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
          let customerResponse = scenarioInitialMessages[activeScenario as string] || "Hallo, ich habe einige Fragen zu meinem Konto.";
          
          if (activeScenario === 'physioTherapy' && physioStateMachine.start.customer) {
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
          }
          
          const customerMessage: Message = {
            id: 2,
            text: customerResponse,
            sender: 'customer',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          };
          
          setMessages(prev => [...prev, customerMessage]);
          
          // Generate first AI suggestion based on scenario
          setTimeout(() => {
            generateAiSuggestionForMessage(activeScenario, 2);
          }, 500);
        }, 1500);
      }, 1000);
    }
  }, [activeScenario, callActive, toast]);

  // Generate AI suggestions for messages
  const generateAiSuggestionForMessage = useCallback((scenario: ScenarioType, afterMessageId: number) => {
    if (!scenario) return;
    
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
        
        // Add an action suggestion if there's an action defined
        if (currentState.action) {
          suggestions.push({
            id: Date.now() + 2,
            text: `Aktion ausführen: ${currentState.action}`,
            type: 'action'
          });
        }
        
        // Add quick-reply suggestions if available
        if (currentState.suggestions && currentState.suggestions.length > 0) {
          currentState.suggestions.forEach((option, index) => {
            suggestions.push({
              id: Date.now() + 3 + index,
              text: option,
              type: 'response'
            });
          });
        }
      }
    } else {
      // For other scenarios, use the predefined suggestions
      suggestions = generateAiSuggestion(scenario, afterMessageId);
      
      // Add some action suggestions for other scenarios too
      if (scenario === 'bankDetails') {
        suggestions.push({
          id: Date.now() + 100,
          text: "Bankdatenformular öffnen",
          type: 'action'
        });
      } else if (scenario === 'verification') {
        suggestions.push({
          id: Date.now() + 100,
          text: "Identitätsprüfung starten",
          type: 'action'
        });
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
  }, [currentPhysioState, messages]);

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
  
  const handleSendMessage = useCallback(() => {
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
          
          // Show toast to indicate state transition
          toast({
            title: "State changed",
            description: `Moved from ${currentPhysioState} to ${nextStateName}`,
          });
          
          setCurrentPhysioState(nextStateName);
          
          // Simulate customer response after a short delay
          setTimeout(() => {
            const nextState = physioStateMachine[nextStateName] as State;
            
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
                generateAiSuggestionForMessage(activeScenario, messages.length + 2);
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
            } else if (activeScenario === 'accountHistory') {
              const defaultResponses = [
                "Ich möchte gerne wissen, was meine letzten Transaktionen waren.",
                "Ja, insbesondere die letzten drei Monate.",
                "Ich erkenne eine Transaktion von letzter Woche nicht.",
                "Es war eine Zahlung an Online Shop GmbH für 79,99 €.",
                "Vielen Dank für Ihre Hilfe."
              ];
              customerResponse = defaultResponses[Math.min(Math.floor(messages.length / 2), defaultResponses.length - 1)];
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
              // Default responses
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
            setTimeout(() => {
              generateAiSuggestionForMessage(activeScenario, messages.length + 2);
            }, 500);
          }, 1500);
        }
      }
    }
  }, [inputValue, messages, currentPhysioState, activeScenario, generateAiSuggestionForMessage, toast]);
  
  const handleAcceptSuggestion = useCallback((suggestionId: number, parentMessageId: number) => {
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
    
    // If it's an action suggestion, show a toast
    if (suggestion.type === 'action') {
      toast({
        title: "Action triggered",
        description: `Executing: ${suggestion.text}`,
      });
      
      // Simulate performing the action
      if (suggestion.text.includes("Bankdatenformular")) {
        // Simulate opening a bank details form
        window.dispatchEvent(new CustomEvent('open-bank-form'));
      } else if (suggestion.text.includes("Identitätsprüfung")) {
        // Simulate starting identity verification
        window.dispatchEvent(new CustomEvent('start-identity-verification'));
      }
    }
    
    toast({
      title: "Suggestion accepted",
      description: "The AI suggestion has been applied.",
    });
  }, [messages, toast]);
  
  const handleRejectSuggestion = useCallback((suggestionId: number, parentMessageId: number) => {
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
  }, [messages]);
  
  const toggleRecording = useCallback(() => {
    setIsRecording(!isRecording);
  }, [isRecording]);
  
  const handleCall = useCallback(() => {
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
      setMessages([]);
      setCurrentPhysioState('start');
      toast({
        title: "Call Ended",
        description: `Call duration: ${elapsedTime}`,
      });
    }
  }, [callActive, elapsedTime, activeScenario, toast]);

  const handleAcceptCall = useCallback((callId: number) => {
    setAcceptedCallId(callId);
    setCallActive(true);
    setCallStartTime(new Date());
    
    // Reset physio state if applicable
    if (activeScenario === 'physioTherapy') {
      setCurrentPhysioState('start');
    }
    
    toast({
      title: "Call Accepted",
      description: `You are now connected with Customer ${callId}`,
    });
  }, [activeScenario, toast]);

  return {
    messages,
    inputValue,
    setInputValue,
    isRecording,
    callActive,
    elapsedTime,
    acceptedCallId,
    messagesEndRef,
    handleSendMessage,
    handleAcceptSuggestion,
    handleRejectSuggestion,
    toggleRecording,
    handleCall,
    handleAcceptCall,
    currentPhysioState
  };
};
