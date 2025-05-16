"use client";

import React from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProfileSettings from "@/components/settings/ProfileSettings";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bell, Settings2, User } from "lucide-react";
import PreferencesSettings from "@/components/settings/PreferencesSettings";
import NotificationSettings from "@/components/settings/NotificationSettings";

export default function SettingsPage() {
  return (
      <div className="min-h-screen bg-iris-dark">
        <Navbar />
        <main className="container mx-auto px-4 py-20">
          <div className="space-y-8">
            <h1 className="text-3xl font-orbitron font-bold text-white mt-4 mb-8">Account Settings</h1>
            
            <Tabs defaultValue="profile" className="w-full">
              <TabsList className="bg-iris-darker mb-6 p-1">
                <TabsTrigger value="profile" className="flex items-center gap-2 py-2">
                  <User className="h-4 w-4" />
                  <span>Profile</span>
                </TabsTrigger>
                <TabsTrigger value="preferences" className="flex items-center gap-2 py-2">
                  <Settings2 className="h-4 w-4" />
                  <span>Preferences</span>
                </TabsTrigger>
                <TabsTrigger value="notifications" className="flex items-center gap-2 py-2">
                  <Bell className="h-4 w-4" />
                  <span>Notifications</span>
                </TabsTrigger>
              </TabsList>
              
              <div className="mt-6">
                <TabsContent value="profile">
                  <ProfileSettings />
                </TabsContent>
                
                <TabsContent value="preferences">
                  <PreferencesSettings />
                </TabsContent>
                
                <TabsContent value="notifications">
                  <NotificationSettings />
                </TabsContent>
              </div>
            </Tabs>
          </div>
        </main>
        <Footer />
    </div>
  );
}
