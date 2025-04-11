
import React from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const Settings = () => {
  return (
    <SidebarProvider>
      <div className="flex flex-col h-screen w-full">
        <Header />
        <div className="flex flex-1 overflow-hidden">
          <Sidebar />
          <main className="flex-1 p-6 overflow-auto bg-callflow-background">
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
                <p className="text-muted-foreground">
                  Manage application settings and configuration
                </p>
              </div>
              
              <Tabs defaultValue="general">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="general">General</TabsTrigger>
                  <TabsTrigger value="notifications">Notifications</TabsTrigger>
                  <TabsTrigger value="appearance">Appearance</TabsTrigger>
                  <TabsTrigger value="integrations">Integrations</TabsTrigger>
                </TabsList>
                
                <TabsContent value="general" className="space-y-4 pt-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>General Settings</CardTitle>
                      <CardDescription>
                        Configure basic application settings
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="space-y-4">
                        <h3 className="text-sm font-medium">Time & Date</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="timezone">Timezone</Label>
                            <Select defaultValue="europe-berlin">
                              <SelectTrigger>
                                <SelectValue placeholder="Select timezone" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="europe-berlin">Europe/Berlin</SelectItem>
                                <SelectItem value="europe-london">Europe/London</SelectItem>
                                <SelectItem value="america-newyork">America/New York</SelectItem>
                                <SelectItem value="asia-tokyo">Asia/Tokyo</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="dateformat">Date Format</Label>
                            <Select defaultValue="dd-mm-yyyy">
                              <SelectTrigger>
                                <SelectValue placeholder="Select date format" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="dd-mm-yyyy">DD-MM-YYYY</SelectItem>
                                <SelectItem value="mm-dd-yyyy">MM-DD-YYYY</SelectItem>
                                <SelectItem value="yyyy-mm-dd">YYYY-MM-DD</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>
                      
                      <Separator />
                      
                      <div className="space-y-4">
                        <h3 className="text-sm font-medium">Language & Region</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="language">Language</Label>
                            <Select defaultValue="german">
                              <SelectTrigger>
                                <SelectValue placeholder="Select language" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="german">German</SelectItem>
                                <SelectItem value="english">English</SelectItem>
                                <SelectItem value="french">French</SelectItem>
                                <SelectItem value="spanish">Spanish</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="currency">Currency</Label>
                            <Select defaultValue="eur">
                              <SelectTrigger>
                                <SelectValue placeholder="Select currency" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="eur">EUR (€)</SelectItem>
                                <SelectItem value="usd">USD ($)</SelectItem>
                                <SelectItem value="gbp">GBP (£)</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>
                      
                      <Separator />
                      
                      <div className="space-y-4">
                        <h3 className="text-sm font-medium">System Settings</h3>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <Label htmlFor="auto-logout" className="flex-1">Auto logout after inactivity</Label>
                            <div className="flex items-center gap-2">
                              <Input 
                                id="auto-logout" 
                                type="number" 
                                className="w-16" 
                                defaultValue="30" 
                              />
                              <span className="text-sm text-muted-foreground">minutes</span>
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <div>
                              <Label htmlFor="auto-save" className="flex items-center gap-2">
                                Enable auto-save
                              </Label>
                              <p className="text-sm text-muted-foreground">
                                Automatically save changes to forms and documents
                              </p>
                            </div>
                            <Switch id="auto-save" defaultChecked />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="notifications" className="space-y-4 pt-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Notification Settings</CardTitle>
                      <CardDescription>
                        Configure how you receive notifications
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="space-y-4">
                        <h3 className="text-sm font-medium">Email Notifications</h3>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <Label htmlFor="daily-summary">Daily summary</Label>
                              <p className="text-sm text-muted-foreground">
                                Receive a daily summary of your activities
                              </p>
                            </div>
                            <Switch id="daily-summary" defaultChecked />
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <div>
                              <Label htmlFor="high-priority">High priority cases</Label>
                              <p className="text-sm text-muted-foreground">
                                Get notified about high priority cases
                              </p>
                            </div>
                            <Switch id="high-priority" defaultChecked />
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <div>
                              <Label htmlFor="escalations">Escalations</Label>
                              <p className="text-sm text-muted-foreground">
                                Get notified when cases are escalated
                              </p>
                            </div>
                            <Switch id="escalations" defaultChecked />
                          </div>
                        </div>
                      </div>
                      
                      <Separator />
                      
                      <div className="space-y-4">
                        <h3 className="text-sm font-medium">In-App Notifications</h3>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <Label htmlFor="new-cases">New cases</Label>
                              <p className="text-sm text-muted-foreground">
                                Get notified when new cases are assigned to you
                              </p>
                            </div>
                            <Switch id="new-cases" defaultChecked />
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <div>
                              <Label htmlFor="mentions">Mentions</Label>
                              <p className="text-sm text-muted-foreground">
                                Get notified when you're mentioned in comments
                              </p>
                            </div>
                            <Switch id="mentions" defaultChecked />
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <div>
                              <Label htmlFor="updates">Case updates</Label>
                              <p className="text-sm text-muted-foreground">
                                Get notified about updates to your cases
                              </p>
                            </div>
                            <Switch id="updates" defaultChecked />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="appearance" className="space-y-4 pt-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Appearance</CardTitle>
                      <CardDescription>
                        Customize the look and feel of the application
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label>Theme</Label>
                          <div className="grid grid-cols-3 gap-2">
                            <Button variant="outline" className="justify-start">
                              Light
                            </Button>
                            <Button variant="outline" className="justify-start">
                              Dark
                            </Button>
                            <Button variant="outline" className="justify-start">
                              System
                            </Button>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <Label>Density</Label>
                          <div className="grid grid-cols-3 gap-2">
                            <Button variant="outline" className="justify-start">
                              Compact
                            </Button>
                            <Button variant="outline" className="justify-start">
                              Comfortable
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="integrations" className="space-y-4 pt-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Integrations</CardTitle>
                      <CardDescription>
                        Manage third-party service integrations
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <p className="text-muted-foreground">Connect with external services to enhance functionality</p>
                        
                        <div className="grid gap-4">
                          <div className="flex items-center justify-between p-2 border rounded-md">
                            <div className="space-y-0.5">
                              <h4 className="text-sm font-medium">CRM System</h4>
                              <p className="text-xs text-muted-foreground">Connect to your CRM system</p>
                            </div>
                            <Button variant="outline">Configure</Button>
                          </div>
                          
                          <div className="flex items-center justify-between p-2 border rounded-md">
                            <div className="space-y-0.5">
                              <h4 className="text-sm font-medium">Email Service</h4>
                              <p className="text-xs text-muted-foreground">Connect your email provider</p>
                            </div>
                            <Button variant="outline">Configure</Button>
                          </div>
                          
                          <div className="flex items-center justify-between p-2 border rounded-md">
                            <div className="space-y-0.5">
                              <h4 className="text-sm font-medium">Calendar</h4>
                              <p className="text-xs text-muted-foreground">Sync with your calendar</p>
                            </div>
                            <Button variant="outline">Configure</Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Settings;
