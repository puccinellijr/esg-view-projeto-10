
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useIsMobile } from "@/hooks/use-mobile";
import { AccessLevel } from "@/types/auth";

interface UserAvatarProps {
  email?: string;
  photoUrl?: string;
  accessLevel?: AccessLevel | string;
  onClick?: () => void;
}

const UserAvatar = ({ email, photoUrl, accessLevel, onClick }: UserAvatarProps) => {
  const isMobile = useIsMobile();
  
  const getInitials = (email: string) => {
    return email ? email.substring(0, 2).toUpperCase() : "U";
  };

  const getAccessLevelLabel = (level?: string) => {
    const normalizedLevel = level?.toLowerCase().trim();
    
    if (normalizedLevel === "administrative") return "Administrativo";
    if (normalizedLevel === "viewer") return "Visualizador";
    return "Operacional";
  };

  return (
    <div className="flex items-center gap-1 sm:gap-2">
      {!isMobile && (
        <span className="text-xs md:text-sm hidden sm:inline max-w-[180px] lg:max-w-none truncate">
          {email} ({getAccessLevelLabel(accessLevel)})
        </span>
      )}
      <Avatar 
        className="cursor-pointer h-8 w-8 sm:h-9 sm:w-9 border-2 border-white/20 hover:border-white transition-colors"
        onClick={onClick}
      >
        <AvatarImage src={photoUrl || ""} alt={email || "User"} />
        <AvatarFallback className="bg-blue-500 text-white text-xs sm:text-sm">
          {getInitials(email || "")}
        </AvatarFallback>
      </Avatar>
    </div>
  );
};

export default UserAvatar;
