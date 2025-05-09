
import React from 'react';
import { AlertCircle, CheckCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface AISuggestionPanelProps {
  showSuggestion: boolean;
  suggestionAccepted: boolean;
  onAcceptSuggestion: () => void;
  onRejectSuggestion: () => void;
  isValidated: boolean;
}

const AISuggestionPanel: React.FC<AISuggestionPanelProps> = ({
  showSuggestion,
  suggestionAccepted,
  onAcceptSuggestion,
  onRejectSuggestion,
  isValidated
}) => {
  if (!showSuggestion || isValidated) return null;
  
  return (
    <div className={`mt-4 border ${suggestionAccepted ? 'border-green-200 bg-green-50' : 'border-blue-200 bg-blue-50'} rounded-md p-4 text-sm animate-fade-in`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2 font-medium">
          <AlertCircle size={16} className={suggestionAccepted ? "text-green-600" : "text-blue-600"} />
          <span className={suggestionAccepted ? "text-green-600" : "text-blue-600"}>AI Suggestion</span>
        </div>
        {suggestionAccepted && (
          <Badge variant="outline" className="font-normal bg-green-100 text-green-700 border-green-200">
            Applied
          </Badge>
        )}
      </div>
      
      <p className="mb-3">
        I found matching customer records in the system. Would you like to use these verified details?
      </p>
      
      {!suggestionAccepted && (
        <div className="flex gap-2">
          <Button 
            size="sm" 
            variant="outline"
            className="border-blue-300 hover:bg-blue-100"
            onClick={onAcceptSuggestion}
          >
            Accept
          </Button>
          <Button 
            size="sm" 
            variant="ghost"
            className="text-blue-700"
            onClick={onRejectSuggestion}
          >
            Reject
          </Button>
        </div>
      )}
    </div>
  );
};

export default AISuggestionPanel;
