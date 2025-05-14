
import { toast } from "@/hooks/use-toast";
import { getSupabaseClientWithJWT } from "@/integrations/supabase/createClient";
import { getUser } from "@civic/auth-web3/nextjs";

export interface UserPreferences {
  id?: string;
  theme_mode: 'light' | 'dark' | 'system';
  accent_color: string;
  reduce_animations: boolean;
  email_notifications: boolean;
  push_notifications: boolean;
  transaction_notifications: boolean;
  marketing_notifications: boolean;
  risk_alert_notifications: boolean;
  claim_status_notifications: boolean;
  language: string;
  timezone: string;
}

export async function getUserPreferences(): Promise<UserPreferences | null> {
  try {
    const supabase = await getSupabaseClientWithJWT();
        
    const { data, error } = await supabase
      .from('user_preferences')
      .select('*')
      .single();
      
    if (error) {
      console.error("Error fetching user preferences:", error);
      return null;
    }
    
    return data as UserPreferences;
  } catch (error: any) {
    console.error("Error fetching user preferences:", error.message);
    return null;
  }
}

export async function updateUserPreferences(preferences: Partial<UserPreferences>): Promise<boolean> {
  try {
    const supabase = await getSupabaseClientWithJWT();
    
    const user = await getUser();
        
          if (!user) {
            return false
          }
    const { error } = await supabase
      .from('user_preferences')
      .update({
        ...preferences,
        updated_at: new Date().toISOString()
      })
      .eq('civic_id', user.id);
      
    if (error) {
      console.error("Error updating user preferences:", error);
      toast({
        title: "Error updating preferences",
        description: error.message,
        variant: "destructive"
      });
      return false;
    }
    
    toast({
      title: "Preferences updated",
      description: "Your preferences have been updated successfully."
    });
    
    return true;
  } catch (error: any) {
    console.error("Error updating user preferences:", error.message);
    toast({
      title: "Error updating preferences",
      description: error.message,
      variant: "destructive"
    });
    return false;
  }
}

export const AVAILABLE_LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'zh', name: 'Chinese' },
  { code: 'ja', name: 'Japanese' },
];

export const AVAILABLE_TIMEZONES = [
  { code: 'UTC', name: 'UTC' },
  { code: 'America/New_York', name: 'Eastern Time (US & Canada)' },
  { code: 'America/Chicago', name: 'Central Time (US & Canada)' },
  { code: 'America/Denver', name: 'Mountain Time (US & Canada)' },
  { code: 'America/Los_Angeles', name: 'Pacific Time (US & Canada)' },
  { code: 'Europe/London', name: 'London' },
  { code: 'Europe/Paris', name: 'Paris, Berlin, Rome, Madrid' },
  { code: 'Asia/Tokyo', name: 'Tokyo' },
  { code: 'Asia/Shanghai', name: 'Beijing, Shanghai' },
  { code: 'Australia/Sydney', name: 'Sydney' },
];

export const ACCENT_COLORS = [
  { name: 'Default (Purple)', value: 'default' },
  { name: 'Blue', value: 'blue' },
  { name: 'Green', value: 'green' },
  { name: 'Red', value: 'red' },
  { name: 'Orange', value: 'orange' },
  { name: 'Pink', value: 'pink' },
];
