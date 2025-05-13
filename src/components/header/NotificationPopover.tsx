
import { useState, useEffect } from "react";
import { BellDot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { supabase } from '@/lib/supabase';
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

// Interface for updates/notifications 
interface UpdateNotification {
  id: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  created_at?: string;
  user_name?: string;
  month?: number;
  year?: number;
}

interface NotificationPopoverProps {
  userAccessLevel?: string;
}

// Table name for storing user read notifications
const USER_READ_NOTIFICATIONS_TABLE = 'user_read_notifications';

const NotificationPopover = ({ userAccessLevel }: NotificationPopoverProps) => {
  const [notifications, setNotifications] = useState<UpdateNotification[]>([]);
  const [showNotificationDot, setShowNotificationDot] = useState(false);
  const isMobile = useIsMobile();
  const { user } = useAuth();
  
  // Fetch real notifications from database
  useEffect(() => {
    // Only fetch notifications for viewer and administrative users
    if (userAccessLevel === "viewer" || userAccessLevel === "administrative") {
      fetchNotifications();
    }
  }, [userAccessLevel]);
  
  const fetchNotifications = async () => {
    if (!user?.id) {
      console.error("User ID not available for fetching notifications");
      return;
    }

    try {
      // Fetch the most recent database insertions (limited to last 10)
      const { data: recentInsertions, error } = await supabase
        .from('esg_indicators')
        .select('id, created_at, month, year, terminal')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) {
        console.error("Error fetching notifications:", error);
        return;
      }

      // Get user's read notifications
      const { data: readNotificationsData } = await supabase
        .from(USER_READ_NOTIFICATIONS_TABLE)
        .select('notification_id')
        .eq('user_id', user.id);

      // Create a set of read notification IDs for quick lookup
      const readNotificationIds = new Set(
        (readNotificationsData || []).map(item => item.notification_id)
      );
      
      console.log("User's read notifications:", readNotificationIds);

      if (recentInsertions && recentInsertions.length > 0) {
        // Process the database entries into notifications
        const notifs: UpdateNotification[] = recentInsertions.map(item => {
          // Format month name in Portuguese
          const monthNames = [
            "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
            "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
          ];
          
          const monthName = monthNames[item.month - 1] || `Mês ${item.month}`;
          const formattedDate = item.created_at 
            ? format(new Date(item.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })
            : "data não disponível";
          
          return {
            id: item.id,
            message: `Dados de ${monthName} de ${item.year} foram cadastrados para o terminal ${item.terminal}`,
            timestamp: formattedDate,
            isRead: readNotificationIds.has(item.id), // Mark as read if in the user's read list
            created_at: item.created_at,
            month: item.month,
            year: item.year
          };
        });

        setNotifications(notifs);
        
        // Check if there are any unread notifications
        const hasUnread = notifs.some(notification => !notification.isRead);
        setShowNotificationDot(hasUnread);
      }
    } catch (err) {
      console.error("Error processing notifications:", err);
    }
  };

  // Mark notifications as read
  const markAsRead = async () => {
    if (!user?.id) {
      console.error("User ID not available for marking notifications as read");
      return;
    }

    try {
      const unreadNotifications = notifications.filter(notif => !notif.isRead);
      
      if (unreadNotifications.length === 0) {
        return; // No unread notifications to mark
      }

      // Prepare the array of notification-user pairs for the read tracking table
      const notificationEntries = unreadNotifications.map(notification => ({
        user_id: user.id,
        notification_id: notification.id,
        read_at: new Date().toISOString()
      }));

      // Insert the entries into the read tracking table
      const { error } = await supabase
        .from(USER_READ_NOTIFICATIONS_TABLE)
        .upsert(notificationEntries, { onConflict: 'user_id,notification_id' });

      if (error) {
        console.error("Error marking notifications as read:", error);
        toast.error("Erro ao marcar notificações como lidas");
        return;
      }

      // Update local state
      const updatedNotifications = notifications.map(notif => ({
        ...notif,
        isRead: true
      }));
      
      setNotifications(updatedNotifications);
      setShowNotificationDot(false);
      
      console.log("Notifications marked as read for user:", user.id);
    } catch (err) {
      console.error("Error in markAsRead:", err);
      toast.error("Erro ao processar notificações");
    }
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
          <BellDot className="h-4 sm:h-5 w-4 sm:w-5" />
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
            <Button 
              variant="ghost" 
              size="sm" 
              className="w-full text-xs" 
              onClick={fetchNotifications}
            >
              Atualizar notificações
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
};

export default NotificationPopover;
