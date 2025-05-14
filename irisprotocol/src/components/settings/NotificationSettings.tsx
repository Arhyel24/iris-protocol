
import React, { useState, useEffect } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Bell, Mail, AlertTriangle, ShieldCheck, CreditCard, Info } from "lucide-react";
import { getUserPreferences, updateUserPreferences, UserPreferences } from "@/services/preferencesService";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";

const NotificationSettings: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [preferences, setPreferences] = useState<UserPreferences>({
    theme_mode: 'system',
    accent_color: 'default',
    reduce_animations: false,
    email_notifications: true,
    push_notifications: true,
    transaction_notifications: true,
    marketing_notifications: false,
    risk_alert_notifications: true,
    claim_status_notifications: true,
    language: 'en',
    timezone: 'UTC',
  });

  useEffect(() => {
    const loadPreferences = async () => {
      setIsLoading(true);
      const userPrefs = await getUserPreferences();
      if (userPrefs) {
        setPreferences(userPrefs);
      }
      setIsLoading(false);
    };

    loadPreferences();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    await updateUserPreferences(preferences);
    
    setIsSaving(false);
  };

  const NotificationItem = ({
    title,
    description,
    icon: Icon,
    checked,
    onChange,
  }: {
    title: string;
    description: string;
    icon: React.ElementType;
    checked: boolean;
    onChange: (checked: boolean) => void;
  }) => (
    <div className="flex items-center justify-between space-x-4 py-4">
      <div className="flex items-start space-x-4">
        <div className="p-2 rounded-full bg-iris-purple/10 text-iris-purple">
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <h4 className="font-medium">{title}</h4>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );

  if (isLoading) {
    return (
      <Card className="glass-card border-none shadow-lg">
        <CardHeader>
          <CardTitle className="text-white text-2xl">Notification Settings</CardTitle>
          <CardDescription>Loading your notification preferences...</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center py-10">
          <Loader2 className="h-8 w-8 animate-spin text-iris-purple" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-card border-none shadow-lg">
      <form onSubmit={handleSubmit}>
        <CardHeader>
          <CardTitle className="text-white text-2xl">Notification Settings</CardTitle>
          <CardDescription>
            Control how and when IRIS notifies you
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-8">
          {/* Notification Channels */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Notification Channels</h3>
            
            <div className="space-y-4 pt-2">
              <div className="flex items-center justify-between space-x-4 py-4">
                <div className="flex items-start space-x-4">
                  <div className="p-2 rounded-full bg-iris-purple/10 text-iris-purple">
                    <Mail className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-medium">Email Notifications</h4>
                    <p className="text-sm text-muted-foreground">Receive important updates via email</p>
                  </div>
                </div>
                <Switch
                  checked={preferences.email_notifications}
                  onCheckedChange={(checked) => setPreferences({...preferences, email_notifications: checked})}
                />
              </div>
              
              <div className="flex items-center justify-between space-x-4 py-4">
                <div className="flex items-start space-x-4">
                  <div className="p-2 rounded-full bg-iris-purple/10 text-iris-purple">
                    <Bell className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-medium">Push Notifications</h4>
                    <p className="text-sm text-muted-foreground">Receive real-time alerts in your browser</p>
                  </div>
                </div>
                <Switch
                  checked={preferences.push_notifications}
                  onCheckedChange={(checked) => setPreferences({...preferences, push_notifications: checked})}
                />
              </div>
            </div>
          </div>
          
          <Separator className="bg-iris-purple/20" />
          
          {/* Notification Types */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">What to notify me about</h3>
            
            <div className="space-y-2 pt-2">
              <NotificationItem
                title="Risk Alerts"
                description="Get notified when tokens in your portfolio experience high risk"
                icon={AlertTriangle}
                checked={preferences.risk_alert_notifications}
                onChange={(checked) => setPreferences({...preferences, risk_alert_notifications: checked})}
              />
              
              <NotificationItem
                title="Transaction Updates"
                description="Notifications about swaps, transfers, and other wallet activities"
                icon={CreditCard}
                checked={preferences.transaction_notifications}
                onChange={(checked) => setPreferences({...preferences, transaction_notifications: checked})}
              />
              
              <NotificationItem
                title="Claim Status Changes"
                description="Updates when your insurance claims change status"
                icon={ShieldCheck}
                checked={preferences.claim_status_notifications}
                onChange={(checked) => setPreferences({...preferences, claim_status_notifications: checked})}
              />
              
              <NotificationItem
                title="Marketing & Announcements"
                description="News about IRIS features, updates, and promotions"
                icon={Info}
                checked={preferences.marketing_notifications}
                onChange={(checked) => setPreferences({...preferences, marketing_notifications: checked})}
              />
            </div>
          </div>
        </CardContent>
        
        <CardFooter>
          <Button 
            type="submit" 
            className="neo-button ml-auto" 
            disabled={isSaving}
          >
            {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Save Notification Settings
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default NotificationSettings;
