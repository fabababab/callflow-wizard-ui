
import React from 'react';
import { Check, X, Star, Info, ActivitySquare, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export type AISuggestion = {
  id: number;
  text: string;
  type: 'info' | 'action' | 'response';
  accepted?: boolean;
  rejected?: boolean;
};

interface AISuggestionsProps {
  suggestions: AISuggestion[];
  messageId: number;
  onAccept: (suggestionId: number, messageId: number) => void;
  onReject: (suggestionId: number, messageId: number) => void;
}

const AISuggestions: React.FC<AISuggestionsProps> = ({
  suggestions,
  messageId,
  onAccept,
  onReject
}) => {
  if (!suggestions || suggestions.length === 0) return null;

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'info':
        return <Info size={12} />;
      case 'action':
        return <ActivitySquare size={12} />;
      case 'response':
        return <MessageSquare size={12} />;
      default:
        return <Star size={12} />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'info':
        return 'Information';
      case 'action':
        return 'Action';
      case 'response':
        return 'Response';
      default:
        return 'Suggestion';
    }
  };

  return (
    <div className="mt-3 space-y-2 border-t border-gray-300/20 pt-2">
      <div className="text-xs flex items-center gap-1">
        <Star size={12} />
        <span>AI Suggestions</span>
      </div>
      {suggestions.map((suggestion) => (
        <div
          key={suggestion.id}
          className={`p-2 rounded ${
            suggestion.type === 'info'
              ? 'bg-blue-100/20 text-blue-700'
              : suggestion.type === 'action'
                ? 'bg-yellow-100/20 text-yellow-700'
                : 'bg-green-100/20 text-green-700'
          } text-xs relative ${
            suggestion.accepted ? 'opacity-70' : ''
          } ${
            suggestion.rejected ? 'opacity-40' : ''
          }`}
        >
          {suggestion.accepted && (
            <div className="absolute -top-1 -right-1">
              <Check size={14} className="text-green-500" />
            </div>
          )}
          {suggestion.rejected && (
            <div className="absolute -top-1 -right-1">
              <X size={14} className="text-red-500" />
            </div>
          )}
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1 mb-1">
              {getTypeIcon(suggestion.type)}
              <Badge variant="outline" className="text-[10px] py-0 h-4">
                {getTypeLabel(suggestion.type)}
              </Badge>
            </div>
            
            <div className="flex justify-between items-start">
              <p className="pr-2">{suggestion.text}</p>
              {!suggestion.accepted && !suggestion.rejected && (
                <div className="flex gap-1 ml-2 shrink-0">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-5 w-5 rounded-full p-0"
                    onClick={() => onAccept(suggestion.id, messageId)}
                    title="Accept"
                  >
                    <Check size={12} className="text-green-500" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-5 w-5 rounded-full p-0"
                    onClick={() => onReject(suggestion.id, messageId)}
                    title="Reject"
                  >
                    <X size={12} className="text-red-500" />
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default AISuggestions;
