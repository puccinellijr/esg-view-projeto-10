
import { useAuth } from "@/context/AuthContext";
import { Menu, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSidebar } from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useState, useEffect } from "react";
import UserProfileModal from "@/components/UserProfileModal";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { RefreshCw } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

// Interface for updates/notifications 
interface UpdateNotification {
  id: string;
  message: string;
  timestamp: string;
  isRead: boolean;
}

const DashboardHeader = () => {
  const { user } = useAuth();
  const { toggleSidebar, state } = useSidebar();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [notifications, setNotifications] = useState<UpdateNotification[]>([]);
  const [showNotificationDot, setShowNotificationDot] = useState(false);
  const isMobile = useIsMobile();
  
  const getInitials = (email: string) => {
    return email ? email.substring(0, 2).toUpperCase() : "U";
  };

  // Get user's first name only for welcome message
  const getUserDisplayName = () => {
    if (user?.name) {
      return user.name.split(' ')[0]; // Get first name only
    } else if (user?.email) {
      return user.email.split('@')[0]; // Get username from email
    } else {
      return 'Usuário';
    }
  };

  // For demo purposes, simulate getting notifications
  // In a real app, this would come from an API or websocket
  useEffect(() => {
    // Only fetch notifications for viewer and administrative users
    if (user?.accessLevel === "viewer" || user?.accessLevel === "administrative") {
      // Simulate fetching notifications
      const mockNotifications: UpdateNotification[] = [
        {
          id: "1",
          message: "Novo dado de consumo de água foi cadastrado",
          timestamp: "2025-05-10 14:35",
          isRead: false
        },
        {
          id: "2", 
          message: "Informações de resíduos sólidos atualizadas",
          timestamp: "2025-05-10 13:22",
          isRead: false
        },
        {
          id: "3",
          message: "Novo indicador ambiental adicionado",
          timestamp: "2025-05-09 16:45",
          isRead: true
        }
      ];
      
      setNotifications(mockNotifications);
      
      // Check if there are any unread notifications
      const hasUnread = mockNotifications.some(notif => !notif.isRead);
      setShowNotificationDot(hasUnread);
    }
  }, [user]);

  // Mark notifications as read
  const markAsRead = () => {
    const updatedNotifications = notifications.map(notif => ({
      ...notif,
      isRead: true
    }));
    
    setNotifications(updatedNotifications);
    setShowNotificationDot(false);
  };

  // Get count of unread notifications
  const unreadCount = notifications.filter(notif => !notif.isRead).length;

  return (
    <>
      <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b px-2 sm:px-4 md:px-6 bg-sidebar text-white">
        <div className="flex items-center gap-2 sm:gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="flex md:hidden lg:flex"
            aria-label="Toggle sidebar"
          >
            <Menu className="h-5 w-5" />
          </Button>
          
          {state === "collapsed" && (
            <div className="hidden md:flex items-center justify-center">
              <img 
                src="/lovable-uploads/b2f69cac-4f8c-4dcb-b91c-75d0f7d0274d.png" 
                alt="Odjell Terminals Logo" 
                className="h-10 w-auto" 
                onError={(e) => {
                  e.currentTarget.src = 'https://via.placeholder.com/150x80?text=Odjell+Terminals';
                }} 
              />
            </div>
          )}
          
          <h1 className="text-lg font-medium md:text-xl">
            ESG
          </h1>
          
          {/* Welcome message for desktop - showing only first name */}
          <div className="hidden md:flex items-center ml-2 lg:ml-4 text-sm lg:text-base font-medium">
            <span>Bem-vindo, {getUserDisplayName()}</span>
          </div>
        </div>
        
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Welcome message for mobile - showing only first name */}
          <div className="md:hidden text-xs sm:text-sm truncate max-w-[100px] sm:max-w-[150px]">
            <span>Bem-vindo, {getUserDisplayName()}</span>
          </div>
          
          {/* Notifications icon for viewer and administrative users */}
          {(user?.accessLevel === "viewer" || user?.accessLevel === "administrative") && (
            <Popover>
              <PopoverTrigger asChild>
                <Button 
                  variant="ghost" 
                  size={isMobile ? "sm" : "icon"}
                  className="relative"
                  onClick={markAsRead}
                  aria-label="Notificações de atualizações"
                >
                  <RefreshCw className="h-4 sm:h-5 w-4 sm:w-5" />
                  {showNotificationDot && unreadCount > 0 && (
                    <span className="absolute top-0 right-0 h-4 w-4 sm:h-5 sm:w-5 rounded-full bg-red-500 text-white text-xxs sm:text-xs flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-72 sm:w-80 p-0">
                <div className="p-3 sm:p-4 border-b">
                  <h3 className="font-medium text-base sm:text-lg">Atualizações Recentes</h3>
                </div>
                <div className="max-h-60 sm:max-h-80 overflow-auto">
                  {notifications.length > 0 ? (
                    notifications.map((notif) => (
                      <div 
                        key={notif.id} 
                        className={cn(
                          "p-3 sm:p-4 border-b flex flex-col gap-1 transition-colors hover:bg-gray-50",
                          !notif.isRead && "bg-blue-50"
                        )}
                      >
                        <p className="text-xs sm:text-sm font-medium">{notif.message}</p>
                        <time className="text-xxs sm:text-xs text-gray-500">{notif.timestamp}</time>
                      </div>
                    ))
                  ) : (
                    <div className="p-3 sm:p-4 text-center text-gray-500">
                      <p>Nenhuma atualização recente</p>
                    </div>
                  )}
                </div>
                {notifications.length > 0 && (
                  <div className="p-2 flex justify-center">
                    <Button variant="ghost" size="sm" className="w-full text-xs">
                      Ver todas atualizações
                    </Button>
                  </div>
                )}
              </PopoverContent>
            </Popover>
          )}
          
          <div className="flex items-center gap-1 sm:gap-2">
            {!isMobile && (
              <span className="text-xs md:text-sm hidden sm:inline max-w-[180px] lg:max-w-none truncate">
                {user?.email} ({user?.accessLevel === "administrative" ? "Administrativo" : user?.accessLevel === "viewer" ? "Visualizador" : "Operacional"})
              </span>
            )}
            <Avatar className="cursor-pointer h-8 w-8 sm:h-9 sm:w-9 border-2 border-white/20 hover:border-white transition-colors"
                  onClick={() => setIsProfileOpen(true)}>
              <AvatarImage src={user?.photoUrl || ""} alt={user?.email || "User"} />
              <AvatarFallback className="bg-blue-500 text-white text-xs sm:text-sm">{getInitials(user?.email || "")}</AvatarFallback>
            </Avatar>
          </div>
        </div>
      </header>

      {isProfileOpen && <UserProfileModal isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />}
    </>
  );
};

export default DashboardHeader;
