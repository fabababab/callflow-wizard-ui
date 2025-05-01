
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, X, AlertCircle, Info, Copy, MessageSquare } from 'lucide-react';

type Suggestion = {
  id: string;
  type: 'info' | 'action' | 'response';
  content: string;
  accepted?: boolean;
  rejected?: boolean;
  invoked?: boolean;
};

const ActionPanel = () => {
  const { toast } = useToast();
  const [suggestions, setSuggestions] = React.useState<Suggestion[]>([
    {
      id: '1',
      type: 'info',
      content: 'Customer has been a member since 2022.',
    },
    {
      id: '2',
      type: 'action',
      content: 'Verify customer identity using policy number and date of birth.',
    },
    {
      id: '3',
      type: 'response',
      content: "Thank you for confirming those details. I've updated our records with your new banking information. You'll receive a confirmation email shortly, and the changes will be effective within 1-2 business days.",
    },
  ]);
  
  // Periodically add new suggestions to simulate AI assistance
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setSuggestions(prev => [
        ...prev,
        {
          id: '4',
          type: 'info',
          content: 'Customer recently updated their email address on April 5th, 2025.',
        }
      ]);
    }, 15000);
    
    return () => clearTimeout(timer);
  }, []);
  
  const handleAccept = (id: string) => {
    setSuggestions(prev => 
      prev.map(suggestion => 
        suggestion.id === id 
          ? { ...suggestion, accepted: true, rejected: false }
          : suggestion
      )
    );
    
    toast({
      title: "Suggestion Accepted",
      description: "The suggestion has been marked as accepted.",
    });
  };
  
  const handleReject = (id: string) => {
    setSuggestions(prev => 
      prev.map(suggestion => 
        suggestion.id === id 
          ? { ...suggestion, rejected: true, accepted: false }
          : suggestion
      )
    );
    
    toast({
      title: "Suggestion Rejected",
      description: "The suggestion has been marked as rejected.",
    });
  };
  
  const handleInvoke = (id: string) => {
    setSuggestions(prev => 
      prev.map(suggestion => 
        suggestion.id === id 
          ? { ...suggestion, invoked: true }
          : suggestion
      )
    );
    
    const suggestion = suggestions.find(s => s.id === id);
    
    if (suggestion?.type === 'response') {
      toast({
        title: "Response Copied",
        description: "The suggested response has been copied to clipboard.",
      });
      
      navigator.clipboard.writeText(suggestion.content);
    } else {
      toast({
        title: "Suggestion Applied",
        description: "The suggestion has been applied to the current workflow.",
      });
    }
  };
  
  // Helper function to get icon based on suggestion type
  const getSuggestionIcon = (type: string) => {
    switch (type) {
      case 'info':
        return <Info size={18} />;
      case 'action':
        return <AlertCircle size={18} />;
      case 'response':
        return <MessageSquare size={18} />;
      default:
        return <Info size={18} />;
    }
  };
  
  // Helper function to get style based on suggestion status
  const getSuggestionStyle = (suggestion: Suggestion) => {
    if (suggestion.invoked) {
      return 'border-callflow-success bg-callflow-success/5';
    }
    if (suggestion.accepted) {
      return 'border-blue-300 bg-blue-50';
    }
    if (suggestion.rejected) {
      return 'border-gray-200 bg-gray-50 opacity-60';
    }
    return 'border-gray-200';
  };
  
  return (
    <Card className="rounded-lg">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">AI Suggestions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {suggestions.map((suggestion) => (
          <div 
            key={suggestion.id} 
            className={`border rounded-lg p-3 transition-all ${getSuggestionStyle(suggestion)}`}
          >
            <div className="flex items-start gap-2">
              <div className={`mt-1 ${
                suggestion.type === 'info' ? 'text-blue-600' :
                suggestion.type === 'action' ? 'text-amber-600' :
                'text-purple-600'
              }`}>
                {getSuggestionIcon(suggestion.type)}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium uppercase text-gray-500">
                    {suggestion.type}
                  </span>
                  {suggestion.invoked && (
                    <Badge variant="outline" className="bg-callflow-success/10 text-callflow-success border-callflow-success/20">
                      <CheckCircle size={12} className="mr-1" />
                      Applied
                    </Badge>
                  )}
                </div>
                <p className="text-sm mb-3">{suggestion.content}</p>
                
                {!suggestion.invoked && (
                  <div className="flex items-center gap-2 mt-2">
                    {suggestion.type === 'response' ? (
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="text-sm gap-1"
                        onClick={() => handleInvoke(suggestion.id)}
                      >
                        <Copy size={14} />
                        Copy Response
                      </Button>
                    ) : (
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="text-sm"
                        onClick={() => handleInvoke(suggestion.id)}
                      >
                        Apply
                      </Button>
                    )}
                    
                    {!suggestion.accepted && !suggestion.rejected && (
                      <>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="text-callflow-success"
                          onClick={() => handleAccept(suggestion.id)}
                        >
                          <CheckCircle size={14} />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="text-callflow-danger"
                          onClick={() => handleReject(suggestion.id)}
                        >
                          <X size={14} />
                        </Button>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default ActionPanel;
