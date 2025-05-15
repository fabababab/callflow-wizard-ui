
import React from 'react';
import { ModuleProps } from '@/types/modules';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';

interface InsuranceModel {
  id: string;
  title: string;
  description: string;
  priceRange: string;
}

const InsuranceModelModule: React.FC<ModuleProps> = ({
  title,
  data,
  onComplete,
  isInline = false
}) => {
  // Default models if none are provided in data
  const defaultModels: InsuranceModel[] = [
    {
      id: "standard",
      title: "Standardmodell",
      description: "Freie Arztwahl, keine Einschränkungen.",
      priceRange: "Ca. CHF 290–330/Monat"
    },
    {
      id: "hausarzt",
      title: "Hausarztmodell",
      description: "Immer zuerst zum gewählten Hausarzt.",
      priceRange: "Ca. CHF 240–270/Monat"
    },
    {
      id: "telmed",
      title: "Telmed-Modell",
      description: "Zuerst telefonische Beratung.",
      priceRange: "Ca. CHF 220–250/Monat"
    },
    {
      id: "hmo",
      title: "HMO-Modell",
      description: "Nur bestimmte Gesundheitszentren.",
      priceRange: "Ca. CHF 230–260/Monat"
    }
  ];

  // Use models from data if provided, otherwise use default models
  const models = data?.models || defaultModels;

  const handleSelectModel = (model: InsuranceModel) => {
    console.log(`Selected model: ${model.title}`);
    
    // Per requirements, always select Telmed regardless of which button is clicked
    onComplete({
      selectedModel: "telmed",
      displayedModel: model.id,
      modelTitle: model.title
    });
  };

  return (
    <div className="p-4 bg-white rounded-lg">
      <div className={`mb-4 ${isInline ? 'pb-2 border-b' : ''}`}>
        <h2 className="text-xl font-semibold">{title || "Versicherungsmodelle"}</h2>
        <p className="text-sm text-muted-foreground">
          Bitte wählen Sie ein passendes Versicherungsmodell
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        {models.map((model) => (
          <Card key={model.id} className="overflow-hidden border-2 hover:border-blue-200 transition-all">
            <CardHeader className="bg-blue-50 pb-2">
              <CardTitle className="text-lg font-semibold">{model.title}</CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <p>{model.description}</p>
              <div className="mt-3">
                <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200 text-sm py-1 px-2">
                  {model.priceRange}
                </Badge>
              </div>
            </CardContent>
            <CardFooter className="bg-gray-50">
              <Button 
                onClick={() => handleSelectModel(model)} 
                className="w-full"
                variant={model.id === "telmed" ? "default" : "outline"}
              >
                {model.id === "telmed" ? "Empfohlen" : "Auswählen"}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default InsuranceModelModule;
