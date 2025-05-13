
import { useState, useEffect } from "react";
import { BellDot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { supabase } from '@/lib/supabase';
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

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

const NotificationPopover = ({ userAccessLevel }: NotificationPopoverProps) => {
  const [notifications, setNotifications] = useState<UpdateNotification[]>([]);
  const [showNotificationDot, setShowNotificationDot] = useState(false);
  const isMobile = useIsMobile();
  
  // Fetch real notifications from database
  useEffect(() => {
    // Only fetch notifications for viewer and administrative users
    if (userAccessLevel === "viewer" || userAccessLevel === "administrative") {
      fetchNotifications();
    }
  }, [userAccessLevel]);
  
  const fetchNotifications = async () => {
    try {
      // Fetch the most recent database insertions (limited to last 10)
      const { data: recentInsertions, error } = await supabase
        .from('esg_indicators')
        .select('id, created_at, month, year, terminal, created_by')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) {
        console.error("Error fetching notifications:", error);
        return;
      }

      if (recentInsertions && recentInsertions.length > 0) {
        // Process the database entries into notifications
        const notifs: UpdateNotification[] = await Promise.all(recentInsertions.map(async (item) => {
          // Get user information if available
          let userName = "Um usuário";
          if (item.created_by) {
            const { data: userData } = await supabase
              .from('user_profiles')
              .select('name')
              .eq('id', item.created_by)
              .single();
            
            if (userData?.name) {
              userName = userData.name;
            }
          }
          
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
            message: `${userName} cadastrou os dados de ${monthName} de ${item.year} para o terminal ${item.terminal}`,
            timestamp: formattedDate,
            isRead: false,
            created_at: item.created_at,
            user_name: userName,
            month: item.month,
            year: item.year
          };
        }));

        setNotifications(notifs);
        
        // Check if there are any unread notifications
        setShowNotificationDot(notifs.length > 0);
      }
    } catch (err) {
      console.error("Error processing notifications:", err);
    }
  };

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
