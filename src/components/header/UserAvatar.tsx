
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import UserProfileModal from "@/components/UserProfileModal";
import { useIsMobile } from "@/hooks/use-mobile";

interface UserAvatarProps {
  email?: string;
  photoUrl?: string;
  accessLevel?: string;
}

const UserAvatar = ({ email, photoUrl, accessLevel }: UserAvatarProps) => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const isMobile = useIsMobile();
  
  const getInitials = (email: string) => {
    return email ? email.substring(0, 2).toUpperCase() : "U";
  };

  const getAccessLevelLabel = (level?: string) => {
    if (level === "administrative") return "Administrativo";
    if (level === "viewer") return "Visualizador";
    return "Operacional";
  };

  return (
    <>
      <div className="flex items-center gap-1 sm:gap-2">
        {!isMobile && (
          <span className="text-xs md:text-sm hidden sm:inline max-w-[180px] lg:max-w-none truncate">
            {email} ({getAccessLevelLabel(accessLevel)})
          </span>
        )}
        <Avatar 
          className="cursor-pointer h-8 w-8 sm:h-9 sm:w-9 border-2 border-white/20 hover:border-white transition-colors"
          onClick={() => setIsProfileOpen(true)}
        >
          <AvatarImage src={photoUrl || ""} alt={email || "User"} />
          <AvatarFallback className="bg-blue-500 text-white text-xs sm:text-sm">
            {getInitials(email || "")}
          </AvatarFallback>
        </Avatar>
      </div>
      
      {isProfileOpen && (
        <UserProfileModal 
          isOpen={isProfileOpen} 
          onClose={() => setIsProfileOpen(false)} 
        />
      )}
    </>
  );
};

export default UserAvatar;
