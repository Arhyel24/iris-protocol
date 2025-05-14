import { getSupabaseClientWithJWT } from "@/integrations/supabase/createClient";
import { getUser } from "@civic/auth-web3/nextjs";

export interface InsurancePolicy {
  id: string;
  civic_user: string;
  wallet_id: string;
  max_coverage: number;
  monthly_premium: number;
  created_at: string;
  expires_at: string;
  tier: string;
  status: string;
}

export interface PaymentRecord {
  id: string;
  civic_user: string;
  insurance_id: string | null;
  amount: number;
  payment_date: string;
  status: string;
  payment_method: string;
  duration_days: number;
  insurance_policies: {
    tier: string;
  } | null;
}

// Get active insurance policy for the current user
export const getActiveInsurancePolicy = async (): Promise<{ data: InsurancePolicy | null; error: any }> => {
  const supabase = await getSupabaseClientWithJWT();
  const user = await getUser();

  if (!user) {
    return { data: null, error: { message: "User not authenticated" } };
  }

  const { data, error } = await supabase
    .from('insurance_policies')
    .select()
    .eq('civic_user', user.id)
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  return { data, error };
};

// Get insurance policy by ID
export const getInsurancePolicyById = async (id: string): Promise<{ data: InsurancePolicy | null; error: any }> => {
  const supabase = await getSupabaseClientWithJWT();

  const { data, error } = await supabase
    .from('insurance_policies')
    .select()
    .eq('id', id)
    .single();

  return { data, error };
};

// Get insurance policy for a wallet
export const getInsuranceForWallet = async (walletId: string): Promise<{ data: InsurancePolicy | null; error: any }> => {
  const supabase = await getSupabaseClientWithJWT();

  const { data, error } = await supabase
    .from('insurance_policies')
    .select()
    .eq('wallet_id', walletId)
    .eq('status', 'active')
    .maybeSingle();

  return { data, error };
};

// Create a new insurance policy
export const createInsurancePolicy = async (
  policyData: {
    wallet_id: string;
    tier: "Basic" | "Pro" | "Premium";
    max_coverage: number;
    monthly_premium: number;
    expires_at: string;
  }
): Promise<{ data: any; error: any; actionType?: string }> => {
  const supabase = await getSupabaseClientWithJWT();
  const user = await getUser();

  if (!user) {
    return { data: null, error: { message: "User not authenticated" } };
  }

  // Check if there's an existing policy for this wallet
  const { data: existingPolicy } = await getInsuranceForWallet(policyData.wallet_id);

  let actionType = "new";

  // If there's an existing policy, we need to handle upgrade/downgrade
  if (existingPolicy) {
    await cancelInsurance(existingPolicy.id);

    const tierRank = { Basic: 1, Pro: 2, Premium: 3 };
    if (tierRank[policyData.tier] > tierRank[existingPolicy.tier as keyof typeof tierRank]) {
      actionType = "upgrade";
    } else if (tierRank[policyData.tier] < tierRank[existingPolicy.tier as keyof typeof tierRank]) {
      actionType = "downgrade";
    }
  }

  const { data, error } = await supabase
    .from('insurance_policies')
    .insert({
      civic_user: user.id,
      wallet_id: policyData.wallet_id,
      max_coverage: policyData.max_coverage,
      monthly_premium: policyData.monthly_premium,
      expires_at: policyData.expires_at,
      tier: policyData.tier,
      status: 'active'
    })
    .select()
    .single();

  if (error) {
    return { data: null, error };
  }

  const paymentResult = await recordPayment(data.id, policyData.monthly_premium);

  return { data, error: paymentResult.error, actionType };
};


// Cancel an existing insurance policy
export const cancelInsurance = async (
  insuranceId: string
): Promise<{ data: any; error: any }> => {
  try {
    const supabase = await getSupabaseClientWithJWT()
      
    const { data, error } = await supabase
      .from('insurance_policies')
      .update({ 
        status: 'cancelled',
        updated_at: new Date().toISOString()
      })
      .eq('id', insuranceId)
      .select();
    
    return { data, error };
  } catch (error) {
    console.error("Error cancelling insurance:", error);
    return { data: null, error: { message: "Failed to cancel insurance" } };
  }
};

// Add this new function to handle cancelling existing insurance
export const cancelExistingInsurance = async (walletId: string): Promise<{ data: any; error: any }> => {
  try {
    // Find existing policies for this wallet
    const { data: existingPolicy, error: findError } = await getInsuranceForWallet(walletId);
    
    if (findError) {
      return { data: null, error: findError };
    }
    
    // If there is an existing policy, cancel it
    if (existingPolicy) {
      return await cancelInsurance(existingPolicy.id);
    }
    
    // If no existing policy, just return success
    return { data: null, error: null };
  } catch (error) {
    console.error("Error cancelling existing insurance:", error);
    return { data: null, error: { message: "Failed to cancel existing insurance" } };
  }
};

// Upgrade an existing insurance policy
export const upgradeInsurance = async (
  insuranceId: string,
  newTier: "Basic" | "Pro" | "Premium"
): Promise<{ data: any; error: any }> => {
  try {
    const supabase = await getSupabaseClientWithJWT()
      
    // Mark current policy as upgraded
    const { error: cancelError } = await supabase
      .from('insurance_policies')
      .update({ 
        status: 'upgraded',
        updated_at: new Date().toISOString()
      })
      .eq('id', insuranceId);
    
    if (cancelError) {
      return { data: null, error: cancelError };
    }
    
    // Get the old policy details for the new one
    const { data: oldPolicy, error: fetchError } = await supabase
      .from('insurance_policies')
      .select('user_id, wallet_id, max_coverage, monthly_premium')
      .eq('id', insuranceId)
      .single();
    
    if (fetchError || !oldPolicy) {
      return { data: null, error: fetchError };
    }
    
    // Define tier details
    const tierDetails = {
      Basic: {
        max_coverage: 5000,
        monthly_premium: 0.5
      },
      Pro: {
        max_coverage: 25000,
        monthly_premium: 1.5
      },
      Premium: {
        max_coverage: 100000,
        monthly_premium: 4.5
      }
    };
    
    const tierConfig = tierDetails[newTier];
    
    // Calculate expiry date (30 days from now)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);
    
    // Create new upgraded policy
    const { data: newPolicy, error: createError } = await supabase
      .from('insurance_policies')
      .insert({
        user_id: oldPolicy.user_id,
        wallet_id: oldPolicy.wallet_id,
        max_coverage: tierConfig.max_coverage,
        monthly_premium: tierConfig.monthly_premium,
        expires_at: expiresAt.toISOString(),
        tier: newTier,
        status: 'active'
      })
      .select()
      .single();
    
    if (createError) {
      return { data: null, error: createError };
    }
    
    // Record the payment for the upgrade
    const paymentResult = await recordPayment(newPolicy.id, tierConfig.monthly_premium);
    
    return { data: newPolicy, error: paymentResult.error };
  } catch (error) {
    console.error("Error upgrading insurance:", error);
    return { data: null, error: { message: "Failed to upgrade insurance" } };
  }
};

// Record a payment for an insurance policy
export const recordPayment = async (
  insuranceId: string,
  amount: number,
  paymentMethod: string = 'demo'
): Promise<{ data: any; error: any }> => {
  try {
    const supabase = await getSupabaseClientWithJWT()
  
    const user = await getUser();

  if (!user) {
    return { data: null, error: { message: "User not authenticated" } };
  }
    
    const { data, error } = await supabase
      .from('payment_history')
      .insert({
        civic_id: user.id,
        insurance_id: insuranceId,
        amount: amount,
        payment_method: paymentMethod,
        status: 'completed'
      })
      .select();
    
    return { data, error };
  } catch (error) {
    console.error("Error recording payment:", error);
    return { data: null, error: { message: "Failed to record payment" } };
  }
};

// Get payment history for a specific insurance policy or all policies if none specified
export const getPaymentHistory = async (insuranceId?: string): Promise<{ data: PaymentRecord[]; error: any }> => {
  const supabase = await getSupabaseClientWithJWT()
    
  const user = await getUser();

  if (!user) {
    return { data: [], error: { message: "User not authenticated" } };
  }

  let query = supabase
    .from('payment_history')
    .select(`
      *,
      insurance_policies (
        tier
      )
    `)
    .eq('civic_id', user.id)
    .order('payment_date', { ascending: false });
  
  if (insuranceId) {
    query = query.eq('insurance_id', insuranceId);
  }
  
  const { data, error } = await query;
  
  return { data: data || [], error };
};
