"use client";

import { useState } from "react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { OrderStatus } from "@prisma/client";
import { updateOrderStatus } from "@/app/actions/orders";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

interface OrderStatusSelectProps {
    orderId: string;
    currentStatus: OrderStatus;
}

const STATUS_OPTIONS: { label: string; value: OrderStatus }[] = [
    { label: "Pending", value: "PENDING" },
    { label: "Processing", value: "PROCESSING" },
    { label: "Shipped", value: "SHIPPED" },
    { label: "Delivered", value: "DELIVERED" },
    { label: "Cancelled", value: "CANCELLED" },
    { label: "Refunded", value: "REFUNDED" },
];

export function OrderStatusSelect({
    orderId,
    currentStatus,
}: OrderStatusSelectProps) {
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();

    const handleStatusChange = async (newStatus: string) => {
        setIsLoading(true);
        try {
            const result = await updateOrderStatus(orderId, newStatus as OrderStatus);
            if (result.success) {
                toast({
                    title: "Status updated",
                    description: `Order status changed to ${newStatus}`,
                });
            } else {
                toast({
                    title: "Error",
                    description: result.error,
                    variant: "destructive",
                });
            }
        } catch (error) {
            toast({
                title: "Error",
                description: "Something went wrong",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex items-center gap-2">
            {isLoading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
            <Select
                defaultValue={currentStatus}
                onValueChange={handleStatusChange}
                disabled={isLoading}
            >
                <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                    {STATUS_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                            {option.label}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    );
}
