"use client";

import { useEffect, useState, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { checkNewOrders } from "@/app/actions/notifications";
import { ShoppingBag } from "lucide-react";
import { useRouter } from "next/navigation";
import { ToastAction } from "@/components/ui/toast";

export function OrderNotificationListener() {
    const { toast } = useToast();
    const router = useRouter();
    const [lastCheckTime, setLastCheckTime] = useState(new Date());
    const checkInterval = 30000; // Check every 30 seconds
    const audioRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        // Initialize audio for notification sound (optional)
        audioRef.current = new Audio("/notification.mp3");
    }, []);

    useEffect(() => {
        const check = async () => {
            try {
                const newOrders = await checkNewOrders(lastCheckTime);

                if (newOrders.length > 0) {
                    newOrders.forEach((order) => {
                        toast({
                            title: "New Order Received!",
                            description: `Order from ${order.user.name || "Customer"} for $${Number(order.total).toFixed(2)}`,
                            action: (
                                <ToastAction altText="View order" onClick={() => router.push(`/admin/orders/${order.id}`)}>
                                    View
                                </ToastAction>
                            ),
                        });

                        // Try to play sound
                        audioRef.current?.play().catch(() => {
                            // Silently fail if browser blocks autoplay
                        });
                    });

                    setLastCheckTime(new Date());
                    router.refresh(); // Refresh data on current page
                }
            } catch (error) {
                console.error("Failed to check for new orders:", error);
            }
        };

        const interval = setInterval(check, checkInterval);
        return () => clearInterval(interval);
    }, [lastCheckTime, toast, router]);

    return null; // This is a logic-only component
}
