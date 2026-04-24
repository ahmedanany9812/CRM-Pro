"use client";

import { Bell, Check, ExternalLink, Loader2, CheckCheck, Clock, Calendar } from "lucide-react";
import {
  useGetNotifications,
  useMarkNotificationRead,
  useMarkAllNotificationsRead,
} from "@/lib/tanstack/useNotifications";
import { NotificationListItem } from "@/services/notification/schema";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDistanceToNow, isToday, isYesterday, format } from "date-fns";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useEffect, useRef, useMemo } from "react";
import { toast } from "sonner";

export function NotificationBell() {
  const router = useRouter();
  const { data, isLoading } = useGetNotifications();
  const markReadMutation = useMarkNotificationRead();
  const markAllReadMutation = useMarkAllNotificationsRead();

  const notifications = data?.notifications ?? [];
  const unreadCount = data?.unreadCount ?? 0;

  // Real-time toast listener
  useEffect(() => {
    if (notifications.length > 0) {
      const latest = notifications[0];
      
      // Get last processed ID from localStorage to persist across navigation
      const storedLastId = localStorage.getItem("lastToastedNotificationId");
      const isNew = storedLastId !== latest.id;
      const isRecent = new Date().getTime() - new Date(latest.createdAt).getTime() < 60000;

      if (latest.readState === "UNREAD" && isNew && isRecent) {
        toast.info(latest.title, {
          description: latest.body,
          action: latest.leadId ? {
            label: "View Lead",
            onClick: () => {
              // Use router for SPA navigation
              router.push(`/leads/${latest.leadId}`);
            }
          } : undefined
        });
        // Update localStorage immediately
        localStorage.setItem("lastToastedNotificationId", latest.id);
      }
    }
  }, [notifications]);

  // Grouping logic
  const groupedNotifications = useMemo(() => {
    const groups: Record<string, NotificationListItem[]> = {
      Today: [],
      Yesterday: [],
      Earlier: []
    };

    notifications.forEach((notif: NotificationListItem) => {
      const date = new Date(notif.createdAt);
      if (isToday(date)) groups.Today.push(notif);
      else if (isYesterday(date)) groups.Yesterday.push(notif);
      else groups.Earlier.push(notif);
    });

    return Object.entries(groups).filter(([_, items]) => items.length > 0);
  }, [notifications]);

  const handleMarkRead = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    markReadMutation.mutate(id);
  };

  const handleMarkAllRead = () => {
    markAllReadMutation.mutate();
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative hover:bg-primary/5 transition-colors group">
          <Bell className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
          {unreadCount > 0 && (
            <span className="absolute top-2 right-2 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[380px] p-0 shadow-2xl border-muted-foreground/10 overflow-hidden" align="end">
        {/* Header */}
        <div className="bg-muted/30 border-b px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Notifications</h4>
            {unreadCount > 0 && (
              <Badge variant="secondary" className="h-4 px-1.5 text-[9px] font-bold bg-primary/10 text-primary border-none">
                {unreadCount} NEW
              </Badge>
            )}
          </div>
          {unreadCount > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-7 px-2 text-[10px] font-bold uppercase text-primary hover:bg-primary/5"
              onClick={handleMarkAllRead}
              disabled={markAllReadMutation.isPending}
            >
              <CheckCheck className="h-3 w-3 mr-1.5" />
              Mark all as read
            </Button>
          )}
        </div>

        {/* Content */}
        <ScrollArea className="h-[450px]">
          {isLoading ? (
            <div className="flex h-40 flex-col items-center justify-center gap-3">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50">Syncing alerts...</span>
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex h-40 flex-col items-center justify-center text-center p-8">
              <div className="bg-muted/50 p-4 rounded-full mb-4">
                <Bell className="h-8 w-8 text-muted-foreground/30" />
              </div>
              <h5 className="text-sm font-bold text-foreground">All caught up!</h5>
              <p className="text-xs text-muted-foreground mt-1">
                You've cleared all your notifications.
              </p>
            </div>
          ) : (
            <div className="flex flex-col pb-4">
              {groupedNotifications.map(([group, items]) => (
                <div key={group} className="flex flex-col">
                  <div className="px-4 py-2 bg-muted/20 border-y border-muted-foreground/5">
                    <span className="text-[9px] font-bold uppercase tracking-tighter text-muted-foreground/60">{group}</span>
                  </div>
                  {items.map((notification: NotificationListItem) => (
                    <div
                      key={notification.id}
                      className={cn(
                        "group relative flex flex-col gap-1.5 p-4 transition-all hover:bg-muted/30 border-b border-muted-foreground/5",
                        notification.readState === "UNREAD" && "bg-primary/2"
                      )}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center gap-2">
                            {notification.readState === "UNREAD" && (
                              <div className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                            )}
                            <span className={cn(
                              "text-sm leading-tight",
                              notification.readState === "UNREAD" ? "font-bold text-foreground" : "font-medium text-muted-foreground"
                            )}>
                              {notification.title}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground leading-relaxed">
                            {notification.body}
                          </p>
                        </div>
                        
                        {notification.readState === "UNREAD" && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-primary hover:bg-primary/5"
                            onClick={(e) => handleMarkRead(e, notification.id)}
                            disabled={markReadMutation.isPending}
                            title="Mark as read"
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                        )}
                      </div>

                      <div className="mt-2 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1 text-[10px] text-muted-foreground/60">
                            <Clock className="h-3 w-3" />
                            {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                          </div>
                          {notification.lead && (
                            <Link
                              href={`/leads/${notification.leadId}`}
                              className="flex items-center gap-1 text-[10px] font-bold text-primary hover:underline uppercase tracking-tight"
                            >
                              <ExternalLink className="h-2.5 w-2.5" />
                              {notification.lead.name}
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        {/* Footer */}
        <div className="border-t bg-muted/10 p-2">
          <Button variant="ghost" size="sm" className="w-full text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:text-primary" asChild>
            <Link href="/reminders">
              <Calendar className="h-3 w-3 mr-2" />
              View full schedule
            </Link>
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
