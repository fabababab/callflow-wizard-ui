import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MessageSquare, ChevronRight, Shield, Check } from 'lucide-react';
import AISuggestions, { AISuggestion } from './AISuggestion';
import ValidationField from './ValidationField';
import { SensitiveField, ValidationStatus } from '@/data/scenarioData';

export type MessageSender = 'agent' | 'customer' | 'system';

export type Message = {
  id: string;
  text: string;
  sender: MessageSender;
  timestamp: Date | string;
  suggestions?: AISuggestion[];
  responseOptions?: string[];
  sensitiveData?: SensitiveField[];
  isAccepted?: boolean;
  isRejected?: boolean;
  systemType?: 'info' | 'warning' | 'error' | 'success';
  numberInput?: {
    userValue: string | number;
    systemValue: string | number;
    matched: boolean;
  };
  requiresVerification?: boolean;
  isVerified?: boolean;
  productInfo?: {
    name: string;
    videoUrl: string;
    description: string;
    details: string[];
  };
  cancellation?: {
    type: string;
    contracts: Array<{
      id: string;
      name: string;
      startDate: string;
      monthly: string;
    }>;
    requiresVerification: boolean;
  };
};

interface MessageProps {
  message: Message;
  onAcceptSuggestion: (suggestionId: string, messageId: string) => void;
  onRejectSuggestion: (suggestionId: string, messageId: string) => void;
  onSelectResponse?: (response: string) => void;
  onValidateSensitiveData?: (messageId: string, fieldId: string, status: ValidationStatus, notes?: string) => void;
  onVerifySystemCheck?: (messageId: string) => void;
  isAgentMode?: boolean;
}

const Message: React.FC<MessageProps> = ({ 
  message, 
  onAcceptSuggestion, 
  onRejectSuggestion,
  onSelectResponse,
  onValidateSensitiveData,
  onVerifySystemCheck,
  isAgentMode = false
}) => {
  const hasSuggestions = message.suggestions && message.suggestions.length > 0;
  const hasResponseOptions = message.responseOptions && message.responseOptions.length > 0;
  const hasSensitiveData = message.sensitiveData && message.sensitiveData.length > 0;
  const hasNumberInput = message.numberInput !== undefined;
  const requiresVerification = message.requiresVerification && !message.isVerified;
  
  // Handler for validating sensitive data
  const handleValidate = (fieldId: string, status: ValidationStatus, notes?: string) => {
    if (onValidateSensitiveData) {
      onValidateSensitiveData(message.id, fieldId, status, notes);
    }
  };

  // Handler for verifying system check
  const handleVerify = () => {
    if (onVerifySystemCheck) {
      onVerifySystemCheck(message.id);
    }
  };
  
  return (
    <div className={`flex ${message.sender === 'agent' ? 'justify-end' : 'justify-start'} mb-4`}>
      <div
        className={`rounded-lg max-w-[85%] p-3 shadow-sm 
          ${message.sender === 'agent'
            ? 'bg-primary text-primary-foreground ml-auto'
            : message.sender === 'customer' 
            ? 'bg-secondary text-secondary-foreground mr-auto' 
            : 'bg-muted text-center italic text-sm'}`}
      >
        <div className="flex justify-between items-center mb-1">
          <Badge
            variant="outline"
            className={`text-xs ${message.sender === 'agent' ? 'bg-primary/20' : 'bg-secondary/20'}`}
          >
            {message.sender === 'agent' ? 'You' : 
             message.sender === 'customer' ? 'Customer' : 'System'}
          </Badge>
          <span className="text-xs opacity-70">
            {typeof message.timestamp === 'string' ? message.timestamp : message.timestamp.toLocaleTimeString()}
          </span>
        </div>
        
        <p className="text-sm whitespace-pre-wrap">{message.text}</p>
        
        {/* Display number matching visualization */}
        {hasNumberInput && (
          <div className="mt-2 p-2 rounded bg-secondary/10 flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-xs font-medium">Input: <strong>{message.numberInput.userValue}</strong></span>
              <span className="text-xs font-medium">System: <strong>{message.numberInput.systemValue}</strong></span>
            </div>
            {message.numberInput.matched ? (
              <div className="bg-green-100 text-green-700 p-1 rounded-full">
                <Check className="h-4 w-4" />
              </div>
            ) : (
              <span className="text-yellow-500 text-xs font-medium">No match</span>
            )}
          </div>
        )}

        {/* Display verification button if needed */}
        {requiresVerification && (
          <div className="mt-2 p-2 rounded bg-yellow-50 border border-yellow-200">
            <p className="text-sm text-yellow-700 mb-1">This requires manual verification to continue</p>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={handleVerify}
              className="bg-green-50 hover:bg-green-100 text-green-700 border-green-200"
            >
              Verify and Continue
            </Button>
          </div>
        )}

        {message.isVerified && (
          <div className="mt-2 flex items-center gap-1 text-green-700">
            <Check className="h-4 w-4" />
            <span className="text-xs">Verified</span>
          </div>
        )}
        
        {/* Display sensitive data validation fields if present */}
        {hasSensitiveData && message.sender === 'customer' && (
          <div className="mt-3 pt-2 border-t border-gray-300/20">
            <div className="text-xs font-medium flex items-center gap-1 mb-2">
              <Shield size={12} />
              <span>Sensitive Data Detected</span>
            </div>
            <div className="space-y-2">
              {message.sensitiveData.map((field) => (
                <ValidationField 
                  key={field.id} 
                  field={field} 
                  onValidate={handleValidate} 
                />
              ))}
            </div>
          </div>
        )}
        
        {/* Display AI suggestions if available */}
        {hasSuggestions && (
          <AISuggestions 
            suggestions={message.suggestions}
            messageId={message.id}
            onAccept={onAcceptSuggestion}
            onReject={onRejectSuggestion}
          />
        )}
        
        {/* Display response options based on who's speaking */}
        {hasResponseOptions && 
          ((isAgentMode && message.sender === 'customer') || (!isAgentMode && message.sender === 'agent')) && 
          onSelectResponse && (
            <div className="mt-3 space-y-2 border-t border-gray-300/20 pt-2">
              <div className="text-xs flex items-center gap-1">
                <MessageSquare size={12} />
                <span>Quick Responses</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {message.responseOptions.map((option, index) => (
                  <Button
                    key={index}
                    size="sm"
                    variant="outline"
                    className="text-xs py-1 px-2 h-auto flex items-center gap-1 group"
                    onClick={() => onSelectResponse(option)}
                  >
                    <span>{option.length > 50 ? `${option.substring(0, 50)}...` : option}</span>
                    <ChevronRight size={12} className="opacity-50 group-hover:opacity-100" />
                  </Button>
                ))}
              </div>
            </div>
          )
        }
      </div>
    </div>
  );
};

export default Message;
