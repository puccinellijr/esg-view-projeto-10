
import { useState, useEffect } from "react";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

// Interface for updates/notifications 
interface UpdateNotification {
  id: string;
  message: string;
  timestamp: string;
  isRead: boolean;
}

interface NotificationPopoverProps {
  userAccessLevel?: string;
}

const NotificationPopover = ({ userAccessLevel }: NotificationPopoverProps) => {
  const [notifications, setNotifications] = useState<UpdateNotification[]>([]);
  const [showNotificationDot, setShowNotificationDot] = useState(false);
  const isMobile = useIsMobile();
  
  // For demo purposes, simulate getting notifications
  // In a real app, this would come from an API or websocket
  useEffect(() => {
    // Only fetch notifications for viewer and administrative users
    if (userAccessLevel === "viewer" || userAccessLevel === "administrative") {
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
  }, [userAccessLevel]);

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

  // If user doesn't have access to notifications, don't render anything
  if (userAccessLevel !== "viewer" && userAccessLevel !== "administrative") {
    return null;
  }

  return (
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
  );
};

export default NotificationPopover;
