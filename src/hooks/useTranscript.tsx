
import { useState, useEffect, useCallback, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Message, MessageSender } from '@/components/transcript/Message';
import { AISuggestion } from '@/components/transcript/AISuggestion';
import { ScenarioType } from '@/components/ScenarioSelector';
import { generateAiSuggestion } from '@/data/scenarioData';
import { physioStateMachine, State, StateMachine, stateMachines, scenarioInitialStates } from '@/data/stateMachines';

export const useTranscript = (activeScenario: ScenarioType) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [callActive, setCallActive] = useState(false);
  const [callStartTime, setCallStartTime] = useState<Date | null>(null);
  const [elapsedTime, setElapsedTime] = useState('00:00');
  const [acceptedCallId, setAcceptedCallId] = useState<number | null>(null);
  const [currentState, setCurrentState] = useState<string>('start');
  const [currentStateMachine, setCurrentStateMachine] = useState<StateMachine | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);
  
  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Set the appropriate state machine when the scenario changes
  useEffect(() => {
    if (activeScenario) {
      const machine = stateMachines[activeScenario as string];
      if (machine) {
        setCurrentStateMachine(machine);
        // Reset to the initial state for this scenario
        const initialState = scenarioInitialStates[activeScenario as string] || 'start';
        setCurrentState(initialState);
        
        // Log the state machine for debugging
        console.log(`Loaded state machine for scenario: ${activeScenario}`, machine);
      } else {
        console.log(`No state machine found for scenario: ${activeScenario}`);
        setCurrentStateMachine(null);
      }
    }
  }, [activeScenario]);

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
      
      // Reset state if we have a state machine
      if (stateMachines[activeScenario as string]) {
        const initialState = scenarioInitialStates[activeScenario as string] || 'start';
        setCurrentState(initialState);
        setCurrentStateMachine(stateMachines[activeScenario as string]);
      }
      
      // Add initial agent greeting
      setTimeout(() => {
        let initialAgentMessage = "Hallo, vielen Dank für Ihren Anruf bei unserem Kundenservice. Wie kann ich Ihnen heute helfen?";
        
        // If we have a state machine, use its initial agent message
        if (currentStateMachine && currentState) {
          const stateData = currentStateMachine[currentState];
          if (stateData && stateData.agent) {
            initialAgentMessage = stateData.agent;
          }
        }
        
        const initialMessage: Message = {
          id: 1,
          text: initialAgentMessage,
          sender: 'agent',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages([initialMessage]);
        
        // Add scenario-specific customer response
        setTimeout(() => {
          let customerResponse = "Hallo, ich habe einige Fragen zu meinem Konto.";
          
          // If we have a state machine, use its initial customer response
          if (currentStateMachine && currentState) {
            const stateData = currentStateMachine[currentState];
            if (stateData && stateData.customer) {
              customerResponse = stateData.customer;
            }
          }
          
          // Generate suggestions and response options based on the current state
          let suggestions: AISuggestion[] = [];
          let responseOptions: string[] = [];
          
          if (currentStateMachine && currentState) {
            const state = currentStateMachine[currentState];
            
            if (state) {
              // Add system message as info suggestion
              if (state.systemMessage) {
                suggestions.push({
                  id: Date.now(),
                  text: state.systemMessage,
                  type: 'info'
                });
              }
              
              // Add next state's agent response as response suggestion
              const nextState = state.nextState && currentStateMachine[state.nextState];
              if (nextState && nextState.agent) {
                suggestions.push({
                  id: Date.now() + 1,
                  text: nextState.agent,
                  type: 'response'
                });
              }
              
              // Add action suggestion if defined
              if (state.action) {
                suggestions.push({
                  id: Date.now() + 2,
                  text: `Aktion ausführen: ${state.action}`,
                  type: 'action'
                });
              }
              
              // Add quick reply suggestions if available
              if (state.suggestions && state.suggestions.length > 0) {
                state.suggestions.forEach((option, index) => {
                  suggestions.push({
                    id: Date.now() + 3 + index,
                    text: option,
                    type: 'response'
                  });
                  
                  // Also add to response options for menu selection
                  responseOptions.push(option);
                });
              }
              
              // If we need more response options to reach 4, add some generic ones
              while (responseOptions.length < 4) {
                const genericResponses = [
                  "Verstanden, vielen Dank für die Information.",
                  "Könnten Sie mir mehr Details geben?",
                  "Ich werde das sofort für Sie bearbeiten.",
                  "Haben Sie noch weitere Fragen?"
                ];
                const randomResponse = genericResponses[Math.floor(Math.random() * genericResponses.length)];
                if (!responseOptions.includes(randomResponse)) {
                  responseOptions.push(randomResponse);
                }
                // Safety check to avoid infinite loop if everything has been added
                if (responseOptions.length === genericResponses.length) break;
              }
              
              // Limit to 4 options if we have more
              responseOptions = responseOptions.slice(0, 4);
            }
          } else {
            // Fallback to the old suggestion system for scenarios without state machines
            suggestions = generateAiSuggestion(activeScenario, 2);
            
            // Add generic response options
            responseOptions = [
              "Verstanden, vielen Dank für die Information.",
              "Könnten Sie mir mehr Details geben?",
              "Ich werde das sofort für Sie bearbeiten.",
              "Haben Sie noch weitere Fragen?"
            ];
          }
          
          const customerMessage: Message = {
            id: 2,
            text: customerResponse,
            sender: 'customer',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            suggestions: suggestions,
            responseOptions: responseOptions
          };
          
          setMessages(prev => [...prev, customerMessage]);
        }, 1500);
      }, 1000);
    }
  }, [activeScenario, callActive, currentStateMachine, currentState, toast]);

  // Generate AI suggestions for messages
  const generateAiSuggestionForMessage = useCallback((messageId: number) => {
    if (!activeScenario) return;
    
    let suggestions: AISuggestion[] = [];
    let responseOptions: string[] = [];
    
    if (currentStateMachine && currentState) {
      // If we're using a state machine, get suggestions from it
      const state = currentStateMachine[currentState];
      
      if (state) {
        // Add system message as info suggestion
        if (state.systemMessage) {
          suggestions.push({
            id: Date.now(),
            text: state.systemMessage,
            type: 'info'
          });
        }
        
        // Add agent response as suggestion
        if (state.agent && currentState !== 'start') {
          suggestions.push({
            id: Date.now() + 1,
            text: state.agent,
            type: 'response'
          });
        }
        
        // Add action suggestion if defined
        if (state.action) {
          suggestions.push({
            id: Date.now() + 2,
            text: `Aktion ausführen: ${state.action}`,
            type: 'action'
          });
        }
        
        // Add next state's agent response as response suggestion
        const nextState = state.nextState && currentStateMachine[state.nextState];
        if (nextState && nextState.agent) {
          suggestions.push({
            id: Date.now() + 3,
            text: nextState.agent,
            type: 'response'
          });
          
          // Add to response options menu
          responseOptions.push(nextState.agent);
        }
        
        // Add quick reply suggestions if available
        if (state.suggestions && state.suggestions.length > 0) {
          state.suggestions.forEach((option, index) => {
            suggestions.push({
              id: Date.now() + 4 + index,
              text: option,
              type: 'response'
            });
            
            // Also add to response options menu
            responseOptions.push(option);
          });
        }
        
        // If we need more response options to reach 4, add some generic ones
        while (responseOptions.length < 4) {
          const genericResponses = [
            "Verstanden, vielen Dank für die Information.",
            "Könnten Sie mir mehr Details geben?",
            "Ich werde das sofort für Sie bearbeiten.",
            "Haben Sie noch weitere Fragen?"
          ];
          const randomResponse = genericResponses[Math.floor(Math.random() * genericResponses.length)];
          if (!responseOptions.includes(randomResponse)) {
            responseOptions.push(randomResponse);
          }
          // Safety check to avoid infinite loop if everything has been added
          if (responseOptions.length === genericResponses.length) break;
        }
        
        // Limit to 4 options if we have more
        responseOptions = responseOptions.slice(0, 4);
      }
    } else {
      // For scenarios without state machines, use the predefined suggestions
      suggestions = generateAiSuggestion(activeScenario, messageId);
      
      // Add some action suggestions for other scenarios too
      if (activeScenario === 'bankDetails') {
        suggestions.push({
          id: Date.now() + 100,
          text: "Bankdatenformular öffnen",
          type: 'action'
        });
      } else if (activeScenario === 'verification') {
        suggestions.push({
          id: Date.now() + 100,
          text: "Identitätsprüfung starten",
          type: 'action'
        });
      }
      
      // Add generic response options
      responseOptions = [
        "Verstanden, vielen Dank für die Information.",
        "Könnten Sie mir mehr Details geben?",
        "Ich werde das sofort für Sie bearbeiten.",
        "Haben Sie noch weitere Fragen?"
      ];
    }
    
    if (suggestions.length > 0 || responseOptions.length > 0) {
      // Add suggestions to the last message
      const updatedMessages = [...messages];
      const lastMessageIndex = updatedMessages.length - 1;
      
      if (lastMessageIndex >= 0) {
        updatedMessages[lastMessageIndex] = {
          ...updatedMessages[lastMessageIndex],
          suggestions: suggestions,
          responseOptions: responseOptions
        };
        
        setMessages(updatedMessages);
      }
    }
  }, [currentState, currentStateMachine, activeScenario, messages]);

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
  
  const handleSelectResponse = useCallback((selectedResponse: string) => {
    // Set the input value to the selected response
    setInputValue(selectedResponse);
    
    // Automatically send the message
    setTimeout(() => {
      const newMessage: Message = {
        id: messages.length + 1,
        text: selectedResponse,
        sender: 'agent',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages([...messages, newMessage]);
      setInputValue('');
      
      // Process state transition with state machine if available
      if (currentStateMachine && currentState) {
        const currentStateData = currentStateMachine[currentState];
        
        if (currentStateData && currentStateData.nextState) {
          // Move to next state
          let nextStateName = currentStateData.nextState;
          
          // Special handling for decision points with multiple options
          if (currentStateData.stateType === 'decision') {
            // Check the message content against available options
            if (currentStateData.suggestions) {
              // Try to match the input with one of the suggestions
              for (const suggestion of currentStateData.suggestions) {
                if (selectedResponse.toLowerCase().includes(suggestion.toLowerCase())) {
                  // For now we just use the standard next state
                  // In a real application, different choices might lead to different states
                  console.log(`Matched suggestion: ${suggestion}`);
                  break;
                }
              }
            }
          }
          
          // Randomly simulate auth failure or other special cases
          if (currentState === 'authentifizierung_plz' && Math.random() < 0.2) {
            nextStateName = 'authentifizierung_failed';
          }
          
          // Show toast to indicate state transition
          toast({
            title: "State changed",
            description: `Moved from ${currentState} to ${nextStateName}`,
          });
          
          setCurrentState(nextStateName);
          
          // Simulate customer response after a short delay
          setTimeout(() => {
            const nextState = currentStateMachine[nextStateName];
            
            if (nextState && nextState.customer) {
              let responseOptions: string[] = [];
              
              // Prepare response options for the next state
              if (nextState.suggestions && nextState.suggestions.length > 0) {
                responseOptions = [...nextState.suggestions];
              }
              
              // If we need more response options to reach 4, add some generic ones
              while (responseOptions.length < 4) {
                const genericResponses = [
                  "Verstanden, vielen Dank für die Information.",
                  "Könnten Sie mir mehr Details geben?",
                  "Ich werde das sofort für Sie bearbeiten.",
                  "Haben Sie noch weitere Fragen?"
                ];
                const randomResponse = genericResponses[Math.floor(Math.random() * genericResponses.length)];
                if (!responseOptions.includes(randomResponse)) {
                  responseOptions.push(randomResponse);
                }
                // Safety check to avoid infinite loop if everything has been added
                if (responseOptions.length === genericResponses.length) break;
              }
              
              // Limit to 4 options if we have more
              responseOptions = responseOptions.slice(0, 4);
              
              const customerResponse: Message = {
                id: messages.length + 2,
                text: nextState.customer,
                sender: 'customer',
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                responseOptions: responseOptions
              };
              
              setMessages(prev => [...prev, customerResponse]);
              
              // Generate new suggestion based on the next state
              setTimeout(() => {
                generateAiSuggestionForMessage(messages.length + 2);
              }, 500);
            }
          }, 1500);
        }
      } else {
        // Fallback for scenarios without state machines
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
            generateAiSuggestionForMessage(messages.length + 2);
          }, 500);
        }, 1500);
      }
    }, 100);
  }, [
    messages,
    currentState,
    currentStateMachine,
    activeScenario,
    generateAiSuggestionForMessage,
    toast
  ]);
  
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
      
      // Process state transition with state machine if available
      if (currentStateMachine && currentState) {
        const currentStateData = currentStateMachine[currentState];
        
        if (currentStateData && currentStateData.nextState) {
          // Move to next state
          let nextStateName = currentStateData.nextState;
          
          // Special handling for decision points with multiple options
          if (currentStateData.stateType === 'decision') {
            // Check the message content against available options
            if (currentStateData.suggestions) {
              // Try to match the input with one of the suggestions
              for (const suggestion of currentStateData.suggestions) {
                if (inputValue.toLowerCase().includes(suggestion.toLowerCase())) {
                  // For now we just use the standard next state
                  // In a real application, different choices might lead to different states
                  console.log(`Matched suggestion: ${suggestion}`);
                  break;
                }
              }
            }
          }
          
          // Randomly simulate auth failure or other special cases
          if (currentState === 'authentifizierung_plz' && Math.random() < 0.2) {
            nextStateName = 'authentifizierung_failed';
          }
          
          // Show toast to indicate state transition
          toast({
            title: "State changed",
            description: `Moved from ${currentState} to ${nextStateName}`,
          });
          
          setCurrentState(nextStateName);
          
          // Simulate customer response after a short delay
          setTimeout(() => {
            const nextState = currentStateMachine[nextStateName];
            
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
                generateAiSuggestionForMessage(messages.length + 2);
              }, 500);
            }
          }, 1500);
        }
      } else {
        // Fallback for scenarios without state machines
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
            generateAiSuggestionForMessage(messages.length + 2);
          }, 500);
        }, 1500);
      }
    }
  }, [
    inputValue, 
    messages, 
    currentState, 
    currentStateMachine, 
    activeScenario, 
    generateAiSuggestionForMessage, 
    toast
  ]);
  
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
    
    // If it's an action suggestion, show a toast and perform the action
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
      } else if (suggestion.text.includes("prüfe")) {
        // Simulate looking up data
        toast({
          title: "System Action",
          description: "Performing data lookup...",
        });
        setTimeout(() => {
          toast({
            title: "Data Verification Complete",
            description: "Customer data verified successfully.",
          });
        }, 1500);
      }
      
      // Advance state automatically after action is performed
      if (currentStateMachine && currentState) {
        const currentStateData = currentStateMachine[currentState];
        if (currentStateData && currentStateData.nextState) {
          const nextStateName = currentStateData.nextState;
          setTimeout(() => {
            toast({
              title: "State advanced automatically",
              description: `Action completed. Moving from ${currentState} to ${nextStateName}`,
            });
            setCurrentState(nextStateName);
            
            // Generate new suggestions for the next state
            setTimeout(() => {
              generateAiSuggestionForMessage(parentMessageId);
            }, 500);
          }, 1000);
        }
      }
    }
    
    toast({
      title: "Suggestion accepted",
      description: "The AI suggestion has been applied.",
    });
  }, [messages, currentStateMachine, currentState, generateAiSuggestionForMessage, toast]);
  
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
    
    toast({
      title: "Suggestion rejected",
      description: "The AI suggestion has been dismissed.",
    });
  }, [messages, toast]);
  
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
      
      // Reset state if we have a state machine for the current scenario
      if (activeScenario && stateMachines[activeScenario as string]) {
        const initialState = scenarioInitialStates[activeScenario as string] || 'start';
        setCurrentState(initialState);
        setCurrentStateMachine(stateMachines[activeScenario as string]);
      }
      
      // Add initial agent greeting after a brief delay
      setTimeout(() => {
        let initialAgentMessage = "Hallo, vielen Dank für Ihren Anruf bei unserem Kundenservice. Wie kann ich Ihnen heute helfen?";
        
        // If we have a state machine, use its initial agent message
        if (currentStateMachine && currentState) {
          const stateData = currentStateMachine[currentState];
          if (stateData && stateData.agent) {
            initialAgentMessage = stateData.agent;
          }
        }
        
        const initialMessage: Message = {
          id: 1,
          text: initialAgentMessage,
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
      setCurrentState('start');
      toast({
        title: "Call Ended",
        description: `Call duration: ${elapsedTime}`,
      });
    }
  }, [callActive, elapsedTime, activeScenario, currentStateMachine, currentState, toast]);

  const handleAcceptCall = useCallback((callId: number) => {
    setAcceptedCallId(callId);
    setCallActive(true);
    setCallStartTime(new Date());
    
    // Reset state if we have a state machine for the current scenario
    if (activeScenario && stateMachines[activeScenario as string]) {
      const initialState = scenarioInitialStates[activeScenario as string] || 'start';
      setCurrentState(initialState);
      setCurrentStateMachine(stateMachines[activeScenario as string]);
    }
    
    toast({
      title: "Call Accepted",
      description: "You have accepted the incoming call",
    });
    
    // Add initial agent greeting after a brief delay
    setTimeout(() => {
      let initialAgentMessage = "Hallo, vielen Dank für Ihren Anruf bei unserem Kundenservice. Wie kann ich Ihnen heute helfen?";
      
      // If we have a state machine, use its initial agent message
      if (currentStateMachine && currentState) {
        const stateData = currentStateMachine[currentState];
        if (stateData && stateData.agent) {
          initialAgentMessage = stateData.agent;
        }
      }
      
      const initialMessage: Message = {
        id: 1,
        text: initialAgentMessage,
        sender: 'agent',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      
      setMessages([initialMessage]);
      
      // Add customer first response
      setTimeout(() => {
        let customerResponse = "Hallo, ich habe eine Frage zu...";
        
        if (currentStateMachine && currentState) {
          const stateData = currentStateMachine[currentState];
          if (stateData && stateData.customer) {
            customerResponse = stateData.customer;
          }
        }
        
        // Generate suggestions based on the current state
        const customerMessage: Message = {
          id: 2,
          text: customerResponse,
          sender: 'customer',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        
        setMessages(prev => [...prev, customerMessage]);
        
        // Generate new suggestions for the customer message
        setTimeout(() => {
          generateAiSuggestionForMessage(2);
        }, 500);
      }, 1500);
    }, 1000);
  }, [activeScenario, currentStateMachine, currentState, generateAiSuggestionForMessage, toast]);

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
    handleSelectResponse,
    toggleRecording,
    handleCall,
    handleAcceptCall,
    currentState
  };
};
