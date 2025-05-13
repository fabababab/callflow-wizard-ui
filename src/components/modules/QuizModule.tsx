
import React, { useState } from 'react';
import { ModuleProps } from '@/types/modules';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, ChevronDown, ChevronUp, Calculator, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface QuizStep {
  id: string;
  title: string;
  calculation: string;
  explanation: string;
}

const QuizModule: React.FC<ModuleProps> = ({ 
  id, 
  title, 
  data, 
  onClose, 
  onComplete 
}) => {
  const isInlineDisplay = data?.isInline === true;
  const message = data?.message || '';
  const steps = data?.steps || [];
  const summary = data?.summary || '';
  
  const [expandedSteps, setExpandedSteps] = useState<Record<string, boolean>>({});
  const [completed, setCompleted] = useState(false);
  
  const toggleStep = (stepId: string) => {
    setExpandedSteps(prev => ({
      ...prev,
      [stepId]: !prev[stepId]
    }));
  };
  
  const handleComplete = () => {
    setCompleted(true);
    if (onComplete) {
      onComplete({
        completed: true,
        summary: summary
      });
    }
  };
  
  const cardClassName = isInlineDisplay
    ? "w-full border-l-4 border-purple-300 border-r border-t border-b border-purple-200 shadow-sm rounded-md bg-purple-50/60"
    : "w-full max-w-md border border-purple-200 shadow-md";

  return (
    <Card className={cardClassName}>
      <CardHeader className={`${isInlineDisplay ? "bg-transparent py-2 pb-0" : "bg-purple-50 border-b border-purple-100"}`}>
        <div className="flex items-center gap-2">
          <Calculator className={`${isInlineDisplay ? "h-4 w-4" : "h-5 w-5"} text-purple-600`} />
          <CardTitle className={`${isInlineDisplay ? "text-purple-700 text-sm" : "text-purple-900"}`}>
            {title || 'Berechnung'}
          </CardTitle>
        </div>
        {message && (
          <CardDescription className={`text-xs ${isInlineDisplay ? "text-purple-600/70" : ""}`}>
            {message}
          </CardDescription>
        )}
      </CardHeader>
      
      <CardContent className={`${isInlineDisplay ? "pt-2" : "pt-6"} space-y-4`}>
        {steps.length === 0 ? (
          <p className="text-center text-gray-500 py-4">Keine Berechnungsschritte verfügbar</p>
        ) : (
          steps.map((step: QuizStep, index: number) => (
            <div key={step.id} className="border border-purple-100 rounded-md overflow-hidden">
              <div 
                className={`flex justify-between items-center p-3 cursor-pointer hover:bg-purple-50 ${
                  expandedSteps[step.id] ? "bg-purple-50" : "bg-white"
                }`}
                onClick={() => toggleStep(step.id)}
              >
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-200">
                    {index + 1}
                  </Badge>
                  <span className={`font-medium ${isInlineDisplay ? "text-sm" : ""}`}>{step.title}</span>
                </div>
                {expandedSteps[step.id] ? (
                  <ChevronUp className="h-4 w-4 text-purple-600" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-purple-600" />
                )}
              </div>
              
              {expandedSteps[step.id] && (
                <div className="p-3 bg-purple-50/40 border-t border-purple-100">
                  <div className="mb-2">
                    <p className="text-sm font-semibold text-purple-900">{step.calculation}</p>
                  </div>
                  <p className="text-xs text-gray-600">{step.explanation}</p>
                </div>
              )}
            </div>
          ))
        )}
        
        {summary && (
          <div className="mt-4 bg-purple-100/70 border border-purple-200 rounded-md p-3">
            <div className="flex items-start gap-2">
              <CheckCircle className="h-5 w-5 text-purple-600 mt-0.5" />
              <p className="text-sm font-medium text-purple-900">{summary}</p>
            </div>
          </div>
        )}
        
        {completed && (
          <div className="mt-2 bg-green-50 border border-green-100 rounded-md p-2">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <p className="text-xs text-green-700">Berechnung abgeschlossen</p>
            </div>
          </div>
        )}
      </CardContent>
      
      <CardFooter className={`flex justify-between ${isInlineDisplay ? "py-2 bg-transparent border-t border-purple-100/50" : "bg-gray-50 border-t"}`}>
        <Button 
          variant="outline" 
          onClick={onClose}
          className={isInlineDisplay ? "text-xs" : ""}
        >
          Schließen
        </Button>
        <Button 
          onClick={handleComplete}
          className={isInlineDisplay ? "text-xs bg-purple-500 hover:bg-purple-600 text-white" : ""}
          disabled={completed}
        >
          Berechnung verstanden
        </Button>
      </CardFooter>
    </Card>
  );
};

export default QuizModule;
