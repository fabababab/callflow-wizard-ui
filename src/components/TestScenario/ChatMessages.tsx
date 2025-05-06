
import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Check, Shield } from 'lucide-react';
import { ValidationStatus } from '@/data/scenarioData';

type SensitiveDataField = {
  id: string;
  type: string;
  value: string;
  status: ValidationStatus;
  notes?: string;
  requiresVerification?: boolean;
};

type Message = {
  id: string;
  text: string;
  sender: 'agent' | 'customer' | 'system';
  timestamp: Date;
  responseOptions?: string[];
  sensitiveData?: SensitiveDataField[];
  requiresVerification?: boolean;
  isVerified?: boolean;
};

interface ChatMessagesProps {
  messages: Message[];
  isAgentMode: boolean;
  onSelectResponse: (response: string) => void;
  onVerifySystemCheck: (messageId: string) => void;
  onValidateSensitiveData: (messageId: string, fieldId: string, status: ValidationStatus, notes?: string) => void;
  messagesEndRef: React.RefObject<HTMLDivElement>;
}

const ChatMessages: React.FC<ChatMessagesProps> = ({
  messages,
  isAgentMode,
  onSelectResponse,
  onVerifySystemCheck,
  onValidateSensitiveData,
  messagesEndRef
}) => {
  return (
    <div className="space-y-4 mb-4">
      {messages.length > 0 ? (
        messages.map((message) => (
          <div 
            key={message.id}
            className={`p-3 rounded-lg ${
              message.sender === 'agent' 
                ? 'bg-primary/10 ml-4' 
                : message.sender === 'customer' 
                ? 'bg-secondary/20 mr-4' 
                : 'bg-muted text-center italic text-sm'
            }`}
          >
            <p className="text-xs font-semibold mb-1 text-white">
              {message.sender === 'agent' ? 'Agent' : 
               message.sender === 'customer' ? 'Customer' : 'System'}
              {isAgentMode && message.sender === 'agent' && " (You)"}
              {!isAgentMode && message.sender === 'customer' && " (You)"}
            </p>
            <p>{message.text}</p>

            {/* Show verification button if needed */}
            {message.requiresVerification && !message.isVerified && (
              <div className="mt-2 p-2 rounded bg-yellow-50 border border-yellow-200">
                <p className="text-sm text-yellow-700 mb-1">This requires manual verification to continue</p>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => onVerifySystemCheck(message.id)}
                  className="bg-green-50 hover:bg-green-100 text-green-700 border-green-200"
                >
                  Verify and Continue
                </Button>
              </div>
            )}

            {message.isVerified && message.requiresVerification && (
              <div className="mt-2 flex items-center gap-1 text-green-700">
                <Check size={14} />
                <span className="text-xs">Verified</span>
              </div>
            )}

            {/* Show sensitive data validation UI */}
            {message.sensitiveData && message.sensitiveData.length > 0 && message.sender === 'customer' && (
              <div className="mt-3 pt-2 border-t border-gray-300/30">
                <div className="text-xs flex items-center gap-1 mb-2">
                  <Shield size={14} className="text-primary" />
                  <span className="font-medium">Sensitive Data Detected</span>
                </div>
                <div className="space-y-2">
                  {message.sensitiveData.map((field) => (
                    <div key={field.id} className={`p-2 rounded text-sm border ${
                      field.status === 'valid'
                        ? 'bg-green-50 border-green-200 text-green-800'
                        : field.status === 'invalid'
                        ? 'bg-red-50 border-red-200 text-red-800'
                        : 'bg-yellow-50 border-yellow-200 text-yellow-800'
                    }`}>
                      <div className="flex justify-between">
                        <span>{field.type}: <strong>{field.value}</strong></span>
                        <span className="capitalize text-xs font-medium">{field.status}</span>
                      </div>
                      
                      {field.notes && (
                        <p className="mt-1 text-xs opacity-70">{field.notes}</p>
                      )}
                      
                      {field.status === 'pending' && (
                        <div className="flex gap-2 mt-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            className="text-xs h-7 bg-green-50 hover:bg-green-100 border-green-200 text-green-800"
                            onClick={() => onValidateSensitiveData(message.id, field.id, 'valid')}
                          >
                            Valid
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-xs h-7 bg-red-50 hover:bg-red-100 border-red-200 text-red-800"
                            onClick={() => onValidateSensitiveData(message.id, field.id, 'invalid')}
                          >
                            Invalid
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Display response options for messages with dark blue text color */}
            {message.responseOptions && message.responseOptions.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {message.responseOptions.map((option) => (
                  <Button 
                    key={option} 
                    variant="outline" 
                    size="sm"
                    onClick={() => onSelectResponse(option)}
                    className="text-blue-800 hover:bg-blue-50"
                  >
                    {option}
                  </Button>
                ))}
              </div>
            )}
          </div>
        ))
      ) : (
        <div className="text-center p-6 text-muted-foreground">
          <p>No messages yet</p>
        </div>
      )}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default ChatMessages;
