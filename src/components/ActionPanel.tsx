
import React from 'react';
import { CreditCard, Wallet, Shield, FileText, HelpCircle, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const ActionPanel = () => {
  return (
    <Card className="rounded-lg">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="common">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="common">Common</TabsTrigger>
            <TabsTrigger value="verification">Verification</TabsTrigger>
            <TabsTrigger value="support">Support</TabsTrigger>
          </TabsList>
          
          <TabsContent value="common" className="space-y-2">
            <Button variant="outline" className="w-full justify-start text-left" size="lg">
              <CreditCard className="mr-2 h-4 w-4" />
              Update Bank Details
            </Button>
            <Button variant="outline" className="w-full justify-start text-left" size="lg">
              <Wallet className="mr-2 h-4 w-4" />
              Process Payment
            </Button>
            <Button variant="outline" className="w-full justify-start text-left" size="lg">
              <FileText className="mr-2 h-4 w-4" />
              View Account History
            </Button>
          </TabsContent>
          
          <TabsContent value="verification" className="space-y-2">
            <Button variant="outline" className="w-full justify-start text-left" size="lg">
              <Shield className="mr-2 h-4 w-4" />
              Identity Verification
            </Button>
            <Button variant="outline" className="w-full justify-start text-left" size="lg">
              <AlertCircle className="mr-2 h-4 w-4" />
              Flag for Review
            </Button>
          </TabsContent>
          
          <TabsContent value="support" className="space-y-2">
            <Button variant="outline" className="w-full justify-start text-left" size="lg">
              <HelpCircle className="mr-2 h-4 w-4" />
              Knowledge Base
            </Button>
            <Button variant="outline" className="w-full justify-start text-left" size="lg">
              <FileText className="mr-2 h-4 w-4" />
              Create Support Ticket
            </Button>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default ActionPanel;
