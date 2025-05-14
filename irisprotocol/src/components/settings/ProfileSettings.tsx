
import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Camera } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";

const ProfileSettings: React.FC = () => {
  const { user, profile, refreshProfile } = useAuth();
  const [displayName, setDisplayName] = useState(profile?.display_name || "");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(profile?.avatar_url || null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const file = e.target.files[0];
    setAvatarFile(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;
    setIsLoading(true);
    
    try {
      let avatarUrl = profile?.avatar_url;
      
      // Upload avatar if changed
      if (avatarFile) {
        // First make sure storage bucket exists
        const { data: bucketData, error: bucketError } = await supabase.storage.getBucket('avatars');
        
        if (bucketError && bucketError.message.includes('does not exist')) {
          await supabase.storage.createBucket('avatars', {
            public: true,
            fileSizeLimit: 1024 * 1024 * 2, // 2MB
          });
        }
        
        // Upload the file
        const fileExt = avatarFile.name.split('.').pop();
        const fileName = `${user.id}-${Math.random().toString(36).substring(2)}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(fileName, avatarFile);
          
        if (uploadError) throw uploadError;
        
        // Get public URL
        const { data: urlData } = supabase.storage
          .from('avatars')
          .getPublicUrl(fileName);
          
        avatarUrl = urlData.publicUrl;
      }
      
      // Update profile
      const { error } = await supabase
        .from('profiles')
        .update({
          display_name: displayName,
          avatar_url: avatarUrl,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);
        
      if (error) throw error;
      
      await refreshProfile();
      
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error updating profile",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="glass-card border-none shadow-lg">
      <form onSubmit={handleSubmit}>
        <CardHeader>
          <CardTitle className="text-white text-2xl">Profile Settings</CardTitle>
          <CardDescription className="text-muted-foreground">
            Manage your personal information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-8">
            <div className="relative group">
              <div className="h-24 w-24 rounded-full overflow-hidden bg-iris-darker/50 ring-2 ring-iris-purple/30 group-hover:ring-iris-purple/60 transition-all">
                {avatarPreview ? (
                  <img 
                    src={avatarPreview} 
                    alt="Avatar preview" 
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center bg-iris-darker text-muted-foreground">
                    <Camera size={32} />
                  </div>
                )}
              </div>
              <label 
                htmlFor="avatar" 
                className="absolute bottom-0 right-0 p-1.5 rounded-full bg-iris-purple text-white cursor-pointer hover:bg-iris-purple-light transition-colors"
              >
                <Camera size={16} />
                <Input 
                  id="avatar" 
                  type="file" 
                  accept="image/*" 
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            </div>
            
            <div className="space-y-6 flex-1 w-full">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-muted-foreground">Email Address</Label>
                <Input 
                  id="email" 
                  value={user?.email || ""} 
                  disabled 
                  className="bg-iris-darker/50 border-iris-purple/20 text-muted-foreground"
                />
                <p className="text-xs text-muted-foreground mt-1">Your email address cannot be changed</p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="displayName" className="text-sm font-medium">Display Name</Label>
                <Input 
                  id="displayName" 
                  value={displayName} 
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="How you want to be known across IRIS"
                  className="border-iris-purple/20 focus:border-iris-purple/50"
                />
              </div>
            </div>
          </div>
          
          <Separator className="bg-iris-purple/20" />
          
          <div className="space-y-2">
            <h3 className="text-lg font-medium">Account Security</h3>
            <p className="text-sm text-muted-foreground">
              Manage your account security settings
            </p>
            <div className="pt-4">
              <Button 
                type="button" 
                variant="outline"
                className="border-iris-purple/20 hover:border-iris-purple/40 hover:bg-iris-purple/5"
              >
                Change Password
              </Button>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            type="submit" 
            className="neo-button ml-auto" 
            disabled={isLoading}
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Save Changes
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default ProfileSettings;
