
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
  // Process the points data - could be an array of strings or CallSummaryPoint objects
  const initialPoints = React.useMemo(() => {
    if (data?.points) {
      // If points is an array of strings, convert to CallSummaryPoint objects
      if (typeof data.points[0] === 'string') {
        return (data.points as string[]).map((point, index) => ({
          id: `${index + 1}`,
          text: point,
          checked: index < 2, // First two points checked by default
          important: index < 2 // First two points marked as important
        }));
      } 
      // If points is already an array of CallSummaryPoint objects, use as is
      else {
        return data.points as CallSummaryPoint[];
      }
    }
    // Default points if none provided
    return [
      { id: '1', text: 'Studium abgeschlossen', checked: true, important: true },
      { id: '2', text: 'Franchise von 2500 auf 1000 CHF reduziert', checked: true, important: true },
      { id: '3', text: 'Bleibt im Telmed-Modell', checked: false, important: true },
      { id: '4', text: 'Änderung ab nächstem Monat', checked: false, important: false }
    ];
  }, [data?.points]);
  
  // Use provided summary or default
  const initialNotes = data?.summary || 'Kunde hat nach Studienabschluss Franchise von CHF 2500.– auf CHF 1000.– angepasst, bleibt im Telmed-Modell. Änderung per nächstem Monatsbeginn eingeleitet.';
  
  const [notes, setNotes] = useState(initialNotes);
  const [points, setPoints] = useState<CallSummaryPoint[]>(initialPoints);
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
      alert('Bitte markieren Sie alle erforderlichen Punkte, bevor Sie abschließen');
    }
  };
  
  const isInline = data?.isInline === true;
  
  return (
    <Card className={`w-full shadow-md ${isInline ? 'border-blue-200' : 'border'}`}>
      <CardHeader className="bg-blue-50 border-b border-blue-100">
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-blue-600" />
          <CardTitle className="text-blue-900">{title || 'Nachbearbeitung'}</CardTitle>
        </div>
        <CardDescription>
          Bitte überprüfen und bestätigen Sie die Zusammenfassung des Gesprächs
        </CardDescription>
      </CardHeader>
      
      <ScrollArea className={`${isInline ? 'max-h-[300px]' : 'max-h-[400px]'}`}>
        <CardContent className="pt-6 space-y-4">
          {submitted && (
            <div className="bg-green-50 p-3 rounded-md flex items-center gap-2 text-green-700 mb-4">
              <Check className="h-5 w-5" />
              <span>Zusammenfassung erfolgreich abgeschlossen</span>
            </div>
          )}
          
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-700">Gesprächszusammenfassung</h3>
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
            <Label htmlFor="notes" className="text-sm font-medium">Zusätzliche Notizen</Label>
            <Textarea
              id="notes"
              placeholder="Geben Sie zusätzliche Notizen zum Gespräch ein..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="min-h-[100px]"
            />
          </div>
        </CardContent>
      </ScrollArea>
      
      <CardFooter className="flex justify-between bg-gray-50 border-t p-4">
        <Button variant="outline" onClick={onClose}>
          Abbrechen
        </Button>
        <Button 
          onClick={handleSubmit}
          className="bg-blue-600 hover:bg-blue-700"
          disabled={submitted}
        >
          <ClipboardCheck className="h-4 w-4 mr-2" />
          Zusammenfassung abschließen
        </Button>
      </CardFooter>
    </Card>
  );
};

export default NachbearbeitungModule;
