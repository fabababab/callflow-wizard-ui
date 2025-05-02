
import React from 'react';

interface StateDataDisplayProps {
  currentState: string;
  stateData: any;
}

const StateDataDisplay: React.FC<StateDataDisplayProps> = ({ currentState, stateData }) => {
  return (
    <div className="space-y-4">
      <div className="bg-muted p-3 rounded-lg">
        <h3 className="font-medium">Current State</h3>
        <p className="text-sm mt-1">{currentState}</p>
      </div>
      <div className="bg-muted p-3 rounded-lg">
        <h3 className="font-medium">Available Options</h3>
        <div className="mt-2 space-y-1">
          {stateData?.meta?.suggestions ? (
            stateData.meta.suggestions.map((suggestion: string) => (
              <p key={suggestion} className="text-sm">{suggestion}</p>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">No options available</p>
          )}
        </div>
      </div>
      {stateData?.meta?.agentText && (
        <div className="bg-muted p-3 rounded-lg">
          <h3 className="font-medium">Agent Text</h3>
          <p className="text-sm mt-1">{stateData.meta.agentText}</p>
        </div>
      )}
      {stateData?.meta?.systemMessage && (
        <div className="bg-muted p-3 rounded-lg">
          <h3 className="font-medium">System Message</h3>
          <p className="text-sm mt-1">{stateData.meta.systemMessage}</p>
        </div>
      )}
    </div>
  );
};

export default StateDataDisplay;
