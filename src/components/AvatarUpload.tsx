import { useState, useRef } from 'react';
import { Camera, User, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { getAvatarUrl, getInitials } from '@/lib/avatars';
import { toast } from 'sonner';

interface AvatarUploadProps {
  currentAvatar?: string | null;
  userName?: string;
  userGender?: 'male' | 'female' | 'non-binary' | 'prefer-not-to-say';
  onAvatarUpdate?: (avatarUrl: string) => void;
  size?: 'sm' | 'md' | 'lg';
  editable?: boolean;
}

export function AvatarUpload({ 
  currentAvatar, 
  userName, 
  userGender = 'prefer-not-to-say',
  onAvatarUpdate, 
  size = 'md',
  editable = true 
}: AvatarUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user, profile, updateProfile } = useAuth();





  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-16 w-16',
    lg: 'h-24 w-24'
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (max 1048487 bytes ≈ 1MB)
    if (file.size > 1048487) {
      toast.error(`Image size should be less than 1MB. Current size: ${Math.round(file.size / 1024)}KB`);
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Upload the file
    handleUpload(file);
  };

  const handleUpload = async (file: File) => {
    if (!user) return;

    setIsUploading(true);
    try {
      // Convert file to base64 for Firebase storage
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64String = e.target?.result as string;
        
        try {
          // Update profile with base64 avatar
          await updateProfile({ avatar: base64String });
          
          // Call callback
          onAvatarUpdate?.(base64String);
          
          toast.success('Avatar updated successfully!');
          setPreviewUrl(null);
        } catch (error) {
          console.error('Avatar upload failed:', error);
          toast.error('Failed to upload avatar');
          setPreviewUrl(null);
        } finally {
          setIsUploading(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Avatar upload failed:', error);
      toast.error('Failed to upload avatar');
      setPreviewUrl(null);
      setIsUploading(false);
    }
  };

  const handleRemoveAvatar = async () => {
    if (!user) return;

    try {
      // Update profile to remove avatar
      await updateProfile({ avatar: '' });
      
      // Call callback
      onAvatarUpdate?.('');
      
      toast.success('Avatar removed successfully!');
      setPreviewUrl(null);
    } catch (error) {
      console.error('Avatar removal failed:', error);
      toast.error('Failed to remove avatar');
    }
  };

  // Get the appropriate avatar URL based on user's avatar and gender
  const displayAvatar = previewUrl || getAvatarUrl(
    currentAvatar || (editable && profile?.avatar ? profile.avatar : null), 
    userGender || (profile?.gender as any) || 'prefer-not-to-say',
    userName
  );

  // Get user initials for fallback
  const userInitials = getInitials(userName || profile?.name || 'User');

  return (
    <div className="relative inline-block">
      <Avatar className={sizeClasses[size]}>
        <AvatarImage src={displayAvatar} alt={userName || 'User avatar'} />
        <AvatarFallback className="bg-primary/20 text-primary font-semibold">
          {userInitials}
        </AvatarFallback>
      </Avatar>

      {editable && (
        <>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
          
          <div className="absolute -bottom-1 -right-1 flex gap-1">
            <Button
              size="sm"
              variant="secondary"
              className="h-6 w-6 p-0 rounded-full shadow-lg"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              title="Upload photo (max 1MB)"
            >
              {isUploading ? (
                <div className="h-3 w-3 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              ) : (
                <Camera className="h-3 w-3" />
              )}
            </Button>
            
            {(currentAvatar || profile?.avatar) && (
              <Button
                size="sm"
                variant="destructive"
                className="h-6 w-6 p-0 rounded-full shadow-lg"
                onClick={handleRemoveAvatar}
                disabled={isUploading}
                title="Remove photo"
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
        </>
      )}
    </div>
  );
}