import { getSupabaseClientWithJWT } from "@/integrations/supabase/createClient";
import { getUser } from "@civic/auth-web3/nextjs";


export interface NotificationData {
  type: 'welcome' | 'insurancePurchase' | 'insuranceUpgrade' | 'insuranceCancel' | 'claimSubmitted' | 'claimUpdate' | 'protectionDisabled' | 'protectionEnabled';
  data: any;
}

export async function sendNotification(email: string, notificationData: NotificationData) {
  try {
    const supabase = await getSupabaseClientWithJWT();
    const user = await getUser();
    
      if (!user) {
        return { error: { message: "You must be logged to use notifications" } };
      }
    
    // Create in-app notification first
    const notificationMessage = createNotificationMessage(notificationData);
    
    if (notificationMessage) {
      await storeNotification({
        civic_id: user.id,
        title: notificationMessage.title,
        message: notificationMessage.message,
        type: notificationData.type,
        action_url: notificationMessage.action_url
      });
    }
    
    // Then attempt to send email notification if email is provided
    if (email) {
      try {
        const { data, error } = await supabase.functions.invoke('send-notification', {
          body: { 
            ...notificationData,
            data: {
              ...notificationData.data,
              email
            }
          }
        });
        
        if (error) {
          console.error("Error sending email notification:", error);
          return { error, data: { in_app: true, email: false } };
        }
        
        return { data: { ...data, in_app: true } };
      } catch (error) {
        console.error("Error sending email notification:", error);
        return { data: { in_app: true, email: false } };
      }
    }
    
    return { data: { in_app: true, email: false } };
  } catch (error) {
    console.error("Error sending notification:", error);
    return { error };
  }
}

// Helper function to create notification messages based on type
function createNotificationMessage(notificationData: NotificationData) {
  const { type, data } = notificationData;
  
  switch (type) {
    case 'welcome':
      return {
        title: "Welcome to IRIS Protocol!",
        message: "Thank you for joining IRIS Protocol. Start protecting your assets now!",
        action_url: "/dashboard"
      };
      
    case 'insurancePurchase':
      return {
        title: "Insurance Purchase Successful",
        message: `Your ${data.tier} insurance with coverage of ${data.coverage} is now active.`,
        action_url: "/insurance"
      };
      
    case 'insuranceUpgrade':
      return {
        title: "Insurance Upgraded",
        message: `Your insurance has been upgraded from ${data.oldTier} to ${data.newTier}.`,
        action_url: "/insurance"
      };
      
    case 'insuranceCancel':
      return {
        title: "Insurance Canceled",
        message: `Your ${data.tier} insurance policy has been canceled.`,
        action_url: "/insurance"
      };
      
    case 'claimSubmitted':
      return {
        title: "Claim Submitted",
        message: `Your claim (#${data.claimId}) for ${data.amount} has been submitted.`,
        action_url: "/claim"
      };
      
    case 'claimUpdate':
      return {
        title: `Claim ${data.status === 'approved' ? 'Approved' : 'Rejected'}`,
        message: `Your claim (#${data.claimId}) for ${data.amount} has been ${data.status}.`,
        action_url: "/claim"
      };
      
    case 'protectionDisabled':
      return {
        title: "Protection Disabled",
        message: `Your protection settings for ${data.asset} have been disabled.`,
        action_url: "/protection"
      };
      
    case 'protectionEnabled':
      return {
        title: "Protection Enabled",
        message: `Your protection settings for ${data.asset} have been enabled.`,
        action_url: "/protection"
      };
      
    default:
      return null;
  }
}

// Helper function to store notification in the database
export async function storeNotification(notification: {
  title: string;
  message: string;
  type: string;
  action_url?: string;
  civic_id: string;
}) {
  const supabase = await getSupabaseClientWithJWT();
    
  const { data, error } = await supabase
    .from('notifications')
    .insert({
      ...notification,
      read: false,
      created_at: new Date().toISOString()
    })
    .select()
    .single();
    
  if (error) {
    console.error("Error storing notification:", error);
    return { error };
  }
  
  return { data };
}

// Fetch user notifications
export async function fetchNotifications(limit = 10, includeRead = true) {
  const supabase = await getSupabaseClientWithJWT();
    
  let query = supabase
    .from('notifications')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);
    
  if (!includeRead) {
    query = query.eq('read', false);
  }
    
  const { data, error } = await query;
  
  if (error) {
    console.error("Error fetching notifications:", error);
    return { error };
  }
  
  return { data };
}

// Mark notification as read
export async function markNotificationAsRead(notificationId: string) {
  const supabase = await getSupabaseClientWithJWT();
    
  const { data, error } = await supabase
    .from('notifications')
    .update({ read: true })
    .eq('id', notificationId)
    .select()
    .single();
    
  if (error) {
    console.error("Error marking notification as read:", error);
    return { error };
  }
  
  return { data };
}

// Mark all notifications as read
export async function markAllNotificationsAsRead() {
  const supabase = await getSupabaseClientWithJWT();
    
  const { data, error } = await supabase
    .from('notifications')
    .update({ read: true })
    .eq('read', false)
    .select();
    
  if (error) {
    console.error("Error marking all notifications as read:", error);
    return { error };
  }
  
  return { data };
}

// Count unread notifications
export async function countUnreadNotifications() {
  const supabase = await getSupabaseClientWithJWT();
    
  const { count, error } = await supabase
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('read', false);
    
  if (error) {
    console.error("Error counting unread notifications:", error);
    return 0;
  }
  
  return count || 0;
}
