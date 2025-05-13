
import React, { useState } from 'react';
import { useNotifications, NotificationType } from "@/contexts/NotificationsContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";
import { AlertCircle, CheckCircle, Info, AlertTriangle, X, CheckCheck } from "lucide-react";
import { Separator } from "@/components/ui/separator";

const Notifications = () => {
  const { notifications, markAsRead, markAllAsRead, removeNotification, clearAll } = useNotifications();
  const [activeTab, setActiveTab] = useState<string>("all");
  
  // Filter notifications based on active tab
  const filteredNotifications = notifications.filter(notification => {
    if (activeTab === "all") return true;
    return notification.type === activeTab;
  });
  
  const getIconForType = (type: NotificationType) => {
    switch (type) {
      case "error":
        return <AlertCircle className="text-red-500" size={20} />;
      case "warning":
        return <AlertTriangle className="text-amber-500" size={20} />;
      case "success":
        return <CheckCircle className="text-green-500" size={20} />;
      case "info":
      default:
        return <Info className="text-blue-500" size={20} />;
    }
  };
  
  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Notifications</h1>
        <div className="space-x-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={markAllAsRead}
            disabled={notifications.every(n => n.read)}
          >
            <CheckCheck size={16} className="mr-2" />
            Mark all as read
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={clearAll}
            disabled={notifications.length === 0}
          >
            Clear all
          </Button>
        </div>
      </div>
      
      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="info">Info</TabsTrigger>
          <TabsTrigger value="success">Success</TabsTrigger>
          <TabsTrigger value="warning">Warning</TabsTrigger>
          <TabsTrigger value="error">Error</TabsTrigger>
        </TabsList>
        
        <TabsContent value={activeTab}>
          <Card>
            <CardHeader>
              <CardTitle>
                {filteredNotifications.length} 
                {activeTab !== "all" ? ` ${activeTab}` : ""} notification
                {filteredNotifications.length !== 1 ? "s" : ""}
              </CardTitle>
              <CardDescription>
                {filteredNotifications.length > 0 
                  ? "All system notifications and messages are stored here"
                  : "No notifications to display"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {filteredNotifications.length === 0 && (
                <div className="text-center py-10 text-muted-foreground">
                  No notifications to display
                </div>
              )}
              
              {filteredNotifications.map(notification => (
                <div key={notification.id} className={`p-4 rounded-lg border ${notification.read ? 'bg-background' : 'bg-muted/20'}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5">
                        {getIconForType(notification.type)}
                      </div>
                      <div>
                        <div className="font-medium">{notification.title}</div>
                        <div className="text-sm text-muted-foreground">{notification.description}</div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {format(new Date(notification.timestamp), "MMM d, yyyy 'at' h:mm a")}
                        </div>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      {!notification.read && (
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="h-8 w-8 p-0" 
                          onClick={() => markAsRead(notification.id)}
                        >
                          <CheckCircle size={16} />
                          <span className="sr-only">Mark as read</span>
                        </Button>
                      )}
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="h-8 w-8 p-0"
                        onClick={() => removeNotification(notification.id)}
                      >
                        <X size={16} />
                        <span className="sr-only">Dismiss</span>
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Notifications;
