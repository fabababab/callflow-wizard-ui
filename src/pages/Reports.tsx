
import React, { useState } from 'react';
import { BarChart3, LineChart, PieChart, Download, Calendar, FilterIcon } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SidebarProvider } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';

const Reports = () => {
  const [dateRange, setDateRange] = useState('This Week');
  
  return (
    <SidebarProvider>
      <div className="flex flex-col h-screen w-full">
        <Header />
        <div className="flex flex-1 overflow-hidden">
          <Sidebar />
          <main className="flex-1 p-6 overflow-auto bg-callflow-background">
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-bold tracking-tight">Reports</h1>
                  <p className="text-muted-foreground">
                    Analyze call center performance with detailed reports
                  </p>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button variant="outline" className="gap-2">
                    <Calendar size={16} />
                    {dateRange}
                  </Button>
                  <Button variant="outline" className="gap-2">
                    <FilterIcon size={16} />
                    Filter
                  </Button>
                  <Button variant="outline" className="gap-2">
                    <Download size={16} />
                    Export
                  </Button>
                </div>
              </div>
              
              <Tabs defaultValue="performance">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="performance">Performance</TabsTrigger>
                  <TabsTrigger value="volume">Call Volume</TabsTrigger>
                  <TabsTrigger value="quality">Quality</TabsTrigger>
                  <TabsTrigger value="agents">Agents</TabsTrigger>
                </TabsList>
                
                <TabsContent value="performance" className="space-y-4 mt-4">
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">
                          Avg. Handle Time
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">4m 32s</div>
                        <p className="text-xs text-callflow-success">
                          -15s from last week
                        </p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">
                          First Call Resolution
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">78%</div>
                        <p className="text-xs text-callflow-success">
                          +2% from last week
                        </p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">
                          Service Level
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">85%</div>
                        <p className="text-xs text-callflow-accent">
                          -1% from last week
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                  
                  <div className="grid gap-4 md:grid-cols-2">
                    <Card className="col-span-1 md:col-span-2">
                      <CardHeader>
                        <CardTitle>Performance Metrics</CardTitle>
                        <CardDescription>
                          Key performance indicators over time
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="h-[300px] w-full flex items-center justify-center">
                          <LineChart className="h-64 w-full text-callflow-muted-text" />
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
                
                <TabsContent value="volume" className="space-y-4 mt-4">
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">
                          Total Calls
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">1,248</div>
                        <p className="text-xs text-callflow-success">
                          +3% from last week
                        </p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">
                          Avg. Calls per Day
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">178</div>
                        <p className="text-xs text-callflow-success">
                          +5 calls from last week
                        </p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">
                          Peak Hour
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">10 AM</div>
                        <p className="text-xs text-muted-foreground">
                          42 calls per hour
                        </p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">
                          Abandoned Rate
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">4.2%</div>
                        <p className="text-xs text-callflow-success">
                          -0.5% from last week
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                  
                  <div className="grid gap-4 md:grid-cols-2">
                    <Card>
                      <CardHeader>
                        <CardTitle>Call Volume by Day</CardTitle>
                        <CardDescription>
                          Daily call distribution
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="h-[250px] w-full flex items-center justify-center">
                          <BarChart3 className="h-48 w-full text-callflow-muted-text" />
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader>
                        <CardTitle>Call Types</CardTitle>
                        <CardDescription>
                          Distribution by category
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="h-[250px] w-full flex items-center justify-center">
                          <PieChart className="h-48 w-full text-callflow-muted-text" />
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
                
                <TabsContent value="quality" className="mt-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Call Quality Metrics</CardTitle>
                      <CardDescription>
                        Detailed quality assurance metrics coming soon
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="h-[400px] flex items-center justify-center">
                      <div className="text-center p-6">
                        <h3 className="text-lg font-medium mb-2">Quality reports are being generated</h3>
                        <p className="text-muted-foreground">
                          This feature will be available in the next update.
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="agents" className="mt-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Agent Performance</CardTitle>
                      <CardDescription>
                        Detailed agent metrics coming soon
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="h-[400px] flex items-center justify-center">
                      <div className="text-center p-6">
                        <h3 className="text-lg font-medium mb-2">Agent reports are being generated</h3>
                        <p className="text-muted-foreground">
                          This feature will be available in the next update.
                        </p>
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

export default Reports;
