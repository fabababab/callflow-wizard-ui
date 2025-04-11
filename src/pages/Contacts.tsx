
import React from 'react';
import { User, Phone, Mail, Building, MapPin, Search, PlusCircle, Filter } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { SidebarProvider } from '@/components/ui/sidebar';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';

const Contacts = () => {
  const contacts = [
    {
      id: 1,
      name: 'Michael Schmidt',
      company: 'Tech Solutions GmbH',
      email: 'michael.schmidt@example.com',
      phone: '+49 123 456 7890',
      location: 'Berlin, Germany',
      lastContact: '2 days ago'
    },
    {
      id: 2,
      name: 'Anna Müller',
      company: 'Digital Services AG',
      email: 'anna.mueller@example.com',
      phone: '+49 234 567 8901',
      location: 'Munich, Germany',
      lastContact: '1 week ago'
    },
    {
      id: 3,
      name: 'Thomas Weber',
      company: 'Global Innovations',
      email: 'thomas.weber@example.com',
      phone: '+49 345 678 9012',
      location: 'Hamburg, Germany',
      lastContact: '3 days ago'
    },
    {
      id: 4,
      name: 'Julia Fischer',
      company: 'Smart Solutions KG',
      email: 'julia.fischer@example.com',
      phone: '+49 456 789 0123',
      location: 'Frankfurt, Germany',
      lastContact: 'Yesterday'
    },
    {
      id: 5,
      name: 'Leon Schneider',
      company: 'Future Tech GmbH',
      email: 'leon.schneider@example.com',
      phone: '+49 567 890 1234',
      location: 'Cologne, Germany',
      lastContact: '5 days ago'
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
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold tracking-tight">Contacts</h1>
                  <p className="text-muted-foreground">
                    Manage your customer contacts database
                  </p>
                </div>
                <Button className="gap-2">
                  <PlusCircle size={16} />
                  Add Contact
                </Button>
              </div>

              <div className="flex items-center gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input 
                    type="search" 
                    placeholder="Search contacts..." 
                    className="pl-8 bg-background"
                  />
                </div>
                <Button variant="outline" className="gap-2">
                  <Filter size={16} />
                  Filter
                </Button>
              </div>

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {contacts.map(contact => (
                  <Card key={contact.id} className="hover:bg-accent/5 transition-colors cursor-pointer">
                    <CardContent className="p-4">
                      <div className="flex gap-4">
                        <div className="bg-callflow-primary/10 w-12 h-12 rounded-full flex items-center justify-center text-callflow-primary shrink-0">
                          <User size={24} />
                        </div>
                        <div className="space-y-1 overflow-hidden">
                          <h3 className="font-medium truncate">{contact.name}</h3>
                          <div className="text-sm flex items-center gap-1 text-muted-foreground">
                            <Building size={14} />
                            <span className="truncate">{contact.company}</span>
                          </div>
                          <div className="text-sm flex items-center gap-1 text-muted-foreground">
                            <Phone size={14} />
                            <span>{contact.phone}</span>
                          </div>
                          <div className="text-sm flex items-center gap-1 text-muted-foreground">
                            <Mail size={14} />
                            <span className="truncate">{contact.email}</span>
                          </div>
                          <div className="text-sm flex items-center gap-1 text-muted-foreground">
                            <MapPin size={14} />
                            <span>{contact.location}</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Contacts;
