
import React, { useState } from 'react';
import { ModuleProps } from '@/types/modules';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Check, ClipboardCheck, FileText } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';

interface CallSummaryPoint {
  id: string;
  text: string;
  checked: boolean;
  important: boolean;
}

const NachbearbeitungModule: React.FC<ModuleProps> = ({ 
  id, 
  title, 
  data, 
  onClose, 
  onComplete 
}) => {
  const summaryPoints: CallSummaryPoint[] = data?.summaryPoints || [
    { id: '1', text: 'Customer identification was verified', checked: false, important: true },
    { id: '2', text: 'Customer inquiry was addressed', checked: false, important: true },
    { id: '3', text: 'Relevant information was provided to customer', checked: false, important: true },
    { id: '4', text: 'Customer was informed about next steps', checked: false, important: false },
    { id: '5', text: 'Customer was offered additional assistance', checked: false, important: false }
  ];
  
  const [notes, setNotes] = useState('');
  const [points, setPoints] = useState<CallSummaryPoint[]>(summaryPoints);
  const [submitted, setSubmitted] = useState(false);
  
  const handleCheckPoint = (pointId: string) => {
    setPoints(prevPoints => 
      prevPoints.map(point => 
        point.id === pointId 
          ? { ...point, checked: !point.checked } 
          : point
      )
    );
  };
  
  const handleSubmit = () => {
    // Check if all important points are checked
    const allImportantChecked = points
      .filter(point => point.important)
      .every(point => point.checked);
    
    if (allImportantChecked) {
      setSubmitted(true);
      
      if (onComplete) {
        onComplete({
          completed: true,
          points: points.filter(p => p.checked).map(p => p.text),
          notes: notes
        });
      }
    } else {
      // Could display an error message here
      alert('Please check all required summary points before completing');
    }
  };
  
  return (
    <Card className="w-full border border-blue-200 shadow-md">
      <CardHeader className="bg-blue-50 border-b border-blue-100">
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-blue-600" />
          <CardTitle className="text-blue-900">{title || 'Call Nachbearbeitung'}</CardTitle>
        </div>
        <CardDescription>
          Please review and confirm the call summary before completing
        </CardDescription>
      </CardHeader>
      
      <ScrollArea className="max-h-[400px]">
        <CardContent className="pt-6 space-y-4">
          {submitted && (
            <div className="bg-green-50 p-3 rounded-md flex items-center gap-2 text-green-700 mb-4">
              <Check className="h-5 w-5" />
              <span>Call summary completed successfully</span>
            </div>
          )}
          
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-700">Call Summary Points</h3>
            {points.map(point => (
              <div key={point.id} className="flex items-start space-x-2">
                <Checkbox 
                  id={`point-${point.id}`}
                  checked={point.checked} 
                  onCheckedChange={() => handleCheckPoint(point.id)}
                />
                <div className="grid gap-1.5">
                  <Label
                    htmlFor={`point-${point.id}`}
                    className={`text-sm ${point.important ? 'font-medium' : ''}`}
                  >
                    {point.text}
                    {point.important && (
                      <span className="ml-1 text-red-500">*</span>
                    )}
                  </Label>
                </div>
              </div>
            ))}
          </div>
          
          <Separator />
          
          <div className="space-y-2">
            <Label htmlFor="notes" className="text-sm font-medium">Additional Notes</Label>
            <Textarea
              id="notes"
              placeholder="Enter any additional notes about the call..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="min-h-[100px]"
            />
          </div>
        </CardContent>
      </ScrollArea>
      
      <CardFooter className="flex justify-between bg-gray-50 border-t p-4">
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button 
          onClick={handleSubmit}
          className="bg-blue-600 hover:bg-blue-700"
          disabled={submitted}
        >
          <ClipboardCheck className="h-4 w-4 mr-2" />
          Complete Call Summary
        </Button>
      </CardFooter>
    </Card>
  );
};

export default NachbearbeitungModule;
