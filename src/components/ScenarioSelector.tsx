
import React from 'react';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

// This file defines the ScenarioType that's used across the application
export type ScenarioType = 
  'studiumabschlussCase' |
  'leistungsabdeckungPhysio' |
  'mahnungTrotzZahlung';

// Define and export the scenarioCallData object that Dashboard.tsx is looking for
export const scenarioCallData: Record<ScenarioType, {
  id: number;
  customerName: string;
  phoneNumber: string;
  waitTime: string;
  callType: string;
  priority: 'high' | 'medium' | 'low';
  expertise: string;
  matchScore: number;
  caseHistory: Array<{
    type: string;
    date: string;
    description: string;
  }>;
  roboCallSummary: {
    duration: string;
    intents?: string[];
    sentiment: string;
    keyPoints: string[];
  };
}> = {
  'studiumabschlussCase': {
    id: 11,
    customerName: 'Markus Weber',
    phoneNumber: '+41 78 123 4567',
    waitTime: '0m 20s',
    callType: 'Versicherungsanpassung',
    priority: 'medium',
    expertise: 'Versicherung',
    matchScore: 94,
    caseHistory: [
      {
        type: 'Vertragsänderung',
        date: 'Mai 12, 2025',
        description: 'Kunde hat Studium abgeschlossen und fragt nach Anpassungen.'
      }
    ],
    roboCallSummary: {
      duration: '1m 30s',
      sentiment: 'Neutral',
      keyPoints: ['Studium abgeschlossen', 'Frage nach Versicherungsanpassungen', 'Überprüfung der Franchise']
    }
  },
  'leistungsabdeckungPhysio': {
    id: 12,
    customerName: 'Anna Fischer',
    phoneNumber: '+41 76 987 6543',
    waitTime: '0m 35s',
    callType: 'Leistungsabdeckung',
    priority: 'medium',
    expertise: 'Leistungen',
    matchScore: 91,
    caseHistory: [
      {
        type: 'Leistungsanfrage',
        date: 'Mai 14, 2025',
        description: 'Kundin hat Fragen zur Abdeckung von Physiotherapie.'
      }
    ],
    roboCallSummary: {
      duration: '1m 45s',
      sentiment: 'Interessiert',
      keyPoints: ['Ärztliche Verordnung für Physiotherapie', 'Frage zur Kostenübernahme', 'Klärung der Selbstbeteiligung']
    }
  },
  'mahnungTrotzZahlung': {
    id: 13,
    customerName: 'Thomas Müller',
    phoneNumber: '+41 79 345 6789',
    waitTime: '0m 15s',
    callType: 'Zahlungsproblem',
    priority: 'high',
    expertise: 'Zahlungsverkehr',
    matchScore: 96,
    caseHistory: [
      {
        type: 'Zahlungsreklamation',
        date: 'Mai 15, 2025',
        description: 'Kunde erhielt Mahnung trotz bereits erfolgter Zahlung.'
      }
    ],
    roboCallSummary: {
      duration: '1m 10s',
      sentiment: 'Verärgert',
      keyPoints: ['Mahnung erhalten', 'Zahlung bereits getätigt', 'Hat Zahlungsbeleg']
    }
  }
};

interface ScenarioSelectorProps {
  activeScenario: ScenarioType;
  onSelectScenario: (scenario: ScenarioType) => void;
  disabled?: boolean;
}

const ScenarioSelector = ({
  activeScenario,
  onSelectScenario,
  disabled = false
}: ScenarioSelectorProps) => {
  // Update the scenarios array to include just the three specified scenarios
  const scenarios: ScenarioType[] = [
    'studiumabschlussCase',
    'leistungsabdeckungPhysio',
    'mahnungTrotzZahlung'
  ];

  return (
    <div className="flex flex-col space-y-1.5">
      <Label htmlFor="scenario">Scenario</Label>
      <Select
        value={activeScenario}
        onValueChange={(value) => onSelectScenario(value as ScenarioType)}
        disabled={disabled}
      >
        <SelectTrigger id="scenario" className="w-full">
          <SelectValue placeholder="Select scenario" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {scenarios.map((scenario) => (
              <SelectItem key={scenario} value={scenario}>
                {scenario === 'studiumabschlussCase' ? 'Studiumabschluss-Case' :
                 scenario === 'leistungsabdeckungPhysio' ? 'Leistungsabdeckung Physio' :
                 'Mahnung trotz Zahlung'}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
};

export default ScenarioSelector;
