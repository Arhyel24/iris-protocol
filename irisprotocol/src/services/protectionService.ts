import { getSupabaseClientWithJWT } from "@/integrations/supabase/createClient";
import { getUser } from "@civic/auth-web3/nextjs";


export interface ProtectionSetting {
  id: string;
  user_id: string;
  token_symbol: string;
  risk_threshold: number;
  is_protected: boolean;
  auto_swap: boolean;
  created_at: string;
  updated_at: string;
}

export interface GlobalProtectionSetting {
  id: string;
  user_id: string;
  portfolio_threshold: number;
  auto_swap: boolean;
  notifications: boolean;
  created_at: string;
  updated_at: string;
}

export async function getUserProtectionSettings(tokenSymbol?: string) {
  const supabase = await getSupabaseClientWithJWT();
      
  let query = supabase
    .from('protection_settings')
    .select('*');
    
  if (tokenSymbol) {
    query = query.eq("token_symbol", tokenSymbol);
  }
    
  const { data, error } = await query.order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching protection settings:", error);
    return { error };
  }
  
  return { data };
}

export async function getGlobalProtectionSettings() {
  const supabase = await getSupabaseClientWithJWT();
      
  const { data, error } = await supabase
    .from('global_protection_settings')
    .select('*')
    .single();

  if (error) {
    if (error.code !== 'PGRST116') { // No rows returned error
      console.error("Error fetching global protection settings:", error);
    }
    return { error };
  }
  
  return { data };
}

export async function updateTokenProtection(settingId: string, updates: {
  risk_threshold?: number;
  is_protected?: boolean;
}) {
  const supabase = await getSupabaseClientWithJWT();
      
  const { data, error } = await supabase
    .from('protection_settings')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq("id", settingId)
    .select()
    .single();
  
  if (error) {
    console.error("Error updating token protection:", error);
    return { error };
  }
  
  return { data };
}

export async function updateGlobalProtection(updates: {
  portfolio_threshold?: number;
  auto_swap?: boolean;
  notifications?: boolean;
}) {
  // Get the current user
  const supabase = await getSupabaseClientWithJWT();
      
  const user = await getUser();
  
  if (!user) {
    return { error: { message: "You must be logged in" } };
  }
  
  // Check if there's an existing record
  const { data: existing } = await supabase
    .from('global_protection_settings')
    .select("id")
    .maybeSingle();
  
  let data;
  let error;
  
  if (existing) {
    // Update existing record
    const result = await supabase
      .from('global_protection_settings')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq("id", existing.id)
      .select()
      .single();
      
    data = result.data;
    error = result.error;
  } else {
    // Insert new record
    const result = await supabase
      .from('global_protection_settings')
      .insert({
        civic_id: user.id,
        portfolio_threshold: updates.portfolio_threshold || 50,
        auto_swap: updates.auto_swap !== undefined ? updates.auto_swap : true,
        notifications: updates.notifications !== undefined ? updates.notifications : true,
      })
      .select()
      .single();
      
    data = result.data;
    error = result.error;
  }
  
  if (error) {
    console.error("Error updating global protection settings:", error);
    return { error };
  }
  
  return { data };
}

export async function initializeProtectionSettings() {
  // Get the current user
  const supabase = await getSupabaseClientWithJWT();
      
  const user = await getUser();
  
  if (!user) {
    return { error: { message: "You must be logged in" } };
  }
  
  // Default tokens to protect
  const defaultTokens = [
    {
      symbol: "SOL",
      name: "Solana",
      risk_threshold: 50,
      is_protected: true
    },
    {
      symbol: "JTO",
      name: "Jito",
      risk_threshold: 60,
      is_protected: false
    },
    {
      symbol: "BONK",
      name: "Bonk",
      risk_threshold: 70,
      is_protected: false
    },
    {
      symbol: "PYTH",
      name: "Pyth Network",
      risk_threshold: 65,
      is_protected: false
    }
  ];
  
  // Check if settings already exist
  const { count } = await supabase
    .from('protection_settings')
    .select('*', { count: 'exact', head: true });
    
  // If settings already exist, don't recreate them
  if (count && count > 0) {
    return { data: null, message: "Protection settings already exist" };
  }
    
  // Create token-specific protection settings
  const tokenPromises = defaultTokens.map(token => 
    supabase
      .from('protection_settings')
      .insert({
        civic_id: user!.id,
        token_symbol: token.symbol,
        token_name: token.name,
        risk_threshold: token.risk_threshold,
        is_protected: token.is_protected
      })
  );
  
  // Create global protection settings
  const globalPromise = supabase
    .from('global_protection_settings')
    .insert({
      user_id: user.id,
      portfolio_threshold: 50,
      auto_swap: true,
      notifications: true
    });
    
  try {
    await Promise.all([...tokenPromises, globalPromise]);
    return { data: true, message: "Protection settings initialized" };
  } catch (error) {
    console.error("Error initializing protection settings:", error);
    return { error };
  }
}
