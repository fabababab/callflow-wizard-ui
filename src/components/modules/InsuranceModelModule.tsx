
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Shield, Check, X, FileText, Download, ExternalLink } from 'lucide-react';
import { ModuleProps } from '@/types/modules';
import { Progress } from '@/components/ui/progress';
import { AspectRatio } from '@/components/ui/aspect-ratio';

interface InsuranceModelModule extends ModuleProps {}

const InsuranceModelModule: React.FC<InsuranceModelModule> = ({
  id,
  title,
  data = {},
  onClose,
  onComplete
}) => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [selectedModel, setSelectedModel] = useState<string>(data.currentModel || 'standard');
  
  // Default data if not provided
  const {
    currentModel = 'standard',
    coverageUtilization = 65,
    customerName = 'Max Müller',
    customerSince = '15.03.2020',
    models = [
      {
        id: 'basic',
        name: 'Basic',
        monthlyCost: 280,
        features: ['General healthcare', 'Emergency care', 'Basic medication'],
        limitations: ['No specialists without referral', 'Limited hospital choice', 'No alternative medicine']
      },
      {
        id: 'standard',
        name: 'Standard',
        monthlyCost: 350,
        features: ['General healthcare', 'Emergency care', 'Standard medication', 'Limited specialist access'],
        limitations: ['Selected hospitals only', 'Partial alternative medicine']
      },
      {
        id: 'premium',
        name: 'Premium',
        monthlyCost: 450,
        features: ['All medical services', 'Priority specialist access', 'Free hospital choice', 'Full alternative medicine'],
        limitations: ['Annual check-up required']
      }
    ],
    documents = [
      { id: 'doc1', name: 'Insurance Policy', type: 'pdf', date: '01.01.2024' },
      { id: 'doc2', name: 'Coverage Details', type: 'pdf', date: '01.01.2024' },
      { id: 'doc3', name: 'Terms and Conditions', type: 'pdf', date: '01.01.2024' }
    ],
    isInline = false
  } = data;

  // Get current model details
  const getCurrentModel = () => {
    return models.find(model => model.id === selectedModel) || models[1]; // Default to standard
  };

  const handleSave = () => {
    const result = {
      action: 'update',
      selectedModel: selectedModel,
      previousModel: currentModel,
      details: getCurrentModel()
    };

    toast({
      title: "Insurance Model Updated",
      description: `Your insurance model has been changed to ${getCurrentModel().name}`,
    });

    onComplete(result);
  };

  const handleCancel = () => {
    onComplete({ action: 'cancel' });
    onClose();
  };

  const handleModelSelect = (modelId: string) => {
    setSelectedModel(modelId);
  };

  const handleOpenDocument = (docId: string) => {
    toast({
      title: "Document Requested",
      description: "The document would open in a new tab in a real application",
    });
  };

  return (
    <Card className="border-amber-200 bg-amber-50/50 shadow-md">
      <CardHeader className="bg-amber-50 border-b border-amber-200">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg text-amber-800">{title || 'Versicherungsmodell'}</CardTitle>
          <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-300">
            Insurance Model
          </Badge>
        </div>
        <CardDescription className="text-amber-700">
          View and manage your insurance model and coverage details
        </CardDescription>
      </CardHeader>

      <CardContent className="pt-4 pb-2">
        <div className="mb-4 p-3 bg-amber-100 rounded-lg border border-amber-200">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-sm font-medium text-amber-800">Customer: {customerName}</h3>
              <p className="text-xs text-amber-600">Customer since: {customerSince}</p>
            </div>
            <div className="text-right">
              <h3 className="text-sm font-medium text-amber-800">Current Model: {getCurrentModel().name}</h3>
              <p className="text-xs text-amber-600">Monthly premium: CHF {getCurrentModel().monthlyCost}</p>
            </div>
          </div>
        </div>

        <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="overview" className="text-sm">
              Overview
            </TabsTrigger>
            <TabsTrigger value="models" className="text-sm">
              Models
            </TabsTrigger>
            <TabsTrigger value="documents" className="text-sm">
              Documents
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="px-1">
            <div className="space-y-5">
              <div>
                <h3 className="text-sm font-medium mb-2 text-amber-800">Coverage Utilization</h3>
                <Progress value={coverageUtilization} className="h-2 bg-amber-200" />
                <div className="flex justify-between text-xs text-amber-600 mt-1">
                  <span>0%</span>
                  <span className="font-medium">{coverageUtilization}% Used</span>
                  <span>100%</span>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium mb-2 text-amber-800">Current Coverage</h3>
                <div className="space-y-2">
                  {getCurrentModel().features.map((feature, index) => (
                    <div key={index} className="flex items-center text-sm">
                      <Check className="h-4 w-4 text-green-600 mr-2" />
                      <span>{feature}</span>
                    </div>
                  ))}
                  
                  {getCurrentModel().limitations.map((limitation, index) => (
                    <div key={index} className="flex items-center text-sm text-amber-700">
                      <X className="h-4 w-4 text-amber-600 mr-2" />
                      <span>{limitation}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="models" className="px-1">
            <div className="space-y-4">
              <h3 className="text-sm font-medium mb-2 text-amber-800">Available Insurance Models</h3>
              <div className="space-y-3">
                {models.map((model) => (
                  <div 
                    key={model.id} 
                    className={`p-3 rounded-md border transition-all cursor-pointer ${
                      selectedModel === model.id 
                        ? 'border-amber-400 bg-amber-100' 
                        : 'border-amber-200 bg-white hover:border-amber-300'
                    }`}
                    onClick={() => handleModelSelect(model.id)}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-medium text-amber-800">{model.name}</h4>
                        <p className="text-xs text-amber-600">CHF {model.monthlyCost}/month</p>
                      </div>
                      <Shield className="h-5 w-5 text-amber-600" />
                    </div>
                    <div className="mt-2 text-xs text-amber-700">
                      <p>{model.features.length} covered features • {model.limitations.length} limitations</p>
                    </div>
                  </div>
                ))}
              </div>
              
              {selectedModel !== currentModel && (
                <div className="p-3 bg-amber-100 rounded-md border border-amber-300 mt-4">
                  <p className="text-sm text-amber-800">
                    <span className="font-medium">Price difference:</span> 
                    {getCurrentModel().monthlyCost - models.find(m => m.id === currentModel)!.monthlyCost > 0 ? '+' : ''}
                    CHF {getCurrentModel().monthlyCost - models.find(m => m.id === currentModel)!.monthlyCost}/month
                  </p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="documents" className="px-1">
            <div className="space-y-4">
              <h3 className="text-sm font-medium mb-2 text-amber-800">Policy Documents</h3>
              <div className="space-y-2">
                {documents.map((doc) => (
                  <div 
                    key={doc.id} 
                    className="flex items-center justify-between p-3 bg-white border border-amber-200 rounded-md hover:border-amber-300 cursor-pointer"
                    onClick={() => handleOpenDocument(doc.id)}
                  >
                    <div className="flex items-center">
                      <FileText className="h-4 w-4 text-amber-600 mr-2" />
                      <div>
                        <p className="text-sm font-medium text-amber-800">{doc.name}</p>
                        <p className="text-xs text-amber-600">{doc.date}</p>
                      </div>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="h-8 border-amber-300 text-amber-800 hover:bg-amber-100"
                    >
                      <Download className="h-4 w-4 mr-1" /> 
                      View
                    </Button>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="mt-4 pt-4 border-t border-amber-200">
              <Button 
                variant="link" 
                className="p-0 h-auto text-amber-700 flex items-center hover:text-amber-900"
                onClick={() => {
                  toast({
                    title: "External Portal Link",
                    description: "This would link to customer portal in a real application"
                  });
                }}
              >
                <ExternalLink className="h-4 w-4 mr-1" /> 
                View all documents in customer portal
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>

      <CardFooter className="flex justify-between border-t border-amber-200 pt-3 bg-amber-50/80">
        <Button variant="outline" onClick={handleCancel} className="border-amber-300 text-amber-800 hover:bg-amber-100">
          Close
        </Button>
        {activeTab === 'models' && selectedModel !== currentModel && (
          <Button 
            onClick={handleSave}
            className="bg-amber-600 text-white hover:bg-amber-700"
          >
            Update Model
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default InsuranceModelModule;
