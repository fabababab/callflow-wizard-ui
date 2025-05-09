
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

interface LoadingErrorStatesProps {
  isLoading: boolean;
  error: string | null;
  hasStateMachine: boolean;
}

const LoadingErrorStates: React.FC<LoadingErrorStatesProps> = ({
  isLoading,
  error,
  hasStateMachine
}) => {
  // If we're not loading, there's no error, and we have a state machine, don't render anything
  if (!isLoading && !error && hasStateMachine) return null;

  return (
    <>
      {/* Display loading state */}
      {isLoading && (
        <Card className="m-4">
          <CardContent className="py-4">
            <div className="flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            </div>
            <p className="text-center">Loading scenario...</p>
          </CardContent>
        </Card>
      )}

      {/* Display error state */}
      {error && (
        <Card className="m-4">
          <CardContent className="py-4">
            <p className="text-red-500">{error}</p>
          </CardContent>
        </Card>
      )}
      
      {/* Display empty state */}
      {!hasStateMachine && !isLoading && !error && (
        <Card className="m-4">
          <CardContent className="py-8 text-center">
            <p>State machine is loading...</p>
          </CardContent>
        </Card>
      )}
    </>
  );
};

export default LoadingErrorStates;
