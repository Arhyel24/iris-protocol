import { getSupabaseClientWithJWT } from "@/integrations/supabase/createClient";
import { getUser } from "@civic/auth-web3/nextjs";



export interface Claim {
  id: string;
  claim_number: string;
  amount: number;
  reason: string;
  description: string | null;
  status: "pending" | "approved" | "rejected" | "cancelled";
  transaction_hash: string | null;
  created_at: string;
  updated_at: string;
  affected_assets: string[];
  insurance_id: string | null;
  wallet_id: string;
  evidence_url?: string | null;
}

export async function getUserClaims() {
  const supabase = await getSupabaseClientWithJWT()

  const { data, error } = await supabase
    .from("claims")
    .select("*, insurance_policies(tier), wallets(name, address)")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching claims:", error);
    return { error };
  }
  
  return { data };
}

export async function getActiveClaim() {
  const supabase = await getSupabaseClientWithJWT()
  
  const { data, error } = await supabase
    .from("claims")
    .select("*, insurance_policies(tier), wallets(name, address)")
    .eq("status", "pending")
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (error) {
    if (error.code !== 'PGRST116') { // No rows returned error
      console.error("Error fetching active claim:", error);
    }
    return { error };
  }
  
  return { data };
}

export async function createClaim(claimData: {
  wallet_id: string;
  insurance_id?: string;
  amount: number;
  reason: string;
  description?: string;
  transaction_hash?: string;
  affected_assets: string[];
  evidence_url?: string | null;
}) {
  const supabase = await getSupabaseClientWithJWT();
  const user = await getUser();

  if (!user) {
    return { error: { message: "You must be logged in to create a claim" } };
  }

  const { data, error } = await supabase
    .from("claims")
    .insert({
      user_id: user.id,
      wallet_id: claimData.wallet_id,
      insurance_id: claimData.insurance_id || null,
      amount: claimData.amount,
      reason: claimData.reason,
      description: claimData.description || null,
      transaction_hash: claimData.transaction_hash || null,
      status: "pending",
      affected_assets: claimData.affected_assets,
      evidence_url: claimData.evidence_url || null
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating claim:", error);
    return { error };
  }

  const { error: notificationError } = await supabase
    .from("notifications")
    .insert({
      user_id: user.id,
      title: "Claim Submitted",
      message: `Your claim for $${claimData.amount.toLocaleString()} has been submitted and is pending review.`,
      type: "claim",
      action_url: "/claim"
    });

  if (notificationError) {
    console.error("Error creating notification:", notificationError);
  }

  return { data };
}

export async function updateClaimStatus(claimId: string, status: "pending" | "approved" | "rejected" | "cancelled") {
  const supabase = await getSupabaseClientWithJWT();
  const user = await getUser();

  if (!user) {
    return { error: { message: "You must be logged in to update a claim" } };
  }

  const { data, error } = await supabase
    .from("claims")
    .update({
      status: status,
      updated_at: new Date().toISOString()
    })
    .eq("id", claimId)
    .select()
    .single();

  if (error) {
    console.error("Error updating claim status:", error);
    return { error };
  }

  let title = "Claim Updated";
  let message = `Your claim status has been updated to ${status}.`;

  if (status === "cancelled") {
    title = "Claim Cancelled";
    message = "You have cancelled your claim.";
  }

  const { error: notificationError } = await supabase
    .from("notifications")
    .insert({
      civic_id: user.id,
      title: title,
      message: message,
      type: "claim",
      action_url: "/claim"
    });

  if (notificationError) {
    console.error("Error creating notification:", notificationError);
  }

  return { data };
}


export async function cancelClaim(claimId: string) {
  return updateClaimStatus(claimId, "cancelled");
}

export async function hasActiveInsurance(walletId: string): Promise<boolean> {
  const supabase = await getSupabaseClientWithJWT()
  
  const { data, error } = await supabase
    .from("insurance_policies")
    .select("id")
    .eq("wallet_id", walletId)
    .eq("status", "active")
    .single();
  
  if (error || !data) {
    return false;
  }
  
  return true;
}
