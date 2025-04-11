
import React from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { 
  Search, 
  FileText, 
  HelpCircle, 
  Phone, 
  Mail, 
  MessageSquare,
  Video
} from 'lucide-react';

const Help = () => {
  const faqs = [
    {
      question: "How do I create a new customer profile?",
      answer: "To create a new customer profile, navigate to the Contacts page and click on the 'Add Contact' button in the top right corner. Fill in the required information in the form that appears and click 'Save'."
    },
    {
      question: "How can I escalate a customer issue?",
      answer: "To escalate a customer issue, go to the active call screen and click on the 'Escalate' button in the Actions panel. Select the appropriate escalation reason and provide any additional details needed. The system will then route the issue to a supervisor."
    },
    {
      question: "What do the different call priority levels mean?",
      answer: "Call priority levels indicate the urgency of customer issues. Critical: Requires immediate attention, potentially service impacting. High: Important issue requiring prompt resolution. Medium: Standard issue with no immediate business impact. Low: Minor issues that can be addressed in due course."
    },
    {
      question: "How do I schedule a follow-up call?",
      answer: "After completing a call, use the 'Schedule Follow-up' option in the call wrap-up screen. Select a date and time, add any notes about the follow-up reason, and assign it to yourself or another agent."
    },
    {
      question: "How can I view my call history?",
      answer: "To view your call history, navigate to the 'Call History' section in the main navigation sidebar. You can filter calls by date range, call type, or search for specific customer information."
    },
    {
      question: "What should I do if the system is not responding?",
      answer: "If the system is not responding, first try refreshing your browser. If the issue persists, check the system status page for any ongoing maintenance or outages. If there are no reported issues, contact the IT support team via the helpdesk portal or emergency support line."
    }
  ];

  return (
    <SidebarProvider>
      <div className="flex flex-col h-screen w-full">
        <Header />
        <div className="flex flex-1 overflow-hidden">
          <Sidebar />
          <main className="flex-1 p-6 overflow-auto bg-callflow-background">
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-bold tracking-tight">Help & Support</h1>
                <p className="text-muted-foreground">
                  Find answers and get assistance
                </p>
              </div>
              
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input 
                  className="pl-10" 
                  placeholder="Search for help topics..." 
                />
              </div>
              
              <div className="grid gap-6 md:grid-cols-3">
                <Card className="hover:bg-accent/5 transition-colors cursor-pointer">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <FileText className="h-5 w-5 text-callflow-primary" />
                      Documentation
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Browse our comprehensive guides and documentation
                    </p>
                  </CardContent>
                  <CardFooter>
                    <Button variant="ghost" className="w-full justify-start p-0 text-sm text-callflow-primary">
                      View Documentation
                    </Button>
                  </CardFooter>
                </Card>
                
                <Card className="hover:bg-accent/5 transition-colors cursor-pointer">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Video className="h-5 w-5 text-callflow-primary" />
                      Video Tutorials
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Watch step-by-step video guides for common tasks
                    </p>
                  </CardContent>
                  <CardFooter>
                    <Button variant="ghost" className="w-full justify-start p-0 text-sm text-callflow-primary">
                      Watch Tutorials
                    </Button>
                  </CardFooter>
                </Card>
                
                <Card className="hover:bg-accent/5 transition-colors cursor-pointer">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <MessageSquare className="h-5 w-5 text-callflow-primary" />
                      Community Forum
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Connect with other users and share knowledge
                    </p>
                  </CardContent>
                  <CardFooter>
                    <Button variant="ghost" className="w-full justify-start p-0 text-sm text-callflow-primary">
                      Visit Forum
                    </Button>
                  </CardFooter>
                </Card>
              </div>
              
              <Card>
                <CardHeader>
                  <CardTitle>Frequently Asked Questions</CardTitle>
                  <CardDescription>
                    Quick answers to common questions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Accordion type="single" collapsible className="w-full">
                    {faqs.map((faq, index) => (
                      <AccordionItem key={index} value={`item-${index}`}>
                        <AccordionTrigger className="text-left">{faq.question}</AccordionTrigger>
                        <AccordionContent>{faq.answer}</AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Contact Support</CardTitle>
                  <CardDescription>
                    Get in touch with our support team
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-6 md:grid-cols-3">
                    <div className="flex flex-col items-center gap-2 text-center p-4 border rounded-md">
                      <Phone className="h-8 w-8 text-callflow-primary" />
                      <h3 className="font-medium">Phone Support</h3>
                      <p className="text-sm text-muted-foreground">
                        Call us for immediate assistance
                      </p>
                      <p className="font-medium">+49 800 123 4567</p>
                      <p className="text-xs text-muted-foreground">
                        Available 24/7
                      </p>
                    </div>
                    
                    <div className="flex flex-col items-center gap-2 text-center p-4 border rounded-md">
                      <Mail className="h-8 w-8 text-callflow-primary" />
                      <h3 className="font-medium">Email Support</h3>
                      <p className="text-sm text-muted-foreground">
                        Send us an email
                      </p>
                      <p className="font-medium">support@callflow.example</p>
                      <p className="text-xs text-muted-foreground">
                        Response within 24 hours
                      </p>
                    </div>
                    
                    <div className="flex flex-col items-center gap-2 text-center p-4 border rounded-md">
                      <MessageSquare className="h-8 w-8 text-callflow-primary" />
                      <h3 className="font-medium">Live Chat</h3>
                      <p className="text-sm text-muted-foreground">
                        Chat with a support agent
                      </p>
                      <Button size="sm" className="mt-2">
                        Start Chat
                      </Button>
                      <p className="text-xs text-muted-foreground">
                        Available 8:00 - 20:00 CET
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Help;
