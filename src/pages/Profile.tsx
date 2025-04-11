
import React from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  User, 
  Mail, 
  Phone, 
  Building, 
  Briefcase, 
  Calendar, 
  Clock, 
  Shield
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';

const Profile = () => {
  return (
    <SidebarProvider>
      <div className="flex flex-col h-screen w-full">
        <Header />
        <div className="flex flex-1 overflow-hidden">
          <Sidebar />
          <main className="flex-1 p-6 overflow-auto bg-callflow-background">
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-bold tracking-tight">Profile</h1>
                <p className="text-muted-foreground">
                  Manage your account settings and preferences
                </p>
              </div>
              
              <div className="flex flex-col lg:flex-row gap-6">
                <Card className="lg:w-1/3">
                  <CardContent className="p-6 flex flex-col items-center space-y-4">
                    <Avatar className="h-24 w-24">
                      <AvatarImage src="" />
                      <AvatarFallback className="bg-callflow-primary text-white text-2xl">JS</AvatarFallback>
                    </Avatar>
                    <div className="text-center">
                      <h2 className="text-xl font-semibold">John Schmidt</h2>
                      <p className="text-muted-foreground">Senior Customer Support Agent</p>
                    </div>
                    <Button className="w-full" variant="outline">Change Photo</Button>
                    
                    <Separator className="my-2" />
                    
                    <div className="w-full space-y-3">
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span>john.schmidt@example.com</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span>+49 123 456 7890</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Building className="h-4 w-4 text-muted-foreground" />
                        <span>Berlin Office</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Briefcase className="h-4 w-4 text-muted-foreground" />
                        <span>Customer Support Department</span>
                      </div>
                    </div>
                    
                    <Separator className="my-2" />
                    
                    <div className="w-full space-y-3">
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>Joined: January 15, 2022</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>Shift: 9:00 AM - 5:00 PM</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Shield className="h-4 w-4 text-muted-foreground" />
                        <span>Access Level: Manager</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <div className="lg:w-2/3 space-y-6">
                  <Tabs defaultValue="personal">
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="personal">Personal Info</TabsTrigger>
                      <TabsTrigger value="security">Security</TabsTrigger>
                      <TabsTrigger value="preferences">Preferences</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="personal" className="space-y-4 pt-4">
                      <Card>
                        <CardHeader>
                          <CardTitle>Personal Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="firstname">First Name</Label>
                              <Input id="firstname" defaultValue="John" />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="lastname">Last Name</Label>
                              <Input id="lastname" defaultValue="Schmidt" />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="email">Email</Label>
                              <Input id="email" defaultValue="john.schmidt@example.com" />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="phone">Phone</Label>
                              <Input id="phone" defaultValue="+49 123 456 7890" />
                            </div>
                            <div className="space-y-2 md:col-span-2">
                              <Label htmlFor="address">Address</Label>
                              <Input id="address" defaultValue="123 Hauptstraße, Berlin" />
                            </div>
                          </div>
                          
                          <div className="flex justify-end">
                            <Button>Save Changes</Button>
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>
                    
                    <TabsContent value="security" className="space-y-4 pt-4">
                      <Card>
                        <CardHeader>
                          <CardTitle>Change Password</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="current-password">Current Password</Label>
                            <Input id="current-password" type="password" />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="new-password">New Password</Label>
                            <Input id="new-password" type="password" />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="confirm-password">Confirm New Password</Label>
                            <Input id="confirm-password" type="password" />
                          </div>
                          
                          <div className="flex justify-end">
                            <Button>Update Password</Button>
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>
                    
                    <TabsContent value="preferences" className="space-y-4 pt-4">
                      <Card>
                        <CardHeader>
                          <CardTitle>System Preferences</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          {/* Placeholder for preferences settings */}
                          <p className="text-muted-foreground">Interface and notification preferences would go here</p>
                          
                          <div className="flex justify-end">
                            <Button>Save Preferences</Button>
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>
                  </Tabs>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Profile;
