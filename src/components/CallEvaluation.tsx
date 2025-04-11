
import React from 'react';
import { Star, SendHorizontal } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

const CallEvaluation = () => {
  const [rating, setRating] = React.useState<number | null>(null);
  const [notes, setNotes] = React.useState('');
  
  return (
    <Card className="rounded-lg">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Call Evaluation</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-sm mb-2">Rate this call:</p>
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <Button
                key={star}
                variant="ghost"
                size="sm"
                className={cn(
                  "p-1 h-auto",
                  rating && rating >= star ? "text-amber-500" : "text-gray-300"
                )}
                onClick={() => setRating(star)}
              >
                <Star className="h-6 w-6 fill-current" />
              </Button>
            ))}
          </div>
        </div>
        
        <div>
          <p className="text-sm mb-2">Notes:</p>
          <Textarea 
            placeholder="Add notes about this call..."
            className="min-h-[100px]"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>
        
        <Button className="w-full">
          <SendHorizontal className="mr-2 h-4 w-4" />
          Submit Evaluation
        </Button>
      </CardContent>
    </Card>
  );
};

export default CallEvaluation;
