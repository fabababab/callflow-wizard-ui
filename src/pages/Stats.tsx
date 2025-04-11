
import React from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';

const Stats = () => {
  // Sample data for charts
  const callVolumeData = [
    { name: 'Mon', value: 124 },
    { name: 'Tue', value: 115 },
    { name: 'Wed', value: 147 },
    { name: 'Thu', value: 132 },
    { name: 'Fri', value: 142 },
    { name: 'Sat', value: 85 },
    { name: 'Sun', value: 65 }
  ];

  const callTypeData = [
    { name: 'Support', value: 540 },
    { name: 'Sales', value: 320 },
    { name: 'Complaints', value: 210 },
    { name: 'Technical', value: 170 }
  ];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  const performanceData = [
    { name: 'Avg Handle Time', current: 4.2, target: 5.0 },
    { name: 'First Call Resolution', current: 72, target: 80 },
    { name: 'Customer Satisfaction', current: 88, target: 90 },
    { name: 'Transfer Rate', current: 12, target: 10 },
    { name: 'Abandon Rate', current: 5, target: 3 }
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
                <h1 className="text-2xl font-bold tracking-tight">Statistics</h1>
                <p className="text-muted-foreground">
                  Detailed analysis of call center performance metrics
                </p>
              </div>
              
              <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                <Card>
                  <CardHeader>
                    <CardTitle>Call Volume (Last 7 Days)</CardTitle>
                  </CardHeader>
                  <CardContent className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={callVolumeData}
                        margin={{
                          top: 20,
                          right: 10,
                          left: 10,
                          bottom: 5,
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="value" fill="#3182ce" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Call Types Distribution</CardTitle>
                  </CardHeader>
                  <CardContent className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={callTypeData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                          {callTypeData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
                
                <Card className="md:col-span-2 xl:col-span-1">
                  <CardHeader>
                    <CardTitle>Agent Performance Metrics</CardTitle>
                  </CardHeader>
                  <CardContent className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={performanceData}
                        layout="vertical"
                        margin={{
                          top: 20,
                          right: 30,
                          left: 20,
                          bottom: 5,
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" />
                        <YAxis dataKey="name" type="category" />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="current" fill="#82ca9d" name="Current" />
                        <Bar dataKey="target" fill="#8884d8" name="Target" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Stats;
