import { supabase } from "@/integrations/supabase/client";
import { v4 as uuidv4 } from "uuid";

// Create storage bucket if it doesn't exist
export async function ensureStorageBuckets() {
  // Check if evidence bucket exists
  const { data: evidenceBucket } = await supabase
    .storage
    .getBucket('claim-evidence');
  
  if (!evidenceBucket) {
    // Create the evidence bucket
    await supabase
      .storage
      .createBucket('claim-evidence', {
        public: false,
        fileSizeLimit: 10485760, // 10MB
      });
  }
  
  // Check if profile bucket exists
  const { data: profileBucket } = await supabase
    .storage
    .getBucket('profile-pictures');
  
  if (!profileBucket) {
    // Create the profile pictures bucket
    await supabase
      .storage
      .createBucket('profile-pictures', {
        public: true,
        fileSizeLimit: 5242880, // 5MB
      });
  }
}

export async function uploadClaimEvidence(file: File, userId: string): Promise<string | null> {
  try {
    // Ensure the bucket exists
    await ensureStorageBuckets();
    
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/${uuidv4()}.${fileExt}`;
    
    const { data, error } = await supabase
      .storage
      .from('claim-evidence')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });
    
    if (error) {
      console.error('Error uploading claim evidence:', error);
      return null;
    }
    
    // Get the public URL for the file
    const { data: urlData } = supabase
      .storage
      .from('claim-evidence')
      .getPublicUrl(data.path);
    
    return urlData.publicUrl;
  } catch (error) {
    console.error('Error uploading claim evidence:', error);
    return null;
  }
}

export async function uploadProfilePicture(file: File, userId: string): Promise<string | null> {
  try {
    // Ensure the bucket exists
    await ensureStorageBuckets();
    
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}.${fileExt}`;
    
    const { data, error } = await supabase
      .storage
      .from('profile-pictures')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: true // Replace if exists
      });
    
    if (error) {
      console.error('Error uploading profile picture:', error);
      return null;
    }
    
    // Get the public URL for the file
    const { data: urlData } = supabase
      .storage
      .from('profile-pictures')
      .getPublicUrl(data.path);
    
    return urlData.publicUrl;
  } catch (error) {
    console.error('Error uploading profile picture:', error);
    return null;
  }
}
