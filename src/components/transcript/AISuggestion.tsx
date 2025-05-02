
import React from 'react';
import { Check, X, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
          <div className="flex justify-between">
            <p>{suggestion.text}</p>
            {!suggestion.accepted && !suggestion.rejected && (
              <div className="flex gap-1 ml-2">
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-4 w-4 rounded-full p-0"
                  onClick={() => onAccept(suggestion.id, messageId)}
                >
                  <Check size={10} className="text-green-500" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-4 w-4 rounded-full p-0"
                  onClick={() => onReject(suggestion.id, messageId)}
                >
                  <X size={10} className="text-red-500" />
                </Button>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default AISuggestions;
