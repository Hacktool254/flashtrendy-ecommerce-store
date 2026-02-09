"use client";

import { useEffect, useState } from "react";
import { Bell, CheckCircle2, Info, Package, AlertTriangle, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getNotifications, getUnreadCount, markAsRead, markAllAsRead } from "@/app/actions/notifications";
import { Notification, NotificationType } from "@prisma/client";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

export function NotificationBell() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const router = useRouter();

    const fetchNotifications = async () => {
        const [notifs, count] = await Promise.all([
            getNotifications(),
            getUnreadCount()
        ]);
        setNotifications(notifs);
        setUnreadCount(count);
    };

    useEffect(() => {
        fetchNotifications();
        // Poll for new notifications every minute
        const interval = setInterval(fetchNotifications, 60000);
        return () => clearInterval(interval);
    }, []);

    const handleMarkAsRead = async (id: string, e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        await markAsRead(id);
        fetchNotifications();
    };

    const handleMarkAllAsRead = async () => {
        await markAllAsRead();
        fetchNotifications();
    };

    const getIcon = (type: NotificationType) => {
        switch (type) {
            case "ORDER": return <Package className="h-4 w-4 text-blue-500" />;
            case "SUCCESS": return <CheckCircle2 className="h-4 w-4 text-green-500" />;
            case "WARNING": return <AlertTriangle className="h-4 w-4 text-amber-500" />;
            default: return <Info className="h-4 w-4 text-slate-500" />;
        }
    };

    return (
        <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                        <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-destructive text-destructive-foreground">
                            {unreadCount > 9 ? "9+" : unreadCount}
                        </Badge>
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 p-0">
                <div className="flex items-center justify-between p-4 border-b">
                    <h3 className="font-semibold">Notifications</h3>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs h-8"
                        onClick={handleMarkAllAsRead}
                    >
                        Mark all as read
                    </Button>
                </div>
                <ScrollArea className="h-[400px]">
                    {notifications.length > 0 ? (
                        <div className="flex flex-col">
                            {notifications.map((notification) => (
                                <Link
                                    key={notification.id}
                                    href={notification.link || "#"}
                                    onClick={() => {
                                        setIsOpen(false);
                                        if (!notification.read) markAsRead(notification.id);
                                    }}
                                    className={cn(
                                        "flex gap-3 p-4 hover:bg-accent transition-colors border-b last:border-0",
                                        !notification.read && "bg-accent/30"
                                    )}
                                >
                                    <div className="mt-1 flex-shrink-0">
                                        {getIcon(notification.type)}
                                    </div>
                                    <div className="flex-1 space-y-1">
                                        <div className="flex items-center justify-between gap-2">
                                            <p className={cn(
                                                "text-sm font-medium leading-none",
                                                !notification.read && "font-bold"
                                            )}>
                                                {notification.title}
                                            </p>
                                            {!notification.read && (
                                                <div className="h-2 w-2 rounded-full bg-blue-500 flex-shrink-0" />
                                            )}
                                        </div>
                                        <p className="text-xs text-muted-foreground line-clamp-2">
                                            {notification.message}
                                        </p>
                                        <p className="text-[10px] text-muted-foreground">
                                            {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                                        </p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
                            <Bell className="h-10 w-10 mb-2 opacity-20" />
                            <p className="text-sm">No notifications yet</p>
                        </div>
                    )}
                </ScrollArea>
                <div className="p-2 border-t text-center">
                    <Button variant="ghost" size="sm" className="w-full text-xs" asChild>
                        <Link href="/dashboard/notifications">View all notifications</Link>
                    </Button>
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
