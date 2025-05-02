
import { useState, useEffect, useCallback, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Message, MessageSender } from '@/components/transcript/Message';
import { AISuggestion } from '@/components/transcript/AISuggestion';
import { ScenarioType } from '@/components/ScenarioSelector';
import { StateMachine, stateMachines, scenarioInitialStates } from '@/data/stateMachines';

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

  // Reset messages when scenario changes and call is active
  useEffect(() => {
    if (callActive && activeScenario) {
      // Reset message history
      setMessages([]);
      
      // Reset state machine
      const machine = stateMachines[activeScenario as string];
      if (machine) {
        const initialState = scenarioInitialStates[activeScenario as string] || 'start';
        setCurrentState(initialState);
        setCurrentStateMachine(machine);
        
        // Add initial agent greeting from state machine
        setTimeout(() => {
          let initialAgentMessage = "Guten Tag, wie kann ich Ihnen helfen?";
          
          const stateData = machine[initialState];
          if (stateData && stateData.agent) {
            initialAgentMessage = stateData.agent;
          }
          
          const initialMessage: Message = {
            id: 1,
            text: initialAgentMessage,
            sender: 'agent',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          };
          setMessages([initialMessage]);
          
          // Add customer response from state machine
          setTimeout(() => {
            let customerResponse = "Guten Tag, ich brauche Hilfe.";
            let suggestions: AISuggestion[] = [];
            let responseOptions: string[] = [];
            
            const stateData = machine[initialState];
            if (stateData) {
              // Use customer response from state machine
              if (stateData.customer) {
                customerResponse = stateData.customer;
              }
              
              // Add system message as info suggestion
              if (stateData.systemMessage) {
                suggestions.push({
                  id: Date.now(),
                  text: stateData.systemMessage,
                  type: 'info'
                });
              }
              
              // Add next state's agent response as response suggestion
              const nextState = stateData.nextState && machine[stateData.nextState];
              if (nextState && nextState.agent) {
                suggestions.push({
                  id: Date.now() + 1,
                  text: nextState.agent,
                  type: 'response'
                });
                responseOptions.push(nextState.agent);
              }
              
              // Add action suggestion if defined
              if (stateData.action) {
                suggestions.push({
                  id: Date.now() + 2,
                  text: `Aktion ausführen: ${stateData.action}`,
                  type: 'action'
                });
              }
              
              // Add suggestions from state machine
              if (stateData.suggestions && stateData.suggestions.length > 0) {
                stateData.suggestions.forEach((suggestion, index) => {
                  suggestions.push({
                    id: Date.now() + 3 + index,
                    text: suggestion,
                    type: 'response'
                  });
                  responseOptions.push(suggestion);
                });
              }
              
              // Add generic responses to fill up to 4 options
              const genericResponses = [
                "Verstanden, vielen Dank für die Information.",
                "Könnten Sie mir mehr Details geben?",
                "Ich werde das sofort für Sie bearbeiten.",
                "Haben Sie noch weitere Fragen?"
              ];
              
              while (responseOptions.length < 4) {
                const randomResponse = genericResponses[Math.floor(Math.random() * genericResponses.length)];
                if (!responseOptions.includes(randomResponse)) {
                  responseOptions.push(randomResponse);
                }
                if (responseOptions.length === genericResponses.length) break;
              }
              
              responseOptions = responseOptions.slice(0, 4);
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
    }
  }, [activeScenario, callActive]);

  // Generate AI suggestions for messages
  const generateAiSuggestionForMessage = useCallback((messageId: number) => {
    if (!activeScenario || !currentStateMachine || !currentState) return;
    
    let suggestions: AISuggestion[] = [];
    let responseOptions: string[] = [];
    
    // Get suggestions from current state
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
        
        responseOptions.push(nextState.agent);
      }
      
      // Add suggestions from state machine
      if (state.suggestions && state.suggestions.length > 0) {
        state.suggestions.forEach((suggestion, index) => {
          suggestions.push({
            id: Date.now() + 4 + index,
            text: suggestion,
            type: 'response'
          });
          
          responseOptions.push(suggestion);
        });
      }
      
      // Add generic responses to fill up to 4 options
      const genericResponses = [
        "Verstanden, vielen Dank für die Information.",
        "Könnten Sie mir mehr Details geben?",
        "Ich werde das sofort für Sie bearbeiten.",
        "Haben Sie noch weitere Fragen?"
      ];
      
      while (responseOptions.length < 4) {
        const randomResponse = genericResponses[Math.floor(Math.random() * genericResponses.length)];
        if (!responseOptions.includes(randomResponse)) {
          responseOptions.push(randomResponse);
        }
        if (responseOptions.length === genericResponses.length) break;
      }
      
      responseOptions = responseOptions.slice(0, 4);
    }
    
    // Update the message with suggestions
    if (suggestions.length > 0 || responseOptions.length > 0) {
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

  // Trigger contact identification based on keywords in the transcript
  useEffect(() => {
    if (callActive && messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.sender === 'customer') {
        const keywords = ['my name is', 'this is', 'speaking', 'michael', 'schmidt', 'mein name ist'];
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
      
      // Process state transition with state machine
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
                  console.log(`Matched suggestion: ${suggestion}`);
                  break;
                }
              }
            }
          }
          
          // Randomly simulate auth failure or other special cases occasionally
          if (currentState === 'authentifizierung_plz' && Math.random() < 0.2) {
            nextStateName = 'authentifizierung_failed';
          }
          
          toast({
            title: "State changed",
            description: `Moved from ${currentState} to ${nextStateName}`,
          });
          
          setCurrentState(nextStateName);
          
          // Simulate customer response after a short delay
          setTimeout(() => {
            const nextState = currentStateMachine[nextStateName];
            
            if (nextState) {
              let customerResponse = "Verstanden."; // Default fallback
              let responseOptions: string[] = [];
              
              // Use customer response from state machine
              if (nextState.customer) {
                customerResponse = nextState.customer;
              }
              
              // Prepare response options for the next state
              if (nextState.suggestions && nextState.suggestions.length > 0) {
                responseOptions = [...nextState.suggestions];
              }
              
              // Add generic responses to fill up to 4 options
              const genericResponses = [
                "Verstanden, vielen Dank für die Information.",
                "Könnten Sie mir mehr Details geben?",
                "Ich werde das sofort für Sie bearbeiten.",
                "Haben Sie noch weitere Fragen?"
              ];
              
              while (responseOptions.length < 4) {
                const randomResponse = genericResponses[Math.floor(Math.random() * genericResponses.length)];
                if (!responseOptions.includes(randomResponse)) {
                  responseOptions.push(randomResponse);
                }
                if (responseOptions.length === genericResponses.length) break;
              }
              
              responseOptions = responseOptions.slice(0, 4);
              
              const customerMessage: Message = {
                id: messages.length + 2,
                text: customerResponse,
                sender: 'customer',
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                responseOptions: responseOptions
              };
              
              setMessages(prev => [...prev, customerMessage]);
              
              // Generate new suggestion based on the next state
              setTimeout(() => {
                generateAiSuggestionForMessage(messages.length + 2);
              }, 500);
            }
          }, 1500);
        }
      }
    }, 100);
  }, [
    messages,
    currentState,
    currentStateMachine,
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
      
      // Process state transition with state machine
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
                  console.log(`Matched suggestion: ${suggestion}`);
                  break;
                }
              }
            }
          }
          
          // Randomly simulate auth failure or other special cases occasionally
          if (currentState === 'authentifizierung_plz' && Math.random() < 0.2) {
            nextStateName = 'authentifizierung_failed';
          }
          
          toast({
            title: "State changed",
            description: `Moved from ${currentState} to ${nextStateName}`,
          });
          
          setCurrentState(nextStateName);
          
          // Simulate customer response after a short delay
          setTimeout(() => {
            const nextState = currentStateMachine[nextStateName];
            
            if (nextState) {
              let customerResponse = "Verstanden."; // Default fallback
              
              // Use customer response from state machine
              if (nextState.customer) {
                customerResponse = nextState.customer;
              }
              
              const customerMessage: Message = {
                id: messages.length + 2,
                text: customerResponse,
                sender: 'customer',
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              };
              
              setMessages(prev => [...prev, customerMessage]);
              
              // Generate new suggestion based on the next state
              setTimeout(() => {
                generateAiSuggestionForMessage(messages.length + 2);
              }, 500);
            }
          }, 1500);
        }
      }
    }
  }, [
    inputValue, 
    messages, 
    currentState, 
    currentStateMachine, 
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
      } else if (suggestion.text.includes("prüfe") || suggestion.text.includes("Aktion")) {
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
        
        // Add initial agent greeting after a brief delay
        setTimeout(() => {
          let initialAgentMessage = "Guten Tag, wie kann ich Ihnen helfen?";
          
          const stateData = stateMachines[activeScenario as string][initialState];
          if (stateData && stateData.agent) {
            initialAgentMessage = stateData.agent;
          }
          
          const initialMessage: Message = {
            id: 1,
            text: initialAgentMessage,
            sender: 'agent',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          };
          setMessages([initialMessage]);
        }, 1000);
      }
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
  }, [callActive, elapsedTime, activeScenario, toast]);

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
      let initialAgentMessage = "Guten Tag, wie kann ich Ihnen helfen?";
      
      // If we have a state machine, use its initial agent message
      if (activeScenario && stateMachines[activeScenario as string]) {
        const initialState = scenarioInitialStates[activeScenario as string] || 'start';
        const stateData = stateMachines[activeScenario as string][initialState];
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
        let customerResponse = "Guten Tag, ich brauche Hilfe.";
        
        if (activeScenario && stateMachines[activeScenario as string]) {
          const initialState = scenarioInitialStates[activeScenario as string] || 'start';
          const stateData = stateMachines[activeScenario as string][initialState];
          if (stateData && stateData.customer) {
            customerResponse = stateData.customer;
          }
        }
        
        // Create customer message
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
  }, [activeScenario, generateAiSuggestionForMessage, toast]);

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
