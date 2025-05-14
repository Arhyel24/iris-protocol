"use client"


import React, { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";

interface Notification {
  id: string;
  title: string;
  message: string;
  created_at: string;
  read: boolean;
  type: string;
  action_url: string | null;
}

export default function Notifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<'all' | 'unread' | 'read'>('all');
  const { toast } = useToast();

  useEffect(() => {
    fetchNotifications();
  }, [activeFilter]);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (activeFilter === 'unread') {
        query = query.eq('read', false);
      } else if (activeFilter === 'read') {
        query = query.eq('read', true);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      setNotifications(data || []);
    } catch (err) {
      console.error('Error fetching notifications:', err);
      toast({
        title: "Error",
        description: "Failed to load notifications",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  
  const markAsRead = async (id: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', id);
        
      if (error) throw error;
      
      // Update local state
      setNotifications(prev => 
        prev.map(n => n.id === id ? {...n, read: true} : n)
      );
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };
  
  const markAllAsRead = async () => {
    try {
      const unreadIds = notifications.filter(n => !n.read).map(n => n.id);
      
      if (unreadIds.length === 0) return;
      
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .in('id', unreadIds);
        
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "All notifications marked as read"
      });
      
      // Update local state
      setNotifications(prev => 
        prev.map(n => ({...n, read: true}))
      );
      
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
      toast({
        title: "Error",
        description: "Failed to mark notifications as read",
        variant: "destructive"
      });
    }
  };
  
  const handleNotificationClick = async (notification: Notification) => {
    // If the notification is not read, mark it as read
    if (!notification.read) {
      await markAsRead(notification.id);
    }
    
    // Navigate to action URL if present
    if (notification.action_url) {
      window.location.href = notification.action_url;
    }
  };
  
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'welcome':
        return "🎉";
      case 'insurancePurchase':
      case 'insuranceUpgrade':
        return "🛡️";
      case 'insuranceCancel':
        return "⚠️";
      case 'claimSubmitted':
      case 'claimUpdate':
        return "📋";
      case 'protectionDisabled':
        return "🔒";
      default:
        return "📣";
    }
  };
  
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM d, yyyy h:mm a');
    } catch (e) {
      return "Unknown date";
    }
  };
  
  const getFilteredNotifications = () => {
    return notifications;
  };
  
  const filteredNotifications = getFilteredNotifications();
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
      <div className="min-h-screen bg-iris-dark">
        <Navbar />
        <main className="container mx-auto px-4 py-20">
          <motion.div
            className="space-y-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-orbitron font-bold text-white">Notifications</h1>
              {unreadCount > 0 && (
                <Button 
                  variant="outline" 
                  onClick={markAllAsRead}
                  className="border-iris-purple/30 hover:bg-iris-purple/10"
                >
                  Mark all as read
                </Button>
              )}
            </div>
            
            <Tabs defaultValue="all" onValueChange={(value) => setActiveFilter(value as any)}>
              <TabsList className="bg-iris-darker mb-6">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="unread">
                  Unread {unreadCount > 0 && `(${unreadCount})`}
                </TabsTrigger>
                <TabsTrigger value="read">Read</TabsTrigger>
              </TabsList>
              
              <TabsContent value="all" className="space-y-4">
                {renderNotifications(filteredNotifications)}
              </TabsContent>
              
              <TabsContent value="unread" className="space-y-4">
                {renderNotifications(filteredNotifications.filter(n => !n.read))}
              </TabsContent>
              
              <TabsContent value="read" className="space-y-4">
                {renderNotifications(filteredNotifications.filter(n => n.read))}
              </TabsContent>
            </Tabs>
          </motion.div>
        </main>
        <Footer />
      </div>
  );
  
  function renderNotifications(notifications: Notification[]) {
    if (loading) {
      return (
        <div className="flex flex-col gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-iris-darker p-6 rounded-lg animate-pulse">
              <div className="h-6 bg-slate-700 rounded w-1/3 mb-3"></div>
              <div className="h-4 bg-slate-700 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-slate-700 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      );
    }
    
    if (notifications.length === 0) {
      return (
        <div className="bg-iris-darker p-8 rounded-lg text-center">
          <p className="text-lg text-muted-foreground">No notifications found</p>
        </div>
      );
    }
    
    return notifications.map(notification => (
      <div 
        key={notification.id}
        onClick={() => handleNotificationClick(notification)}
        className={`bg-iris-darker p-6 rounded-lg border-l-4 transition-all cursor-pointer hover:bg-iris-purple/5 ${
          notification.read ? 'border-iris-purple/30' : 'border-iris-purple'
        }`}
      >
        <div className="flex items-start gap-4">
          <div className="text-3xl">{getNotificationIcon(notification.type)}</div>
          <div className="flex-1">
            <div className="flex justify-between items-start">
              <h3 className={`text-lg font-medium ${notification.read ? 'text-muted-foreground' : 'text-white'}`}>
                {notification.title}
              </h3>
              <span className="text-xs text-muted-foreground">
                {formatDate(notification.created_at)}
              </span>
            </div>
            <p className="text-sm mt-2 text-muted-foreground">
              {notification.message}
            </p>
            {notification.action_url && (
              <div className="mt-4">
                <Button size="sm" variant="link" className="text-iris-purple hover:text-iris-yellow p-0">
                  View details
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    ));
  }
};
