
import React, { useState, useEffect } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
  CardDescription,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Loader2, Moon, Sun, Monitor } from "lucide-react";
import { getUserPreferences, updateUserPreferences, AVAILABLE_LANGUAGES, AVAILABLE_TIMEZONES, ACCENT_COLORS, UserPreferences } from "@/services/preferencesService";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

const PreferencesSettings: React.FC = () => {
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

  if (isLoading) {
    return (
      <Card className="glass-card border-none shadow-lg">
        <CardHeader>
          <CardTitle className="text-white text-2xl">Preferences</CardTitle>
          <CardDescription>Loading your preferences...</CardDescription>
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
          <CardTitle className="text-white text-2xl">Preferences</CardTitle>
          <CardDescription>
            Customize your experience on IRIS
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-8">
          {/* Appearance Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Appearance</h3>
            
            <div className="space-y-6 pt-2">
              <div className="space-y-3">
                <Label htmlFor="theme">Theme Mode</Label>
                <ToggleGroup 
                  type="single" 
                  value={preferences.theme_mode}
                  onValueChange={(value) => {
                    if (value) setPreferences({...preferences, theme_mode: value as 'light' | 'dark' | 'system'});
                  }}
                  className="justify-start"
                >
                  <ToggleGroupItem value="light" className="gap-2 data-[state=on]:bg-iris-purple/20">
                    <Sun className="h-4 w-4" />
                    Light
                  </ToggleGroupItem>
                  <ToggleGroupItem value="dark" className="gap-2 data-[state=on]:bg-iris-purple/20">
                    <Moon className="h-4 w-4" />
                    Dark
                  </ToggleGroupItem>
                  <ToggleGroupItem value="system" className="gap-2 data-[state=on]:bg-iris-purple/20">
                    <Monitor className="h-4 w-4" />
                    System
                  </ToggleGroupItem>
                </ToggleGroup>
              </div>
              
              <div className="space-y-3">
                <Label htmlFor="accentColor">Accent Color</Label>
                <Select
                  value={preferences.accent_color}
                  onValueChange={(value) => setPreferences({...preferences, accent_color: value})}
                >
                  <SelectTrigger className="w-full md:w-72 border-iris-purple/20">
                    <SelectValue placeholder="Select accent color" />
                  </SelectTrigger>
                  <SelectContent>
                    {ACCENT_COLORS.map((color) => (
                      <SelectItem key={color.value} value={color.value}>{color.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="reduce_animations" className="block">Reduce Animations</Label>
                  <p className="text-sm text-muted-foreground">
                    Minimize motion effects throughout the interface
                  </p>
                </div>
                <Switch
                  id="reduce_animations"
                  checked={preferences.reduce_animations}
                  onCheckedChange={(checked) => setPreferences({...preferences, reduce_animations: checked})}
                />
              </div>
            </div>
          </div>
          
          <Separator className="bg-iris-purple/20" />
          
          {/* Regional Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Regional Settings</h3>
            
            <div className="space-y-6 pt-2">
              <div className="space-y-3">
                <Label htmlFor="language">Language</Label>
                <Select
                  value={preferences.language}
                  onValueChange={(value) => setPreferences({...preferences, language: value})}
                >
                  <SelectTrigger className="w-full md:w-72 border-iris-purple/20">
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    {AVAILABLE_LANGUAGES.map((lang) => (
                      <SelectItem key={lang.code} value={lang.code}>{lang.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-3">
                <Label htmlFor="timezone">Timezone</Label>
                <Select
                  value={preferences.timezone}
                  onValueChange={(value) => setPreferences({...preferences, timezone: value})}
                >
                  <SelectTrigger className="w-full md:w-72 border-iris-purple/20">
                    <SelectValue placeholder="Select timezone" />
                  </SelectTrigger>
                  <SelectContent>
                    {AVAILABLE_TIMEZONES.map((tz) => (
                      <SelectItem key={tz.code} value={tz.code}>{tz.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-1">
                  All times and dates will be displayed in this timezone
                </p>
              </div>
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
            Save Preferences
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default PreferencesSettings;
